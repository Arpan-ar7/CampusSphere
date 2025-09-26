/* FILE: student-dashboard.js */

document.addEventListener('DOMContentLoaded', () => {
    // ===================================================================
    // INITIALIZATION
    // ===================================================================
    lucide.createIcons();

    // ===================================================================
    // CONFIGURATION - API Base URL
    // ===================================================================
    const API_BASE_URL = 'http://localhost:5000/api'; // Your Flask backend URL

    // ===================================================================
    // STATE MANAGEMENT for Student Dashboard
    // ===================================================================
    const state = {
        currentStudentPage: 'home', // Default page is 'home'
        selectedAchievements: new Set(),
        currentUser: JSON.parse(sessionStorage.getItem('currentUser') || '{}'), // NEW: Get user from session
        collaborateCurrentTab: 'all-posts', // NEW: Track collaborate tab
        submittedEvents: [], // NEW: Track submitted events
        collaborationPosts: [], // NEW: Track collaboration posts
        interestedPosts: new Set(), // NEW: Track posts user is interested in
        chatMessages: [], // NEW: Track chat messages
    };

    // ===================================================================
    // ENHANCED DUMMY DATA for Student Dashboard
    // ===================================================================
    const dummyData = {
        user: {
            id: state.currentUser.id || 1,
            name: state.currentUser.fullName || 'Arpan Kumar Panda',
            officialName: 'Arpan Kumar Panda',
            email: state.currentUser.email || 'arpan.panda126649@marwadiuniversity.ac.in',
            bio: "Student at CampusSphere University, passionate about technology and community engagement. Always eager to collaborate on innovative projects and learn new skills.",
            department: 'Computer Science Engineering',
            branch: 'CSE core',
            semester: '3',
            class: '3EV-5',
            enrollmentNo: '92400120098',
            skills: ['Python', 'Teamwork', 'Communication','Machine Learning',''],
            avatarUrl: "images/studentprofile.png"
            
        },
        
        events: [
            { 
                id: 1, 
                title: 'Annual Tech Innovate Challenge', 
                category: 'Technical', 
                isEligible: true,
                date: 'Nov 15, 2024',
                time: '10:00 AM - 5:00 PM',
                location: 'Engineering Building Auditorium', 
                eligibility: 'Open to all Engineering & CS students (Year 2 and above)',
                description: 'A campus-wide hackathon focusing on AI and sustainable solutions. Join teams to build innovative projects that can solve real-world problems. This is a great opportunity to showcase your skills, network with peers, and win exciting prizes.',
                schedule: [
                    { time: '10:00 AM', task: 'Registration & Team Formation' },
                    { time: '11:00 AM', task: 'Keynote Speech by Dr. Vance' },
                    { time: '11:30 AM', task: 'Hackathon Begins' },
                ],
                facultyContact: { name: 'Dr. Eleanor Vance', email: 'e.vance@university.edu' },
                imageUrl: 'https://images.unsplash.com/photo-1605379399642-870262d3d051?q=80&w=800',
                hasGoogleForm: false, // NEW: Track if event has Google Form
                googleFormUrl: '' // NEW: Google Form URL if available
            },
            { 
                id: 2, 
                title: 'Global Culture Fest', 
                category: 'Cultural', 
                isEligible: false,
                date: 'Dec 01, 2024',
                time: '12:00 PM - 6:00 PM',
                location: 'Student Union Plaza', 
                eligibility: 'Open to all students and faculty',
                description: 'Celebrate diversity with international food stalls, music, and dance performances from around the world. A vibrant event to experience global cultures right here on campus.',
                schedule: [
                    { time: '12:00 PM', task: 'Event Kick-off & Food Stalls Open' },
                    { time: '02:00 PM', task: 'Cultural Dance Performances' },
                    { time: '04:00 PM', task: 'Live Music Band' },
                ],
                facultyContact: { name: 'Dr. Aisha Khan', email: 'a.khan@university.edu' },
                imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=800',
                hasGoogleForm: true, // NEW: Has Google Form
                googleFormUrl: 'https://forms.google.com/culture-fest'
            },
            { 
                id: 3, 
                title: 'Inter-Departmental Sports Day', 
                category: 'Sports', 
                isEligible: false,
                date: 'Oct 28, 2024',
                time: '9:00 AM - 4:00 PM',
                location: 'Campus Sports Complex', 
                eligibility: 'Requires registration through department sports clubs',
                description: 'A day of friendly competition across various sports like football, basketball, and volleyball. Come cheer for your department and participate in fun mini-games.',
                schedule: [
                    { time: '09:00 AM', task: 'Opening Ceremony' },
                    { time: '10:00 AM', task: 'Track & Field Events' },
                    { time: '01:00 PM', task: 'Team Sports Finals' },
                ],
                facultyContact: { name: 'Coach David Lee', email: 'd.lee@university.edu' },
                imageUrl: "images/sports.png",

                hasGoogleForm: false,
                googleFormUrl: ''
            },
            { 
                id: 4, 
                title: 'Future Leaders Summit', 
                category: 'Academic', 
                isEligible: true,
                date: 'Nov 05, 2024',
                time: '1:00 PM - 5:00 PM',
                location: 'Business School Lecture Hall', 
                eligibility: 'Open to all students with a minimum 3.0 GPA',
                description: 'Discover pathways to leadership with keynote speakers from top companies and interactive workshops designed to build your professional skills.',
                schedule: [
                    { time: '01:00 PM', task: 'Welcome & Introduction' },
                    { time: '01:30 PM', task: 'Keynote: "Leadership in the Digital Age"' },
                    { time: '03:00 PM', task: 'Breakout Session: Networking Skills' },
                ],
                facultyContact: { name: 'Prof. Sarah Chen', email: 's.chen@university.edu' },
                imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=800',
                hasGoogleForm: true,
                googleFormUrl: 'https://forms.google.com/leadership-summit'
            },
            { 
                id: 5, 
                title: 'Intro to Web Development', 
                category: 'Workshop', 
                isEligible: true,
                date: 'Oct 10, 2024',
                time: '6:00 PM - 8:00 PM',
                location: 'Computer Lab 203', 
                eligibility: 'Open to all students, no prior experience needed',
                description: 'Learn the basics of HTML, CSS, and JavaScript in this hands-on workshop. A perfect starting point for anyone interested in building websites.',
                schedule: [
                    { time: '06:00 PM', task: 'Introduction to HTML & CSS' },
                    { time: '07:00 PM', task: 'Hands-on JavaScript exercises' },
                ],
                facultyContact: { name: 'Dr. Ben Carter', email: 'b.carter@university.edu' },
                imageUrl: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=800',
                hasGoogleForm: false,
                googleFormUrl: ''
            },
            { 
                id: 6, 
                title: 'Fall Semester Welcome Party', 
                category: 'Social', 
                isEligible: false,
                date: 'Sep 20, 2024',
                time: '5:00 PM onwards',
                location: 'University Garden', 
                eligibility: 'Open to all students',
                description: 'Kick off the new semester with music, games, and free food. A great chance to meet new friends and relax before classes ramp up.',
                schedule: [
                    { time: '05:00 PM', task: 'DJ and Music' },
                    { time: '06:00 PM', task: 'Food and Refreshments' },
                ],
                facultyContact: { name: 'Student Affairs Office', email: 'student.affairs@university.edu' },
                imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=800',
                hasGoogleForm: false,
                googleFormUrl: ''
            }
        ],

        // NEW: Enhanced collaboration posts with team size tracking
        collaborationPosts: [
            { 
                id: 1, 
                title: 'Teammate needed for SIH 2025', 
                description: 'Looking for enthusiastic and skilled developers to join our team for Smart India Hackathon 2025. We are focusing on an AI-driven solution for sustainable urban farming.', 
                skills: ['AI/ML', 'Python', 'IoT', 'Data Science'], 
                author: 'Alex Johnson',
                authorId: 2,
                teamSizeNeeded: 3,
                interestedCount: 7,
                hasGoogleForm: true,
                googleFormUrl: 'https://forms.google.com/sih-team',
                postedDate: '2024-10-20',
                imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800' 
            },
            { 
                id: 2, 
                title: 'Web Dev for Campus Event Portal', 
                description: 'Seeking frontend and backend developers for a new campus event management portal. Technologies include React, Node.js, and MongoDB. Help us build a seamless experience.', 
                skills: ['React', 'Node.js', 'MongoDB', 'Full-stack'], 
                author: 'Sarah Kim',
                authorId: 3,
                teamSizeNeeded: 2,
                interestedCount: 4,
                hasGoogleForm: false,
                googleFormUrl: '',
                postedDate: '2024-10-18',
                imageUrl: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=800' 
            },
            { 
                id: 3, 
                title: 'Research Assistant for Robotics', 
                description: 'Opportunity for a passionate student to assist in a cutting-edge robotics research project. Focus on robotic arm control and path planning. Experience with ROS, OpenCV is valued.', 
                skills: ['Robotics', 'ROS', 'OpenCV', 'C++'], 
                author: 'Mike Chen',
                authorId: 4,
                teamSizeNeeded: 1,
                interestedCount: 12,
                hasGoogleForm: false,
                googleFormUrl: '',
                postedDate: '2024-10-15',
                imageUrl: 'images/robotics.png' 
            },
            { 
                id: 4, 
                title: 'Content Creator for Campus Blog', 
                description: 'The Campus Chronicle is looking for creative writers and multimedia content creators to cover university events, student stories, and academic achievements.', 
                skills: ['Content Writing', 'Journalism', 'Photography'], 
                author: 'Emily Davis',
                authorId: 5,
                teamSizeNeeded: 4,
                interestedCount: 8,
                hasGoogleForm: true,
                googleFormUrl: 'https://forms.google.com/campus-blog',
                postedDate: '2024-10-12',
                imageUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=800' 
            }
        ],

        achievements: [
            { id: 1, title: 'Annual Inter-University Hackathon', role: 'Winner - Best Innovative Solution', date: 'March 15-17, 2024' },
            { id: 2, title: "CampusSphere Freshers' Fest", role: 'Volunteer Organizer', date: 'September 22, 2023' },
            { id: 3, title: 'National AI Symposium', role: 'Participant', date: 'November 5-6, 2023' },
            { id: 4, title: 'Student Leadership Summit', role: 'Panel Speaker', date: 'February 10, 2024' },
            { id: 5, title: 'University Chess Championship', role: 'Runner-up', date: 'April 1, 2024' },
            { id: 6, title: 'Data Science Workshop Series', role: 'Course Completion Certificate', date: 'Jan 15 - Feb 28, 2024' },
            { id: 7, title: 'Campus Blood Donation Drive', role: 'Event Coordinator', date: 'October 10, 2023' },
            { id: 8, title: 'Sustainable Living Challenge', role: 'Team Leader', date: 'July 1-31, 2023' }
        ],

        // NEW: Sample submitted events
        submittedEvents: [
            {
                id: 1,
                title: 'AI Workshop for Beginners',
                status: 'pending',
                submittedDate: '2024-10-15',
                category: 'Workshop',
                description: 'An introductory workshop on AI and machine learning concepts.',
                mentor: 'Dr. Smith'
            },
            {
                id: 2,
                title: 'Cultural Dance Competition',
                status: 'approved',
                submittedDate: '2024-10-10',
                category: 'Cultural',
                description: 'Inter-departmental dance competition showcasing various cultural styles.',
                mentor: 'Prof. Johnson'
            }
        ]
    };

    // ===================================================================
    // DOM ELEMENT SELECTORS for Student Dashboard
    // ===================================================================
    const DOMElements = {
        header: {
            profileDropdownBtn: document.getElementById('profile-dropdown-btn'),
            profileDropdownMenu: document.getElementById('profile-dropdown-menu'),
            profileMenuBtn: document.getElementById('profile-menu-btn'),
            logoutMenuBtn: document.getElementById('logout-menu-btn')
        },
        navLinks: document.querySelectorAll('.student-nav-link'),
        desktopNavLinks: document.querySelectorAll('.student-nav-link-desktop'),
        pages: document.querySelectorAll('.student-page'),
        home: {
            exploreBtn: document.querySelector('#student-home-page button')
        },
        discover: {
            filterButtons: document.querySelectorAll('#student-discover-page .filter-btn'),
            eventGrid: document.querySelector('#student-discover-page .grid'),
            eligibleToggle: document.getElementById('eligible-toggle'),
        },
        collaborate: {
            postGrid: document.querySelector('#student-collaborate-page .grid'),
            addCollabBtn: document.getElementById('add-collaboration-btn'),
            tabAllPosts: document.getElementById('tab-all-posts'),
            tabMyPosts: document.getElementById('tab-my-posts'),
            tabInterested: document.getElementById('tab-interested')
        },
        organize: {
            form: document.getElementById('organize-event-form'),
            submittedEventsGrid: document.getElementById('submitted-events-grid')
        },
        resume: {
            achievementsGrid: document.querySelector('#student-resume-page .grid'),
            selectAllCheckbox: document.getElementById('select-all-achievements'),
            downloadPdfBtn: document.getElementById('download-resume-pdf-btn'),
        },
        profile: {
            form: document.getElementById('profile-form'),
            avatarImg: document.getElementById('profile-avatar-img'),
            uploadAvatarBtn: document.getElementById('upload-avatar-btn'),
            avatarUpload: document.getElementById('avatar-upload'),
            displayName: document.getElementById('profile-display-name'),
            email: document.getElementById('profile-email'),
            skillsContainer: document.getElementById('skills-container'),
            newSkillInput: document.getElementById('new-skill-input'),
            addSkillBtn: document.getElementById('add-skill-btn'),
            suggestionTags: document.querySelectorAll('.suggestion-tag'),
            saveProfileBtn: document.getElementById('save-profile-btn')
        },
        darkModeToggle: document.getElementById('dark-mode-toggle'),
        
        // NEW: Modal elements
        modals: {
            eventDetails: document.getElementById('event-details-modal'),
            eventRegistration: document.getElementById('event-registration-modal'),
            addCollaboration: document.getElementById('add-collaboration-modal'),
            collaborationChat: document.getElementById('collaboration-chat-modal'),
            notification: document.getElementById('notification')
        }
    };

    // ===================================================================
    // UTILITY FUNCTIONS
    // ===================================================================
    
    // NEW: Show notification function
    function showNotification(title, message, type = 'success') {
        const notification = DOMElements.modals.notification;
        const titleEl = document.getElementById('notification-title');
        const messageEl = document.getElementById('notification-message');
        const iconEl = document.getElementById('notification-icon');
        
        titleEl.textContent = title;
        messageEl.textContent = message;
        
        // Set icon based on type
        if (type === 'success') {
            iconEl.innerHTML = '<i data-lucide="check-circle" class="w-6 h-6 text-green-500"></i>';
        } else if (type === 'error') {
            iconEl.innerHTML = '<i data-lucide="x-circle" class="w-6 h-6 text-red-500"></i>';
        } else if (type === 'warning') {
            iconEl.innerHTML = '<i data-lucide="alert-triangle" class="w-6 h-6 text-yellow-500"></i>';
        }
        
        notification.classList.remove('hidden');
        lucide.createIcons();
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            hideNotification();
        }, 5000);
    }

    function hideNotification() {
        const notification = DOMElements.modals.notification;
        notification.classList.add('hiding');
        setTimeout(() => {
            notification.classList.add('hidden');
            notification.classList.remove('hiding');
        }, 300);
    }

    // NEW: Profile data persistence functions
    function saveProfileData() {
        const profileData = {
            officialName: document.getElementById('profile-official-name')?.value || dummyData.user.name,
            bio: document.getElementById('profile-bio')?.value || dummyData.user.bio,
            department: document.getElementById('profile-department')?.value || dummyData.user.department,
            branch: document.getElementById('profile-branch')?.value || dummyData.user.branch,
            semester: document.getElementById('profile-semester')?.value || dummyData.user.semester,
            class: document.getElementById('profile-class')?.value || dummyData.user.class,
            enrollmentNo: document.getElementById('profile-enrollment')?.value || dummyData.user.enrollmentNo,
            skills: dummyData.user.skills,
            avatarUrl: dummyData.user.avatarUrl
        };
        
        // Save to localStorage for persistence
        localStorage.setItem('studentProfile', JSON.stringify(profileData));
        
        // Update dummy data
        Object.assign(dummyData.user, profileData);
        
        // Update display name in header
        DOMElements.profile.displayName.textContent = profileData.officialName;
        
        showNotification('Profile Updated', 'Your profile changes have been saved successfully!');
    }

    function loadProfileData() {
        const savedProfile = localStorage.getItem('studentProfile');
        if (savedProfile) {
            const profileData = JSON.parse(savedProfile);
            Object.assign(dummyData.user, profileData);
            
            // Update form fields if they exist
            const fields = [
                'profile-official-name',
                'profile-bio', 
                'profile-department',
                'profile-branch',
                'profile-semester',
                'profile-class',
                'profile-enrollment'
            ];
            
            fields.forEach(fieldId => {
                const element = document.getElementById(fieldId);
                if (element && profileData[fieldId.replace('profile-', '')]) {
                    element.value = profileData[fieldId.replace('profile-', '')];
                }
            });
        }
    }

    // ===================================================================
    // DARK MODE FUNCTIONALITY
    // ===================================================================
    
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        updateDarkModeIcon(true);
    }

    function toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDark);
        updateDarkModeIcon(isDark);
    }

    function updateDarkModeIcon(isDark) {
        const icon = DOMElements.darkModeToggle?.querySelector('[data-lucide]');
        if (icon) {
            icon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
            lucide.createIcons();
        }
    }

    // ===================================================================
    // UI RENDERING & DYNAMIC CONTENT FUNCTIONS
    // ===================================================================

    function renderStudentPage() {
        DOMElements.pages.forEach(p => p.classList.add('hidden'));
        const currentPage = document.getElementById(`student-${state.currentStudentPage}-page`);
        if (currentPage) currentPage.classList.remove('hidden');

        [...DOMElements.navLinks, ...DOMElements.desktopNavLinks].forEach(link => {
            link.classList.toggle('active', link.dataset.page === state.currentStudentPage);
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Load page-specific data
        if (state.currentStudentPage === 'collaborate') {
            renderCollaborationPosts();
        } else if (state.currentStudentPage === 'organize') {
            renderSubmittedEvents();
        } else if (state.currentStudentPage === 'profile') {
            loadProfileData();
            renderSkills();
        }
        
        lucide.createIcons();
    }

    function renderDiscoverEvents() {
        const grid = DOMElements.discover.eventGrid;
        if (!grid) return;

        const activeFilter = document.querySelector('#student-discover-page .filter-btn.active');
        if (!activeFilter) return;
        const activeCategory = activeFilter.textContent;
        
        const isEligibleOnly = DOMElements.discover.eligibleToggle.checked;

        let eventsToDisplay = dummyData.events;
        if (isEligibleOnly) {
            eventsToDisplay = eventsToDisplay.filter(event => event.isEligible);
        }
        
        const filteredEvents = eventsToDisplay.filter(event => {
            return activeCategory === 'All' || event.category === activeCategory;
        });
        
        grid.innerHTML = '';
        if (filteredEvents.length === 0) {
            grid.innerHTML = `<p class="text-gray-500 md:col-span-3 text-center">No events match your criteria.</p>`;
            return;
        }

        filteredEvents.forEach(event => {
            const card = document.createElement('div');
            card.className = 'bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm flex flex-col transition-transform hover:scale-105 hover:shadow-lg';
            const shortDescription = event.description.length > 100 ? event.description.substring(0, 100) + '...' : event.description;
            card.innerHTML = `
                <img src="${event.imageUrl}" class="h-40 object-cover" alt="${event.title}">
                <div class="p-4 flex flex-col flex-grow">
                    <h3 class="font-bold text-lg leading-tight">${event.title}</h3>
                    <div class="text-sm text-gray-500 mt-1 mb-2 space-y-1">
                        <p class="flex items-center"><i data-lucide="calendar" class="w-4 h-4 mr-2"></i>${event.date}</p>
                        <p class="flex items-center"><i data-lucide="map-pin" class="w-4 h-4 mr-2"></i>${event.location}</p>
                    </div>
                    <p class="text-sm text-gray-600 mb-4 flex-grow">${shortDescription}</p>
                    <button data-event-id="${event.id}" class="view-details-btn mt-auto w-full bg-blue-50 text-blue-700 font-semibold py-2 rounded-lg hover:bg-blue-100 transition">View Details</button>
                </div>`;
            grid.appendChild(card);
        });
        lucide.createIcons();
    }

    // NEW: Enhanced collaboration rendering with tabs
    function renderCollaborationPosts() {
        const grid = DOMElements.collaborate.postGrid;
        if (!grid) return;

        let postsToShow = [];
        
        if (state.collaborateCurrentTab === 'all-posts') {
            postsToShow = dummyData.collaborationPosts;
        } else if (state.collaborateCurrentTab === 'my-posts') {
            postsToShow = dummyData.collaborationPosts.filter(post => post.authorId === dummyData.user.id);
        } else if (state.collaborateCurrentTab === 'interested') {
            postsToShow = dummyData.collaborationPosts.filter(post => state.interestedPosts.has(post.id));
        }

        grid.innerHTML = '';
        
        if (postsToShow.length === 0) {
            grid.innerHTML = `<div class="col-span-full text-center py-12">
                <i data-lucide="users" class="w-16 h-16 mx-auto text-gray-300 mb-4"></i>
                <h3 class="text-lg font-semibold text-gray-800 mb-2">No collaboration posts found</h3>
                <p class="text-gray-500">Be the first to post a collaboration request!</p>
            </div>`;
            lucide.createIcons();
            return;
        }

        postsToShow.forEach(post => {
            const card = document.createElement('div');
            card.className = 'collaboration-card bg-white p-5 rounded-2xl border border-gray-200 shadow-sm';
            const skillsHtml = post.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('');
            
            // Calculate progress percentage
            const progressPercent = Math.min((post.interestedCount / post.teamSizeNeeded) * 100, 100);
            
            // Determine button text and action
            let buttonHtml = '';
            if (post.authorId === dummyData.user.id) {
                buttonHtml = `
                    <div class="flex gap-2">
                        <button class="manage-post-btn flex-1 bg-green-600 text-white font-semibold py-2 rounded-lg hover:bg-green-700 transition" data-post-id="${post.id}">
                            <i data-lucide="settings" class="w-4 h-4 inline mr-2"></i>Manage (${post.interestedCount})
                        </button>
                        <button class="chat-btn bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition" data-post-id="${post.id}" title="Messages">
                            <i data-lucide="message-circle" class="w-4 h-4"></i>
                        </button>
                    </div>`;
            } else if (state.interestedPosts.has(post.id)) {
                buttonHtml = `<button class="interested-btn w-full bg-yellow-100 text-yellow-800 font-semibold py-2 rounded-lg cursor-default">Applied</button>`;
            } else {
                buttonHtml = `<button class="interest-btn w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition" data-post-id="${post.id}">I'm Interested</button>`;
            }

            card.innerHTML = `
                <img src="${post.imageUrl}" class="w-full h-32 object-cover rounded-lg mb-4">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="font-bold text-lg">${post.title}</h3>
                    <span class="text-xs text-gray-500">${post.postedDate}</span>
                </div>
                <p class="text-sm text-gray-500 mb-1">by ${post.author}</p>
                <p class="text-sm text-gray-600 mt-1 mb-3">${post.description}</p>
                <div class="flex flex-wrap gap-2 mb-4">${skillsHtml}</div>
                <div class="mb-4">
                    <div class="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Team Progress</span>
                        <span>${post.interestedCount}/${post.teamSizeNeeded} interested</span>
                    </div>
                    <div class="team-progress">
                        <div class="team-progress-bar" style="width: ${progressPercent}%"></div>
                    </div>
                </div>
                ${buttonHtml}`;
            grid.appendChild(card);
        });
        lucide.createIcons();
    }

    // NEW: Render submitted events
    function renderSubmittedEvents() {
        const grid = DOMElements.organize.submittedEventsGrid;
        if (!grid) return;

        grid.innerHTML = '';
        
        if (state.submittedEvents.length === 0) {
            grid.innerHTML = `<div class="col-span-full text-center py-8">
                <i data-lucide="calendar-x" class="w-12 h-12 mx-auto text-gray-300 mb-4"></i>
                <p class="text-gray-500">No events submitted yet.</p>
            </div>`;
            lucide.createIcons();
            return;
        }

        state.submittedEvents.forEach(event => {
            const card = document.createElement('div');
            card.className = 'bg-white p-6 rounded-2xl border border-gray-200 shadow-sm';
            
            let statusClass = 'status-pending';
            if (event.status === 'approved') statusClass = 'status-approved';
            if (event.status === 'rejected') statusClass = 'status-rejected';
            
            card.innerHTML = `
                <div class="flex justify-between items-start mb-3">
                    <h3 class="font-bold text-lg">${event.title}</h3>
                    <span class="status-badge ${statusClass}">${event.status}</span>
                </div>
                <p class="text-sm text-gray-600 mb-2">${event.description}</p>
                <div class="text-xs text-gray-500 space-y-1">
                    <p><i data-lucide="user" class="w-3 h-3 inline mr-1"></i>Mentor: ${event.mentor}</p>
                    <p><i data-lucide="calendar" class="w-3 h-3 inline mr-1"></i>Submitted: ${event.submittedDate}</p>
                    <p><i data-lucide="tag" class="w-3 h-3 inline mr-1"></i>Category: ${event.category}</p>
                </div>`;
            grid.appendChild(card);
        });
        lucide.createIcons();
    }

    function renderAchievements() {
        const grid = DOMElements.resume.achievementsGrid;
        if (!grid) return;
        grid.innerHTML = '';
        dummyData.achievements.forEach(item => {
            const card = document.createElement('div');
            const isSelected = state.selectedAchievements.has(item.id);
            card.className = `achievement-card bg-white rounded-2xl shadow-sm ${isSelected ? 'selected' : ''}`;
            
            card.innerHTML = `
                <input type="checkbox" data-achievement-id="${item.id}" class="achievement-checkbox rounded border-gray-300 text-blue-600 focus:ring-blue-500" ${isSelected ? 'checked' : ''}>
                <h3 class="font-bold text-lg">${item.title}</h3>
                <p class="flex items-center text-sm text-gray-600 mt-2">
                    <i data-lucide="user-check" class="w-4 h-4 mr-2 text-green-500"></i>${item.role}
                </p>
                <p class="flex items-center text-sm text-gray-500 mt-1">
                    <i data-lucide="calendar" class="w-4 h-4 mr-2 text-gray-400"></i>${item.date}
                </p>`;
            grid.appendChild(card);
        });
        lucide.createIcons();
    }
    
    function renderSkills() {
        const container = DOMElements.profile.skillsContainer;
        if (!container) return;
        container.innerHTML = '';
        dummyData.user.skills.forEach(skill => {
            const tag = document.createElement('span');
            tag.className = 'skill-tag-editable';
            tag.innerHTML = `${skill}<button data-skill="${skill}" class="remove-skill-btn" type="button">&times;</button>`;
            container.appendChild(tag);
        });
        
        document.querySelectorAll('.remove-skill-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const skillToRemove = btn.dataset.skill;
                dummyData.user.skills = dummyData.user.skills.filter(s => s !== skillToRemove);
                renderSkills();
            });
        });
    }

    // ===================================================================
    // HELPER FUNCTIONS
    // ===================================================================
    
    function addSkill() {
        const input = DOMElements.profile.newSkillInput;
        const skill = input.value.trim();
        if (skill && !dummyData.user.skills.includes(skill)) {
            dummyData.user.skills.push(skill);
            renderSkills();
            input.value = '';
        }
    }

    function showEventDetailsModal(event) {
        const modal = document.getElementById('event-details-modal');
        const modalContent = document.getElementById('modal-content-container');
        
        let scheduleHtml = '';
        if (event.schedule && event.schedule.length > 0) {
            const scheduleItems = event.schedule.map(item => `
                <li class="flex items-center space-x-4">
                    <span class="font-bold text-blue-600 w-24">${item.time}</span>
                    <span class="text-gray-700">${item.task}</span>
                </li>
            `).join('');
            scheduleHtml = `
                <div class="mt-6">
                    <h3 class="text-xl font-bold text-gray-800 mb-3 flex items-center"><i data-lucide="list-checks" class="w-5 h-5 mr-2 text-blue-500"></i>Schedule</h3>
                    <ul class="space-y-2 border-l-2 border-blue-100 pl-4">${scheduleItems}</ul>
                </div>
            `;
        }

        let contactHtml = '';
        if (event.facultyContact) {
            contactHtml = `
                <div class="mt-6">
                    <h3 class="text-xl font-bold text-gray-800 mb-3 flex items-center"><i data-lucide="user-check" class="w-5 h-5 mr-2 text-blue-500"></i>Faculty Contact</h3>
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <p class="text-gray-800">For any queries, please connect with <span class="font-bold">${event.facultyContact.name}</span>.</p>
                        <a href="mailto:${event.facultyContact.email}" class="text-blue-600 font-semibold hover:underline">${event.facultyContact.email}</a>
                    </div>
                </div>
            `;
        }

        // NEW: Add register button in modal
        const registerButtonHtml = `
            <div class="mt-6 p-4 bg-gray-50 rounded-lg">
                <button id="register-event-btn" data-event-id="${event.id}" class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center space-x-2">
                    <i data-lucide="calendar-plus" class="w-5 h-5"></i>
                    <span>Register for this Event</span>
                </button>
            </div>
        `;

        modalContent.innerHTML = `
            <img src="${event.imageUrl}" class="w-full h-64 object-cover rounded-t-2xl" alt="${event.title}">
            <div class="p-6 md:p-8">
                <h2 class="text-3xl font-bold text-gray-800">${event.title}</h2>
                
                <div class="flex flex-col sm:flex-row items-start sm:items-center text-gray-500 space-y-2 sm:space-y-0 sm:space-x-6 my-4">
                    <p class="flex items-center"><i data-lucide="calendar" class="w-5 h-5 mr-2 text-blue-500"></i>${event.date}</p>
                    ${event.time ? `<p class="flex items-center"><i data-lucide="clock" class="w-5 h-5 mr-2 text-blue-500"></i>${event.time}</p>` : ''}
                    <p class="flex items-center"><i data-lucide="map-pin" class="w-5 h-5 mr-2 text-blue-500"></i>${event.location}</p>
                </div>

                ${event.eligibility ? `
                <div class="flex items-center bg-yellow-100 text-yellow-800 p-3 rounded-lg my-4">
                    <i data-lucide="award" class="w-5 h-5 mr-3"></i>
                    <p><span class="font-bold">Eligibility:</span> ${event.eligibility}</p>
                </div>` : ''}

                <p class="text-gray-700 leading-relaxed mt-4">${event.description}</p>
                
                ${scheduleHtml}
                ${contactHtml}
                ${registerButtonHtml}
            </div>
        `;
        
        modal.classList.remove('hidden');
        lucide.createIcons();
    }

    // NEW: Handle event registration
    function handleEventRegistration(eventId) {
        const event = dummyData.events.find(e => e.id === eventId);
        if (!event) return;

        const modal = DOMElements.modals.eventRegistration;
        const titleEl = document.getElementById('registration-event-title');
        
        titleEl.textContent = event.title;
        modal.classList.remove('hidden');
    }

    function confirmEventRegistration() {
        const modal = DOMElements.modals.eventRegistration;
        const titleEl = document.getElementById('registration-event-title');
        const eventTitle = titleEl.textContent;
        
        // Find the event to check if it has Google Form
        const event = dummyData.events.find(e => e.title === eventTitle);
        
        modal.classList.add('hidden');
        
        if (event && event.hasGoogleForm && event.googleFormUrl) {
            // Redirect to Google Form
            showNotification(
                'Registration Complete!',
                'Redirecting you to the registration form...',
                'success'
            );
            setTimeout(() => {
                window.open(event.googleFormUrl, '_blank');
            }, 1500);
        } else {
            // Auto-register using profile data
            showNotification(
                'Successfully Registered!',
                'You have been registered using your profile information. Check your email for confirmation.',
                'success'
            );
        }
        
        // Close event details modal
        DOMElements.modals.eventDetails.classList.add('hidden');
    }

    // NEW: Handle collaboration interest
    function handleCollaborationInterest(postId) {
        const post = dummyData.collaborationPosts.find(p => p.id === postId);
        if (!post) return;

        if (post.hasGoogleForm && post.googleFormUrl) {
            // Redirect to Google Form
            showNotification(
                'Redirecting...',
                'Taking you to the collaboration form...',
                'success'
            );
            setTimeout(() => {
                window.open(post.googleFormUrl, '_blank');
            }, 1500);
        } else {
            // Use profile data and add to interested
            state.interestedPosts.add(postId);
            post.interestedCount += 1;
            
            showNotification(
                'Interest Registered!',
                'Your profile has been shared with the project author. They will contact you if selected.',
                'success'
            );
        }
        
        renderCollaborationPosts();
    }

    // NEW: Handle collaboration form submission
    function handleCollaborationSubmission(formData) {
        const newPost = {
            id: Date.now(), // Simple ID generation
            title: formData.title,
            description: formData.description,
            skills: formData.skills.split(',').map(s => s.trim()),
            author: dummyData.user.name,
            authorId: dummyData.user.id,
            teamSizeNeeded: parseInt(formData.teamSize),
            interestedCount: 0,
            hasGoogleForm: !!formData.googleFormUrl,
            googleFormUrl: formData.googleFormUrl || '',
            postedDate: new Date().toISOString().split('T')[0],
            imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800' // Default image
        };
        
        dummyData.collaborationPosts.unshift(newPost); // Add to beginning
        
        showNotification(
            'Post Created!',
            'Your collaboration request has been posted successfully.',
            'success'
        );
        
        // Switch to "My Posts" tab to show the new post
        state.collaborateCurrentTab = 'my-posts';
        updateCollaborateTabs();
        renderCollaborationPosts();
    }

    // NEW: Update collaborate tabs
    function updateCollaborateTabs() {
        const tabs = [
            { id: 'tab-all-posts', key: 'all-posts' },
            { id: 'tab-my-posts', key: 'my-posts' },
            { id: 'tab-interested', key: 'interested' }
        ];
        
        tabs.forEach(tab => {
            const element = document.getElementById(tab.id);
            if (element) {
                element.classList.toggle('active', state.collaborateCurrentTab === tab.key);
            }
        });
    }

    // NEW: Handle avatar upload
    function handleAvatarUpload(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const newAvatarUrl = e.target.result;
            dummyData.user.avatarUrl = newAvatarUrl;
            
            // Update all avatar displays
            DOMElements.profile.avatarImg.src = newAvatarUrl;
            const headerAvatar = document.querySelector('#profile-dropdown-btn img');
            if (headerAvatar) {
                headerAvatar.src = newAvatarUrl;
            }
            
            showNotification('Avatar Updated', 'Your profile picture has been updated!');
        };
        reader.readAsDataURL(file);
    }

    // ===================================================================
    // EVENT LISTENERS for Student Dashboard
    // ===================================================================

    // Dark mode toggle
    DOMElements.darkModeToggle?.addEventListener('click', toggleDarkMode);

    // Navigation
    DOMElements.desktopNavLinks.forEach(link => link.addEventListener('click', () => {
        state.currentStudentPage = link.dataset.page;
        renderStudentPage();
    }));
    
    DOMElements.navLinks.forEach(link => link.addEventListener('click', () => {
        state.currentStudentPage = link.dataset.page;
        renderStudentPage();
    }));
    
    // NEW: Profile dropdown functionality
    DOMElements.header.profileDropdownBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        DOMElements.header.profileDropdownMenu.classList.toggle('hidden');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        DOMElements.header.profileDropdownMenu?.classList.add('hidden');
    });

    DOMElements.header.profileMenuBtn?.addEventListener('click', () => {
        state.currentStudentPage = 'profile';
        renderStudentPage();
        DOMElements.header.profileDropdownMenu.classList.add('hidden');
    });

    DOMElements.header.logoutMenuBtn?.addEventListener('click', () => {
        // Clear session data and redirect
        sessionStorage.removeItem('currentUser');
        localStorage.removeItem('studentProfile');
        window.location.href = 'landing-page.html';
    });
    
    DOMElements.home.exploreBtn?.addEventListener('click', () => {
        state.currentStudentPage = 'discover';
        renderStudentPage();
    });

    // Discover page event listeners
    const discoverGrid = DOMElements.discover.eventGrid;
    if (discoverGrid) {
        discoverGrid.addEventListener('click', (e) => {
            if (e.target.classList.contains('view-details-btn') || e.target.closest('.view-details-btn')) {
                const button = e.target.closest('.view-details-btn');
                const eventId = parseInt(button.dataset.eventId);
                const eventData = dummyData.events.find(event => event.id === eventId);
                if (eventData) {
                    showEventDetailsModal(eventData);
                }
            }
        });
    }

    // NEW: Event registration handlers
    document.addEventListener('click', (e) => {
        if (e.target.id === 'register-event-btn' || e.target.closest('#register-event-btn')) {
            const button = e.target.closest('#register-event-btn');
            const eventId = parseInt(button.dataset.eventId);
            handleEventRegistration(eventId);
        }
    });

    document.getElementById('confirm-registration-btn')?.addEventListener('click', confirmEventRegistration);
    
    document.getElementById('cancel-registration-btn')?.addEventListener('click', () => {
        DOMElements.modals.eventRegistration.classList.add('hidden');
    });

    // Modal close handlers
    document.getElementById('close-event-modal-btn')?.addEventListener('click', () => {
        DOMElements.modals.eventDetails.classList.add('hidden');
    });

    document.getElementById('close-notification-btn')?.addEventListener('click', hideNotification);
    
    DOMElements.discover.filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            DOMElements.discover.filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            renderDiscoverEvents();
        });
    });

    DOMElements.discover.eligibleToggle?.addEventListener('change', renderDiscoverEvents);

    // NEW: Collaborate page event listeners
    DOMElements.collaborate.addCollabBtn?.addEventListener('click', () => {
        DOMElements.modals.addCollaboration.classList.remove('hidden');
    });

    // Collaborate tabs
    DOMElements.collaborate.tabAllPosts?.addEventListener('click', () => {
        state.collaborateCurrentTab = 'all-posts';
        updateCollaborateTabs();
        renderCollaborationPosts();
    });

    DOMElements.collaborate.tabMyPosts?.addEventListener('click', () => {
        state.collaborateCurrentTab = 'my-posts';
        updateCollaborateTabs();
        renderCollaborationPosts();
    });

    DOMElements.collaborate.tabInterested?.addEventListener('click', () => {
        state.collaborateCurrentTab = 'interested';
        updateCollaborateTabs();
        renderCollaborationPosts();
    });

    // Collaborate grid event delegation
    DOMElements.collaborate.postGrid?.addEventListener('click', (e) => {
        if (e.target.classList.contains('interest-btn') || e.target.closest('.interest-btn')) {
            const button = e.target.closest('.interest-btn');
            const postId = parseInt(button.dataset.postId);
            handleCollaborationInterest(postId);
        }
        
    });

    // NEW: Collaboration modal handlers
    document.getElementById('close-collaboration-modal-btn')?.addEventListener('click', () => {
        DOMElements.modals.addCollaboration.classList.add('hidden');
    });

    document.getElementById('cancel-collaboration-btn')?.addEventListener('click', () => {
        DOMElements.modals.addCollaboration.classList.add('hidden');
    });

    document.getElementById('collaboration-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = {
            title: document.getElementById('collab-title').value,
            description: document.getElementById('collab-description').value,
            skills: document.getElementById('collab-skills').value,
            teamSize: document.getElementById('collab-team-size').value,
            googleFormUrl: document.getElementById('collab-form-link').value
        };
        
        handleCollaborationSubmission(formData);
        e.target.reset();
        DOMElements.modals.addCollaboration.classList.add('hidden');
    });

    // NEW: Organize form handler
    DOMElements.organize.form?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newEvent = {
            id: Date.now(),
            title: document.getElementById('event-title').value,
            description: document.getElementById('event-description').value,
            category: document.getElementById('event-category').value,
            status: 'pending',
            submittedDate: new Date().toISOString().split('T')[0],
            mentor: document.getElementById('event-mentor').value
        };
        
        state.submittedEvents.unshift(newEvent);
        
        showNotification(
            'Event Submitted!',
            'Your event proposal has been submitted for faculty approval.',
            'success'
        );
        
        e.target.reset();
        renderSubmittedEvents();
    });

    // Resume page event listeners
    DOMElements.resume.achievementsGrid?.addEventListener('click', (e) => {
        if (e.target.classList.contains('achievement-checkbox')) {
            const checkbox = e.target;
            const achievementId = parseInt(checkbox.dataset.achievementId);
            const card = checkbox.closest('.achievement-card');

            if (checkbox.checked) {
                state.selectedAchievements.add(achievementId);
                card.classList.add('selected');
            } else {
                state.selectedAchievements.delete(achievementId);
                card.classList.remove('selected');
            }
            DOMElements.resume.selectAllCheckbox.checked = state.selectedAchievements.size === dummyData.achievements.length;
        }
    });

    DOMElements.resume.selectAllCheckbox?.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        if (isChecked) {
            dummyData.achievements.forEach(item => state.selectedAchievements.add(item.id));
        } else {
            state.selectedAchievements.clear();
        }
        renderAchievements();
    });

    DOMElements.resume.downloadPdfBtn?.addEventListener('click', () => {
        if (typeof window.jspdf === 'undefined') {
            showNotification('Error', 'PDF generation library is not loaded.', 'error');
            return;
        }
        if (state.selectedAchievements.size === 0) {
            showNotification('No Selection', 'Please select at least one achievement to include in the PDF.', 'warning');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const selectedItems = dummyData.achievements.filter(item => state.selectedAchievements.has(item.id));

        doc.setFontSize(22);
        doc.text('Verified Achievements', 20, 20);
        doc.setFontSize(16);
        doc.text(dummyData.user.name, 20, 30);
        
        let yPosition = 45;
        selectedItems.forEach(item => {
            if (yPosition > 280) {
                doc.addPage();
                yPosition = 20;
            }
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text(`- ${item.title}`, 20, yPosition);
            
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            doc.text(`  Role: ${item.role}`, 22, yPosition + 5);
            doc.text(`  Date: ${item.date}`, 22, yPosition + 10);
            
            yPosition += 20;
        });

        doc.save('CampusSphere_Achievements.pdf');
        showNotification('PDF Downloaded', 'Your achievements have been saved to PDF successfully!');
    });

    // Profile page event listeners
    DOMElements.profile.addSkillBtn?.addEventListener('click', addSkill);
    
    DOMElements.profile.newSkillInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSkill();
        }
    });
    
    DOMElements.profile.suggestionTags.forEach(tag => {
        tag.addEventListener('click', () => {
            const skill = tag.textContent;
            if (skill && !dummyData.user.skills.includes(skill)) {
                dummyData.user.skills.push(skill);
                renderSkills();
            }
        });
    });

    // NEW: Avatar upload handler
    DOMElements.profile.uploadAvatarBtn?.addEventListener('click', () => {
        DOMElements.profile.avatarUpload.click();
    });

    DOMElements.profile.avatarUpload?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleAvatarUpload(file);
        }
    });

    // NEW: Save profile handler
    DOMElements.profile.saveProfileBtn?.addEventListener('click', saveProfileData);

    // ===================================================================
    // INITIAL PAGE LOAD SETUP
    // ===================================================================
    loadProfileData();
    renderDiscoverEvents(); 
    renderCollaborationPosts();
    renderAchievements();
    renderSkills();
    renderStudentPage();
    updateCollaborateTabs();

    // Load submitted events from dummy data for demo
    state.submittedEvents = dummyData.submittedEvents;
});