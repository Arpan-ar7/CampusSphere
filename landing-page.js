/* FILE: landing-page.js */

document.addEventListener('DOMContentLoaded', () => {
    // ===================================================================
    // INITIALIZATION
    // ===================================================================
    lucide.createIcons(); // Render all Lucide icons

    // ===================================================================
    // CONFIGURATION
    // ===================================================================
    const API_BASE_URL = 'http://localhost:5000/api'; // Your Flask backend URL

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
            roleSelection: document.getElementById('role-selection-modal'),
            roleButtons: document.querySelectorAll('.role-btn'),
        },
        forms: {
            loginForm: document.getElementById('login-form'),
            signupForm: document.getElementById('signup-form'),
            loginEmail: document.getElementById('login-email'),
            loginPassword: document.getElementById('login-password'),
            signupFullname: document.getElementById('signup-fullname'),
            signupEmail: document.getElementById('signup-email'),
            signupPassword: document.getElementById('signup-password'),
            signupConfirmPassword: document.getElementById('signup-confirm-password'),
            signupRole: document.getElementById('signup-role'),
        },
        messages: {
            loginError: document.getElementById('login-error-message'),
            signupError: document.getElementById('signup-error-message'),
            signupSuccess: document.getElementById('signup-success-message'),
        },
        buttons: {
            showAuthModal: [
                document.getElementById('show-auth-modal-btn'),
                document.getElementById('get-started-btn'),
                document.getElementById('mobile-auth-btn')
            ],
            loginSubmit: document.getElementById('login-submit-btn'),
            signupSubmit: document.getElementById('signup-submit-btn'),
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
        
        // Clear any error messages when switching tabs
        hideMessage(DOMElements.messages.loginError);
        hideMessage(DOMElements.messages.signupError);
        hideMessage(DOMElements.messages.signupSuccess);
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

    // Show error/success message
    function showMessage(element, message, type = 'error') {
        if (!element) return;
        element.textContent = message;
        element.classList.remove('hidden');
        
        if (type === 'success') {
            element.className = element.className.replace('bg-red-100 border-red-400 text-red-700', 'bg-green-100 border-green-400 text-green-700');
        }
    }

    // Hide message
    function hideMessage(element) {
        if (!element) return;
        element.classList.add('hidden');
    }

    // Show loading state for buttons
    function setButtonLoading(button, isLoading) {
        if (!button) return;
        const textSpan = button.querySelector('.login-btn-text, .signup-btn-text');
        const spinner = button.querySelector('.login-btn-spinner, .signup-btn-spinner');
        
        if (textSpan && spinner) {
            textSpan.classList.toggle('hidden', isLoading);
            spinner.classList.toggle('hidden', !isLoading);
        }
        
        button.disabled = isLoading;
        button.classList.toggle('opacity-50', isLoading);
        button.classList.toggle('cursor-not-allowed', isLoading);
    }

    // ===================================================================
    // API FUNCTIONS
    // ===================================================================

    // Handle user registration
    async function registerUser(userData) {
        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            return data;
        } catch (error) {
            throw error;
        }
    }

    // Handle user login
    async function loginUser(userData) {
        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            return data;
        } catch (error) {
            throw error;
        }
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
    DOMElements.modals.closeAuthBtn?.addEventListener('click', () => {
        DOMElements.modals.auth.classList.add('hidden');
        // Clear forms and messages
        DOMElements.forms.loginForm?.reset();
        DOMElements.forms.signupForm?.reset();
        hideMessage(DOMElements.messages.loginError);
        hideMessage(DOMElements.messages.signupError);
        hideMessage(DOMElements.messages.signupSuccess);
    });

    // Login/Sign Up tab switching.
    DOMElements.modals.loginTabBtn?.addEventListener('click', () => switchAuthTab('login'));
    DOMElements.modals.signupTabBtn?.addEventListener('click', () => switchAuthTab('signup'));

    // ===================================================================
    // FORM SUBMISSION HANDLERS
    // ===================================================================

    // Handle Login Form Submission
    DOMElements.forms.loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = DOMElements.forms.loginEmail.value.trim();
        const password = DOMElements.forms.loginPassword.value;

        // Basic validation
        if (!email || !password) {
            showMessage(DOMElements.messages.loginError, 'Please fill in all fields');
            return;
        }

        // Show loading state
        setButtonLoading(DOMElements.buttons.loginSubmit, true);
        hideMessage(DOMElements.messages.loginError);

        try {
            const result = await loginUser({ email, password });
            
            // Login successful - store user data 
            sessionStorage.setItem('currentUser', JSON.stringify(result.user));
            
            // Check user's role and redirect accordingly
            const userRole = result.user.role;
            
            // Close auth modal and redirect directly to appropriate dashboard
            DOMElements.modals.auth.classList.add('hidden');
            
            // Redirect based on user's role from database
            window.location.href = `${userRole}-dashboard.html`;

        } catch (error) {
            showMessage(DOMElements.messages.loginError, error.message);
        } finally {
            setButtonLoading(DOMElements.buttons.loginSubmit, false);
        }
    });

    // Handle Sign Up Form Submission
    DOMElements.forms.signupForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const fullName = DOMElements.forms.signupFullname.value.trim();
        const email = DOMElements.forms.signupEmail.value.trim();
        const password = DOMElements.forms.signupPassword.value;
        const confirmPassword = DOMElements.forms.signupConfirmPassword.value;
        const role = DOMElements.forms.signupRole.value;

        // Basic validation
        if (!fullName || !email || !password || !confirmPassword || !role) {
            showMessage(DOMElements.messages.signupError, 'Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            showMessage(DOMElements.messages.signupError, 'Passwords do not match');
            return;
        }

        if (password.length < 6) {
            showMessage(DOMElements.messages.signupError, 'Password must be at least 6 characters long');
            return;
        }

        // Email validation (basic)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showMessage(DOMElements.messages.signupError, 'Please enter a valid email address');
            return;
        }

        // Show loading state
        setButtonLoading(DOMElements.buttons.signupSubmit, true);
        hideMessage(DOMElements.messages.signupError);
        hideMessage(DOMElements.messages.signupSuccess);

        try {
            const result = await registerUser({ fullName, email, password, role });
            
            // Registration successful
            showMessage(DOMElements.messages.signupSuccess, result.message, 'success');
            
            // Clear the form
            DOMElements.forms.signupForm.reset();
            
            // Switch to login tab after a delay
            setTimeout(() => {
                switchAuthTab('login');
                // Pre-fill email in login form
                DOMElements.forms.loginEmail.value = email;
            }, 2000);

        } catch (error) {
            showMessage(DOMElements.messages.signupError, error.message);
        } finally {
            setButtonLoading(DOMElements.buttons.signupSubmit, false);
        }
    });

    // Role selection buttons - navigate to the corresponding dashboard page after login
    DOMElements.modals.roleButtons.forEach(button => button.addEventListener('click', () => {
        const role = button.dataset.role;
        if (role) {
            // Store selected role
            const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
            currentUser.selectedRole = role;
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Navigate to the dashboard
            window.location.href = `${role}-dashboard.html`;
        }
    }));

    // ===================================================================
    // INITIALIZATION CHECKS
    // ===================================================================

    // Check if user is already logged in (optional - for future use)
    const currentUser = sessionStorage.getItem('currentUser');
    if (currentUser) {
        // User is already logged in, could redirect or show different UI
        // For now, we'll just log it
        console.log('User already logged in:', JSON.parse(currentUser));
    }

    // Re-render icons after dynamic content changes
    setTimeout(() => {
        lucide.createIcons();
    }, 100);
});