const { ipcRenderer } = require('electron');

const API_URL = 'https://electron-auth-backend.vercel.app/api/auth';

function showLoginForm() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('homePage').style.display = 'none';
}

function showRegisterForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    document.getElementById('homePage').style.display = 'none';
}

function showHomePage(fullName) {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('homePage').style.display = 'block';
    document.getElementById('welcomeMessage').textContent = `Thank you ${fullName}, you have successfully logged in.`;
}

async function register() {
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    // Add validation
    if (!fullName || !email || !password) {
        alert('Please fill in all fields');
        return;
    }

    try {
        console.log('Making registration request to:', `${API_URL}/register`);
        console.log('Request payload:', { fullName, email });

        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ fullName, email, password })
        });

        console.log('Response status:', response.status);
        const responseText = await response.text();
        console.log('Raw response:', responseText);

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error('Failed to parse response:', e);
            throw new Error('Invalid server response');
        }
        
        if (response.ok) {
            ipcRenderer.send('show-notification', 'Registration successful!');
            showLoginForm();
        } else {
            console.error('Registration failed:', data);
            const errorMessage = data.message || 'Registration failed. Please try again.';
            alert(errorMessage);
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Connection error. Please check your internet connection and try again.');
    }
}

async function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token);
            showHomePage(data.user.fullName);
        } else {
            alert(data.message || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Error during login: Server might be offline');
    }
}

function logout() {
    localStorage.removeItem('token');
    showLoginForm();
}

// Show login form by default
showLoginForm(); 