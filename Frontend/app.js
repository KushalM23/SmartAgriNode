// Global variables
let currentUser = null;
const API_BASE_URL = 'http://localhost:5000/api';

// DOM elements
const authButtons = document.getElementById('auth-buttons');
const userInfo = document.getElementById('user-info');
const usernameDisplay = document.getElementById('username-display');
const loadingOverlay = document.getElementById('loading-overlay');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    setupEventListeners();
    setupNavigation();
});

// Setup event listeners
function setupEventListeners() {
    // Login form
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    
    // Register form
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    
    // Crop recommendation form
    document.getElementById('crop-form').addEventListener('submit', handleCropRecommendation);
    
    // Image upload
    setupImageUpload();
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
}

// Setup navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');
    
    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
                
                // Update active nav link
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
    
    // Update active nav link on scroll
    window.addEventListener('scroll', function() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// Authentication functions
async function checkAuthStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/user`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const userData = await response.json();
            currentUser = userData;
            updateAuthUI(true);
        } else {
            updateAuthUI(false);
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
        updateAuthUI(false);
    }
}

function updateAuthUI(isAuthenticated) {
    if (isAuthenticated && currentUser) {
        authButtons.style.display = 'none';
        userInfo.style.display = 'flex';
        usernameDisplay.textContent = currentUser.username;
    } else {
        authButtons.style.display = 'flex';
        userInfo.style.display = 'none';
        currentUser = null;
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    try {
        showLoading();
        
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser = data.user;
            updateAuthUI(true);
            closeModal('login-modal');
            showNotification('Login successful!', 'success');
            document.getElementById('login-form').reset();
        } else {
            showNotification(data.error || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Login failed. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    
    try {
        showLoading();
        
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Registration successful! Please login.', 'success');
            closeModal('register-modal');
            document.getElementById('register-form').reset();
            showLoginModal();
        } else {
            showNotification(data.error || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('Registration failed. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

async function logout() {
    try {
        const response = await fetch(`${API_BASE_URL}/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        
        if (response.ok) {
            currentUser = null;
            updateAuthUI(false);
            showNotification('Logout successful!', 'success');
        }
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Crop recommendation
async function handleCropRecommendation(e) {
    e.preventDefault();
    
    if (!currentUser) {
        showNotification('Please login to use this feature', 'error');
        return;
    }
    
    const formData = new FormData(e.target);
    const cropData = {};
    
    formData.forEach((value, key) => {
        cropData[key] = parseFloat(value);
    });
    
    try {
        showLoading();
        
        const response = await fetch(`${API_BASE_URL}/crop-recommendation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(cropData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            displayCropResult(data);
            showNotification('Crop recommendation generated successfully!', 'success');
        } else {
            showNotification(data.error || 'Failed to get recommendation', 'error');
        }
    } catch (error) {
        console.error('Crop recommendation error:', error);
        showNotification('Failed to get recommendation. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

function displayCropResult(data) {
    const cropResult = document.getElementById('crop-result');
    const recommendedCrop = document.getElementById('recommended-crop');
    const confidenceFill = document.getElementById('confidence-fill');
    const confidenceText = document.getElementById('confidence-text');
    
    recommendedCrop.textContent = data.recommended_crop;
    confidenceFill.style.width = `${data.confidence * 100}%`;
    confidenceText.textContent = `${Math.round(data.confidence * 100)}% Confidence`;
    
    cropResult.style.display = 'block';
    cropResult.classList.add('fade-in');
    
    // Scroll to result
    cropResult.scrollIntoView({ behavior: 'smooth' });
}

// Weed detection
function setupImageUpload() {
    const uploadArea = document.getElementById('upload-area');
    const imageInput = document.getElementById('image-input');
    
    // File input change
    imageInput.addEventListener('change', handleImageSelect);
    
    // Drag and drop
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('drop', handleDrop);
    uploadArea.addEventListener('click', () => imageInput.click());
}

function handleImageSelect(e) {
    const file = e.target.files[0];
    if (file) {
        displayImagePreview(file);
    }
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        displayImagePreview(files[0]);
    }
}

async function processImage(file) {
    if (!currentUser) {
        showNotification('Please login to use this feature', 'error');
        return;
    }
    
    if (!file.type.startsWith('image/')) {
        showNotification('Please select a valid image file', 'error');
        return;
    }
    
    try {
        showLoading();
        
        // Display original image
        displayOriginalImage(file);
        
        // Upload and process image
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await fetch(`${API_BASE_URL}/weed-detection`, {
            method: 'POST',
            credentials: 'include',
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            displayWeedResult(data);
            showNotification('Weed detection completed successfully!', 'success');
        } else {
            showNotification(data.error || 'Weed detection failed', 'error');
        }
    } catch (error) {
        console.error('Weed detection error:', error);
        showNotification('Weed detection failed. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

function displayImagePreview(file) {
    if (!currentUser) {
        showNotification('Please login to use this feature', 'error');
        return;
    }
    
    if (!file.type.startsWith('image/')) {
        showNotification('Please select a valid image file', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const previewImage = document.getElementById('preview-image');
        const imagePreview = document.getElementById('image-preview');
        
        previewImage.src = e.target.result;
        imagePreview.style.display = 'block';
        
        // Store the file for later processing
        window.selectedImageFile = file;
        
        // Scroll to preview
        imagePreview.scrollIntoView({ behavior: 'smooth' });
    };
    reader.readAsDataURL(file);
}

function submitWeedDetection() {
    if (!window.selectedImageFile) {
        showNotification('Please select an image first', 'error');
        return;
    }
    
    processImage(window.selectedImageFile);
}

function displayOriginalImage(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const originalImage = document.getElementById('original-image');
        originalImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function displayWeedResult(data) {
    const weedResult = document.getElementById('weed-result');
    const resultImage = document.getElementById('result-image');
    const detectionCount = document.getElementById('detection-count');
    
    resultImage.src = `data:image/jpeg;base64,${data.result_image}`;
    detectionCount.textContent = data.detections;
    
    weedResult.style.display = 'block';
    weedResult.classList.add('fade-in');
    
    // Scroll to result
    weedResult.scrollIntoView({ behavior: 'smooth' });
}

// Modal functions
function showLoginModal() {
    document.getElementById('login-modal').style.display = 'block';
}

function showRegisterModal() {
    document.getElementById('register-modal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Utility functions
function showLoading() {
    loadingOverlay.style.display = 'flex';
}

function hideLoading() {
    loadingOverlay.style.display = 'none';
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '500',
        zIndex: '4000',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease-out'
    });
    
    // Set background color based on type
    switch (type) {
        case 'success':
            notification.style.backgroundColor = '#27ae60';
            break;
        case 'error':
            notification.style.backgroundColor = '#e74c3c';
            break;
        default:
            notification.style.backgroundColor = '#3498db';
    }
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Add some sample data for testing
function populateSampleData() {
    if (document.getElementById('N')) {
        document.getElementById('N').value = '90';
        document.getElementById('P').value = '42';
        document.getElementById('K').value = '43';
        document.getElementById('temperature').value = '20.87';
        document.getElementById('humidity').value = '82.00';
        document.getElementById('ph').value = '6.50';
        document.getElementById('rainfall').value = '202.93';
    }
}

// Populate sample data when page loads (for testing)
window.addEventListener('load', populateSampleData);
