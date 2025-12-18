// Recommendations System with Matching Algorithm

// Load actual user preferences from localStorage
function getUserPreferences() {
    const userStr = localStorage.getItem('gapyear_user');
    if (!userStr) {
        // Redirect to login if no user
        window.location.href = 'login.html';
        return null;
    }

    const user = JSON.parse(userStr);
    const prefs = user.preferences || {};

    // Convert school type to array if needed
    const schoolTypes = Array.isArray(user.schoolType)
        ? user.schoolType
        : user.schoolType ? [user.schoolType] : ['seminary'];

    // Convert preferences to arrays if needed
    const hashkafas = Array.isArray(prefs.hashkafa)
        ? prefs.hashkafa
        : prefs.hashkafa ? [prefs.hashkafa] : ['modern-orthodox'];

    const locations = Array.isArray(prefs.location)
        ? prefs.location
        : prefs.location ? [prefs.location] : ['jerusalem'];

    return {
        type: schoolTypes,
        hashkafa: hashkafas,
        location: locations,
        size: prefs.size || 'medium',
        minBudget: prefs.minBudget || 20000,
        maxBudget: prefs.maxBudget || 25000,
        programFocus: prefs.programFocus || 'Academic & Spiritual Growth',
        importantFeatures: user.importantFeatures || []
    };
}

const userPreferences = getUserPreferences();

// Matching Algorithm
class RecommendationEngine {
    constructor(userPrefs) {
        this.userPrefs = userPrefs;
    }

    calculateMatchScore(school) {
        let score = 0;
        let maxScore = 0;

        // Type match (20 points)
        maxScore += 20;
        // Handle both array and single value for backward compatibility
        const userTypes = Array.isArray(this.userPrefs.type)
            ? this.userPrefs.type
            : [this.userPrefs.type];

        if (userTypes.includes(school.type)) {
            score += 20;
        }

        // Hashkafa match (25 points)
        maxScore += 25;
        // Handle both array and single value for backward compatibility
        const userHashkafas = Array.isArray(this.userPrefs.hashkafa)
            ? this.userPrefs.hashkafa
            : [this.userPrefs.hashkafa];

        if (userHashkafas.includes(school.hashkafa)) {
            score += 25;
        } else if (school.hashkafa === 'mixed') {
            score += 15; // Mixed hashkafa is somewhat compatible
        }

        // Location match (15 points)
        maxScore += 15;
        // Handle both array and single value for backward compatibility
        const userLocations = Array.isArray(this.userPrefs.location)
            ? this.userPrefs.location
            : [this.userPrefs.location];

        if (userLocations.includes(school.location)) {
            score += 15;
        }

        // Size match (10 points)
        maxScore += 10;
        if (school.size === this.userPrefs.size) {
            score += 10;
        }

        // Budget match (20 points)
        maxScore += 20;
        if (school.cost >= this.userPrefs.minBudget && school.cost <= this.userPrefs.maxBudget) {
            score += 20;
        } else if (school.cost < this.userPrefs.minBudget) {
            // Under budget is good too
            score += 18;
        } else {
            // Over budget, but close
            const diff = school.cost - this.userPrefs.maxBudget;
            if (diff <= 5000) {
                score += 10;
            }
        }

        // Program focus match (10 points)
        maxScore += 10;
        if (school.programFocus === this.userPrefs.programFocus) {
            score += 10;
        }

        // Calculate percentage
        const percentage = Math.round((score / maxScore) * 100);
        return { score, maxScore, percentage };
    }

    getRecommendations(schools, limit = null) {
        // First, filter schools by type preference (MUST match type)
        const userTypes = Array.isArray(this.userPrefs.type)
            ? this.userPrefs.type
            : [this.userPrefs.type];

        const typeFilteredSchools = schools.filter(school =>
            userTypes.includes(school.type)
        );

        // Then calculate match scores for type-filtered schools
        const schoolsWithScores = typeFilteredSchools.map(school => {
            const matchData = this.calculateMatchScore(school);
            return {
                ...school,
                matchScore: matchData.score,
                matchPercentage: matchData.percentage
            };
        });

        // Sort by match score (highest first)
        schoolsWithScores.sort((a, b) => b.matchScore - a.matchScore);

        // Return top matches (filter out low matches < 50%)
        const goodMatches = schoolsWithScores.filter(s => s.matchPercentage >= 50);

        return limit ? goodMatches.slice(0, limit) : goodMatches;
    }

    getMatchReason(school) {
        const reasons = [];

        if (school.type === this.userPrefs.type) {
            reasons.push(`${school.type === 'seminary' ? 'Seminary' : 'Yeshiva'}`);
        }

        if (school.hashkafa === this.userPrefs.hashkafa) {
            reasons.push(this.formatHashkafa(school.hashkafa));
        }

        if (school.location === this.userPrefs.location) {
            reasons.push(this.formatLocation(school.location));
        }

        if (school.cost >= this.userPrefs.minBudget && school.cost <= this.userPrefs.maxBudget) {
            reasons.push('In your budget');
        }

        if (school.size === this.userPrefs.size) {
            reasons.push(`${this.formatSize(school.size)} size`);
        }

        return reasons.join(' • ');
    }

