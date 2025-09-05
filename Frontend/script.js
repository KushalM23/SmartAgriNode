// Global variables
const API_BASE_URL = 'http://localhost:5000/api';
let currentUser = null;
let selectedFile = null;

// DOM elements
const navbar = document.getElementById('navbar');
const navMenu = document.getElementById('nav-menu');
const hamburger = document.getElementById('hamburger');
const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('.nav-link');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    checkAuthStatus();
});

// Initialize application
function initializeApp() {
    // Setup navigation
    setupNavigation();
    
    // Setup forms
    setupForms();
    
    // Setup file upload
    setupFileUpload();
    
    // Setup scroll effects
    setupScrollEffects();
}

// Setup navigation functionality
function setupNavigation() {
    // Mobile menu toggle
    hamburger.addEventListener('click', toggleMobileMenu);
    
    // Navigation link clicks
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('href').substring(1);
            showSection(target);
            closeMobileMenu();
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
            closeMobileMenu();
        }
    });
}

// Setup form event listeners
function setupForms() {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Signup form
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
    
    // Crop recommendation form
    const cropForm = document.getElementById('crop-form');
    if (cropForm) {
        cropForm.addEventListener('submit', handleCropRecommendation);
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// Setup file upload functionality
function setupFileUpload() {
    const uploadArea = document.getElementById('upload-area');
    const imageInput = document.getElementById('image-input');
    const detectWeedsBtn = document.getElementById('detect-weeds-btn');
    
    if (uploadArea) {
        // Click to upload
        uploadArea.addEventListener('click', () => {
            imageInput.click();
        });
        
        // Drag and drop
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('dragleave', handleDragLeave);
        uploadArea.addEventListener('drop', handleDrop);
    }
    
    if (imageInput) {
        imageInput.addEventListener('change', handleImageSelect);
    }
    
    if (detectWeedsBtn) {
        detectWeedsBtn.addEventListener('click', handleWeedDetection);
    }
}

// Setup scroll effects
function setupScrollEffects() {
    window.addEventListener('scroll', () => {
        // Navbar scroll effect
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// Navigation functions
function toggleMobileMenu() {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
}

function closeMobileMenu() {
    navMenu.classList.remove('active');
    hamburger.classList.remove('active');
}

function showSection(sectionId) {
    // Check if user is trying to access protected sections without being logged in
    const protectedSections = ['crop-recommendation', 'weed-detection'];
    if (protectedSections.includes(sectionId) && !currentUser) {
        showToast('Please login to access this feature', 'warning');
        showSection('login');
        return;
    }
    
    // Hide all sections
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update active nav link
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
        }
    });
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Authentication functions
async function checkAuthStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/user`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const user = await response.json();
            currentUser = user;
            updateAuthUI(true);
        } else {
            updateAuthUI(false);
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        updateAuthUI(false);
    }
}

function updateAuthUI(isAuthenticated) {
    const loginLink = document.getElementById('login-link');
    const signupLink = document.getElementById('signup-link');
    const userMenu = document.getElementById('user-menu');
    const userName = document.getElementById('user-name');
    
    if (isAuthenticated && currentUser) {
        // Show user menu, hide login/signup
        if (loginLink) loginLink.style.display = 'none';
        if (signupLink) signupLink.style.display = 'none';
        if (userMenu) userMenu.style.display = 'block';
        if (userName) userName.textContent = currentUser.username;
    } else {
        // Show login/signup, hide user menu
        if (loginLink) loginLink.style.display = 'block';
        if (signupLink) signupLink.style.display = 'block';
        if (userMenu) userMenu.style.display = 'none';
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        username: formData.get('username'),
        password: formData.get('password')
    };
    
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            currentUser = result.user;
            updateAuthUI(true);
            showToast('Login successful!', 'success');
            showSection('home');
        } else {
            showToast(result.error || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast('Network error. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

async function handleSignup(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password')
    };
    
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showToast('Account created successfully! Logging you in...', 'success');
            // Automatically log in the user after successful signup
            setTimeout(async () => {
                try {
                    const loginResponse = await fetch(`${API_BASE_URL}/login`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        credentials: 'include',
                        body: JSON.stringify({
                            username: data.username,
                            password: data.password
                        })
                    });
                    
                    const loginResult = await loginResponse.json();
                    
                    if (loginResponse.ok) {
                        currentUser = loginResult.user;
                        updateAuthUI(true);
                        showToast('Welcome! You are now logged in.', 'success');
                        showSection('home');
                    } else {
                        showToast('Account created. Please login manually.', 'info');
                        showSection('login');
                    }
                } catch (error) {
                    console.error('Auto-login error:', error);
                    showToast('Account created. Please login manually.', 'info');
                    showSection('login');
                }
            }, 1000);
        } else {
            showToast(result.error || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Signup error:', error);
        showToast('Network error. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

async function handleLogout() {
    try {
        const response = await fetch(`${API_BASE_URL}/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        
        if (response.ok) {
            currentUser = null;
            updateAuthUI(false);
            showToast('Logged out successfully', 'info');
            showSection('home');
        }
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Crop recommendation functions
async function handleCropRecommendation(e) {
    e.preventDefault();
    
    if (!currentUser) {
        showToast('Please login to use crop recommendation', 'warning');
        showSection('login');
        return;
    }
    
    const formData = new FormData(e.target);
    const data = {
        N: parseFloat(formData.get('N')),
        P: parseFloat(formData.get('P')),
        K: parseFloat(formData.get('K')),
        temperature: parseFloat(formData.get('temperature')),
        humidity: parseFloat(formData.get('humidity')),
        ph: parseFloat(formData.get('ph')),
        rainfall: parseFloat(formData.get('rainfall'))
    };
    
    // Validate inputs
    if (!validateCropInputs(data)) {
        return;
    }
    
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE_URL}/crop-recommendation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            displayCropResult(result);
            showToast('Crop recommendation generated!', 'success');
        } else {
            showToast(result.error || 'Recommendation failed', 'error');
        }
    } catch (error) {
        console.error('Crop recommendation error:', error);
        showToast('Network error. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

function validateCropInputs(data) {
    const requiredFields = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall'];
    
    for (const field of requiredFields) {
        if (isNaN(data[field]) || data[field] === null || data[field] === undefined) {
            showToast(`Please enter a valid value for ${field}`, 'error');
            return false;
        }
    }
    
    // Additional validation ranges
    if (data.humidity < 0 || data.humidity > 100) {
        showToast('Humidity must be between 0 and 100', 'error');
        return false;
    }
    
    if (data.ph < 0 || data.ph > 14) {
        showToast('pH must be between 0 and 14', 'error');
        return false;
    }
    
    return true;
}

function displayCropResult(result) {
    const resultContainer = document.getElementById('crop-result');
    const recommendedCrop = document.getElementById('recommended-crop');
    const confidenceValue = document.getElementById('confidence-value');
    
    if (resultContainer && recommendedCrop && confidenceValue) {
        recommendedCrop.textContent = result.recommended_crop;
        confidenceValue.textContent = `${(result.confidence * 100).toFixed(1)}%`;
        resultContainer.style.display = 'block';
        
        // Scroll to result
        resultContainer.scrollIntoView({ behavior: 'smooth' });
    }
}

// Weed detection functions
function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFileSelect(files[0]);
    }
}

function handleImageSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFileSelect(file);
    }
}

