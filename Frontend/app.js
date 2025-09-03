function setUserData(user) {
    localStorage.setItem('userData', JSON.stringify(user));
}

function getUserData() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
}

function clearUserData() {
    localStorage.removeItem('userData');
}

window.addEventListener('load', function() {
    const user = getUserData();
    if (user) {
        loginUser(user);
    }
});

function requireAuth(section) {
    showAuthForms('login');
    sessionStorage.setItem('redirectSection', section);
}

function showAlert(message, type = 'error') {
    const existingAlert = document.querySelector('.custom-alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    const alert = document.createElement('div');
    alert.className = `custom-alert ${type}`;
    alert.textContent = message;

    document.body.appendChild(alert);
    setTimeout(() => alert.classList.add('show'), 10);

    setTimeout(() => {
        alert.classList.remove('show');
        setTimeout(() => alert.remove(), 400);
    }, 3000);
}

function showHome() {
    document.getElementById('auth-forms').style.display = 'none';
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('home').style.display = 'block';
}

function showAuthForms(type) {
    document.getElementById('home').style.display = 'none';
    document.getElementById('auth-forms').style.display = 'block';
    
    if (type === 'login') {
        document.getElementById('login-form').style.display = 'block';
        document.getElementById('signup-form').style.display = 'none';
    } else {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('signup-form').style.display = 'block';
    }
}

function toggleForms() {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    
    if (loginForm.style.display === 'none') {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
    } else {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
    }
}

document.querySelector('#login-form form').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = this.querySelector('input[type="email"]').value;
    const password = this.querySelector('input[type="password"]').value;
    

    const user = getUserData();
    if (user) {
        if (user.email === email && user.password === password) {
            loginUser(user);
            showAlert('Login successful!', 'success');
        } else {
            showAlert('Invalid credentials', 'error');
        }
    } else {
        showAlert('User not found. Please sign up.', 'error');
    }
});

document.querySelector('#signup-form form').addEventListener('submit', function(e) {
    e.preventDefault();
    const user = {
        name: this.querySelector('input[placeholder="Full Name"]').value,
        email: this.querySelector('input[type="email"]').value,
        password: this.querySelector('input[type="password"]').value
    };
    
    setUserData(user);
    loginUser(user);
    showAlert('Account created successfully!', 'success');
});

function loginUser(user) {
    document.getElementById('auth-forms').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('user-name').textContent = user.name;

    // Check if there's a redirect section stored
    const redirectSection = sessionStorage.getItem('redirectSection');
    if (redirectSection) {
        showDashboardSection(redirectSection);
        sessionStorage.removeItem('redirectSection');
    } else {
        showDashboardSection('home');
    }
}

// Function to handle logout
function logout() {
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('home').style.display = 'block';
    // Reset forms
    document.getElementById('auth-forms').style.display = 'none';
    document.getElementById('crop-form').reset();
    document.getElementById('weed-form').reset();
    document.getElementById('preview-image').style.display = 'none';
    document.getElementById('upload-text').style.display = 'block';
    // Clear user data
    clearUserData();
    document.getElementById('user-name').textContent = '';
}

// Function to show different dashboard sections
function showDashboardSection(section) {
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('onclick').includes(section)) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Hide all sections
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.style.display = 'none';
    });

    // Show selected section
    document.getElementById(`dashboard-${section}`).style.display = 'block';
}

// Handle crop recommendation form submission
document.getElementById('crop-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const inputs = this.querySelectorAll('input');
    const values = {};
    inputs.forEach(input => {
        values[input.placeholder] = input.value;
    });
    
    const resultBox = document.getElementById('crop-result');
    resultBox.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing soil conditions...';
    resultBox.className = 'result-box processing show';
    
    // Simulate processing until backend is integrated
    setTimeout(() => {
        resultBox.innerHTML = '<i class="fas fa-info-circle"></i> This feature will provide crop recommendations once the backend is integrated. Your soil parameters have been recorded.';
        resultBox.className = 'result-box info show';
    }, 1500);
});

// Handle image upload and preview
document.getElementById('image-upload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('preview-image');
            const uploadText = document.getElementById('upload-text');
            preview.src = e.target.result;
            preview.style.display = 'block';
            uploadText.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
});

// Handle weed detection form submission
document.getElementById('weed-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const file = document.getElementById('image-upload').files[0];
    if (!file) {
        alert('Please select an image first');
        return;
    }
    
    const resultBox = document.getElementById('weed-result');
    resultBox.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing image for weed detection...';
    resultBox.className = 'result-box processing show';
    
    // Simulate processing until backend is integrated
    setTimeout(() => {
        resultBox.innerHTML = '<i class="fas fa-info-circle"></i> This feature will analyze your image for weed detection once the backend is integrated. Your image has been recorded.';
        resultBox.className = 'result-box info show';
    }, 1500);
});