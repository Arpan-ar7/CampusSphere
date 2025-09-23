/* FILE: admin-dashboard.js */

document.addEventListener('DOMContentLoaded', () => {
    // ===================================================================
    // STATE & DATA
    // ===================================================================
    const state = {
        currentAdminPage: 'analytics',
        currentUserTab: 'faculty', // 'faculty' or 'all'
    };
    let adminCharts = {}; // To hold chart instances

    const dummyData = {
        // Added more users as requested
        users: [
            { name: "Dr. Eleanor Vance", role: "Faculty", dept: "Computer Science", status: "Pending" },
            { name: "Prof. Ben Carter", role: "Faculty", dept: "Physics", status: "Pending" },
            { name: "Jane Doe", role: "Student", dept: "Computer Science", status: "Verified" },
            { name: "John Smith", role: "Student", dept: "Mechanical Eng.", status: "Verified" },
            { name: "Dr. Aisha Khan", role: "Faculty", dept: "History", status: "Verified" },
            { name: "Rohan M.", role: "Student", dept: "ECE", status: "Verified" },
            { name: "Prof. David Lee", role: "Faculty", dept: "ECE", status: "Pending" },
            { name: "Priya S.", role: "Student", dept: "Civil Eng.", status: "Verified" },
        ],
        events: [
            { name: "Annual Tech Innovate Challenge", dept: "CSE", cat: "Technical", part: 120, status: "Approved", featured: true },
            { name: "Global Culture Fest", dept: "Student Union", cat: "Cultural", part: 450, status: "Approved", featured: false },
            { name: "Inter-Departmental Sports Day", dept: "Sports Committee", cat: "Sports", part: 300, status: "Approved", featured: true },
            { name: "Startup Pitch Competition", dept: "E-Cell", cat: "Academic", part: 75, status: "Pending", featured: false },
        ]
    };

    // ===================================================================
    // DOM SELECTORS
    // ===================================================================
    const DOMElements = {
        pageTitle: document.getElementById('admin-page-title'),
        navLinks: document.querySelectorAll('.admin-nav-link'),
        pages: document.querySelectorAll('.admin-page'),
        userTabs: {
            faculty: document.getElementById('faculty-tab-btn'),
            all: document.getElementById('all-users-tab-btn'),
        },
        usersTableBody: document.getElementById('users-table-body'),
        eventsTableBody: document.getElementById('events-table-body'),
    };

    // ===================================================================
    // RENDERING FUNCTIONS
    // ===================================================================

    function renderPage() {
        DOMElements.pages.forEach(p => p.classList.add('hidden'));
        const currentPage = document.getElementById(`admin-${state.currentAdminPage}-page`);
        if (currentPage) currentPage.classList.remove('hidden');

        let activeLinkText = '';
        DOMElements.navLinks.forEach(link => {
            const isActive = link.dataset.page === state.currentAdminPage;
            link.classList.toggle('active', isActive);
            if (isActive) activeLinkText = link.textContent.trim();
        });
        DOMElements.pageTitle.textContent = activeLinkText;

        if (state.currentAdminPage === 'analytics') {
            setupAdminCharts();
        }
        lucide.createIcons();
    }

    function renderUserTable() {
        const tbody = DOMElements.usersTableBody;
        if (!tbody) return;
        tbody.innerHTML = '';
        const usersToDisplay = state.currentUserTab === 'faculty' 
            ? dummyData.users.filter(u => u.status === 'Pending' && u.role === 'Faculty') 
            : dummyData.users;

        usersToDisplay.forEach(u => {
            const row = document.createElement('tr');
            row.className = 'bg-white border-b hover:bg-gray-50';
            const statusClass = u.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800';
            const actionButton = u.status === 'Pending' 
                ? `<button class="px-3 py-1 text-xs font-semibold rounded-full bg-green-500 hover:bg-green-600 text-white">Approve</button>` 
                : `<button class="px-3 py-1 text-xs font-semibold rounded-full bg-red-500 hover:bg-red-600 text-white">Revoke</button>`;
            row.innerHTML = `
                <td class="px-6 py-4">${u.name}</td>
                <td class="px-6 py-4">${u.role}</td>
                <td class="px-6 py-4">${u.dept}</td>
                <td class="px-6 py-4"><span class="px-2 py-1 text-xs font-semibold rounded-full ${statusClass}">${u.status}</span></td>
                <td class="px-6 py-4">${actionButton}</td>
            `;
            tbody.appendChild(row);
        });
    }

    function renderEventTable() {
        const tbody = DOMElements.eventsTableBody;
        if (!tbody) return;
        tbody.innerHTML = '';
        dummyData.events.forEach(event => {
            const row = document.createElement('tr');
            row.className = 'bg-white border-b hover:bg-gray-50';
            const statusClass = event.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800';
            row.innerHTML = `
                <td class="px-6 py-4 font-medium text-gray-900">${event.name}</td>
                <td class="px-6 py-4">${event.dept}</td>
                <td class="px-6 py-4">${event.cat}</td>
                <td class="px-6 py-4">${event.part}</td>
                <td class="px-6 py-4"><span class="px-2 py-1 text-xs font-semibold rounded-full ${statusClass}">${event.status}</span></td>
                <td class="px-6 py-4"><input type="checkbox" class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" ${event.featured ? 'checked' : ''}></td>
            `;
            tbody.appendChild(row);
        });
    }

    function setupAdminCharts() {
        // Destroy any existing charts to prevent them from overlapping
        Object.values(adminCharts).forEach(chart => chart?.destroy());
        
        // Line Chart: Participation Over Time
        const participationCtx = document.getElementById('participation-chart')?.getContext('2d');
        if (participationCtx) {
            adminCharts.participation = new Chart(participationCtx, {
                type: 'line',
                data: { labels: ['Jan', 'Feb', 'Mar', 'Apr'], datasets: [{ label: 'Participation', data: [400, 700, 650, 900], borderColor: '#1E88E5', tension: 0.1, fill: false }] },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }
        
        // Pie Chart: Events by Category
        const categoryCtx = document.getElementById('category-chart')?.getContext('2d');
        if (categoryCtx) {
            adminCharts.category = new Chart(categoryCtx, {
                type: 'pie',
                data: { labels: ['Sports', 'Cultural', 'Technical'], datasets: [{ data: [30, 45, 25], backgroundColor: ['#1E88E5', '#4CAF50', '#FFC107'] }] },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }
        
        // Bar Chart: Departmental Engagement
        const departmentCtx = document.getElementById('department-chart')?.getContext('2d');
        if (departmentCtx) {
            adminCharts.department = new Chart(departmentCtx, {
                type: 'bar',
                data: { labels: ['CSE', 'ECE', 'MECH'], datasets: [{ label: 'Participants', data: [1200, 900, 750], backgroundColor: '#1E88E5' }, { label: 'Events', data: [80, 60, 50], backgroundColor: '#4CAF50' }] },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }
    }

    // ===================================================================
    // EVENT LISTENERS
    // ===================================================================

    DOMElements.navLinks.forEach(link => {
        link.addEventListener('click', () => {
            state.currentAdminPage = link.dataset.page;
            renderPage();
        });
    });

    DOMElements.userTabs.faculty.addEventListener('click', () => {
        state.currentUserTab = 'faculty';
        DOMElements.userTabs.faculty.classList.add('active');
        DOMElements.userTabs.all.classList.remove('active');
        renderUserTable();
    });

    DOMElements.userTabs.all.addEventListener('click', () => {
        state.currentUserTab = 'all';
        DOMElements.userTabs.all.classList.add('active');
        DOMElements.userTabs.faculty.classList.remove('active');
        renderUserTable();
    });

    // ===================================================================
    // INITIALIZATION
    // ===================================================================
    DOMElements.userTabs.faculty.classList.add('active'); // Set default active tab
    renderPage();
    renderUserTable();
    renderEventTable();
});

