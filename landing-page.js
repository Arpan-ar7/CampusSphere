/* FILE: landing-page.js */

document.addEventListener('DOMContentLoaded', () => {
    // ===================================================================
    // INITIALIZATION
    // ===================================================================
    lucide.createIcons(); // Render all Lucide icons

    // ===================================================================
    // DOM ELEMENT SELECTORS for the Landing Page
    // ===================================================================
    const DOMElements = {
        header: document.getElementById('pre-login-header'),
        navLinks: document.querySelectorAll('.nav-link-pre-login'),
        mobileMenuBtn: document.getElementById('mobile-menu-btn'),
        closeMobileMenuBtn: document.getElementById('close-mobile-menu-btn'),
        mobileMenu: document.getElementById('mobile-menu'),
        mobileNavLinks: document.querySelectorAll('.mobile-nav-link'),
        modals: {
            auth: document.getElementById('auth-modal'),
            closeAuthBtn: document.getElementById('close-auth-modal-btn'),
            loginTabBtn: document.getElementById('login-tab-btn'),
            signupTabBtn: document.getElementById('signup-tab-btn'),
            ssoLoginBtn: document.getElementById('sso-login-btn'),
            roleSelection: document.getElementById('role-selection-modal'),
            roleButtons: document.querySelectorAll('.role-btn'),
        },
        buttons: {
            showAuthModal: [
                document.getElementById('show-auth-modal-btn'),
                document.getElementById('get-started-btn'),
                document.getElementById('mobile-auth-btn')
            ],
        }
    };

    // ===================================================================
    // HELPER FUNCTIONS for Landing Page
    // ===================================================================

    // Closes the mobile menu with a fade-out effect.
    function closeMobileMenu() {
        if (!DOMElements.mobileMenu) return;
        DOMElements.mobileMenu.classList.add('opacity-0');
        setTimeout(() => DOMElements.mobileMenu.classList.add('hidden'), 300);
    }

    // Switches between the Login and Sign Up tabs in the authentication modal.
    function switchAuthTab(tab) {
        const isLogin = tab === 'login';
        document.getElementById('login-view').classList.toggle('hidden', !isLogin);
        document.getElementById('signup-view').classList.toggle('hidden', isLogin);
        DOMElements.modals.loginTabBtn.classList.toggle('active', isLogin);
        DOMElements.modals.signupTabBtn.classList.toggle('active', !isLogin);
    }

    // Handles scroll effects for the header and active navigation link highlighting.
    function handleScroll() {
        if (!DOMElements.header) return;
        const isScrolled = window.scrollY > 50;
        DOMElements.header.classList.toggle('header-scrolled', isScrolled);

        let currentSection = 'home';
        const sections = document.querySelectorAll('#pre-login-main section');
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= sectionTop - 70) { // 70 is header height offset
                currentSection = section.getAttribute('id');
            }
        });

        DOMElements.navLinks.forEach(link => {
            link.classList.toggle('active-nav-pre-login', link.dataset.section === currentSection);
        });
    }

    // ===================================================================
    // EVENT LISTENERS for Landing Page
    // ===================================================================

    // Listen for page scroll to trigger header changes.
    window.addEventListener('scroll', handleScroll);

    // Smooth scrolling for all navigation links.
    const allNavLinks = [...DOMElements.navLinks, ...DOMElements.mobileNavLinks];
    allNavLinks.forEach(link => link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        document.querySelector(targetId).scrollIntoView({ behavior: 'smooth' });
        if (!DOMElements.mobileMenu.classList.contains('opacity-0')) {
            closeMobileMenu();
        }
    }));

    // Mobile menu open/close buttons.
    DOMElements.mobileMenuBtn?.addEventListener('click', () => {
        DOMElements.mobileMenu.classList.remove('hidden');
        setTimeout(() => DOMElements.mobileMenu.classList.remove('opacity-0'), 10);
    });
    DOMElements.closeMobileMenuBtn?.addEventListener('click', closeMobileMenu);

    // Buttons that open the authentication modal.
    DOMElements.buttons.showAuthModal.forEach(btn => btn?.addEventListener('click', () => {
        DOMElements.modals.auth.classList.remove('hidden');
        closeMobileMenu();
    }));

    // Closing the authentication modal.
    DOMElements.modals.closeAuthBtn?.addEventListener('click', () => DOMElements.modals.auth.classList.add('hidden'));

    // "Sign in with University Email" button shows the role selection modal.
    DOMElements.modals.ssoLoginBtn?.addEventListener('click', () => {
        DOMElements.modals.auth.classList.add('hidden');
        DOMElements.modals.roleSelection.classList.remove('hidden');
    });

    // Login/Sign Up tab switching.
    DOMElements.modals.loginTabBtn?.addEventListener('click', () => switchAuthTab('login'));
    DOMElements.modals.signupTabBtn?.addEventListener('click', () => switchAuthTab('signup'));

    // Role selection buttons now navigate to the corresponding dashboard page.
    DOMElements.modals.roleButtons.forEach(button => button.addEventListener('click', () => {
        const role = button.dataset.role;
        if (role) {
            // This is the key change: navigate to the new page.
            window.location.href = `${role}-dashboard.html`;
        }
    }));
});