    formatHashkafa(hashkafa) {
        return hashkafa.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    formatLocation(location) {
        return location.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    formatSize(size) {
        return size.charAt(0).toUpperCase() + size.slice(1);
    }
}

// Initialize recommendation engine
if (!userPreferences) {
    // User will be redirected by getUserPreferences()
    throw new Error('No user preferences available');
}
const recommendationEngine = new RecommendationEngine(userPreferences);

// Recommendations Page App
class RecommendationsApp {
    constructor() {
        this.schools = getSchools();
        this.recommendations = recommendationEngine.getRecommendations(this.schools);
        this.currentSort = 'match';

        console.log('Recommendations page - Match count:', this.recommendations.length);
        console.log('Recommendations page - User preferences:', userPreferences);

        this.init();
    }

    init() {
        this.updateMatchBanner();
        this.setupEventListeners();
        this.renderRecommendations();
        this.updateCompareButton();
    }

    updateMatchBanner() {
        try {
            const matchCount = this.recommendations.length;
            const bannerTitle = document.querySelector('.match-info-text h3');
            const bannerDesc = document.querySelector('.match-info-text p');

            console.log('Updating banner - Match count:', matchCount);
            console.log('Banner title element:', bannerTitle);
            console.log('Banner desc element:', bannerDesc);

            if (bannerTitle) {
                bannerTitle.textContent = `We found ${matchCount} great ${matchCount === 1 ? 'match' : 'matches'} for you!`;
                console.log('Updated title to:', bannerTitle.textContent);
            } else {
                console.error('Banner title element not found!');
            }

            if (bannerDesc) {
                const prefs = userPreferences;
                const prefsList = [];

                // Add hashkafa
                if (prefs.hashkafa && prefs.hashkafa.length > 0) {
                    const hashkafaLabels = prefs.hashkafa.map(h => recommendationEngine.formatHashkafa(h));
                    prefsList.push(hashkafaLabels.join(' or '));
                }

                // Add location
                if (prefs.location && prefs.location.length > 0) {
                    const locationLabels = prefs.location.map(l => recommendationEngine.formatLocation(l));
                    prefsList.push(locationLabels.join(' or '));
                }

                // Add size
                if (prefs.size) {
                    prefsList.push(`${recommendationEngine.formatSize(prefs.size)} size`);
                }

                // Add budget
                if (prefs.minBudget && prefs.maxBudget) {
                    prefsList.push(`$${(prefs.minBudget / 1000).toFixed(0)}-${(prefs.maxBudget / 1000).toFixed(0)}K budget`);
                }

                const prefsText = prefsList.length > 0
                    ? `Based on your preferences: ${prefsList.join(', ')}`
                    : 'Update your preferences to get better matches';

                bannerDesc.textContent = prefsText;
                console.log('Updated description to:', bannerDesc.textContent);
            } else {
                console.error('Banner description element not found!');
            }
        } catch (error) {
            console.error('Error in updateMatchBanner:', error);
        }
    }

    setupEventListeners() {
        // Sort dropdown
        const sortSelect = document.getElementById('sortRecommendations');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.sortRecommendations();
                this.renderRecommendations();
            });
        }

        // Compare buttons
        document.getElementById('compareBtn').addEventListener('click', () => {
            comparisonManager.showComparison();
        });

        document.getElementById('clearCompareBtn').addEventListener('click', () => {
            this.clearComparison();
        });

        // Modal close buttons
        document.getElementById('closeModal').addEventListener('click', () => {
            comparisonManager.hideComparison();
        });

        document.getElementById('closeDetailModal').addEventListener('click', () => {
            this.hideDetailModal();
        });

        // Close modals on background click
        document.getElementById('comparisonModal').addEventListener('click', (e) => {
            if (e.target.id === 'comparisonModal') {
                comparisonManager.hideComparison();
            }
        });

