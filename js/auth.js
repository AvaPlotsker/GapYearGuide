// Authentication Logic (Mock Implementation)

// Check if user is logged in
function checkAuth() {
    const user = localStorage.getItem('gapyear_user');
    return user !== null;
}

// Get current user
function getCurrentUser() {
    const userStr = localStorage.getItem('gapyear_user');
    return userStr ? JSON.parse(userStr) : null;
}

// Get all users from storage
function getAllUsers() {
    const usersStr = localStorage.getItem('gapyear_users');
    return usersStr ? JSON.parse(usersStr) : [];
}

// Save all users to storage
function saveAllUsers(users) {
    localStorage.setItem('gapyear_users', JSON.stringify(users));
}

// Find user by email
function findUserByEmail(email) {
    const users = getAllUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

// Login function
function login(email, password) {
    // Mock authentication - in real app, this would call your backend API
    // For demo purposes, accept any email/password combination

    // Check if user already exists
    let user = findUserByEmail(email);

    if (!user) {
        // Create new user if they don't exist
        user = {
            id: Date.now(),
            email: email,
            firstName: email.split('@')[0].split('.')[0],
            lastName: email.split('@')[0].split('.')[1] || 'User',
            schoolType: ['seminary'],
            createdAt: new Date().toISOString(),
            preferences: {
                hashkafa: ['modern-orthodox'],
                location: ['jerusalem'],
                size: 'medium',
                minBudget: 20000,
                maxBudget: 25000,
                programFocus: 'Academic & Spiritual Growth'
            },
            importantFeatures: []
        };

        // Add to users list
        const users = getAllUsers();
        users.push(user);
        saveAllUsers(users);
    }

    // Set as current user
    localStorage.setItem('gapyear_user', JSON.stringify(user));

    return { success: true, user };
}

// Signup function
function signup(userData) {
    // Mock signup - in real app, this would call your backend API

    // Check if user already exists
    const existingUser = findUserByEmail(userData.email);
    if (existingUser) {
        return { success: false, error: 'User already exists' };
    }

    const user = {
        id: Date.now(),
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        schoolType: [userData.schoolType],
        createdAt: new Date().toISOString(),
        preferences: {
            hashkafa: ['modern-orthodox'],
            location: ['jerusalem'],
            size: 'medium',
            minBudget: 20000,
            maxBudget: 25000,
            programFocus: 'Academic & Spiritual Growth'
        },
        importantFeatures: []
    };

    // Add to users list
    const users = getAllUsers();
    users.push(user);
    saveAllUsers(users);

    // Set as current user
    localStorage.setItem('gapyear_user', JSON.stringify(user));

    return { success: true, user };
}

// Logout function
function logout() {
    // Don't delete user data, just remove current session
    localStorage.removeItem('gapyear_user');
    window.location.href = 'login.html';
}

// Login Form Handler
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (!email || !password) {
            alert('Please fill in all fields');
            return;
        }

        const result = login(email, password);

        if (result.success) {
            // Show success message
            showMessage('Login successful! Redirecting...', 'success');

            // Redirect to main page after short delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            showMessage('Login failed. Please try again.', 'error');
        }
    });
}

// Signup Form Handler
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const schoolType = document.getElementById('schoolType').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;

        // Validation
        if (!firstName || !lastName || !email || !password || !schoolType) {
            alert('Please fill in all required fields');
            return;
        }

        if (password.length < 8) {
            alert('Password must be at least 8 characters');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        if (!agreeTerms) {
            alert('Please agree to the Terms of Service and Privacy Policy');
            return;
        }

        const userData = {
            firstName,
            lastName,
            email,
            password,
            schoolType
        };

        const result = signup(userData);

        if (result.success) {
            showMessage('Account created successfully! Redirecting...', 'success');

            setTimeout(() => {
                window.location.href = 'profile.html';
            }, 1000);
        } else {
            showMessage('Signup failed. Please try again.', 'error');
        }
    });
}

// Google Sign In (Mock)
document.querySelectorAll('.btn-google').forEach(btn => {
    btn.addEventListener('click', () => {
        alert('Google Sign-In would be integrated here.\n\nFor demo purposes, you can use any email/password to sign in.');
    });
});

// Show message function
function showMessage(message, type) {
    // Create message element
    const msgDiv = document.createElement('div');
    msgDiv.className = `auth-message ${type}`;
    msgDiv.textContent = message;

    // Style it
    msgDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        border-radius: 8px;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(msgDiv);

    // Remove after 3 seconds
    setTimeout(() => {
        msgDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => msgDiv.remove(), 300);
    }, 3000);
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Check authentication on protected pages
document.addEventListener('DOMContentLoaded', () => {
    // Toggle between login and signup forms
    const showSignupLink = document.getElementById('showSignupLink');
    const showLoginLink = document.getElementById('showLoginLink');
    const loginSection = document.getElementById('loginSection');
    const signupSection = document.getElementById('signupSection');

    if (showSignupLink && signupSection && loginSection) {
        showSignupLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginSection.classList.add('hidden');
            signupSection.classList.remove('hidden');
        });
    }

    if (showLoginLink && loginSection && signupSection) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            signupSection.classList.add('hidden');
            loginSection.classList.remove('hidden');
        });
    }

    // Check authentication
    const protectedPages = ['profile.html', 'favorites.html', 'recommendations.html'];
    const currentPage = window.location.pathname.split('/').pop();

    // If on a protected page and not logged in, redirect to login
    if (protectedPages.includes(currentPage) && !checkAuth()) {
        window.location.href = 'login.html';
        return; // Stop execution after redirect
    }

    // If on login page and already logged in, redirect to main page
    if (currentPage === 'login.html' && checkAuth()) {
        window.location.href = 'index.html';
        return; // Stop execution after redirect
    }

    // Setup logout buttons - using a more direct approach
    const logoutButtons = document.querySelectorAll('.nav-logout');
    console.log('Found logout buttons:', logoutButtons.length);

    logoutButtons.forEach((btn, index) => {
        console.log(`Setting up logout button ${index}`);
        btn.addEventListener('click', function(e) {
            console.log('Logout button clicked');
            e.preventDefault();
            e.stopPropagation();

            const confirmed = confirm('Are you sure you want to log out?');
            console.log('User confirmation:', confirmed);

            if (confirmed) {
                console.log('Calling logout...');
                // Clear user data
                localStorage.removeItem('gapyear_user');
                console.log('User data removed');
                // Redirect
                console.log('Redirecting to login.html');
                window.location.href = 'login.html';
            }
        });
    });

    // Setup comparison guide modal
    const showComparisonLinks = document.querySelectorAll('#showComparisonGuide, #showComparisonGuideProfile');
    const comparisonModal = document.getElementById('comparisonGuideModal');
    const closeComparisonBtn = document.getElementById('closeComparisonModal');

    showComparisonLinks.forEach(link => {
        if (link) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                if (comparisonModal) {
                    comparisonModal.classList.remove('hidden');
                }
            });
        }
    });

    if (closeComparisonBtn && comparisonModal) {
        closeComparisonBtn.addEventListener('click', () => {
            comparisonModal.classList.add('hidden');
        });
    }

    // Close modal on background click
    if (comparisonModal) {
        comparisonModal.addEventListener('click', (e) => {
            if (e.target.id === 'comparisonGuideModal') {
                comparisonModal.classList.add('hidden');
            }
        });
    }
});
