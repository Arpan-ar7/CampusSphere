# ===================================================================
# CAMPUSSPHERE - COMPLETE FLASK BACKEND
# ===================================================================
# This is the main backend server for the CampusSphere platform
# It provides APIs for student, faculty, and admin dashboards

from flask import Flask, jsonify, request, session
from flask_cors import CORS
from flask_bcrypt import Bcrypt
import mysql.connector
import os
from dotenv import load_dotenv
import json
from datetime import datetime, timedelta
from functools import wraps
import secrets
import uuid

# Load environment variables from .env file
load_dotenv()

# Initialize Flask application
app = Flask(__name__)
CORS(app, supports_credentials=True)  # Enable CORS with credentials for sessions
bcrypt = Bcrypt(app)  # Password hashing
app.secret_key = os.getenv("SECRET_KEY", secrets.token_hex(32))  # Secure secret key

# ===================================================================
# DATABASE CONNECTION UTILITY
# ===================================================================
def get_db_connection():
    """
    Create and return a database connection
    Returns None if connection fails
    """
    try:
        conn = mysql.connector.connect(
            host=os.getenv("DB_HOST", "localhost"),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", ""),
            database=os.getenv("DB_NAME", "campussphere_db"),
            charset='utf8mb4',
            autocommit=False  # Manual transaction control
        )
        return conn
    except mysql.connector.Error as err:
        print(f"Database connection error: {err}")
        return None

# ===================================================================
# AUTHENTICATION MIDDLEWARE
# ===================================================================
def login_required(allowed_roles=None):
    """
    Decorator to protect routes that require authentication
    Args:
        allowed_roles: List of roles that can access this endpoint
    """
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            # Check if user is logged in
            if 'user_id' not in session:
                return jsonify({"error": "Authentication required"}), 401
            
            # Check role permissions if specified
            if allowed_roles and session.get('role') not in allowed_roles:
                return jsonify({"error": "Insufficient permissions"}), 403
            
            return f(*args, **kwargs)
        return wrapper
    return decorator

# ===================================================================
# GENERAL/UTILITY ENDPOINTS
# ===================================================================

@app.route('/api/test', methods=['GET'])
def test_connection():
    """Test endpoint to verify server is running"""
    return jsonify({
        "message": "CampusSphere backend is running!",
        "timestamp": datetime.now().isoformat(),
        "status": "healthy"
    }), 200

@app.route('/api/departments', methods=['GET'])
def get_departments():
    """Get all departments for form dropdowns"""
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT id, name, code FROM departments ORDER BY name")
        departments = cursor.fetchall()
        return jsonify(departments), 200
    except mysql.connector.Error as err:
        return jsonify({"error": f"Database error: {err}"}), 500
    finally:
        cursor.close()
        conn.close()

# ===================================================================
# AUTHENTICATION ENDPOINTS
# ===================================================================

@app.route('/api/register', methods=['POST'])
def register_user():
    """
    Register a new user (student, faculty, or admin)
    Expected JSON: {fullName, email, password, role}
    """
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['fullName', 'email', 'password', 'role']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    full_name = data['fullName'].strip()
    email = data['email'].strip().lower()
    password = data['password']
    role = data['role'].lower()

    # Validate role
    allowed_roles = ['student', 'faculty', 'admin']
    if role not in allowed_roles:
        return jsonify({"error": "Invalid role. Must be student, faculty, or admin"}), 400

    # Validate email format (basic)
    if '@' not in email or '.' not in email:
        return jsonify({"error": "Invalid email format"}), 400

    # Hash password securely
    try:
        pw_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    except Exception as e:
        return jsonify({"error": "Password hashing failed"}), 500

    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor(dictionary=True)
    
    try:
        # Check if email already exists
        cursor.execute("SELECT email FROM users WHERE email = %s", (email,))
        if cursor.fetchone():
            return jsonify({"error": "Email already registered"}), 409

        # Determine initial status based on role
        # Faculty accounts need admin approval, others are active
        status = 'active'
        
        # Insert new user
        cursor.execute("""
            INSERT INTO users (full_name, email, password_hash, role, status) 
            VALUES (%s, %s, %s, %s, %s)
        """, (full_name, email, pw_hash, role, status))
        
        user_id = cursor.lastrowid
        
        # If registering as faculty, create faculty profile entry
        if role == 'faculty':
            cursor.execute("""
                INSERT INTO faculty_profiles (user_id, mentorship_capacity, is_accepting_requests) 
                VALUES (%s, 5, 1)
            """, (user_id,))
        
        # Commit the transaction
        conn.commit()
        
        # Prepare response message
        message = f"Registration successful as {role}!"
            
        return jsonify({
            "message": message,
            "user_id": user_id,
            "requires_approval": role == 'faculty'
        }), 201
    
    except mysql.connector.Error as err:
        conn.rollback()
        return jsonify({"error": f"Registration failed: {err}"}), 500
    
    finally:
        cursor.close()
        conn.close()

