/* FILE: admin-dashboard.js */

document.addEventListener('DOMContentLoaded', () => {
    // ===================================================================
    // INITIALIZATION
    // ===================================================================
    lucide.createIcons();

    // ===================================================================
    // DOM ELEMENT SELECTORS for Admin Dashboard
    // ===================================================================
    const logoutBtn = document.getElementById('admin-logout-btn');

    // ===================================================================
    // EVENT LISTENERS for Admin Dashboard
    // ===================================================================
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            // Navigate back to the main landing page on logout
            window.location.href = 'landing-page.html';
        });
    }
});