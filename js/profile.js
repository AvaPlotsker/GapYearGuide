// Profile Page Application

class ProfileApp {
    constructor() {
        this.user = this.getCurrentUser();
        this.init();
    }

    getCurrentUser() {
        const userStr = localStorage.getItem('gapyear_user');
        const user = userStr ? JSON.parse(userStr) : null;
        console.log('Current user loaded:', user);
        console.log('Important features from storage:', user?.importantFeatures);
        return user;
    }

    init() {
        if (!this.user) {
            window.location.href = 'login.html';
            return;
        }

        this.loadUserProfile();
        this.updateStats();
        this.setupEventListeners();
    }

    loadUserProfile() {
        // Update profile header with user info
        const profileName = document.querySelector('.profile-name');
        const profileEmail = document.querySelector('.profile-email');
        const avatarCircle = document.querySelector('.avatar-circle');

        if (profileName) {
            profileName.textContent = `${this.user.firstName} ${this.user.lastName}`;
        }

        if (profileEmail) {
            profileEmail.textContent = this.user.email;
        }

        if (avatarCircle) {
            // Create initials from first and last name
            const initials = `${this.user.firstName.charAt(0)}${this.user.lastName.charAt(0)}`;
            avatarCircle.textContent = initials.toUpperCase();
        }

        // Update personal information section
        const detailValues = document.querySelectorAll('.detail-value');

        // Full Name
        if (detailValues[0]) {
            detailValues[0].textContent = `${this.user.firstName} ${this.user.lastName}`;
        }

        // Email
        if (detailValues[1]) {
            detailValues[1].textContent = this.user.email;
        }

        // Current School (default placeholder for now)
        if (detailValues[2]) {
            detailValues[2].textContent = this.user.currentSchool || 'Not specified';
        }

        // Location (default placeholder for now)
        if (detailValues[3]) {
            detailValues[3].textContent = this.user.location || 'Not specified';
        }

        // Graduation Year (default placeholder for now)
        if (detailValues[4]) {
            detailValues[4].textContent = this.user.graduationYear || '2025';
        }

        // Password (always show dots)
        if (detailValues[5]) {
            detailValues[5].textContent = '••••••••';
        }

        // Update preferences section
        const prefs = this.user.preferences || {
            hashkafa: ['modern-orthodox'],
            location: ['jerusalem'],
            size: 'medium',
            minBudget: 20000,
            maxBudget: 25000,
            programFocus: 'Academic & Spiritual Growth'
        };

        // Preferred Type(s)
        if (detailValues[6]) {
            const typeMap = {
                'seminary': 'Seminary',
                'yeshiva': 'Yeshiva',
                'gap-year-program': 'Gap Year Program',
                'both': 'Either Seminary or Yeshiva'
            };

            // Convert to array if needed
            const schoolTypes = Array.isArray(this.user.schoolType)
                ? this.user.schoolType
                : this.user.schoolType ? [this.user.schoolType] : ['seminary'];

            // Map and join
            const typesDisplay = schoolTypes.map(type => typeMap[type] || type).join(', ');
            detailValues[6].textContent = typesDisplay || 'Seminary';
        }

        // Hashkafa(s)
        if (detailValues[7]) {
            const hashkafaMap = {
                'modern-orthodox': 'Modern Orthodox',
                'yeshivish': 'Yeshivish',
                'chassidish': 'Chassidish',
                'mixed': 'Mixed'
            };

            // Convert to array if needed
            const hashkafas = Array.isArray(prefs.hashkafa)
                ? prefs.hashkafa
                : prefs.hashkafa ? [prefs.hashkafa] : ['modern-orthodox'];

            // Map and join
            const hashkafaDisplay = hashkafas.map(h => hashkafaMap[h] || h).join(', ');
            detailValues[7].textContent = hashkafaDisplay || 'Modern Orthodox';
        }

        // Location Preference(s)
        if (detailValues[8]) {
            const locationMap = {
                'jerusalem': 'Jerusalem',
                'ramat-beit-shemesh': 'Ramat Beit Shemesh',
                'bnei-brak': 'Bnei Brak',
                'safed': 'Safed',
                'tel-aviv': 'Tel Aviv'
            };

            // Convert to array if needed
            const locations = Array.isArray(prefs.location)
                ? prefs.location
                : prefs.location ? [prefs.location] : ['jerusalem'];

            // Map and join
            const locationDisplay = locations.map(loc => locationMap[loc] || loc).join(', ');
            detailValues[8].textContent = locationDisplay || 'Jerusalem';
        }

        // School Size
        if (detailValues[9]) {
            const sizeMap = {
                'small': 'Small (< 50)',
                'medium': 'Medium (50-150)',
                'large': 'Large (> 150)'
            };
            detailValues[9].textContent = sizeMap[prefs.size] || 'Medium (50-150)';
        }

        // Budget Range
        if (detailValues[10]) {
            const minBudget = prefs.minBudget || 20000;
            const maxBudget = prefs.maxBudget || 25000;
            detailValues[10].textContent = `$${minBudget.toLocaleString()} - $${maxBudget.toLocaleString()}`;
        }

        // Program Focus
        if (detailValues[11]) {
            detailValues[11].textContent = prefs.programFocus || 'Academic & Spiritual Growth';
        }
    }