@app.route('/api/login', methods=['POST'])
def login_user():
    """
    Authenticate user and create session
    Expected JSON: {email, password}
    """
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"error": "Email and password are required"}), 400

    email = data['email'].strip().lower()
    password = data['password']

    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor(dictionary=True)

    try:
        # Find user by email
        cursor.execute("""
            SELECT u.*, d.name as department_name, d.code as department_code
            FROM users u 
            LEFT JOIN departments d ON u.department_id = d.id 
            WHERE u.email = %s
        """, (email,))
        
        user = cursor.fetchone()

        # Verify user exists and password is correct
        if not user or not bcrypt.check_password_hash(user['password_hash'], password):
            return jsonify({"error": "Invalid email or password"}), 401

        # Check account status
        # if user['status'] == 'pending_verification':
        #     return jsonify({
        #         "error": "Account pending admin approval", 
        #         "requires_approval": True
        #     }), 403
        elif user['status'] == 'suspended':
            return jsonify({"error": "Account has been suspended"}), 403

        # Create session
        session.permanent = True  # Make session persistent
        session['user_id'] = user['id']
        session['role'] = user['role']
        session['email'] = user['email']
        session['full_name'] = user['full_name']

        # Update last login time
        cursor.execute("UPDATE users SET updated_at = NOW() WHERE id = %s", (user['id'],))
        conn.commit()

        # Return user data (excluding sensitive info)
        user_data = {
            "id": user['id'],
            "fullName": user['full_name'],
            "email": user['email'],
            "role": user['role'],
            "department": user.get('department_name'),
            "avatar_url": user.get('avatar_url')
        }

        return jsonify({
            "message": "Login successful!",
            "user": user_data
        }), 200

    except mysql.connector.Error as err:
        return jsonify({"error": f"Login failed: {err}"}), 500
    
    finally:
        cursor.close()
        conn.close()

@app.route('/api/logout', methods=['POST'])
@login_required()
def logout_user():
    """Clear user session and log out"""
    session.clear()
    return jsonify({"message": "Logged out successfully"}), 200

@app.route('/api/profile', methods=['GET'])
@login_required()
def get_current_user():
    """Get current logged in user's profile"""
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("""
            SELECT u.*, d.name as department_name
            FROM users u 
            LEFT JOIN departments d ON u.department_id = d.id 
            WHERE u.id = %s
        """, (session['user_id'],))
        
        user = cursor.fetchone()
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Parse JSON fields
        if user.get('skills'):
            try:
                user['skills'] = json.loads(user['skills'])
            except:
                user['skills'] = []
        else:
            user['skills'] = []

        # Remove sensitive data
        user.pop('password_hash', None)
        
        return jsonify(user), 200
        
    except mysql.connector.Error as err:
        return jsonify({"error": f"Database error: {err}"}), 500
    
    finally:
        cursor.close()
        conn.close()

# ===================================================================
# STUDENT DASHBOARD ENDPOINTS
# ===================================================================

@app.route('/api/student/profile', methods=['GET', 'PUT'])
@login_required(['student'])
def student_profile():
    """Get or update student profile information"""
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor(dictionary=True)
    
    try:
        if request.method == 'GET':
            # Fetch complete student profile
            cursor.execute("""
                SELECT u.*, d.name as department_name, d.code as department_code
                FROM users u 
                LEFT JOIN departments d ON u.department_id = d.id 
                WHERE u.id = %s AND u.role = 'student'
            """, (session['user_id'],))
            
            profile = cursor.fetchone()
            if not profile:
                return jsonify({"error": "Student profile not found"}), 404

            # Parse skills JSON safely
            if profile.get('skills'):
                try:
                    profile['skills'] = json.loads(profile['skills'])
                except (json.JSONDecodeError, TypeError):
                    profile['skills'] = []
            else:
                profile['skills'] = []

            # Remove sensitive data
            profile.pop('password_hash', None)
            
            return jsonify(profile), 200
            
        else:  # PUT - Update profile
            data = request.get_json()
            if not data:
                return jsonify({"error": "No data provided"}), 400

            # Build dynamic update query
            update_fields = []
            values = []
            
            # Define allowed fields for students
            allowed_fields = {
                'full_name': 'full_name',
                'bio': 'bio',
                'branch': 'branch',
                'semester': 'semester',
                'class': 'class',
                'enrollment_no': 'enrollment_no',
                'avatar_url': 'avatar_url'
            }
            
            # Process each allowed field
            for field_name, db_column in allowed_fields.items():
                if field_name in data:
                    update_fields.append(f"{db_column} = %s")
                    values.append(data[field_name])

            # Handle skills array (JSON)
            if 'skills' in data:
                update_fields.append("skills = %s")
                # Ensure skills is a list
                skills = data['skills'] if isinstance(data['skills'], list) else []
                values.append(json.dumps(skills))

            # Handle department lookup
            if 'department' in data and data['department']:
                cursor.execute("SELECT id FROM departments WHERE name = %s", (data['department'],))
                dept = cursor.fetchone()
                if dept:
                    update_fields.append("department_id = %s")
                    values.append(dept['id'])

            # Execute update if we have fields to update
            if update_fields:
                values.append(session['user_id'])
                sql = f"UPDATE users SET {', '.join(update_fields)}, updated_at = NOW() WHERE id = %s"
                cursor.execute(sql, values)
                conn.commit()
                
                return jsonify({"message": "Profile updated successfully"}), 200
            
            return jsonify({"error": "No valid fields to update"}), 400

    except mysql.connector.Error as err:
        conn.rollback()
        return jsonify({"error": f"Database error: {err}"}), 500
    
    finally:
        cursor.close()
        conn.close()

