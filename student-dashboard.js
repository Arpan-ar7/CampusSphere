/* FILE: student-dashboard.js */

document.addEventListener('DOMContentLoaded', () => {
    // ===================================================================
    // INITIALIZATION
    // ===================================================================
    lucide.createIcons();

    // ===================================================================
    // STATE MANAGEMENT for Student Dashboard
    // ===================================================================
    const state = {
        currentStudentPage: 'home', // Default page is 'home'
        // Add this new line inside your 'state' object
selectedAchievements: new Set(),
    };

    // ===================================================================
    // DUMMY DATA for Student Dashboard
    // ===================================================================
    const dummyData = {
        user: {
            name: 'Jane Doe',
            email: 'jane.doe@university.edu',
            bio: "Dedicated student at CampusSphere University, passionate about technology and community engagement. Always eager to collaborate on innovative projects and learn new skills.",
            skills: ['React', 'Python', 'Teamwork', 'Communication', 'Data Entry'],
            avatarUrl: 'https://i.pravatar.cc/120?u=jane'
        },
        
        // --- UPDATED: Restored all 6 events with full details and eligibility ---
        events: [
            { 
                id: 1, 
                title: 'Annual Tech Innovate Challenge', 
                category: 'Technical', 
                isEligible: true, // New property for toggle switch
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
                imageUrl: 'https://images.unsplash.com/photo-1605379399642-870262d3d051?q=80&w=800' 
            },
            { // Restored Event 2
                id: 2, 
                title: 'Global Culture Fest', 
                category: 'Cultural', 
                isEligible: false, // Not eligible
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
                imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=800' 
            },
            { // Restored Event 3
                id: 3, 
                title: 'Inter-Departmental Sports Day', 
                category: 'Sports', 
                isEligible: false, // Not eligible
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
                imageUrl: 'https://images.unsplash.com/photo-1599494112020-f33955c4c11b?q=80&w=800' 
            },
            { // Restored Event 4
                id: 4, 
                title: 'Future Leaders Summit', 
                category: 'Academic', 
                isEligible: true, // Eligible
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
                imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=800' 
            },
            { // Restored Event 5
                id: 5, 
                title: 'Intro to Web Development', 
                category: 'Workshop', 
                isEligible: true, // Eligible
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
                imageUrl: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=800' 
            },
            { // Restored Event 6
                id: 6, 
                title: 'Fall Semester Welcome Party', 
                category: 'Social', 
                isEligible: false, // Not eligible
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
                imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=800' 
            }
        ],
        collaborationPosts: [
            { id: 1, title: 'Teammate needed for SIH 2025', description: 'Looking for enthusiastic and skilled developers to join our team for Smart India Hackathon 2025. We are focusing on an AI-driven solution for sustainable urban farming.', skills: ['AI/ML', 'Python', 'IoT', 'Data Science'], imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800' },
            { id: 2, title: 'Web Dev for Campus Event Portal', description: 'Seeking frontend and backend developers for a new campus event management portal. Technologies include React, Node.js, and MongoDB. Help us build a seamless experience.', skills: ['React', 'Node.js', 'MongoDB', 'Full-stack'], imageUrl: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=800' },
            { id: 3, title: 'Research Assistant for Robotics', description: 'Opportunity for a passionate student to assist in a cutting-edge robotics research project. Focus on robotic arm control and path planning. Experience with ROS, OpenCV is valued.', skills: ['Robotics', 'ROS', 'OpenCV', 'C++'], imageUrl: 'https://images.unsplash.com/photo-1614926857224-081541396895?q=80&w=800' },
            { id: 4, title: 'Content Creator for Campus Blog', description: 'The Campus Chronicle is looking for creative writers and multimedia content creators to cover university events, student stories, and academic achievements.', skills: ['Content Writing', 'Journalism', 'Photography'], imageUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=800' }
        ],
        // Replace your old 'achievements' array with this one
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
    };

    // ===================================================================
    // DOM ELEMENT SELECTORS for Student Dashboard
    // ===================================================================
    const DOMElements = {
        header: {
            profileAvatarBtn: document.getElementById('profile-avatar-btn'),
            logoutBtn: document.getElementById('logout-btn')
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
            eligibleToggle: document.getElementById('eligible-toggle'), // Added selector for the toggle switch
        },
        collaborate: {
            postGrid: document.querySelector('#student-collaborate-page .grid')
        },
        resume: {
achievementsGrid: document.querySelector('#student-resume-page .grid'), // <-- Add comma here
            // Add these two new lines inside the 'resume' object
selectAllCheckbox: document.getElementById('select-all-achievements'),
downloadPdfBtn: document.getElementById('download-resume-pdf-btn'),
        },
        profile: {
            skillsContainer: document.getElementById('skills-container'),
            newSkillInput: document.getElementById('new-skill-input'),
            addSkillBtn: document.getElementById('add-skill-btn'),
            suggestionTags: document.querySelectorAll('.suggestion-tag')
        },
    };

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
        lucide.createIcons();
    }

    // --- UPDATED: This function now handles the eligibility toggle ---
    function renderDiscoverEvents() {
        const grid = DOMElements.discover.eventGrid;
        if (!grid) return;

        const activeFilter = document.querySelector('#student-discover-page .filter-btn.active');
        if (!activeFilter) return;
        const activeCategory = activeFilter.textContent;
        
        // --- LOGIC FOR ELIGIBILITY TOGGLE ---
        // 1. Check if the eligibility toggle is on
        const isEligibleOnly = DOMElements.discover.eligibleToggle.checked;

        // 2. Start with all events, then filter if the toggle is on
        let eventsToDisplay = dummyData.events;
        if (isEligibleOnly) {
            eventsToDisplay = eventsToDisplay.filter(event => event.isEligible);
        }
        
        // 3. Apply the category filter to the (potentially pre-filtered) list
        const filteredEvents = eventsToDisplay.filter(event => {
            return activeCategory === 'All' || event.category === activeCategory;
        });
        
        // 4. Render the final list of events
        grid.innerHTML = ''; // Clear previous results
        if (filteredEvents.length === 0) {
            grid.innerHTML = `<p class="text-gray-500 md:col-span-3 text-center">No events match your criteria.</p>`;
            return;
        }

        filteredEvents.forEach(event => {
            const card = document.createElement('div');
            card.className = 'bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm flex flex-col transition-transform hover:scale-105 hover:shadow-lg';
            // Use a shorter substring for the description on the card
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

    function renderCollaborationPosts() {
        const grid = DOMElements.collaborate.postGrid;
        if(!grid) return;
        grid.innerHTML = '';
        dummyData.collaborationPosts.forEach(post => {
            const card = document.createElement('div');
            card.className = 'bg-white p-5 rounded-2xl border border-gray-200 shadow-sm transition-shadow hover:shadow-lg';
            const skillsHtml = post.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('');
            card.innerHTML = `
                <img src="${post.imageUrl}" class="w-full h-32 object-cover rounded-lg mb-4">
                <h3 class="font-bold text-lg">${post.title}</h3>
                <p class="text-sm text-gray-600 mt-1 mb-3">${post.description}</p>
                <div class="flex flex-wrap gap-2 mb-4">${skillsHtml}</div>
                <button class="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition">I'm Interested</button>`;
            grid.appendChild(card);
        });
    }

    // Replace your entire old 'renderAchievements' function with this
function renderAchievements() {
    const grid = DOMElements.resume.achievementsGrid;
    if (!grid) return;
    grid.innerHTML = ''; // Clear existing cards
    dummyData.achievements.forEach(item => {
        const card = document.createElement('div');
        // Check if this item's ID is in our selection Set
        const isSelected = state.selectedAchievements.has(item.id);
        // Add the 'selected' class if it is
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
        if(!container) return;
        container.innerHTML = '';
        dummyData.user.skills.forEach(skill => {
            const tag = document.createElement('span');
            tag.className = 'skill-tag-editable';
            tag.innerHTML = `${skill}<button data-skill="${skill}" class="remove-skill-btn">&times;</button>`;
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
            </div>
        `;
        
        modal.classList.remove('hidden');
        lucide.createIcons();
    }

    // ===================================================================
    // EVENT LISTENERS for Student Dashboard
    // ===================================================================

    DOMElements.desktopNavLinks.forEach(link => link.addEventListener('click', () => {
        state.currentStudentPage = link.dataset.page;
        renderStudentPage();
    }));
    
    DOMElements.navLinks.forEach(link => link.addEventListener('click', () => {
        state.currentStudentPage = link.dataset.page;
        renderStudentPage();
    }));
    
    DOMElements.header.profileAvatarBtn?.addEventListener('click', () => {
        state.currentStudentPage = 'profile';
        renderStudentPage();
    });

    DOMElements.header.logoutBtn?.addEventListener('click', () => {
        window.location.href = 'landing-page.html';
    });
    
    DOMElements.home.exploreBtn?.addEventListener('click', () => {
        state.currentStudentPage = 'discover';
        renderStudentPage();
    });

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

    const closeEventModalBtn = document.getElementById('close-event-modal-btn');
    if (closeEventModalBtn) {
        closeEventModalBtn.addEventListener('click', () => {
            document.getElementById('event-details-modal').classList.add('hidden');
        });
    }
    
    DOMElements.discover.filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            DOMElements.discover.filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            renderDiscoverEvents();
        });
    });
    // PASTE THIS ENTIRE BLOCK AT THE END OF THE 'EVENT LISTENERS' SECTION

// --- Resume Page Event Listeners ---

// Handles clicks on the checkboxes within the achievement cards.
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
        // Update the 'Select All' checkbox state
        DOMElements.resume.selectAllCheckbox.checked = state.selectedAchievements.size === dummyData.achievements.length;
    }
});

// Handles the 'Select All' checkbox.
DOMElements.resume.selectAllCheckbox?.addEventListener('change', (e) => {
    const isChecked = e.target.checked;
    if (isChecked) {
        // Add all achievement IDs to the selection set
        dummyData.achievements.forEach(item => state.selectedAchievements.add(item.id));
    } else {
        // Clear the selection set
        state.selectedAchievements.clear();
    }
    // Re-render all cards to reflect the change
    renderAchievements();
});

// Handles the 'Download PDF' button click.
DOMElements.resume.downloadPdfBtn?.addEventListener('click', () => {
    if (typeof window.jspdf === 'undefined') {
        alert('PDF generation library is not loaded. Please check the script tag in your HTML file.');
        return;
    }
    if (state.selectedAchievements.size === 0) {
        alert('Please select at least one achievement to include in the PDF.');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Filter the main data to get only the selected achievements
    const selectedItems = dummyData.achievements.filter(item => state.selectedAchievements.has(item.id));

    // Create the PDF content
    doc.setFontSize(22);
    doc.text('Verified Achievements', 20, 20);
    doc.setFontSize(16);
    doc.text(dummyData.user.name, 20, 30);
    
    let yPosition = 45; // Starting position for the list
    selectedItems.forEach(item => {
        if (yPosition > 280) { // Add a new page if content overflows
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
        
        yPosition += 20; // Move down for the next item
    });

    // Save the PDF
    doc.save('CampusSphere_Achievements.pdf');
});

    // --- NEW: Event listener for the eligibility toggle switch ---
    DOMElements.discover.eligibleToggle.addEventListener('change', () => {
        renderDiscoverEvents(); // Re-render when toggle state changes
    });

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

    // ===================================================================
    // INITIAL PAGE LOAD SETUP
    // ===================================================================
    renderDiscoverEvents(); 
    renderCollaborationPosts();
    renderAchievements();
    renderSkills();
    renderStudentPage();
});