    setupEventListeners() {
        // Edit buttons
        const editButtons = document.querySelectorAll('.section-header .btn-small');
        if (editButtons[0]) {
            editButtons[0].addEventListener('click', () => this.openEditPersonal());
        }
        if (editButtons[1]) {
            editButtons[1].addEventListener('click', () => this.openEditPreferences());
        }

        // Edit Personal Info Form
        const editPersonalForm = document.getElementById('editPersonalForm');
        if (editPersonalForm) {
            editPersonalForm.addEventListener('submit', (e) => this.savePersonalInfo(e));
        }

        // Edit Preferences Form
        const editPreferencesForm = document.getElementById('editPreferencesForm');
        if (editPreferencesForm) {
            editPreferencesForm.addEventListener('submit', (e) => this.savePreferences(e));
        }

        // Feature tags toggle and save
        document.querySelectorAll('.feature-tag').forEach(tag => {
            tag.addEventListener('click', () => {
                tag.classList.toggle('active');
                this.saveFeatureTags();
            });
        });

        // Load saved feature tags
        this.loadFeatureTags();

        // Setup logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                if (confirm('Are you sure you want to log out?')) {
                    // Remove current session (user can login again later)
                    localStorage.removeItem('gapyear_user');

                    // Redirect to login page
                    window.location.href = 'login.html';
                }
            });
        }
    }

    openEditPersonal() {
        // Populate form with current data
        document.getElementById('editFirstName').value = this.user.firstName || '';
        document.getElementById('editLastName').value = this.user.lastName || '';
        document.getElementById('editEmail').value = this.user.email || '';
        document.getElementById('editCurrentSchool').value = this.user.currentSchool || '';
        document.getElementById('editLocation').value = this.user.location || '';
        document.getElementById('editGraduationYear').value = this.user.graduationYear || '';

        // Show modal
        document.getElementById('editPersonalModal').classList.remove('hidden');
    }

    openEditPreferences() {
        // Get user preferences (with defaults)
        const prefs = this.user.preferences || {
            hashkafa: ['modern-orthodox'],
            location: ['jerusalem'],
            size: 'medium',
            minBudget: 20000,
            maxBudget: 25000,
            programFocus: 'Academic & Spiritual Growth'
        };

        // Get school types as array (convert old single value to array if needed)
        const schoolTypes = Array.isArray(this.user.schoolType)
            ? this.user.schoolType
            : this.user.schoolType ? [this.user.schoolType] : ['seminary'];

        // Check appropriate school type checkboxes
        document.querySelectorAll('input[name="schoolType"]').forEach(checkbox => {
            checkbox.checked = schoolTypes.includes(checkbox.value);
        });

        // Get hashkafas as array (convert old single value to array if needed)
        const hashkafas = Array.isArray(prefs.hashkafa)
            ? prefs.hashkafa
            : prefs.hashkafa ? [prefs.hashkafa] : ['modern-orthodox'];

        // Check appropriate hashkafa checkboxes
        document.querySelectorAll('input[name="hashkafa"]').forEach(checkbox => {
            checkbox.checked = hashkafas.includes(checkbox.value);
        });

        // Get locations as array (convert old single value to array if needed)
        const locations = Array.isArray(prefs.location)
            ? prefs.location
            : prefs.location ? [prefs.location] : ['jerusalem'];

        // Check appropriate location checkboxes
        document.querySelectorAll('input[name="location"]').forEach(checkbox => {
            checkbox.checked = locations.includes(checkbox.value);
        });

        // Populate other fields
        document.getElementById('editSizePref').value = prefs.size || 'medium';
        document.getElementById('editMinBudget').value = prefs.minBudget || 20000;
        document.getElementById('editMaxBudget').value = prefs.maxBudget || 25000;
        document.getElementById('editProgramFocus').value = prefs.programFocus || '';

        // Show modal
        document.getElementById('editPreferencesModal').classList.remove('hidden');
    }

    savePersonalInfo(e) {
        e.preventDefault();

        // Get form values
        this.user.firstName = document.getElementById('editFirstName').value;
        this.user.lastName = document.getElementById('editLastName').value;
        this.user.email = document.getElementById('editEmail').value;
        this.user.currentSchool = document.getElementById('editCurrentSchool').value;
        this.user.location = document.getElementById('editLocation').value;
        this.user.graduationYear = document.getElementById('editGraduationYear').value;

        // Save to current user
        localStorage.setItem('gapyear_user', JSON.stringify(this.user));

        // Save to users list
        this.saveUserToList();

        // Close modal
        document.getElementById('editPersonalModal').classList.add('hidden');

        // Reload profile
        this.loadUserProfile();

        // Show success message
        this.showMessage('Personal information updated successfully!', 'success');
    }

    savePreferences(e) {
        e.preventDefault();

        // Collect checked school types
        const schoolTypes = [];
        document.querySelectorAll('input[name="schoolType"]:checked').forEach(checkbox => {
            schoolTypes.push(checkbox.value);
        });

        // Collect checked hashkafas
        const hashkafas = [];
        document.querySelectorAll('input[name="hashkafa"]:checked').forEach(checkbox => {
            hashkafas.push(checkbox.value);
        });

        // Collect checked locations
        const locations = [];
        document.querySelectorAll('input[name="location"]:checked').forEach(checkbox => {
            locations.push(checkbox.value);
        });

        // Update user school types (as array)
        this.user.schoolType = schoolTypes;

        // Update preferences (hashkafa and location as arrays)
        const preferences = {
            hashkafa: hashkafas,
            location: locations,
            size: document.getElementById('editSizePref').value,
            minBudget: parseInt(document.getElementById('editMinBudget').value) || 20000,
            maxBudget: parseInt(document.getElementById('editMaxBudget').value) || 25000,
            programFocus: document.getElementById('editProgramFocus').value
        };

        this.user.preferences = preferences;

        // Save to current user
        localStorage.setItem('gapyear_user', JSON.stringify(this.user));

        // Save to users list
        this.saveUserToList();

        // Close modal
        document.getElementById('editPreferencesModal').classList.add('hidden');

        // Reload profile
        this.loadUserProfile();

        // Update stats with new preferences
        this.updateStats();

        // Show success message
        this.showMessage('Preferences updated successfully!', 'success');
    }

    saveFeatureTags() {
        const activeTags = [];
        document.querySelectorAll('.feature-tag.active').forEach(tag => {
            activeTags.push(tag.textContent.trim());
        });

        console.log('Saving important features:', activeTags);

        this.user.importantFeatures = activeTags;
        localStorage.setItem('gapyear_user', JSON.stringify(this.user));

        // Save to users list
        this.saveUserToList();

        console.log('Features saved to user:', this.user.importantFeatures);
    }

    saveUserToList() {
        // Get all users
        const usersStr = localStorage.getItem('gapyear_users');
        const users = usersStr ? JSON.parse(usersStr) : [];

        // Find and update current user in the list
        const userIndex = users.findIndex(u => u.email === this.user.email);
        if (userIndex !== -1) {
            users[userIndex] = this.user;
        } else {
            users.push(this.user);
        }

        // Save back to localStorage
        localStorage.setItem('gapyear_users', JSON.stringify(users));
    }

    loadFeatureTags() {
        if (!this.user.importantFeatures || this.user.importantFeatures.length === 0) {
            console.log('No important features to load');
            return;
        }

        console.log('Loading important features:', this.user.importantFeatures);

        document.querySelectorAll('.feature-tag').forEach(tag => {
            // First remove any existing active class
            tag.classList.remove('active');

            const tagText = tag.textContent.trim();
            console.log('Checking tag:', tagText);

            if (this.user.importantFeatures.includes(tagText)) {
                console.log('Activating tag:', tagText);
                tag.classList.add('active');
            }
        });
    }

    showMessage(message, type) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `auth-message ${type}`;
        msgDiv.textContent = message;

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

        setTimeout(() => {
            msgDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => msgDiv.remove(), 300);
        }, 3000);
    }

    updateStats() {
        // Get favorites count
        const favorites = JSON.parse(localStorage.getItem('gapyear_favorites') || '[]');
        const favoritesCount = favorites.length;

        // Get viewed schools from localStorage
        const viewedSchools = JSON.parse(localStorage.getItem('gapyear_viewed_schools') || '[]');
        const viewedCount = viewedSchools.length;

        // Get recommendations count using the EXACT same logic as recommendations page
        // Recreate engine with current user preferences to ensure accuracy
        const prefs = this.user.preferences || {};

        // Convert school type to array if needed
        const schoolTypes = Array.isArray(this.user.schoolType)
            ? this.user.schoolType
            : this.user.schoolType ? [this.user.schoolType] : ['seminary'];

        // Convert hashkafa to array if needed
        const hashkafas = Array.isArray(prefs.hashkafa)
            ? prefs.hashkafa
            : prefs.hashkafa ? [prefs.hashkafa] : ['modern-orthodox'];

        // Convert location to array if needed
        const locations = Array.isArray(prefs.location)
            ? prefs.location
            : prefs.location ? [prefs.location] : ['jerusalem'];

        // Create recommendation engine with user preferences (same as recommendations.js)
        const tempEngine = new RecommendationEngine({
            type: schoolTypes,
            hashkafa: hashkafas,
            location: locations,
            size: prefs.size || 'medium',
            minBudget: prefs.minBudget || 20000,
            maxBudget: prefs.maxBudget || 25000,
            programFocus: prefs.programFocus || 'Academic & Spiritual Growth',
            importantFeatures: this.user.importantFeatures || []
        });

        const allSchools = getSchools();
        const recommendations = tempEngine.getRecommendations(allSchools);
        const matchesCount = recommendations.length;

        console.log('Profile page - Match count:', matchesCount);
        console.log('Profile page - User preferences:', {
            type: schoolTypes,
            hashkafa: hashkafas,
            location: locations,
            size: prefs.size
        });

        // Update stats in the DOM
        const statsNumbers = document.querySelectorAll('.stat-number');
        if (statsNumbers.length >= 3) {
            statsNumbers[0].textContent = favoritesCount;
            statsNumbers[1].textContent = viewedCount;
            statsNumbers[2].textContent = matchesCount;
        }

        // Update quick links
        const quickLinks = document.querySelectorAll('.quick-link-card p');
        if (quickLinks.length >= 2) {
            quickLinks[0].textContent = `${favoritesCount} schools saved`;
            quickLinks[1].textContent = `${matchesCount} schools match your preferences`;
        }
    }
}

// Global functions for modal close buttons
function closeEditPersonal() {
    document.getElementById('editPersonalModal').classList.add('hidden');
}

function closeEditPreferences() {
    document.getElementById('editPreferencesModal').classList.add('hidden');
}

// Close modals on background click
document.addEventListener('click', (e) => {
    if (e.target.id === 'editPersonalModal') {
        closeEditPersonal();
    }
    if (e.target.id === 'editPreferencesModal') {
        closeEditPreferences();
    }
});

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new ProfileApp();
});