@app.route('/api/student/events', methods=['GET'])
@login_required(['student'])
def get_student_events():
    """Get events for student dashboard (all approved events)"""
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor(dictionary=True)
    
    try:
        # Get all approved events with registration status for current student
        cursor.execute("""
            SELECT e.*, 
                   u.full_name as organizer_name,
                   d.name as organizer_department,
                   er.status as registration_status,
                   er.registered_at,
                   COUNT(DISTINCT er2.user_id) as participant_count
            FROM events e
            JOIN users u ON e.organizer_id = u.id
            LEFT JOIN departments d ON u.department_id = d.id
            LEFT JOIN event_registrations er ON e.id = er.event_id AND er.user_id = %s
            LEFT JOIN event_registrations er2 ON e.id = er2.event_id
            WHERE e.status = 'approved'
            GROUP BY e.id
            ORDER BY e.start_datetime ASC
        """, (session['user_id'],))
        
        events = cursor.fetchall()
        
        # Convert datetime objects to strings for JSON serialization
        for event in events:
            if event['start_datetime']:
                event['start_datetime'] = event['start_datetime'].isoformat()
            if event['end_datetime']:
                event['end_datetime'] = event['end_datetime'].isoformat()
            if event['registered_at']:
                event['registered_at'] = event['registered_at'].isoformat()
        
        return jsonify(events), 200
        
    except mysql.connector.Error as err:
        return jsonify({"error": f"Database error: {err}"}), 500
    
    finally:
        cursor.close()
        conn.close()

@app.route('/api/student/events/<int:event_id>/register', methods=['POST'])
@login_required(['student'])
def register_for_event(event_id):
    """Register student for an event"""
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor(dictionary=True)
    
    try:
        # Check if event exists and is approved
        cursor.execute("SELECT * FROM events WHERE id = %s AND status = 'approved'", (event_id,))
        event = cursor.fetchone()
        
        if not event:
            return jsonify({"error": "Event not found or not available for registration"}), 404
        
        # Check if already registered
        cursor.execute("SELECT * FROM event_registrations WHERE user_id = %s AND event_id = %s", 
                      (session['user_id'], event_id))
        
        if cursor.fetchone():
            return jsonify({"error": "Already registered for this event"}), 409
        
        # Check capacity if set
        if event['max_participants']:
            cursor.execute("SELECT COUNT(*) as count FROM event_registrations WHERE event_id = %s", (event_id,))
            current_count = cursor.fetchone()['count']
            
            if current_count >= event['max_participants']:
                return jsonify({"error": "Event is full"}), 409
        
        # Register the student
        cursor.execute("""
            INSERT INTO event_registrations (user_id, event_id, status) 
            VALUES (%s, %s, 'registered')
        """, (session['user_id'], event_id))
        
        conn.commit()
        
        return jsonify({"message": "Successfully registered for event!"}), 201
        
    except mysql.connector.Error as err:
        conn.rollback()
        return jsonify({"error": f"Database error: {err}"}), 500
    
    finally:
        cursor.close()
        conn.close()

@app.route('/api/student/collaborate', methods=['GET', 'POST'])
@login_required(['student'])
def student_collaborate():
    """Get collaboration posts or create new one"""
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor(dictionary=True)
    
    try:
        if request.method == 'GET':
            # Get all active collaboration posts with interest counts
            cursor.execute("""
                SELECT cp.*, 
                       u.full_name as author_name,
                       COUNT(DISTINCT ci.user_id) as interest_count,
                       MAX(CASE WHEN ci.user_id = %s THEN 1 ELSE 0 END) as user_interested
                FROM collaboration_posts cp
                JOIN users u ON cp.author_id = u.id
                LEFT JOIN collaboration_interests ci ON cp.id = ci.post_id
                WHERE cp.status = 'active'
                GROUP BY cp.id
                ORDER BY cp.created_at DESC
            """, (session['user_id'],))
            
            posts = cursor.fetchall()
            
            # Parse skills_required JSON
            for post in posts:
                if post.get('skills_required'):
                    try:
                        post['skills_required'] = json.loads(post['skills_required'])
                    except:
                        post['skills_required'] = []
                else:
                    post['skills_required'] = []
                    
                # Convert datetime to string
                if post['created_at']:
                    post['created_at'] = post['created_at'].isoformat()
                if post['updated_at']:
                    post['updated_at'] = post['updated_at'].isoformat()
            
            return jsonify(posts), 200
            
        else:  # POST - Create new collaboration post
            data = request.get_json()
            
            required_fields = ['title', 'description', 'skills_required', 'team_size_needed']
            if not all(field in data for field in required_fields):
                return jsonify({"error": "Missing required fields"}), 400
            
            # Parse skills if it's a string
            skills_required = data['skills_required']
            if isinstance(skills_required, str):
                skills_required = [s.strip() for s in skills_required.split(',') if s.strip()]
            
            cursor.execute("""
                INSERT INTO collaboration_posts 
                (author_id, title, description, skills_required, team_size_needed, 
                 registration_form_url, project_category, status) 
                VALUES (%s, %s, %s, %s, %s, %s, %s, 'active')
            """, (
                session['user_id'],
                data['title'],
                data['description'],
                json.dumps(skills_required),
                data['team_size_needed'],
                data.get('registration_form_url'),
                data.get('project_category')
            ))
            
            conn.commit()
            
            return jsonify({"message": "Collaboration post created successfully!"}), 201
        
    except mysql.connector.Error as err:
        if request.method == 'POST':
            conn.rollback()
        return jsonify({"error": f"Database error: {err}"}), 500
    
    finally:
        cursor.close()
        conn.close()

