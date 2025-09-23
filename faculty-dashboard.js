/* FILE: faculty-dashboard.js */

document.addEventListener('DOMContentLoaded', () => {
    // ===================================================================
    // INITIALIZATION
    // ===================================================================
    lucide.createIcons();

    // ===================================================================
    // STATE MANAGEMENT for Faculty Dashboard
    // ===================================================================
    const state = {
        currentFacultyPage: 'dashboard', // Default page
    };
    let facultyCharts = {}; // To hold chart instances

    // ===================================================================
    // DOM ELEMENT SELECTORS for Faculty Dashboard
    // ===================================================================
    const DOMElements = {
        navLinks: document.querySelectorAll('#faculty-view .faculty-nav-link'),
        pages: document.querySelectorAll('.faculty-page'),
        pageTitle: document.getElementById('faculty-page-title'),
        logoutBtn: document.getElementById('faculty-logout-btn'),
        profileBtnHeader: document.getElementById('faculty-profile-btn-header'),
        dashboardCards: document.querySelectorAll('.dashboard-card-link'),
        charts: {
            categories: document.getElementById('eventCategoriesChart')
        }
    };

    // ===================================================================
    // UI RENDERING & DYNAMIC CONTENT FUNCTIONS
    // ===================================================================

    // Main function to switch between faculty pages
    function renderFacultyPage() {
        DOMElements.pages.forEach(p => p.classList.add('hidden'));
        const currentPage = document.getElementById(`faculty-${state.currentFacultyPage}-page`);
        if (currentPage) currentPage.classList.remove('hidden');

        let activeLinkText = '';
        DOMElements.navLinks.forEach(link => {
            const isActive = link.dataset.page === state.currentFacultyPage;
            link.classList.toggle('active', isActive);
            if (isActive) {
                activeLinkText = link.querySelector('span').textContent;
            }
        });

        // Update the main header title
        if (DOMElements.pageTitle) {
            DOMElements.pageTitle.textContent = activeLinkText;
        }
        
        // If the analytics page is active, set up the charts
        if (state.currentFacultyPage === 'analytics') {
            setupFacultyCharts();
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
        lucide.createIcons();
    }
    
    // Sets up the Chart.js instances for the analytics page
    function setupFacultyCharts() {
        Object.values(facultyCharts).forEach(chart => chart?.destroy());
        facultyCharts = {};

        if (DOMElements.charts.categories) {
            const ctx = DOMElements.charts.categories.getContext('2d');
            facultyCharts.categories = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Technical', 'Cultural', 'Academic', 'Sports', 'Workshops'],
                    datasets: [{
                        label: 'Event Categories',
                        data: [45, 25, 15, 8, 7],
                        backgroundColor: ['#2563EB', '#34D399', '#F59E0B', '#EF4444', '#8B5CF6'],
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } }
                }
            });
        }
    }

    // ===================================================================
    // EVENT LISTENERS for Faculty Dashboard
    // ===================================================================

    // Clicks on sidebar navigation links
    DOMElements.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            state.currentFacultyPage = link.dataset.page;
            renderFacultyPage();
        });
    });
    
    // Logout button navigates back to the landing page
    DOMElements.logoutBtn?.addEventListener('click', () => {
        window.location.href = 'landing-page.html';
    });

    // Profile button in header navigates to the profile page
    DOMElements.profileBtnHeader?.addEventListener('click', () => {
        state.currentFacultyPage = 'profile';
        renderFacultyPage();
    });

    // Dashboard summary cards act as navigation links
    DOMElements.dashboardCards.forEach(card => {
        card.addEventListener('click', () => {
            const page = card.dataset.page;
            if (page) {
                state.currentFacultyPage = page;
                renderFacultyPage();
            }
        });
    });

    // ===================================================================
    // INITIAL PAGE LOAD SETUP
    // ===================================================================
    renderFacultyPage(); // Render the default dashboard view
});