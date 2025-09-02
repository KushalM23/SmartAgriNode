// Show auth forms and hide home
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

// Function to toggle between login and signup forms
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

// Function to handle login
document.querySelector('#login-form form').addEventListener('submit', function(e) {
    e.preventDefault();
    document.getElementById('auth-forms').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    showDashboardSection('home');
});

// Function to handle signup
document.querySelector('#signup-form form').addEventListener('submit', function(e) {
    e.preventDefault();
    document.getElementById('auth-forms').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    showDashboardSection('home');
});

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
}

// Function to show different dashboard sections
function showDashboardSection(section) {
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`.nav-link[onclick*="${section}"]`)?.classList.add('active');

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
    resultBox.innerHTML = 'Processing your request...';
    resultBox.style.backgroundColor = '#fff3cd';
    
    // Simulate processing (to be replaced with actual backend call)
    setTimeout(() => {
        resultBox.innerHTML = 'Recommendation will be processed when backend is implemented.';
        resultBox.style.backgroundColor = '#d4edda';
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
    resultBox.innerHTML = 'Processing your image...';
    resultBox.style.backgroundColor = '#fff3cd';
    
    // Simulate processing (to be replaced with actual backend call)
    setTimeout(() => {
        resultBox.innerHTML = 'Weed detection will be processed when backend is implemented.';
        resultBox.style.backgroundColor = '#d4edda';
    }, 1500);
});