@app.route('/api/student/collaborate/<int:post_id>/interest', methods=['POST'])
@login_required(['student'])
def express_collaboration_interest(post_id):
    """Express interest in a collaboration post"""
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor(dictionary=True)
    
    try:
        # Check if post exists and is active
        cursor.execute("SELECT * FROM collaboration_posts WHERE id = %s AND status = 'active'", (post_id,))
        post = cursor.fetchone()
        
        if not post:
            return jsonify({"error": "Collaboration post not found"}), 404
        
        # Can't express interest in own post
        if post['author_id'] == session['user_id']:
            return jsonify({"error": "Cannot express interest in your own post"}), 400
        
        # Check if already expressed interest
        cursor.execute("SELECT * FROM collaboration_interests WHERE post_id = %s AND user_id = %s", 
                      (post_id, session['user_id']))
        
        if cursor.fetchone():
            return jsonify({"error": "Interest already expressed for this post"}), 409
        
        # Express interest
        data = request.get_json()
        message = data.get('message', '') if data else ''
        
        cursor.execute("""
            INSERT INTO collaboration_interests (post_id, user_id, message) 
            VALUES (%s, %s, %s)
        """, (post_id, session['user_id'], message))
        
        conn.commit()
        
        return jsonify({"message": "Interest expressed successfully!"}), 201
        
    except mysql.connector.Error as err:
        conn.rollback()
        return jsonify({"error": f"Database error: {err}"}), 500
    
    finally:
        cursor.close()
        conn.close()

@app.route('/api/student/organize', methods=['POST'])
@login_required(['student'])
def organize_event():
    """Submit new event proposal"""
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor(dictionary=True)
    
    try:
        data = request.get_json()
        
        required_fields = ['title', 'description', 'start_datetime', 'category']
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400
        
        # Parse datetime
        try:
            start_datetime = datetime.fromisoformat(data['start_datetime'].replace('Z', '+00:00'))
        except ValueError:
            return jsonify({"error": "Invalid datetime format"}), 400
        
        # Insert event proposal
        cursor.execute("""
            INSERT INTO events 
            (title, description, start_datetime, end_datetime, location, category, 
             eligibility_criteria, registration_form_url, organizer_id, status) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 'pending_approval')
        """, (
            data['title'],
            data['description'],
            start_datetime,
            data.get('end_datetime'),
            data.get('location'),
            data['category'],
            data.get('eligibility_criteria'),
            data.get('registration_form_url'),
            session['user_id']
        ))
        
        conn.commit()
        
        return jsonify({"message": "Event proposal submitted successfully!"}), 201
        
    except mysql.connector.Error as err:
        conn.rollback()
        return jsonify({"error": f"Database error: {err}"}), 500
    
    finally:
        cursor.close()
        conn.close()

@app.route('/api/student/organized-events', methods=['GET'])
@login_required(['student'])
def get_organized_events():
    """Get events organized by current student"""
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("""
            SELECT e.*, 
                   u.full_name as reviewed_by_name,
                   COUNT(DISTINCT er.user_id) as registration_count
            FROM events e
            LEFT JOIN users u ON e.reviewed_by = u.id
            LEFT JOIN event_registrations er ON e.id = er.event_id
            WHERE e.organizer_id = %s
            GROUP BY e.id
            ORDER BY e.created_at DESC
        """, (session['user_id'],))
        
        events = cursor.fetchall()
        
        # Convert datetime objects to strings
        for event in events:
            if event['start_datetime']:
                event['start_datetime'] = event['start_datetime'].isoformat()
            if event['end_datetime']:
                event['end_datetime'] = event['end_datetime'].isoformat()
            if event['reviewed_at']:
                event['reviewed_at'] = event['reviewed_at'].isoformat()
        
        return jsonify(events), 200
        
    except mysql.connector.Error as err:
        return jsonify({"error": f"Database error: {err}"}), 500
    
    finally:
        cursor.close()
        conn.close()

# ===================================================================
# FACULTY DASHBOARD ENDPOINTS
# ===================================================================

