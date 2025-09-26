/* FILE: faculty-dashboard.js */

document.addEventListener('DOMContentLoaded', () => {
    // ===================================================================
    // INITIALIZATION
    // ===================================================================
    lucide.createIcons(); // Initialize Lucide icons

    // ===================================================================
    // CONFIGURATION - API Base URL
    // ===================================================================
    const API_BASE_URL = 'http://localhost:5000/api'; // Your Flask backend URL

    // ===================================================================
    // STATE MANAGEMENT for Faculty Dashboard
    // ===================================================================
    const state = {
        currentFacultyPage: 'dashboard', // Default page is dashboard
        currentUser: JSON.parse(sessionStorage.getItem('currentUser') || '{}'), // Get user from session
        currentEventTab: 'official', // Track current event tab
    };
    
    // Object to hold Chart.js instances for proper cleanup
    let facultyCharts = {}; 

    // ===================================================================
    // DOM ELEMENT SELECTORS for Faculty Dashboard
    // ===================================================================
    const DOMElements = {
        // Navigation elements
        navLinks: document.querySelectorAll('.faculty-nav-link'),
        pages: document.querySelectorAll('.faculty-page'),
        pageTitle: document.getElementById('faculty-page-title'),
        darkModeToggle: document.getElementById('dark-mode-toggle'),
        notificationsBadge: document.getElementById('notification-badge'),
        
        // Mobile menu
        mobileMenuBtn: document.getElementById('faculty-mobile-menu-btn'),
        
        // Profile dropdown
        profileDropdownBtn: document.getElementById('profile-dropdown-btn'),
        profileDropdownMenu: document.getElementById('profile-dropdown-menu'),
        profileMenuBtn: document.getElementById('profile-menu-btn'),
        logoutMenuBtn: document.getElementById('logout-menu-btn'),
        
        // Dashboard cards that act as navigation
        dashboardCards: document.querySelectorAll('.dashboard-card-link'),
        
        // Dashboard counters
        counters: {
            pendingProposals: document.getElementById('pending-proposals-count'),
            activeEvents: document.getElementById('active-events-count'),
            menteeProjects: document.getElementById('mentee-projects-count')
        },
        
        // Proposals page
        proposalsContainer: document.getElementById('proposals-container'),
        noProposalsMessage: document.getElementById('no-proposals-message'),
        
        // Events page
        eventTabs: {
            officialBtn: document.getElementById('tab-official-events'),
            supervisedBtn: document.getElementById('tab-supervised-events')
        },
        eventsContent: {
            official: document.getElementById('official-events-content'),
            supervised: document.getElementById('supervised-events-content'),
            officialTable: document.getElementById('official-events-table'),
            supervisedTable: document.getElementById('supervised-events-table')
        },
        
        // Create event form
        createEventForm: document.getElementById('create-event-form'),
        
        // Mentorship hub
        menteeProjectsContainer: document.getElementById('mentee-projects-container'),
        collaborationFeed: document.getElementById('collaboration-feed'),
        currentMenteesCount: document.getElementById('current-mentees'),
        maxMenteesCount: document.getElementById('max-mentees'),
        
        // Profile page
        profile: {
            form: document.getElementById('faculty-profile-form'),
            avatarImg: document.getElementById('faculty-avatar-img'),
            uploadBtn: document.getElementById('faculty-upload-avatar-btn'),
            avatarUpload: document.getElementById('faculty-avatar-upload'),
            skillsContainer: document.getElementById('faculty-skills-container'),
            newSkillInput: document.getElementById('faculty-new-skill-input'),
            addSkillBtn: document.getElementById('faculty-add-skill-btn'),
            suggestionTags: document.querySelectorAll('.faculty-suggestion-tag'),
            saveBtn: document.getElementById('faculty-save-profile-btn'),
            capacityInput: document.getElementById('faculty-capacity'),
            mentorshipToggle: document.getElementById('mentorship-toggle')
        },
        
        // Chart containers for analytics
        charts: {
            categories: document.getElementById('eventCategoriesChart'),
            monthly: document.getElementById('monthlyParticipationChart'),
            departments: document.getElementById('departmentComparisonChart')
        },
        
        // Modals
        modals: {
            proposalAction: document.getElementById('proposal-action-modal'),
            meetingRequest: document.getElementById('meeting-request-modal'),
            notification: document.getElementById('faculty-notification')
        }
    };

    // ===================================================================
    // ENHANCED DUMMY DATA for Faculty Dashboard
    // ===================================================================
    const dummyData = {
        faculty: {
            id: state.currentUser.id || 1,
            name: state.currentUser.fullName || 'Dr. kunal',
            email: state.currentUser.email || 'kuna@marwadiuniversity.ac.in',
            department: 'Computer Science',
            designation: 'Associate Professor',
            bio: 'Dedicated faculty member with expertise in artificial intelligence and machine learning. Passionate about mentoring students and fostering innovation in computer science education.',
            skills: ['Artificial Intelligence', 'Machine Learning', 'Data Science', 'Research Methodology'],
            avatarUrl: 'images/profkunal.png',
            mentorshipCapacity: 5,
            isAcceptingMentees: true
        },

        // Sample student proposals
        proposals: [
            {
                id: 1,
                title: 'Annual Student Research Symposium',
                description: 'A comprehensive event showcasing undergraduate and graduate research projects across all departments.',
                studentName: 'Aisha Rahman',
                studentEmail: 'aisha.rahman@university.edu',
                submittedDate: '2024-03-15',
                category: 'Academic',
                status: 'pending'
            },
            {
                id: 2,
                title: 'Computer Science Hackathon 2024',
                description: 'A 48-hour coding competition focusing on AI and sustainable technology solutions.',
                studentName: 'Ben Carter',
                studentEmail: 'ben.carter@university.edu',
                submittedDate: '2024-03-18',
                category: 'Technical',
                status: 'pending'
            },
            {
                id: 3,
                title: 'Global Cultures Festival',
                description: 'Celebrating diversity with international food, music, and cultural presentations.',
                studentName: 'Fiona Garcia',
                studentEmail: 'fiona.garcia@university.edu',
                submittedDate: '2024-03-28',
                category: 'Cultural',
                status: 'pending'
            }
        ],

        // Sample events
        events: {
            official: [
                {
                    id: 1,
                    title: 'Annual Faculty Research Symposium',
                    status: 'active',
                    participants: 120,
                    date: '2024-11-15',
                    category: 'Academic',
                    createdBy: 'faculty'
                },
                {
                    id: 2,
                    title: 'Spring Semester Orientation for New Faculty',
                    status: 'upcoming',
                    participants: 35,
                    date: '2025-01-10',
                    category: 'Academic',
                    createdBy: 'faculty'
                },
                {
                    id: 3,
                    title: 'University-Wide Innovation Challenge',
                    status: 'draft',
                    participants: 0,
                    date: '2025-03-01',
                    category: 'Technical',
                    createdBy: 'faculty'
                }
            ],
            supervised: [
                {
                    id: 4,
                    title: 'AI Workshop for Beginners',
                    status: 'approved',
                    participants: 85,
                    date: '2024-12-05',
                    category: 'Workshop',
                    createdBy: 'student',
                    studentOrganizer: 'Alex Johnson'
                },
                {
                    id: 5,
                    title: 'Tech Startup Pitch Competition',
                    status: 'active',
                    participants: 150,
                    date: '2024-11-20',
                    category: 'Competition',
                    createdBy: 'student',
                    studentOrganizer: 'Sarah Kim'
                }
            ]
        },

        // Sample mentee projects
        menteeProjects: [
            {
                id: 1,
                title: 'AI-driven Lecture Summarization',
                student: 'Alice Johnson',
                studentEmail: 'alice.johnson@university.edu',
                status: 'approved',
                description: 'Developing a model to summarize university lectures for student review.',
                lastUpdate: '2024-10-15'
            },
            {
                id: 2,
                title: 'Sustainable Campus Waste Management',
                student: 'Michael Lee',
                studentEmail: 'michael.lee@university.edu',
                status: 'revision',
                description: 'Proposing and prototyping a smart waste sorting system for campus dorms.',
                lastUpdate: '2024-10-20'
            }
        ],

        // Sample collaboration feed
        collaborationFeed: [
            {
                id: 1,
                title: 'Smart Gardening System',
                author: 'Emily White',
                category: 'IoT',
                imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=600'
            },
            {
                id: 2,
                title: 'Campus AI Chatbot',
                author: 'Noah Brown',
                category: 'Artificial Intelligence',
                imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=600'
            },
            {
                id: 3,
                title: 'Peer-to-Peer Tutoring Platform',
                author: 'Olivia Green',
                category: 'Education Tech',
                imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600'
            }
        ]
    };

    // ===================================================================
    // UTILITY FUNCTIONS
    // ===================================================================
    
    // Show notification function
    function showNotification(title, message, type = 'success') {
        const notification = DOMElements.modals.notification;
        const titleEl = document.getElementById('faculty-notification-title');
        const messageEl = document.getElementById('faculty-notification-message');
        const iconEl = document.getElementById('faculty-notification-icon');
        
        if (!notification || !titleEl || !messageEl || !iconEl) return;
        
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
        if (!notification) return;
        
        notification.classList.add('hiding');
        setTimeout(() => {
            notification.classList.add('hidden');
            notification.classList.remove('hiding');
        }, 300);
    }

    // Profile data persistence functions
    function saveFacultyProfileData() {
        const profileData = {
            name: document.getElementById('faculty-name')?.value || dummyData.faculty.name,
            department: document.getElementById('faculty-department')?.value || dummyData.faculty.department,
            designation: document.getElementById('faculty-designation')?.value || dummyData.faculty.designation,
            bio: document.getElementById('faculty-bio')?.value || dummyData.faculty.bio,
            skills: dummyData.faculty.skills,
            mentorshipCapacity: parseInt(DOMElements.profile.capacityInput?.value) || dummyData.faculty.mentorshipCapacity,
            isAcceptingMentees: DOMElements.profile.mentorshipToggle?.checked || dummyData.faculty.isAcceptingMentees,
            avatarUrl: dummyData.faculty.avatarUrl
        };
        
        // Update dummy data
        Object.assign(dummyData.faculty, profileData);
        
        // Update display elements
        updateDashboardCounters();
        
        showNotification('Profile Updated', 'Your profile changes have been saved successfully!');
    }

    function loadFacultyProfileData() {
        // Update form fields if they exist
        const fields = [
            { id: 'faculty-name', key: 'name' },
            { id: 'faculty-department', key: 'department' },
            { id: 'faculty-designation', key: 'designation' },
            { id: 'faculty-bio', key: 'bio' }
        ];
        
        fields.forEach(field => {
            const element = document.getElementById(field.id);
            if (element && dummyData.faculty[field.key]) {
                element.value = dummyData.faculty[field.key];
            }
        });
        
        // Update capacity and toggle
        if (DOMElements.profile.capacityInput) {
            DOMElements.profile.capacityInput.value = dummyData.faculty.mentorshipCapacity;
        }
        if (DOMElements.profile.mentorshipToggle) {
            DOMElements.profile.mentorshipToggle.checked = dummyData.faculty.isAcceptingMentees;
        }
    }

    // Handle avatar upload
    function handleFacultyAvatarUpload(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const newAvatarUrl = e.target.result;
            dummyData.faculty.avatarUrl = newAvatarUrl;
            
            // Update all avatar displays
            if (DOMElements.profile.avatarImg) {
                DOMElements.profile.avatarImg.src = newAvatarUrl;
            }
            
            showNotification('Avatar Updated', 'Your profile picture has been updated!');
        };
        reader.readAsDataURL(file);
    }

    // ===================================================================
    // DARK MODE FUNCTIONALITY
    // ===================================================================
    
    // Check if user previously selected dark mode from localStorage
    const isDarkMode = localStorage.getItem('facultyDarkMode') === 'true';
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
        localStorage.setItem('facultyDarkMode', isDark); // Save preference
        updateDarkModeIcon(isDark);
    }

    /**
     * Update the dark mode toggle icon (moon/sun)
     * @param {boolean} isDark - Whether dark mode is active
     */
    function updateDarkModeIcon(isDark) {
        const icon = DOMElements.darkModeToggle?.querySelector('[data-lucide]');
        if (icon) {
            icon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
            lucide.createIcons(); // Re-render the icon
        }
    }

    // ===================================================================
    // UI RENDERING & DYNAMIC CONTENT FUNCTIONS
    // ===================================================================

    /**
     * Main function to switch between faculty pages
     * Updates active navigation links, shows/hides pages, and updates page title
     */
    function renderFacultyPage() {
        // Hide all pages
        DOMElements.pages.forEach(p => p.classList.add('hidden'));
        
        // Show current page
        const currentPage = document.getElementById(`faculty-${state.currentFacultyPage}-page`);
        if (currentPage) currentPage.classList.remove('hidden');

        // Update navigation link states and get active link text
        let activeLinkText = '';
        DOMElements.navLinks.forEach(link => {
            const isActive = link.dataset.page === state.currentFacultyPage;
            link.classList.toggle('active', isActive);
            if (isActive) {
                const spanElement = link.querySelector('span');
                if (spanElement) {
                    activeLinkText = spanElement.textContent;
                }
            }
        });

        // Update the main header title
        if (DOMElements.pageTitle) {
            DOMElements.pageTitle.textContent = activeLinkText;
        }
        
        // Load page-specific content
        if (state.currentFacultyPage === 'analytics') {
            setupFacultyCharts();
        } else if (state.currentFacultyPage === 'review-proposals') {
            renderProposals();
        } else if (state.currentFacultyPage === 'manage-events') {
            renderEvents();
        } else if (state.currentFacultyPage === 'mentorship-hub') {
            renderMentorshipHub();
        } else if (state.currentFacultyPage === 'profile') {
            loadFacultyProfileData();
            renderFacultySkills();
        } else if (state.currentFacultyPage === 'dashboard') {
            updateDashboardCounters();
        }

        // Smooth scroll to top and refresh icons
        window.scrollTo({ top: 0, behavior: 'smooth' });
        lucide.createIcons();
    }
    
    // Update dashboard counters
    function updateDashboardCounters() {
        if (DOMElements.counters.pendingProposals) {
            const pendingCount = dummyData.proposals.filter(p => p.status === 'pending').length;
            DOMElements.counters.pendingProposals.textContent = pendingCount;
        }
        
        if (DOMElements.counters.activeEvents) {
            const activeCount = dummyData.events.official.filter(e => e.status === 'active' || e.status === 'upcoming').length;
            DOMElements.counters.activeEvents.textContent = activeCount;
        }
        
        if (DOMElements.counters.menteeProjects) {
            DOMElements.counters.menteeProjects.textContent = dummyData.menteeProjects.length;
        }
        
        // Update notification badge
        const totalNotifications = dummyData.proposals.filter(p => p.status === 'pending').length;
        if (DOMElements.notificationsBadge) {
            if (totalNotifications > 0) {
                DOMElements.notificationsBadge.textContent = totalNotifications;
                DOMElements.notificationsBadge.classList.remove('hidden');
            } else {
                DOMElements.notificationsBadge.classList.add('hidden');
            }
        }
    }

    // Render proposals
    function renderProposals() {
        const container = DOMElements.proposalsContainer;
        const noProposalsMsg = DOMElements.noProposalsMessage;
        
        if (!container) return;
        
        const pendingProposals = dummyData.proposals.filter(p => p.status === 'pending');
        
        if (pendingProposals.length === 0) {
            container.classList.add('hidden');
            noProposalsMsg?.classList.remove('hidden');
            return;
        }
        
        container.classList.remove('hidden');
        noProposalsMsg?.classList.add('hidden');
        
        container.innerHTML = '';
        
        pendingProposals.forEach(proposal => {
            const card = document.createElement('div');
            card.className = 'proposal-card bg-white p-6 rounded-xl border border-gray-200';
            
            card.innerHTML = `
                <h3 class="text-lg font-bold text-gray-800">${proposal.title}</h3>
                <p class="text-sm text-gray-500 mt-1">Submitted by <span class="font-medium text-gray-700">${proposal.studentName}</span> on ${new Date(proposal.submittedDate).toLocaleDateString()}</p>
                <p class="text-sm text-gray-600 mt-2">${proposal.description}</p>
                <div class="mt-4 pt-4 border-t">
                    <button class="proposal-action-btn text-sm font-semibold text-blue-600 hover:text-blue-800 transition" data-proposal-id="${proposal.id}" data-action="review">
                        Review Proposal
                    </button>
                </div>
            `;
            
            container.appendChild(card);
        });
        
        lucide.createIcons();
    }

    // Render events with tabs
    function renderEvents() {
        renderEventsTable('official');
        renderEventsTable('supervised');
    }

    function renderEventsTable(type) {
        const tableContainer = DOMElements.eventsContent[type === 'official' ? 'officialTable' : 'supervisedTable'];
        if (!tableContainer) return;
        
        const events = dummyData.events[type] || [];
        
        if (events.length === 0) {
            tableContainer.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="calendar-x" class="w-12 h-12 mx-auto text-gray-300 mb-4"></i>
                    <p class="text-gray-500">No ${type} events found.</p>
                </div>
            `;
            lucide.createIcons();
            return;
        }
        
        const tableHTML = `
            <table class="events-table">
                <thead>
                    <tr>
                        <th>Event Name</th>
                        <th>Status</th>
                        <th>Participants</th>
                        <th>Date</th>
                        ${type === 'supervised' ? '<th>Organizer</th>' : ''}
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${events.map(event => `
                        <tr>
                            <td class="font-medium text-gray-800">${event.title}</td>
                            <td><span class="status-badge status-${event.status}">${event.status}</span></td>
                            <td class="text-gray-600">${event.participants}</td>
                            <td class="text-gray-600">${new Date(event.date).toLocaleDateString()}</td>
                            ${type === 'supervised' ? `<td class="text-gray-600">${event.studentOrganizer || 'N/A'}</td>` : ''}
                            <td><button class="manage-event-btn font-semibold text-blue-600 hover:text-blue-800" data-event-id="${event.id}">Manage</button></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        tableContainer.innerHTML = tableHTML;
    }

    // Render mentorship hub
    function renderMentorshipHub() {
        renderMenteeProjects();
        renderCollaborationFeed();
        updateMentorshipCapacity();
    }

    function renderMenteeProjects() {
        const container = DOMElements.menteeProjectsContainer;
        if (!container) return;
        
        container.innerHTML = '';
        
        if (dummyData.menteeProjects.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i data-lucide="user-x" class="w-12 h-12 mx-auto text-gray-300 mb-4"></i>
                    <p class="text-gray-500">No mentee projects yet.</p>
                </div>
            `;
            lucide.createIcons();
            return;
        }
        
        dummyData.menteeProjects.forEach(project => {
            const card = document.createElement('div');
            card.className = 'mentee-project-card bg-white p-4 rounded-xl border';
            
            let statusClass = project.status === 'approved' ? 'status-approved' : 'status-pending';
            if (project.status === 'revision') statusClass = 'status-pending';
            
            card.innerHTML = `
                <h3 class="font-bold">${project.title}</h3>
                <p class="text-sm text-gray-500">Mentee: ${project.student}</p>
                <span class="my-2 inline-block status-badge ${statusClass}">${project.status}</span>
                <p class="text-sm text-gray-600">${project.description}</p>
                <div class="flex justify-between items-center mt-3">
                    <span class="text-xs text-gray-500">Updated: ${new Date(project.lastUpdate).toLocaleDateString()}</span>
                    <button class="view-mentee-project-btn text-sm font-semibold text-blue-600 hover:text-blue-800" data-project-id="${project.id}">
                        View Details
                    </button>
                </div>
            `;
            
            container.appendChild(card);
        });
        
        lucide.createIcons();
    }

    function renderCollaborationFeed() {
        const container = DOMElements.collaborationFeed;
        if (!container) return;
        
        container.innerHTML = '';
        
        dummyData.collaborationFeed.forEach(project => {
            const card = document.createElement('div');
            card.className = 'collaboration-feed-card bg-white rounded-xl border overflow-hidden';
            
            card.innerHTML = `
                <img src="${project.imageUrl}" alt="Project Image" class="w-full h-32 object-cover">
                <div class="p-4">
                    <h4 class="font-bold">${project.title}</h4>
                    <p class="text-sm text-gray-500">By ${project.author}</p>
                    <span class="mt-2 inline-block px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">${project.category}</span>
                </div>
            `;
            
            container.appendChild(card);
        });
    }

    function updateMentorshipCapacity() {
        if (DOMElements.currentMenteesCount) {
            DOMElements.currentMenteesCount.textContent = dummyData.menteeProjects.length;
        }
        if (DOMElements.maxMenteesCount) {
            DOMElements.maxMenteesCount.textContent = dummyData.faculty.mentorshipCapacity;
        }
    }

    // Render faculty skills
    function renderFacultySkills() {
        const container = DOMElements.profile.skillsContainer;
        if (!container) return;
        
        container.innerHTML = '';
        
        dummyData.faculty.skills.forEach(skill => {
            const tag = document.createElement('span');
            tag.className = 'faculty-skill-tag';
            tag.innerHTML = `${skill}<button data-skill="${skill}" class="remove-faculty-skill-btn" type="button">&times;</button>`;
            container.appendChild(tag);
        });
        
        // Add event listeners for remove buttons
        document.querySelectorAll('.remove-faculty-skill-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const skillToRemove = btn.dataset.skill;
                dummyData.faculty.skills = dummyData.faculty.skills.filter(s => s !== skillToRemove);
                renderFacultySkills();
            });
        });
    }

    function addFacultySkill() {
        const input = DOMElements.profile.newSkillInput;
        if (!input) return;
        
        const skill = input.value.trim();
        if (skill && !dummyData.faculty.skills.includes(skill)) {
            dummyData.faculty.skills.push(skill);
            renderFacultySkills();
            input.value = '';
        }
    }
    
    /**
     * Sets up the Chart.js instances for the analytics page
     * Destroys existing charts before creating new ones to prevent memory leaks
     */
    function setupFacultyCharts() {
        // Clean up existing charts
        Object.values(facultyCharts).forEach(chart => chart?.destroy());
        facultyCharts = {};

        // Create event categories doughnut chart
        if (DOMElements.charts.categories) {
            const ctx = DOMElements.charts.categories.getContext('2d');
            facultyCharts.categories = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Technical', 'Cultural', 'Academic', 'Sports', 'Workshops'],
                    datasets: [{
                        label: 'Event Categories',
                        data: [45, 25, 15, 8, 7], // Sample data percentages
                        backgroundColor: [
                            '#2563EB', // Blue for Technical
                            '#34D399', // Green for Cultural  
                            '#F59E0B', // Yellow for Academic
                            '#EF4444', // Red for Sports
                            '#8B5CF6'  // Purple for Workshops
                        ],
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
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

        // Create department comparison chart
        if (DOMElements.charts.departments) {
            const ctx = DOMElements.charts.departments.getContext('2d');
            facultyCharts.departments = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Computer Science', 'Engineering', 'Business', 'Arts', 'Sciences'],
                    datasets: [{
                        label: 'Events Organized',
                        data: [45, 35, 25, 30, 20],
                        backgroundColor: [
                            '#2563EB',
                            '#10B981',
                            '#F59E0B',
                            '#EF4444',
                            '#8B5CF6'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
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

    // Handle proposal actions
    function handleProposalAction(proposalId, action) {
        const proposal = dummyData.proposals.find(p => p.id === proposalId);
        if (!proposal) return;

        if (action === 'approve') {
            proposal.status = 'approved';
            showNotification('Proposal Approved', `"${proposal.title}" has been approved and forwarded to admin.`);
        } else if (action === 'deny') {
            proposal.status = 'rejected';
            showNotification('Proposal Denied', `"${proposal.title}" has been rejected. Student will be notified.`);
        } else if (action === 'changes') {
            // This will be handled by the meeting request modal
            return;
        }

        // Update UI
        updateDashboardCounters();
        if (state.currentFacultyPage === 'review-proposals') {
            renderProposals();
        }
    }

    // Handle meeting request
    function handleMeetingRequest(proposalId, message, location) {
        const proposal = dummyData.proposals.find(p => p.id === proposalId);
        if (!proposal) return;

        // In a real app, this would send an email to the student
        showNotification(
            'Changes Requested',
            `Your feedback has been sent to ${proposal.studentName}. ${location ? `Meeting scheduled at ${location}.` : ''}`,
            'success'
        );

        proposal.status = 'revision_requested';
        
        // Update UI
        updateDashboardCounters();
        if (state.currentFacultyPage === 'review-proposals') {
            renderProposals();
        }
    }

    // Handle event creation
    function handleEventCreation(eventData) {
        const newEvent = {
            id: Date.now(),
            title: eventData.title,
            status: 'draft',
            participants: 0,
            date: eventData.date,
            category: eventData.category,
            createdBy: 'faculty',
            description: eventData.description,
            location: eventData.location,
            eligibility: eventData.eligibility,
            formLink: eventData.formLink
        };

        dummyData.events.official.unshift(newEvent);
        
        showNotification('Event Created', 'Your event has been created successfully!');
        
        // Clear form
        DOMElements.createEventForm?.reset();
        
        // Update counters
        updateDashboardCounters();
    }

    // Event tab management
    function updateEventTabs() {
        // Update tab buttons
        const officialBtn = DOMElements.eventTabs.officialBtn;
        const supervisedBtn = DOMElements.eventTabs.supervisedBtn;
        
        if (officialBtn) {
            officialBtn.classList.toggle('text-blue-600', state.currentEventTab === 'official');
            officialBtn.classList.toggle('border-blue-600', state.currentEventTab === 'official');
            officialBtn.classList.toggle('text-gray-500', state.currentEventTab !== 'official');
        }
        
        if (supervisedBtn) {
            supervisedBtn.classList.toggle('text-blue-600', state.currentEventTab === 'supervised');
            supervisedBtn.classList.toggle('border-blue-600', state.currentEventTab === 'supervised');
            supervisedBtn.classList.toggle('text-gray-500', state.currentEventTab !== 'supervised');
        }
        
        // Update content visibility
        DOMElements.eventsContent.official?.classList.toggle('hidden', state.currentEventTab !== 'official');
        DOMElements.eventsContent.supervised?.classList.toggle('hidden', state.currentEventTab !== 'supervised');
    }

    function showProposalActionModal(proposal) {
        const modal = DOMElements.modals.proposalAction;
        const titleEl = document.getElementById('proposal-title');
        
        if (!modal || !titleEl) return;
        
        titleEl.textContent = proposal.title;
        modal.classList.remove('hidden');
        
        // Store current proposal ID for actions
        modal.dataset.currentProposalId = proposal.id;
    }

    // ===================================================================
    // EVENT LISTENERS for Faculty Dashboard
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
        state.currentFacultyPage = 'profile';
        renderFacultyPage();
        DOMElements.profileDropdownMenu?.classList.add('hidden');
    });

    DOMElements.logoutMenuBtn?.addEventListener('click', () => {
        // Clear session data and redirect
        sessionStorage.removeItem('currentUser');
        localStorage.removeItem('facultyProfile');
        window.location.href = 'landing-page.html';
    });

    // Navigation link event listeners
    DOMElements.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default link behavior
            const page = link.dataset.page;
            if (page) {
                state.currentFacultyPage = page;
                renderFacultyPage();
            }
        });
    });

    // Dashboard summary cards act as navigation shortcuts
    DOMElements.dashboardCards.forEach(card => {
        card.addEventListener('click', () => {
            const page = card.dataset.page;
            if (page) {
                state.currentFacultyPage = page;
                renderFacultyPage();
            }
        });
    });

    // Event tabs
    DOMElements.eventTabs.officialBtn?.addEventListener('click', () => {
        state.currentEventTab = 'official';
        updateEventTabs();
    });

    DOMElements.eventTabs.supervisedBtn?.addEventListener('click', () => {
        state.currentEventTab = 'supervised';
        updateEventTabs();
    });

    // Proposal action handlers
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('proposal-action-btn')) {
            const proposalId = parseInt(e.target.dataset.proposalId);
            const proposal = dummyData.proposals.find(p => p.id === proposalId);
            
            if (proposal) {
                showProposalActionModal(proposal);
            }
        }
    });

    // Proposal action modal handlers
    document.getElementById('approve-proposal-btn')?.addEventListener('click', () => {
        const proposalId = parseInt(DOMElements.modals.proposalAction?.dataset.currentProposalId);
        if (proposalId) {
            handleProposalAction(proposalId, 'approve');
            DOMElements.modals.proposalAction?.classList.add('hidden');
        }
    });

    document.getElementById('deny-proposal-btn')?.addEventListener('click', () => {
        const proposalId = parseInt(DOMElements.modals.proposalAction?.dataset.currentProposalId);
        if (proposalId) {
            handleProposalAction(proposalId, 'deny');
            DOMElements.modals.proposalAction?.classList.add('hidden');
        }
    });

    document.getElementById('request-changes-btn')?.addEventListener('click', () => {
        DOMElements.modals.proposalAction?.classList.add('hidden');
        DOMElements.modals.meetingRequest?.classList.remove('hidden');
    });

    document.getElementById('cancel-proposal-action-btn')?.addEventListener('click', () => {
        DOMElements.modals.proposalAction?.classList.add('hidden');
    });

    // Meeting request modal handlers
    document.getElementById('meeting-request-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const proposalId = parseInt(DOMElements.modals.proposalAction?.dataset.currentProposalId);
        const message = document.getElementById('meeting-message')?.value;
        const location = document.getElementById('meeting-location')?.value;
        
        if (proposalId && message) {
            handleMeetingRequest(proposalId, message, location);
            
            DOMElements.modals.meetingRequest?.classList.add('hidden');
            e.target.reset();
        }
    });

    document.getElementById('cancel-meeting-btn')?.addEventListener('click', () => {
        DOMElements.modals.meetingRequest?.classList.add('hidden');
    });

    // Create event form handler
    DOMElements.createEventForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const eventData = {
            title: document.getElementById('event-title')?.value,
            description: document.getElementById('event-description')?.value,
            date: document.getElementById('event-date')?.value,
            time: document.getElementById('event-time')?.value,
            location: document.getElementById('event-location')?.value,
            category: document.getElementById('event-category')?.value,
            eligibility: document.getElementById('event-eligibility')?.value,
            formLink: document.getElementById('event-form-link')?.value
        };
        
        if (eventData.title && eventData.description && eventData.date) {
            handleEventCreation(eventData);
        }
    });

    // Profile management handlers
    DOMElements.profile.addSkillBtn?.addEventListener('click', addFacultySkill);
    
    DOMElements.profile.newSkillInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addFacultySkill();
        }
    });
    
    DOMElements.profile.suggestionTags?.forEach(tag => {
        tag.addEventListener('click', () => {
            const skill = tag.textContent.trim();
            if (skill && !dummyData.faculty.skills.includes(skill)) {
                dummyData.faculty.skills.push(skill);
                renderFacultySkills();
            }
        });
    });

    // Avatar upload handler
    DOMElements.profile.uploadBtn?.addEventListener('click', () => {
        DOMElements.profile.avatarUpload?.click();
    });

    DOMElements.profile.avatarUpload?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFacultyAvatarUpload(file);
        }
    });

    // Save profile handler
    DOMElements.profile.saveBtn?.addEventListener('click', saveFacultyProfileData);

    // Notification close handler
    document.getElementById('close-faculty-notification-btn')?.addEventListener('click', hideNotification);

    // Event management handlers
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('manage-event-btn')) {
            const eventId = parseInt(e.target.dataset.eventId);
            // In a real app, this would open an event management modal
            showNotification('Event Management', 'Event management functionality will be implemented here.');
        }
        
        if (e.target.classList.contains('view-mentee-project-btn')) {
            const projectId = parseInt(e.target.dataset.projectId);
            // In a real app, this would open a project details modal
            showNotification('Project Details', 'Project details view will be implemented here.');
        }
    });

    // Mobile menu handler
    DOMElements.mobileMenuBtn?.addEventListener('click', () => {
        // Toggle mobile sidebar visibility
        const sidebar = document.querySelector('aside');
        if (sidebar) {
            sidebar.classList.toggle('hidden');
            sidebar.classList.toggle('md:flex');
        }
    });

    // ===================================================================
    // INITIAL PAGE LOAD SETUP
    // ===================================================================
    
    // Load saved profile data
    loadFacultyProfileData();
    
    // Update dashboard counters
    updateDashboardCounters();
    
    // Set up initial event tab
    updateEventTabs();
    
    // Render the default dashboard view on page load
    renderFacultyPage();
});