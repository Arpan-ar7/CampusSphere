/* FILE: admin-dashboard.js */

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
    // STATE & DATA MANAGEMENT
    // ===================================================================
    
    // Application state to track current page and user tab
    const state = {
        currentAdminPage: 'analytics', // Default page is analytics
        currentUserTab: 'faculty',     // Default tab is faculty verification
        currentUser: JSON.parse(sessionStorage.getItem('currentUser') || '{}'), // Get user from session
    };
    
    // Object to hold Chart.js instances for proper cleanup
    let adminCharts = {}; 

    // Enhanced sample data for demonstration purposes
    const dummyData = {
        // Admin profile data
        admin: {
            id: state.currentUser.id || 1,
            name: state.currentUser.fullName || 'ABCD',
            email: state.currentUser.email || 'admin@campussphere.edu',
            designation: 'HOD',
            bio: 'Experienced system administrator responsible for managing the CampusSphere platform and ensuring optimal user experience for students and faculty.',
            avatarUrl: ''
        },

        // User data with different roles and verification statuses
        users: [
            { id: 1, name: "Dr. Eleanor Vance", email: "e.vance@university.edu", role: "Faculty", dept: "Computer Science", status: "Pending" },
            { id: 2, name: "Prof. Ben Carter", email: "b.carter@university.edu", role: "Faculty", dept: "Physics", status: "Pending" },
            { id: 3, name: "Jane Doe", email: "jane.doe@university.edu", role: "Student", dept: "Computer Science", status: "Verified" },
            { id: 4, name: "John Smith", email: "john.smith@university.edu", role: "Student", dept: "Mechanical Eng.", status: "Verified" },
            { id: 5, name: "Dr. Aisha Khan", email: "a.khan@university.edu", role: "Faculty", dept: "History", status: "Verified" },
            { id: 6, name: "Rohan M.", email: "rohan.m@university.edu", role: "Student", dept: "ECE", status: "Verified" },
            { id: 7, name: "Prof. David Lee", email: "d.lee@university.edu", role: "Faculty", dept: "ECE", status: "Pending" },
            { id: 8, name: "Priya S.", email: "priya.s@university.edu", role: "Student", dept: "Civil Eng.", status: "Verified" },
        ],

        // Event data with various categories and statuses
        events: [
            { id: 1, name: "Annual Tech Innovate Challenge", organizer: "Dr. Eleanor Vance", dept: "CSE", cat: "Technical", part: 120, status: "Approved", featured: true },
            { id: 2, name: "Global Culture Fest", organizer: "Student Council", dept: "Student Union", cat: "Cultural", part: 450, status: "Approved", featured: false },
            { id: 3, name: "Inter-Departmental Sports Day", organizer: "Sports Committee", dept: "Sports Committee", cat: "Sports", part: 300, status: "Approved", featured: true },
            { id: 4, name: "Startup Pitch Competition", organizer: "E-Cell Team", dept: "E-Cell", cat: "Academic", part: 75, status: "Pending", featured: false },
            { id: 5, name: "AI Workshop for Beginners", organizer: "Alex Johnson", dept: "CSE", cat: "Workshop", part: 85, status: "Approved", featured: false },
            { id: 6, name: "Annual Research Symposium", organizer: "Dr. Sarah Chen", dept: "Research Wing", cat: "Academic", part: 200, status: "Approved", featured: true },
        ],

        // Department rankings data
        departmentRankings: [
            { name: 'Computer Science', score: 1850, rank: 1 },
            { name: 'Mechanical Engineering', score: 1620, rank: 2 },
            { name: 'Electronics & Communication', score: 1450, rank: 3 },
            { name: 'Civil Engineering', score: 1280, rank: 4 },
            { name: 'Business Administration', score: 980, rank: 5 }
        ],

        // Recent announcements
        announcements: [
            {
                id: 1,
                title: 'System Maintenance Notice',
                message: 'The platform will undergo scheduled maintenance on Sunday from 2 AM to 4 AM.',
                target: 'all',
                priority: 'important',
                banner: true,
                createdAt: '2024-10-20',
                createdBy: 'System Administrator'
            },
            {
                id: 2,
                title: 'New Event Registration Process',
                message: 'All events now require faculty approval before going live. Please plan accordingly.',
                target: 'students',
                priority: 'normal',
                banner: false,
                createdAt: '2024-10-18',
                createdBy: 'System Administrator'
            }
        ],

        // Platform settings
        settings: {
            universityName: 'CampusSphere University',
            primaryColor: '#2563EB',
            autoApproveEvents: false,
            requireFacultyApproval: true,
            logoUrl: null,
            sealUrl: null
        }
    };

    // ===================================================================
    // DOM ELEMENT SELECTORS
    // ===================================================================
    const DOMElements = {
        // Page navigation and content elements
        pageTitle: document.getElementById('admin-page-title'),
        navLinks: document.querySelectorAll('.admin-nav-link'),
        pages: document.querySelectorAll('.admin-page'),
        
        // Profile dropdown
        profileDropdownBtn: document.getElementById('admin-profile-dropdown-btn'),
        profileDropdownMenu: document.getElementById('admin-profile-dropdown-menu'),
        profileMenuBtn: document.getElementById('admin-profile-menu-btn'),
        logoutMenuBtn: document.getElementById('admin-logout-menu-btn'),
        
        // Dark mode toggle
        darkModeToggle: document.getElementById('dark-mode-toggle'),
        
        // Notification elements
        notificationsBadge: document.getElementById('admin-notification-badge'),
        notificationModal: document.getElementById('admin-notification'),
        
        // User management tab elements
        userTabs: {
            faculty: document.getElementById('faculty-tab-btn'),
            all: document.getElementById('all-users-tab-btn'),
        },
        
        // Counter elements
        counters: {
            pendingFaculty: document.getElementById('pending-faculty-count'),
            totalUsers: document.getElementById('total-users-count'),
            featuredEvents: document.getElementById('featured-events-count'),
            totalEvents: document.getElementById('total-events-count')
        },
        
        // Table body elements for dynamic content
        usersTableBody: document.getElementById('users-table-body'),
        eventsTableBody: document.getElementById('events-table-body'),
        noPendingFaculty: document.getElementById('no-pending-faculty'),
        
        // Analytics elements
        analyticsPeriodr: document.getElementById('analytics-period'),
        departmentRankings: document.getElementById('department-rankings'),
        
        // Forms
        announcementForm: document.getElementById('announcement-form'),
        profileForm: document.getElementById('admin-profile-form'),
        
        // Recent announcements
        recentAnnouncements: document.getElementById('recent-announcements'),
        
        // Settings
        settingsForm: document.getElementById('branding-form'),
        
        // Modals
        userApprovalModal: document.getElementById('user-approval-modal'),
    };

    // ===================================================================
    // UTILITY FUNCTIONS
    // ===================================================================
    
    // Show notification function
    function showNotification(title, message, type = 'success') {
        const notification = DOMElements.notificationModal;
        const titleEl = document.getElementById('admin-notification-title');
        const messageEl = document.getElementById('admin-notification-message');
        const iconEl = document.getElementById('admin-notification-icon');
        
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
        const notification = DOMElements.notificationModal;
        notification.classList.add('hiding');
        setTimeout(() => {
            notification.classList.add('hidden');
            notification.classList.remove('hiding');
        }, 300);
    }

    // Profile data persistence functions
    function saveAdminProfileData() {
        const profileData = {
            name: document.getElementById('admin-name')?.value || dummyData.admin.name,
            email: document.getElementById('admin-email')?.value || dummyData.admin.email,
            designation: document.getElementById('admin-designation')?.value || dummyData.admin.designation,
            bio: document.getElementById('admin-bio')?.value || dummyData.admin.bio,
            avatarUrl: dummyData.admin.avatarUrl
        };
        
        // Save to localStorage for persistence
        localStorage.setItem('adminProfile', JSON.stringify(profileData));
        
        // Update dummy data
        Object.assign(dummyData.admin, profileData);
        
        showNotification('Profile Updated', 'Your profile has been updated successfully!');
    }

    function loadAdminProfileData() {
        const savedProfile = localStorage.getItem('adminProfile');
        if (savedProfile) {
            const profileData = JSON.parse(savedProfile);
            Object.assign(dummyData.admin, profileData);
            
            // Update form fields if they exist
            const fields = [
                { id: 'admin-name', key: 'name' },
                { id: 'admin-email', key: 'email' },
                { id: 'admin-designation', key: 'designation' },
                { id: 'admin-bio', key: 'bio' }
            ];
            
            fields.forEach(field => {
                const element = document.getElementById(field.id);
                if (element && profileData[field.key]) {
                    element.value = profileData[field.key];
                }
            });
        }
    }

    // ===================================================================
    // DARK MODE FUNCTIONALITY
    // ===================================================================
    
    // Check if user previously selected dark mode from localStorage
    const isDarkMode = localStorage.getItem('adminDarkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        updateDarkModeIcon(true);
    }

    /**
     * Toggle between light and dark mode
     */
    function toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('adminDarkMode', isDark); // Save preference to localStorage
        updateDarkModeIcon(isDark);
    }

    /**
     * Update the dark mode toggle icon (moon/sun)
     * @param {boolean} isDark - Whether dark mode is currently active
     */
    function updateDarkModeIcon(isDark) {
        const icon = DOMElements.darkModeToggle?.querySelector('[data-lucide]');
        if (icon) {
            icon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
            lucide.createIcons(); // Re-render the icon
        }
    }

    // ===================================================================
    // PAGE RENDERING FUNCTIONS
    // ===================================================================

    /**
     * Main function to render the current page
     * Handles page switching, navigation state, and page title updates
     */
    function renderPage() {
        // Hide all pages
        DOMElements.pages.forEach(p => p.classList.add('hidden'));
        
        // Show current page
        const currentPage = document.getElementById(`admin-${state.currentAdminPage}-page`);
        if (currentPage) currentPage.classList.remove('hidden');

        // Update navigation link active states and get page title
        let activeLinkText = '';
        DOMElements.navLinks.forEach(link => {
            const isActive = link.dataset.page === state.currentAdminPage;
            link.classList.toggle('active', isActive);
            if (isActive) activeLinkText = link.textContent.trim();
        });
        
        // Update page title in header
        DOMElements.pageTitle.textContent = activeLinkText;

        // Load page-specific content
        if (state.currentAdminPage === 'analytics') {
            setupAdminCharts();
            renderDepartmentRankings();
        } else if (state.currentAdminPage === 'users') {
            renderUserTable();
            updateUserCounts();
        } else if (state.currentAdminPage === 'events') {
            renderEventTable();
            updateEventCounts();
        } else if (state.currentAdminPage === 'announcements') {
            renderRecentAnnouncements();
        } else if (state.currentAdminPage === 'profile') {
            loadAdminProfileData();
        }

        // Update notification badge
        updateNotificationBadge();
        
        // Refresh icons for any newly rendered content
        lucide.createIcons();
    }

    // Update counters
    function updateUserCounts() {
        if (DOMElements.counters.pendingFaculty) {
            const pendingCount = dummyData.users.filter(u => u.status === 'Pending' && u.role === 'Faculty').length;
            DOMElements.counters.pendingFaculty.textContent = pendingCount;
        }
        
        if (DOMElements.counters.totalUsers) {
            DOMElements.counters.totalUsers.textContent = dummyData.users.length;
        }
    }

    function updateEventCounts() {
        if (DOMElements.counters.featuredEvents) {
            const featuredCount = dummyData.events.filter(e => e.featured).length;
            DOMElements.counters.featuredEvents.textContent = featuredCount;
        }
        
        if (DOMElements.counters.totalEvents) {
            DOMElements.counters.totalEvents.textContent = dummyData.events.length;
        }
    }

    function updateNotificationBadge() {
        const pendingActions = dummyData.users.filter(u => u.status === 'Pending' && u.role === 'Faculty').length;
        
        if (DOMElements.notificationsBadge) {
            if (pendingActions > 0) {
                DOMElements.notificationsBadge.textContent = pendingActions;
                DOMElements.notificationsBadge.classList.remove('hidden');
            } else {
                DOMElements.notificationsBadge.classList.add('hidden');
            }
        }
    }

    /**
     * Render the users table based on current tab selection
     * Filters users by faculty verification needs or shows all users
     */
    function renderUserTable() {
        const tbody = DOMElements.usersTableBody;
        const noFacultyMsg = DOMElements.noPendingFaculty;
        
        if (!tbody) return;
        
        // Clear existing table content
        tbody.innerHTML = '';
        
        // Filter users based on current tab
        const usersToDisplay = state.currentUserTab === 'faculty' 
            ? dummyData.users.filter(u => u.status === 'Pending' && u.role === 'Faculty') 
            : dummyData.users;

        // Show/hide empty state message for faculty tab
        if (state.currentUserTab === 'faculty' && usersToDisplay.length === 0) {
            tbody.parentElement.parentElement.classList.add('hidden');
            noFacultyMsg?.classList.remove('hidden');
            return;
        } else {
            tbody.parentElement.parentElement.classList.remove('hidden');
            noFacultyMsg?.classList.add('hidden');
        }

        // Generate table rows for each user
        usersToDisplay.forEach(user => {
            const row = document.createElement('tr');
            row.className = 'bg-white border-b table-row-hover';
            
            // Determine status badge styling
            const statusClass = user.status === 'Pending' ? 'status-pending' : 'status-verified';
            
            // Determine action buttons based on status and tab
            let actionButtons = '';
            if (state.currentUserTab === 'faculty' && user.status === 'Pending') {
                actionButtons = `
                    <button class="table-action-btn table-action-approve mr-2" data-user-id="${user.id}" data-action="approve">
                        Approve
                    </button>
                    <button class="table-action-btn table-action-deny" data-user-id="${user.id}" data-action="deny">
                        Deny
                    </button>
                `;
            } else if (state.currentUserTab === 'all') {
                actionButtons = `<button class="table-action-btn table-action-remove" data-user-id="${user.id}" data-action="remove">Remove</button>`;
            }
            
            // Populate row with user data
            row.innerHTML = `
                <td class="px-6 py-4 font-medium text-gray-900">${user.name}</td>
                <td class="px-6 py-4">${user.email}</td>
                <td class="px-6 py-4">${user.role}</td>
                <td class="px-6 py-4">${user.dept}</td>
                <td class="px-6 py-4"><span class="status-badge ${statusClass}">${user.status}</span></td>
                <td class="px-6 py-4">${actionButtons}</td>
            `;
            tbody.appendChild(row);
        });
    }

    /**
     * Render the events table with all campus events
     * Shows event details and homepage featuring options
     */
    function renderEventTable() {
        const tbody = DOMElements.eventsTableBody;
        if (!tbody) return;
        
        // Clear existing table content
        tbody.innerHTML = '';
        
        // Generate table rows for each event
        dummyData.events.forEach(event => {
            const row = document.createElement('tr');
            row.className = 'bg-white border-b table-row-hover';
            
            // Determine status badge styling
            const statusClass = event.status === 'Pending' ? 'status-pending' : 'status-approved';
            
            // Populate row with event data
            row.innerHTML = `
                <td class="px-6 py-4 font-medium text-gray-900">${event.name}</td>
                <td class="px-6 py-4">${event.organizer}</td>
                <td class="px-6 py-4">${event.cat}</td>
                <td class="px-6 py-4">${event.part}</td>
                <td class="px-6 py-4"><span class="status-badge ${statusClass}">${event.status}</span></td>
                <td class="px-6 py-4">
                    <input type="checkbox" class="feature-event-checkbox h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                           data-event-id="${event.id}" ${event.featured ? 'checked' : ''}>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Render department rankings
    function renderDepartmentRankings() {
        const container = DOMElements.departmentRankings;
        if (!container) return;
        
        container.innerHTML = '';
        
        dummyData.departmentRankings.forEach(dept => {
            const item = document.createElement('div');
            item.className = 'department-rank-item flex justify-between items-center';
            
            item.innerHTML = `
                <div class="flex items-center space-x-3">
                    <span class="rank-number">${dept.rank}</span>
                    <span class="rank-department">${dept.name}</span>
                </div>
                <span class="rank-score">${dept.score.toLocaleString()}</span>
            `;
            
            container.appendChild(item);
        });
    }

    // Render recent announcements
    function renderRecentAnnouncements() {
        const container = DOMElements.recentAnnouncements;
        if (!container) return;
        
        container.innerHTML = '';
        
        if (dummyData.announcements.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i data-lucide="megaphone" class="w-12 h-12 mx-auto mb-2 text-gray-300"></i>
                    <p>No announcements yet.</p>
                </div>
            `;
            lucide.createIcons();
            return;
        }
        
        dummyData.announcements.forEach(announcement => {
            const item = document.createElement('div');
            item.className = `announcement-item announcement-priority-${announcement.priority}`;
            
            const targetText = announcement.target === 'all' ? 'All Users' : 
                             announcement.target === 'students' ? 'Students' :
                             announcement.target === 'faculty' ? 'Faculty' : 'Administrators';
            
            item.innerHTML = `
                <div class="flex justify-between items-start mb-2">
                    <h4 class="font-semibold text-gray-800">${announcement.title}</h4>
                    <div class="flex items-center space-x-2 text-xs text-gray-500">
                        <span class="status-badge status-${announcement.priority}">${announcement.priority}</span>
                        ${announcement.banner ? '<i data-lucide="star" class="w-4 h-4 text-yellow-500"></i>' : ''}
                    </div>
                </div>
                <p class="text-gray-600 text-sm mb-2">${announcement.message}</p>
                <div class="flex justify-between items-center text-xs text-gray-500">
                    <span>Target: ${targetText}</span>
                    <span>${new Date(announcement.createdAt).toLocaleDateString()}</span>
                </div>
            `;
            
            container.appendChild(item);
        });
        
        lucide.createIcons();
    }

    /**
     * Initialize Chart.js instances for analytics dashboard
     * Creates line, pie, and bar charts for various metrics
     */
    function setupAdminCharts() {
        // Destroy any existing charts to prevent memory leaks
        Object.values(adminCharts).forEach(chart => chart?.destroy());
        adminCharts = {};

        // Line Chart: Participation Over Time
        const participationCtx = document.getElementById('participation-chart')?.getContext('2d');
        if (participationCtx) {
            adminCharts.participation = new Chart(participationCtx, {
                type: 'line',
                data: { 
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'], 
                    datasets: [
                        { 
                            label: 'This Year', 
                            data: [800, 950, 1100, 1200, 1150, 1300, 1450, 1600, 1400, 1550], 
                            borderColor: '#2563EB', 
                            backgroundColor: 'rgba(37, 99, 235, 0.1)',
                            tension: 0.4, 
                            fill: true 
                        },
                        { 
                            label: 'Last Year', 
                            data: [700, 850, 950, 1000, 980, 1100, 1200, 1350, 1180, 1300], 
                            borderColor: '#94A3B8', 
                            backgroundColor: 'rgba(148, 163, 184, 0.1)',
                            tension: 0.4, 
                            fill: false 
                        }
                    ] 
                },
                options: { 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
        
        // Pie Chart: Events by Category
        const categoryCtx = document.getElementById('category-chart')?.getContext('2d');
        if (categoryCtx) {
            adminCharts.category = new Chart(categoryCtx, {
                type: 'doughnut',
                data: { 
                    labels: ['Technical', 'Cultural', 'Academic', 'Sports', 'Workshop'], 
                    datasets: [{ 
                        data: [35, 25, 20, 12, 8], 
                        backgroundColor: [
                            '#2563EB', 
                            '#10B981', 
                            '#F59E0B', 
                            '#EF4444', 
                            '#8B5CF6'
                        ],
                        hoverOffset: 4
                    }] 
                },
                options: { 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                        }
                    }
                }
            });
        }
        
        // Bar Chart: Departmental Engagement
        const departmentCtx = document.getElementById('department-chart')?.getContext('2d');
        if (departmentCtx) {
            adminCharts.department = new Chart(departmentCtx, {
                type: 'bar',
                data: { 
                    labels: ['CSE', 'Mech Eng', 'ECE', 'Civil Eng', 'Business'], 
                    datasets: [
                        { 
                            label: 'Participants', 
                            data: [1850, 1620, 1450, 1280, 980], 
                            backgroundColor: '#2563EB' 
                        }, 
                        { 
                            label: 'Events Organized', 
                            data: [45, 38, 32, 28, 22], 
                            backgroundColor: '#10B981' 
                        }
                    ] 
                },
                options: { 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    }

    // Handle user approval/denial
    function handleUserAction(userId, action) {
        const user = dummyData.users.find(u => u.id === userId);
        if (!user) return;

        if (action === 'approve') {
            user.status = 'Verified';
            showNotification('Faculty Approved', `${user.name} has been approved and can now access all faculty features.`);
        } else if (action === 'deny') {
            // Remove from pending list
            const index = dummyData.users.findIndex(u => u.id === userId);
            if (index > -1) {
                dummyData.users.splice(index, 1);
            }
            showNotification('Registration Denied', `${user.name}'s registration has been denied and they have been notified.`);
        } else if (action === 'remove') {
            const index = dummyData.users.findIndex(u => u.id === userId);
            if (index > -1) {
                dummyData.users.splice(index, 1);
            }
            showNotification('User Removed', `${user.name} has been removed from the system.`);
        }

        // Update UI
        updateUserCounts();
        updateNotificationBadge();
        renderUserTable();
    }

    // Handle event featuring
    function handleEventFeaturing(eventId, featured) {
        const event = dummyData.events.find(e => e.id === eventId);
        if (!event) return;

        event.featured = featured;
        
        const action = featured ? 'featured on' : 'removed from';
        showNotification('Event Updated', `${event.name} has been ${action} the homepage.`);
        
        updateEventCounts();
    }

    // Handle announcement creation
    function handleAnnouncementCreation(announcementData) {
        const newAnnouncement = {
            id: Date.now(),
            title: announcementData.title,
            message: announcementData.message,
            target: announcementData.target,
            priority: announcementData.priority,
            banner: announcementData.banner,
            createdAt: new Date().toISOString().split('T')[0],
            createdBy: dummyData.admin.name
        };

        dummyData.announcements.unshift(newAnnouncement);
        
        const targetText = announcementData.target === 'all' ? 'all users' : 
                          announcementData.target === 'students' ? 'students' :
                          announcementData.target === 'faculty' ? 'faculty' : 'administrators';
        
        showNotification(
            'Announcement Sent', 
            `Your announcement has been sent to ${targetText}.${announcementData.banner ? ' It will be displayed as a banner.' : ''}`,
            'success'
        );
        
        renderRecentAnnouncements();
    }

    // ===================================================================
    // EVENT LISTENERS
    // ===================================================================

    // Dark mode toggle event listener
    DOMElements.darkModeToggle?.addEventListener('click', toggleDarkMode);

    // Profile dropdown functionality
    DOMElements.profileDropdownBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        DOMElements.profileDropdownMenu?.classList.toggle('hidden');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        DOMElements.profileDropdownMenu?.classList.add('hidden');
    });

    DOMElements.profileMenuBtn?.addEventListener('click', () => {
        state.currentAdminPage = 'profile';
        renderPage();
        DOMElements.profileDropdownMenu?.classList.add('hidden');
    });

    DOMElements.logoutMenuBtn?.addEventListener('click', () => {
        // Clear session data and redirect
        sessionStorage.removeItem('currentUser');
        localStorage.removeItem('adminProfile');
        window.location.href = 'landing-page.html';
    });

    // Navigation link event listeners
    DOMElements.navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const page = link.dataset.page;
            if (page) {
                state.currentAdminPage = page;
                renderPage();
            }
        });
    });

    // Faculty tab click handler
    DOMElements.userTabs.faculty?.addEventListener('click', () => {
        state.currentUserTab = 'faculty';
        DOMElements.userTabs.faculty.classList.add('active');
        DOMElements.userTabs.all.classList.remove('active');
        renderUserTable();
    });

    // All users tab click handler
    DOMElements.userTabs.all?.addEventListener('click', () => {
        state.currentUserTab = 'all';
        DOMElements.userTabs.all.classList.add('active');
        DOMElements.userTabs.faculty.classList.remove('active');
        renderUserTable();
    });

    // User action handlers (approve/deny/remove)
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('table-action-approve') || e.target.classList.contains('table-action-deny')) {
            const userId = parseInt(e.target.dataset.userId);
            const action = e.target.dataset.action;
            const user = dummyData.users.find(u => u.id === userId);
            
            if (user) {
                showUserApprovalModal(user, action);
            }
        } else if (e.target.classList.contains('table-action-remove')) {
            const userId = parseInt(e.target.dataset.userId);
            const user = dummyData.users.find(u => u.id === userId);
            
            if (user && confirm(`Are you sure you want to remove ${user.name} from the system?`)) {
                handleUserAction(userId, 'remove');
            }
        }
    });

    function showUserApprovalModal(user, action) {
        const modal = DOMElements.userApprovalModal;
        const nameEl = document.getElementById('user-approval-name');
        
        nameEl.textContent = user.name;
        modal.classList.remove('hidden');
        
        // Store current user and action for modal buttons
        modal.dataset.userId = user.id;
        modal.dataset.action = action;
    }

    // User approval modal handlers
    document.getElementById('confirm-approval-btn')?.addEventListener('click', () => {
        const userId = parseInt(DOMElements.userApprovalModal.dataset.userId);
        handleUserAction(userId, 'approve');
        DOMElements.userApprovalModal.classList.add('hidden');
    });

    document.getElementById('deny-approval-btn')?.addEventListener('click', () => {
        const userId = parseInt(DOMElements.userApprovalModal.dataset.userId);
        handleUserAction(userId, 'deny');
        DOMElements.userApprovalModal.classList.add('hidden');
    });

    document.getElementById('cancel-approval-btn')?.addEventListener('click', () => {
        DOMElements.userApprovalModal.classList.add('hidden');
    });

    // Event featuring handlers
    document.addEventListener('change', (e) => {
        if (e.target.classList.contains('feature-event-checkbox')) {
            const eventId = parseInt(e.target.dataset.eventId);
            const featured = e.target.checked;
            handleEventFeaturing(eventId, featured);
        }
    });

    // Announcement form handler
    DOMElements.announcementForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const announcementData = {
            title: document.getElementById('announcement-title').value,
            message: document.getElementById('announcement-message').value,
            target: document.getElementById('announcement-target').value,
            priority: document.getElementById('announcement-priority').value,
            banner: document.getElementById('announcement-banner').checked
        };
        
        handleAnnouncementCreation(announcementData);
        e.target.reset();
    });

    // Profile form handler
    document.getElementById('save-profile-btn')?.addEventListener('click', saveAdminProfileData);

    // Settings handlers
    document.getElementById('upload-logo-btn')?.addEventListener('click', () => {
        document.getElementById('logo-upload').click();
    });

    document.getElementById('upload-seal-btn')?.addEventListener('click', () => {
        document.getElementById('seal-upload').click();
    });

    document.getElementById('save-settings-btn')?.addEventListener('click', () => {
        showNotification('Settings Saved', 'Platform settings have been updated successfully!');
    });

    // Notification close handler
    document.getElementById('close-admin-notification-btn')?.addEventListener('click', hideNotification);

    // ===================================================================
    // INITIALIZATION
    // ===================================================================
    
    // Set default active tab
    DOMElements.userTabs.faculty?.classList.add('active');
    
    // Load saved profile data
    loadAdminProfileData();
    
    // Initial render of all components
    renderPage();
});