@app.route('/api/faculty/profile', methods=['GET', 'PUT'])
@login_required(['faculty'])
def faculty_profile():
    """Get or update faculty profile information"""
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor(dictionary=True)
    
    try:
        if request.method == 'GET':
            # Fetch complete faculty profile with faculty-specific data
            cursor.execute("""
                SELECT u.*, d.name as department_name, d.code as department_code,
                       fp.designation, fp.areas_of_expertise, fp.mentorship_capacity,
                       fp.current_mentees, fp.is_accepting_requests, fp.office_location
                FROM users u 
                LEFT JOIN departments d ON u.department_id = d.id 
                LEFT JOIN faculty_profiles fp ON u.id = fp.user_id
                WHERE u.id = %s AND u.role = 'faculty'
            """, (session['user_id'],))
            
            profile = cursor.fetchone()
            if not profile:
                return jsonify({"error": "Faculty profile not found"}), 404

            # Parse JSON fields safely
            if profile.get('skills'):
                try:
                    profile['skills'] = json.loads(profile['skills'])
                except:
                    profile['skills'] = []
            else:
                profile['skills'] = []
                
            if profile.get('areas_of_expertise'):
                try:
                    profile['areas_of_expertise'] = json.loads(profile['areas_of_expertise'])
                except:
                    profile['areas_of_expertise'] = []
            else:
                profile['areas_of_expertise'] = []

            # Remove sensitive data
            profile.pop('password_hash', None)
            
            return jsonify(profile), 200
            
        else:  # PUT - Update profile
            data = request.get_json()
            if not data:
                return jsonify({"error": "No data provided"}), 400

            # Update users table fields
            user_fields = []
            user_values = []
            
            allowed_user_fields = {
                'full_name': 'full_name',
                'bio': 'bio',
                'avatar_url': 'avatar_url'
            }
            
            for field_name, db_column in allowed_user_fields.items():
                if field_name in data:
                    user_fields.append(f"{db_column} = %s")
                    user_values.append(data[field_name])

            # Handle skills array
            if 'skills' in data:
                user_fields.append("skills = %s")
                skills = data['skills'] if isinstance(data['skills'], list) else []
                user_values.append(json.dumps(skills))

            # Update users table if we have fields
            if user_fields:
                user_values.append(session['user_id'])
                sql = f"UPDATE users SET {', '.join(user_fields)}, updated_at = NOW() WHERE id = %s"
                cursor.execute(sql, user_values)

            # Update faculty_profiles table
            faculty_fields = []
            faculty_values = []
            
            faculty_field_map = {
                'designation': 'designation',
                'mentorship_capacity': 'mentorship_capacity',
                'is_accepting_requests': 'is_accepting_requests',
                'office_location': 'office_location'
            }
            
            for field_name, db_column in faculty_field_map.items():
                if field_name in data:
                    faculty_fields.append(f"{db_column} = %s")
                    faculty_values.append(data[field_name])

            # Handle areas of expertise
            if 'areas_of_expertise' in data:
                faculty_fields.append("areas_of_expertise = %s")
                expertise = data['areas_of_expertise'] if isinstance(data['areas_of_expertise'], list) else []
                faculty_values.append(json.dumps(expertise))

            # Update faculty_profiles table if we have fields
            if faculty_fields:
                faculty_values.append(session['user_id'])
                sql = f"UPDATE faculty_profiles SET {', '.join(faculty_fields)}, updated_at = NOW() WHERE user_id = %s"
                cursor.execute(sql, faculty_values)

            conn.commit()
            return jsonify({"message": "Profile updated successfully"}), 200

    # Continuation from faculty profile update section

    except mysql.connector.Error as err:
        conn.rollback()
        return jsonify({"error": f"Database error: {err}"}), 500

    finally:
        cursor.close()
        conn.close()

# ===================================================================
# FACULTY DASHBOARD - ADDITIONAL ENDPOINTS
# ===================================================================

@app.route('/api/faculty/events', methods=['GET'])
@login_required(['faculty'])
def get_faculty_events():
    """Get events organized by current faculty member"""
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor(dictionary=True)
    
    try:
        # Get both official faculty events and supervised student events
        cursor.execute("""
            SELECT e.*, 
                   u.full_name as organizer_name,
                   COUNT(DISTINCT er.user_id) as participant_count
            FROM events e
            LEFT JOIN users u ON e.organizer_id = u.id
            LEFT JOIN event_registrations er ON e.id = er.event_id
            WHERE (e.organizer_id = %s OR e.reviewed_by = %s)
            GROUP BY e.id
            ORDER BY e.created_at DESC
        """, (session['user_id'], session['user_id']))
        
        events = cursor.fetchall()
        
        # Convert datetime objects to strings for JSON serialization
        for event in events:
            if event['start_datetime']:
                event['start_datetime'] = event['start_datetime'].isoformat()
            if event['end_datetime']:
                event['end_datetime'] = event['end_datetime'].isoformat()
            if event['reviewed_at']:
                event['reviewed_at'] = event['reviewed_at'].isoformat()
        
        return jsonify(events), 200
        
    except mysql.connector.Error as err:
        return jsonify({"error": f"Database error: {err}"}), 500
    
    finally:
        cursor.close()
        conn.close()

@app.route('/api/faculty/proposals', methods=['GET'])
@login_required(['faculty'])
def get_pending_proposals():
    """Get student event proposals pending faculty approval"""
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor(dictionary=True)
    
    try:
        # Get pending proposals (events waiting for faculty approval)
        cursor.execute("""
            SELECT e.*, 
                   u.full_name as student_name,
                   u.email as student_email,
                   d.name as department_name
            FROM events e
            JOIN users u ON e.organizer_id = u.id
            LEFT JOIN departments d ON u.department_id = d.id
            WHERE e.status = 'pending_approval' 
            AND u.role = 'student'
            ORDER BY e.created_at ASC
        """)
        
        proposals = cursor.fetchall()
        
        # Convert datetime objects to strings
        for proposal in proposals:
            if proposal['start_datetime']:
                proposal['start_datetime'] = proposal['start_datetime'].isoformat()
            if proposal['end_datetime']:
                proposal['end_datetime'] = proposal['end_datetime'].isoformat()
            if proposal['created_at']:
                proposal['created_at'] = proposal['created_at'].isoformat()
        
        return jsonify(proposals), 200
        
    except mysql.connector.Error as err:
        return jsonify({"error": f"Database error: {err}"}), 500
    
    finally:
        cursor.close()
        conn.close()

