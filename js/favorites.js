// Favorites Page Application

class FavoritesApp {
    constructor() {
        this.schools = getSchools();
        this.favorites = this.loadFavorites();
        this.favoriteSchools = this.getFavoriteSchools();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderFavorites();
        this.updateCompareButton();
    }

    loadFavorites() {
        const saved = localStorage.getItem('gapyear_favorites');
        return saved ? JSON.parse(saved) : [];
    }

    saveFavorites() {
        localStorage.setItem('gapyear_favorites', JSON.stringify(this.favorites));
    }

    getFavoriteSchools() {
        return this.schools.filter(school => this.favorites.includes(school.id));
    }

    setupEventListeners() {
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

    renderFavorites() {
        const grid = document.getElementById('favoritesGrid');
        const emptyState = document.getElementById('emptyFavorites');

        if (this.favoriteSchools.length === 0) {
            grid.style.display = 'none';
            emptyState.classList.remove('hidden');
            return;
        }

        grid.style.display = 'grid';
        emptyState.classList.add('hidden');
        grid.innerHTML = this.favoriteSchools.map(school => this.createSchoolCard(school)).join('');
        this.attachCardEventListeners();
    }

    createSchoolCard(school) {
        const isSelected = comparisonManager.isSelected(school.id);

        return `
            <div class="school-card ${isSelected ? 'selected' : ''}" data-school-id="${school.id}">
                <div class="school-card-header">
                    <div>
                        <h3 class="school-name">${school.name}</h3>
                        <span class="school-type">${school.type}</span>
                    </div>
                    <div class="school-actions">
                        <button class="icon-btn favorite-btn active"
                                data-school-id="${school.id}"
                                title="Remove from favorites">
                            ❤️
                        </button>
                        <input type="checkbox"
                               class="compare-checkbox"
                               data-school-id="${school.id}"
                               ${isSelected ? 'checked' : ''}
                               title="Compare this school">
                    </div>
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
                        <span class="info-label">Hashkafa</span>
                        <span class="info-value">${this.formatHashkafa(school.hashkafa)}</span>
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
                        <span class="info-label">Meals/Day</span>
                        <span class="info-value">${school.meals.perDay}</span>
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
        const index = this.favorites.indexOf(schoolId);

        if (index > -1) {
            this.favorites.splice(index, 1);
            this.saveFavorites();
            this.favoriteSchools = this.getFavoriteSchools();
            this.renderFavorites();
        }
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
        // Reuse the detail generation logic
        const appInstance = new GapYearGuideApp();
        return appInstance.generateSchoolDetail(school);
    }

    formatLocation(location) {
        return location.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    formatHashkafa(hashkafa) {
        return hashkafa.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new FavoritesApp();
});