function handleFileSelect(file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showToast('Please select a valid image file', 'error');
        return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
        showToast('Image size must be less than 10MB', 'error');
        return;
    }
    
    selectedFile = file;
    
    // Show preview and hide upload area
    const reader = new FileReader();
    reader.onload = function(e) {
        const previewImg = document.getElementById('preview-img');
        const imagePreview = document.getElementById('image-preview');
        const uploadArea = document.getElementById('upload-area');
        
        if (previewImg && imagePreview && uploadArea) {
            previewImg.src = e.target.result;
            imagePreview.style.display = 'block';
            uploadArea.style.display = 'none';
        }
    };
    reader.readAsDataURL(file);
}

async function handleWeedDetection() {
    if (!selectedFile) {
        showToast('Please select an image first', 'warning');
        return;
    }
    
    if (!currentUser) {
        showToast('Please login to use weed detection', 'warning');
        showSection('login');
        return;
    }
    
    showLoading(true);
    
    try {
        const formData = new FormData();
        formData.append('image', selectedFile);
        
        const response = await fetch(`${API_BASE_URL}/weed-detection`, {
            method: 'POST',
            credentials: 'include',
            body: formData
        });
        
        if (!response.ok) {
            const errorResult = await response.json();
            throw new Error(errorResult.error || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (result && result.result_image) {
            displayWeedResult(result);
            showToast('Weed detection completed!', 'success');
        } else {
            throw new Error('Invalid response from server');
        }
    } catch (error) {
        console.error('Weed detection error:', error);
        showToast(`Detection failed: ${error.message}`, 'error');
        
        // Don't redirect to home page on error, stay on weed detection page
        // and show the error message
    } finally {
        showLoading(false);
    }
}

function displayWeedResult(result) {
    const resultContainer = document.getElementById('weed-result');
    const resultImg = document.getElementById('result-img');
    const weedCount = document.getElementById('weed-count');
    
    if (resultContainer && resultImg && weedCount) {
        resultImg.src = `data:image/jpeg;base64,${result.result_image}`;
        weedCount.textContent = result.detections;
        resultContainer.style.display = 'block';
        
        // Scroll to result
        resultContainer.scrollIntoView({ behavior: 'smooth' });
    }
}

// Utility functions
function showLoading(show) {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = show ? 'flex' : 'none';
    }
}

function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = getToastIcon(type);
    toast.innerHTML = `
        <i class="${icon}"></i>
        <span>${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto remove after 2.5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 2500);
    
    // Remove on click
    toast.addEventListener('click', () => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    });
}

function getToastIcon(type) {
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    return icons[type] || icons.info;
}

// Form validation helpers
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    // ESC key closes mobile menu
    if (e.key === 'Escape') {
        closeMobileMenu();
    }
});

// Handle page visibility change
document.addEventListener('visibilitychange', function() {
    if (!document.hidden && currentUser) {
        // Re-check auth status when page becomes visible
        checkAuthStatus();
    }
});

// Error handling for unhandled promises
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    showToast('An unexpected error occurred', 'error');
    event.preventDefault(); // Prevent the default error handling
});

// Global error handler
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
    showToast('An unexpected error occurred', 'error');
});

// Prevent page crashes on fetch errors
const originalFetch = window.fetch;
window.fetch = function(...args) {
    return originalFetch.apply(this, args)
        .catch(error => {
            console.error('Fetch error:', error);
            showToast('Network error. Please check your connection.', 'error');
            throw error;
        });
};

// Service worker registration (for future PWA features)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // navigator.serviceWorker.register('/sw.js')
        //     .then(registration => console.log('SW registered'))
        //     .catch(error => console.log('SW registration failed'));
    });
}