@app.route('/api/faculty/proposals/<int:proposal_id>/action', methods=['POST'])
@login_required(['faculty'])
def handle_proposal_action(proposal_id):
    """Approve, deny, or request changes for a student proposal"""
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor(dictionary=True)
    data = request.get_json()
    
    if not data or 'action' not in data:
        return jsonify({"error": "Action is required"}), 400

    action = data['action']  # 'approve', 'deny', 'changes'
    notes = data.get('notes', '')
    meeting_location = data.get('meeting_location', '')
    
    try:
        # Verify the proposal exists and is pending
        cursor.execute("SELECT * FROM events WHERE id = %s AND status = 'pending_approval'", (proposal_id,))
        proposal = cursor.fetchone()
        
        if not proposal:
            return jsonify({"error": "Proposal not found or already processed"}), 404
        
        # Update proposal based on action
        if action == 'approve':
            cursor.execute("""
                UPDATE events 
                SET status = 'approved', reviewed_by = %s, reviewed_at = NOW(), admin_notes = %s
                WHERE id = %s
            """, (session['user_id'], notes, proposal_id))
            
            message = "Proposal approved successfully"
            
        elif action == 'deny':
            cursor.execute("""
                UPDATE events 
                SET status = 'denied', reviewed_by = %s, reviewed_at = NOW(), admin_notes = %s
                WHERE id = %s
            """, (session['user_id'], notes, proposal_id))
            
            message = "Proposal denied"
            
        elif action == 'changes':
            cursor.execute("""
                UPDATE events 
                SET status = 'revision_requested', reviewed_by = %s, reviewed_at = NOW(), admin_notes = %s
                WHERE id = %s
            """, (session['user_id'], notes + (f" Meeting location: {meeting_location}" if meeting_location else ""), proposal_id))
            
            message = "Changes requested - student has been notified"
        
        else:
            return jsonify({"error": "Invalid action"}), 400
        
        conn.commit()
        return jsonify({"message": message}), 200
        
    except mysql.connector.Error as err:
        conn.rollback()
        return jsonify({"error": f"Database error: {err}"}), 500
    
    finally:
        cursor.close()
        conn.close()

@app.route('/api/faculty/create-event', methods=['POST'])
@login_required(['faculty'])
def create_faculty_event():
    """Create a new official faculty event"""
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor()
    data = request.get_json()
    
    required_fields = ['title', 'description', 'start_datetime', 'category']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400
    
    try:
        # Parse datetime
        try:
            start_datetime = datetime.fromisoformat(data['start_datetime'].replace('Z', '+00:00'))
            end_datetime = None
            if data.get('end_datetime'):
                end_datetime = datetime.fromisoformat(data['end_datetime'].replace('Z', '+00:00'))
        except ValueError:
            return jsonify({"error": "Invalid datetime format"}), 400
        
        # Create event with approved status (faculty events are auto-approved)
        cursor.execute("""
            INSERT INTO events 
            (title, description, start_datetime, end_datetime, location, category, 
             eligibility_criteria, registration_form_url, organizer_id, status, reviewed_by, reviewed_at) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 'approved', %s, NOW())
        """, (
            data['title'],
            data['description'],
            start_datetime,
            end_datetime,
            data.get('location'),
            data['category'],
            data.get('eligibility_criteria'),
            data.get('registration_form_url'),
            session['user_id'],
            session['user_id']  # Faculty member reviews their own event
        ))
        
        conn.commit()
        return jsonify({"message": "Event created successfully!"}), 201
        
    except mysql.connector.Error as err:
        conn.rollback()
        return jsonify({"error": f"Database error: {err}"}), 500
    
    finally:
        cursor.close()
        conn.close()