        document.getElementById('detailModal').addEventListener('click', (e) => {
            if (e.target.id === 'detailModal') {
                this.hideDetailModal();
            }
        });
    }

    sortRecommendations() {
        switch (this.currentSort) {
            case 'match':
                this.recommendations.sort((a, b) => b.matchPercentage - a.matchPercentage);
                break;
            case 'rating':
                this.recommendations.sort((a, b) => b.rating - a.rating);
                break;
            case 'cost':
                this.recommendations.sort((a, b) => a.cost - b.cost);
                break;
        }
    }

    renderRecommendations() {
        const grid = document.getElementById('recommendationsGrid');

        if (this.recommendations.length === 0) {
            grid.innerHTML = '<div class="empty-state"><h3>No recommendations found</h3><p>Update your preferences to get personalized recommendations.</p></div>';
            return;
        }

        grid.innerHTML = this.recommendations.map(school => this.createRecommendationCard(school)).join('');
        this.attachCardEventListeners();
    }

    createRecommendationCard(school) {
        const favorites = JSON.parse(localStorage.getItem('gapyear_favorites') || '[]');
        const isFavorite = favorites.includes(school.id);
        const isSelected = comparisonManager.isSelected(school.id);
        const matchReason = recommendationEngine.getMatchReason(school);

        return `
            <div class="school-card ${isSelected ? 'selected' : ''}" data-school-id="${school.id}">
                <div class="match-badge">${school.matchPercentage}% Match</div>

                <div class="school-card-header">
                    <div>
                        <h3 class="school-name">${school.name}</h3>
                        <span class="school-type">${school.type}</span>
                    </div>
                    <div class="school-actions">
                        <button class="icon-btn favorite-btn ${isFavorite ? 'active' : ''}"
                                data-school-id="${school.id}"
                                title="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
                            ${isFavorite ? '❤️' : '🤍'}
                        </button>
                        <input type="checkbox"
                               class="compare-checkbox"
                               data-school-id="${school.id}"
                               ${isSelected ? 'checked' : ''}
                               title="Compare this school">
                    </div>
                </div>

                <div class="match-reasons">
                    <strong>Why this matches:</strong> ${matchReason}
                </div>

                <div class="school-rating">
                    <span class="stars">${'⭐'.repeat(Math.floor(school.rating))}</span>
                    <span class="rating-count">${school.rating} (${school.reviewCount} reviews)</span>
                </div>

                <div class="school-info">
                    <div class="info-row">
                        <span class="info-label">Location</span>
                        <span class="info-value">${this.formatLocation(school.location)}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Students</span>
                        <span class="info-value">${school.studentCount}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Annual Cost</span>
                        <span class="info-value">$${school.cost.toLocaleString()}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Distance to Kotel</span>
                        <span class="info-value">${school.distances.kotel}</span>
                    </div>
                </div>

                <div class="school-tags">
                    ${school.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
        `;
    }

    attachCardEventListeners() {
        // Card click to show details
        document.querySelectorAll('.school-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.classList.contains('compare-checkbox') ||
                    e.target.classList.contains('favorite-btn') ||
                    e.target.closest('.favorite-btn')) {
                    return;
                }

                const schoolId = parseInt(card.dataset.schoolId);
                this.showSchoolDetail(schoolId);
            });
        });

        // Favorite buttons
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const schoolId = parseInt(btn.dataset.schoolId);
                this.toggleFavorite(schoolId);
            });
        });

        // Compare checkboxes
        document.querySelectorAll('.compare-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                e.stopPropagation();
                const schoolId = parseInt(checkbox.dataset.schoolId);
                const card = checkbox.closest('.school-card');

                if (checkbox.checked) {
                    if (comparisonManager.addSchool(schoolId)) {
                        card.classList.add('selected');
                    } else {
                        checkbox.checked = false;
                    }
                } else {
                    comparisonManager.removeSchool(schoolId);
                    card.classList.remove('selected');
                }

                this.updateCompareButton();
            });
        });
    }

    toggleFavorite(schoolId) {
        const favorites = JSON.parse(localStorage.getItem('gapyear_favorites') || '[]');
        const index = favorites.indexOf(schoolId);

        if (index > -1) {
            favorites.splice(index, 1);
        } else {
            favorites.push(schoolId);
        }

        localStorage.setItem('gapyear_favorites', JSON.stringify(favorites));
        this.renderRecommendations();
    }

    clearComparison() {
        comparisonManager.clearAll();
        this.updateCompareButton();

        document.querySelectorAll('.compare-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });

        document.querySelectorAll('.school-card').forEach(card => {
            card.classList.remove('selected');
        });
    }

    updateCompareButton() {
        const count = comparisonManager.getSelectedCount();
        const btn = document.getElementById('compareBtn');
        const countSpan = document.getElementById('compareCount');

        countSpan.textContent = count;
        btn.disabled = count < 2;
    }

    showSchoolDetail(schoolId) {
        const school = getSchoolById(schoolId);
        if (!school) return;

        const modal = document.getElementById('detailModal');
        const nameEl = document.getElementById('detailSchoolName');
        const contentEl = document.getElementById('detailContent');

        nameEl.textContent = school.name;
        contentEl.innerHTML = this.generateSchoolDetail(school);

        modal.classList.remove('hidden');
    }

    hideDetailModal() {
        document.getElementById('detailModal').classList.add('hidden');
    }

    generateSchoolDetail(school) {
        // Reuse the same detail generation from app.js
        const appInstance = new GapYearGuideApp();
        return appInstance.generateSchoolDetail(school);
    }

    formatLocation(location) {
        return location.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
}

// Add CSS for match reasons
const recommendationsStyle = document.createElement('style');
recommendationsStyle.textContent = `
    .match-reasons {
        background: #eff6ff;
        padding: 0.75rem;
        border-radius: var(--radius-sm);
        margin-bottom: 1rem;
        font-size: 0.875rem;
        color: var(--text-secondary);
        border: 1px solid #bfdbfe;
    }

    .match-reasons strong {
        color: var(--primary-color);
        display: block;
        margin-bottom: 0.25rem;
    }
`;
document.head.appendChild(recommendationsStyle);

// Initialize app when DOM is ready (only on recommendations page)
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on the recommendations page
    if (document.getElementById('recommendationsGrid')) {
        const app = new RecommendationsApp();
    }
});