@app.route('/api/faculty/mentorship', methods=['GET'])
@login_required(['faculty'])
def get_mentorship_info():
    """Get faculty mentorship information and active mentees"""
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor(dictionary=True)
    
    try:
        # Get active mentorship relationships
        cursor.execute("""
            SELECT mr.*, 
                   u.full_name as mentee_name,
                   u.email as mentee_email,
                   d.name as department_name
            FROM mentorship_relationships mr
            JOIN users u ON mr.mentee_id = u.id
            LEFT JOIN departments d ON u.department_id = d.id
            WHERE mr.mentor_id = %s AND mr.status = 'active'
            ORDER BY mr.created_at DESC
        """, (session['user_id'],))
        
        active_mentees = cursor.fetchall()
        
        # Get collaboration feed (recent collaboration posts from students)
        cursor.execute("""
            SELECT cp.*, 
                   u.full_name as author_name,
                   u.email as author_email
            FROM collaboration_posts cp
            JOIN users u ON cp.author_id = u.id
            WHERE cp.status = 'active'
            ORDER BY cp.created_at DESC
            LIMIT 10
        """)
        
        collaboration_feed = cursor.fetchall()
        
        # Convert datetime objects
        for mentee in active_mentees:
            if mentee['created_at']:
                mentee['created_at'] = mentee['created_at'].isoformat()
            if mentee['updated_at']:
                mentee['updated_at'] = mentee['updated_at'].isoformat()
        
        for post in collaboration_feed:
            if post['created_at']:
                post['created_at'] = post['created_at'].isoformat()
            if post['updated_at']:
                post['updated_at'] = post['updated_at'].isoformat()
            # Parse skills JSON
            if post.get('skills_required'):
                try:
                    post['skills_required'] = json.loads(post['skills_required'])
                except:
                    post['skills_required'] = []
        
        return jsonify({
            "active_mentees": active_mentees,
            "collaboration_feed": collaboration_feed
        }), 200
        
    except mysql.connector.Error as err:
        return jsonify({"error": f"Database error: {err}"}), 500
    
    finally:
        cursor.close()
        conn.close()

# ===================================================================
# ADMIN DASHBOARD ENDPOINTS
# ===================================================================

@app.route('/api/admin/analytics', methods=['GET'])
@login_required(['admin'])
def get_admin_analytics():
    """Get comprehensive analytics for admin dashboard"""
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor(dictionary=True)
    
    try:
        analytics = {}
        
        # Get user statistics
        cursor.execute("SELECT role, status, COUNT(*) as count FROM users GROUP BY role, status")
        user_stats = cursor.fetchall()
        analytics['user_stats'] = user_stats
        
        # Get event statistics
        cursor.execute("SELECT category, status, COUNT(*) as count FROM events GROUP BY category, status")
        event_stats = cursor.fetchall()
        analytics['event_stats'] = event_stats
        
        # Get monthly participation data
        cursor.execute("""
            SELECT DATE_FORMAT(er.registered_at, '%Y-%m') as month,
                   COUNT(*) as registrations
            FROM event_registrations er
            WHERE er.registered_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
            GROUP BY month
            ORDER BY month
        """)
        monthly_participation = cursor.fetchall()
        analytics['monthly_participation'] = monthly_participation
        
        # Get department-wise engagement
        cursor.execute("""
            SELECT d.name as department,
                   COUNT(DISTINCT u.id) as total_users,
                   COUNT(DISTINCT e.id) as events_organized,
                   COUNT(DISTINCT er.id) as total_registrations
            FROM departments d
            LEFT JOIN users u ON d.id = u.department_id
            LEFT JOIN events e ON u.id = e.organizer_id
            LEFT JOIN event_registrations er ON u.id = er.user_id
            GROUP BY d.id, d.name
            ORDER BY total_registrations DESC
        """)
        department_stats = cursor.fetchall()
        analytics['department_stats'] = department_stats
        
        return jsonify(analytics), 200
        
    except mysql.connector.Error as err:
        return jsonify({"error": f"Database error: {err}"}), 500
    
    finally:
        cursor.close()
        conn.close()

@app.route('/api/admin/users', methods=['GET'])
@login_required(['admin'])
def get_all_users():
    """Get all users with filtering options"""
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor(dictionary=True)
    
    try:
        # Get query parameters
        role_filter = request.args.get('role', '')
        status_filter = request.args.get('status', '')
        
        # Build query based on filters
        query = """
            SELECT u.*, d.name as department_name
            FROM users u 
            LEFT JOIN departments d ON u.department_id = d.id
            WHERE 1=1
        """
        params = []
        
        if role_filter:
            query += " AND u.role = %s"
            params.append(role_filter)
        
        if status_filter:
            query += " AND u.status = %s"
            params.append(status_filter)
        
        query += " ORDER BY u.created_at DESC"
        
        cursor.execute(query, params)
        users = cursor.fetchall()
        
        # Remove sensitive data
        for user in users:
            user.pop('password_hash', None)
            if user['created_at']:
                user['created_at'] = user['created_at'].isoformat()
            if user['updated_at']:
                user['updated_at'] = user['updated_at'].isoformat()
        
        return jsonify(users), 200
        
    except mysql.connector.Error as err:
        return jsonify({"error": f"Database error: {err}"}), 500
    
    finally:
        cursor.close()
        conn.close()

@app.route('/api/admin/users/<int:user_id>/action', methods=['POST'])
@login_required(['admin'])
def handle_user_action(user_id):
    """Approve, deny, or remove users"""
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor(dictionary=True)
    data = request.get_json()
    
    if not data or 'action' not in data:
        return jsonify({"error": "Action is required"}), 400

    action = data['action']  # 'approve', 'deny', 'remove'
    
    try:
        if action == 'approve':
            cursor.execute("UPDATE users SET status = 'active' WHERE id = %s", (user_id,))
            message = "User approved successfully"
            
        elif action == 'deny' or action == 'remove':
            cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
            message = "User removed from system"
            
        else:
            return jsonify({"error": "Invalid action"}), 400
        
        conn.commit()
        return jsonify({"message": message}), 200
        
    except mysql.connector.Error as err:
        conn.rollback()
        return jsonify({"error": f"Database error: {err}"}), 500
    
    finally:
        cursor.close()
        conn.close()

@app.route('/api/admin/events', methods=['GET'])
@login_required(['admin'])
def get_all_events():
    """Get all events for admin management"""
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("""
            SELECT e.*, 
                   u.full_name as organizer_name,
                   u.role as organizer_role,
                   d.name as organizer_department,
                   COUNT(DISTINCT er.user_id) as participant_count
            FROM events e
            JOIN users u ON e.organizer_id = u.id
            LEFT JOIN departments d ON u.department_id = d.id
            LEFT JOIN event_registrations er ON e.id = er.event_id
            GROUP BY e.id
            ORDER BY e.created_at DESC
        """)
        
        events = cursor.fetchall()
        
        # Convert datetime objects
        for event in events:
            if event['start_datetime']:
                event['start_datetime'] = event['start_datetime'].isoformat()
            if event['end_datetime']:
                event['end_datetime'] = event['end_datetime'].isoformat()
            if event['created_at']:
                event['created_at'] = event['created_at'].isoformat()
            if event['reviewed_at']:
                event['reviewed_at'] = event['reviewed_at'].isoformat()
        
        return jsonify(events), 200
        
    except mysql.connector.Error as err:
        return jsonify({"error": f"Database error: {err}"}), 500
    
    finally:
        cursor.close()
        conn.close()

@app.route('/api/admin/events/<int:event_id>/feature', methods=['POST'])
@login_required(['admin'])
def toggle_event_feature(event_id):
    """Toggle event featured status on homepage"""
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor()
    data = request.get_json()
    
    if 'featured' not in data:
        return jsonify({"error": "Featured status is required"}), 400
    
    featured = bool(data['featured'])
    
    try:
        cursor.execute("UPDATE events SET is_featured = %s WHERE id = %s", (featured, event_id))
        conn.commit()
        
        action = "featured" if featured else "unfeatured"
        return jsonify({"message": f"Event {action} successfully"}), 200
        
    except mysql.connector.Error as err:
        conn.rollback()
        return jsonify({"error": f"Database error: {err}"}), 500
    
    finally:
        cursor.close()
        conn.close()

@app.route('/api/admin/announcements', methods=['GET', 'POST'])
@login_required(['admin'])
def handle_announcements():
    """Get all announcements or create new one"""
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor(dictionary=True)
    
    try:
        if request.method == 'GET':
            cursor.execute("""
                SELECT a.*, u.full_name as created_by_name
                FROM announcements a
                JOIN users u ON a.created_by = u.id
                ORDER BY a.created_at DESC
            """)
            
            announcements = cursor.fetchall()
            
            for announcement in announcements:
                if announcement['created_at']:
                    announcement['created_at'] = announcement['created_at'].isoformat()
                if announcement['expires_at']:
                    announcement['expires_at'] = announcement['expires_at'].isoformat()
            
            return jsonify(announcements), 200
            
        else:  # POST - Create announcement
            data = request.get_json()
            
            required_fields = ['title', 'message', 'target_audience']
            if not all(field in data for field in required_fields):
                return jsonify({"error": "Missing required fields"}), 400
            
            cursor.execute("""
                INSERT INTO announcements 
                (title, message, target_audience, priority, is_banner, created_by, expires_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                data['title'],
                data['message'],
                data['target_audience'],
                data.get('priority', 'normal'),
                data.get('is_banner', False),
                session['user_id'],
                data.get('expires_at')
            ))
            
            conn.commit()
            return jsonify({"message": "Announcement created successfully!"}), 201
        
    except mysql.connector.Error as err:
        if request.method == 'POST':
            conn.rollback()
        return jsonify({"error": f"Database error: {err}"}), 500
    
    finally:
        cursor.close()
        conn.close()

@app.route('/api/admin/settings', methods=['GET', 'PUT'])
@login_required(['admin'])
def handle_platform_settings():
    """Get or update platform settings"""
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor(dictionary=True)
    
    try:
        if request.method == 'GET':
            cursor.execute("SELECT * FROM platform_settings")
            settings = cursor.fetchall()
            
            # Convert to key-value dict
            settings_dict = {setting['setting_key']: setting['setting_value'] for setting in settings}
            return jsonify(settings_dict), 200
            
        else:  # PUT - Update settings
            data = request.get_json()
            if not data:
                return jsonify({"error": "No settings data provided"}), 400
            
            for key, value in data.items():
                cursor.execute("""
                    INSERT INTO platform_settings (setting_key, setting_value, updated_by)
                    VALUES (%s, %s, %s)
                    ON DUPLICATE KEY UPDATE 
                    setting_value = VALUES(setting_value), 
                    updated_by = VALUES(updated_by),
                    updated_at = NOW()
                """, (key, str(value), session['user_id']))
            
            conn.commit()
            return jsonify({"message": "Settings updated successfully!"}), 200
        
    except mysql.connector.Error as err:
        if request.method == 'PUT':
            conn.rollback()
        return jsonify({"error": f"Database error: {err}"}), 500
    
    finally:
        cursor.close()
        conn.close()

# ===================================================================
# ERROR HANDLERS & MAIN
# ===================================================================

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    # Run in debug mode for development
    app.run(debug=True, host='0.0.0.0', port=5000)