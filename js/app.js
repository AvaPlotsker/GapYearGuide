// Main Application Logic
class GapYearGuideApp {
    constructor() {
        this.schools = getSchools();
        this.filteredSchools = []; // Start with empty - user must select a type first
        this.favorites = this.loadFavorites();
        this.currentSort = 'name';
        this.filters = {
            search: '',
            types: [], // Multiple types
            locations: [], // Multiple locations
            hashkafas: [], // Multiple hashkafas
            academicLevels: [], // Multiple academic levels
            sizes: [] // Multiple sizes
        };
        this.reviewsCache = {}; // Cache for all reviews by school ID

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderRecommendationsPreview();
        this.renderSchools();
        this.updateCompareButton();
        this.loadAllReviews(); // Load reviews for all schools
    }

    setupEventListeners() {
        // Search
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.filters.search = e.target.value.toLowerCase();
            this.applyFiltersAndSort();
        });

        document.getElementById('searchBtn').addEventListener('click', () => {
            this.applyFiltersAndSort();
        });

        // Filter toggle
        document.getElementById('filterToggle').addEventListener('click', () => {
            document.getElementById('filterPanel').classList.toggle('hidden');
        });

        // Setup filter dropdown toggles
        document.querySelectorAll('.filter-dropdown-header').forEach(header => {
            header.addEventListener('click', () => {
                const content = header.nextElementSibling;
                const isOpen = content.classList.contains('open');

                // Close all other dropdowns
                document.querySelectorAll('.filter-dropdown-content.open').forEach(openContent => {
                    if (openContent !== content) {
                        openContent.classList.remove('open');
                        openContent.previousElementSibling.classList.remove('open');
                    }
                });

                // Toggle current dropdown
                if (isOpen) {
                    content.classList.remove('open');
                    header.classList.remove('open');
                } else {
                    content.classList.add('open');
                    header.classList.add('open');
                }
            });
        });

        // Filter controls - all using checkboxes for multiple selection

        // Type checkboxes - auto-apply filters
        document.querySelectorAll('input[name="typeFilter"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.filters.types = Array.from(
                    document.querySelectorAll('input[name="typeFilter"]:checked')
                ).map(cb => cb.value);
                this.applyFiltersAndSort();
            });
        });

        // Location checkboxes
        document.querySelectorAll('input[name="locationFilter"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.filters.locations = Array.from(
                    document.querySelectorAll('input[name="locationFilter"]:checked')
                ).map(cb => cb.value);
            });
        });

        // Hashkafa checkboxes
        document.querySelectorAll('input[name="hashkafaFilter"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.filters.hashkafas = Array.from(
                    document.querySelectorAll('input[name="hashkafaFilter"]:checked')
                ).map(cb => cb.value);
            });
        });

        // Academic Level checkboxes
        document.querySelectorAll('input[name="academicLevelFilter"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.filters.academicLevels = Array.from(
                    document.querySelectorAll('input[name="academicLevelFilter"]:checked')
                ).map(cb => cb.value);
            });
        });

        // Size checkboxes
        document.querySelectorAll('input[name="sizeFilter"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.filters.sizes = Array.from(
                    document.querySelectorAll('input[name="sizeFilter"]:checked')
                ).map(cb => cb.value);
            });
        });

        document.getElementById('applyFilters').addEventListener('click', () => {
            this.applyFiltersAndSort();
        });

        document.getElementById('clearFilters').addEventListener('click', () => {
            this.clearFilters();
        });

        // Comparison controls
        document.getElementById('compareBtn').addEventListener('click', () => {
            comparisonManager.showComparison();
        });

        document.getElementById('clearCompareBtn').addEventListener('click', () => {
            this.clearComparison();
        });

        document.getElementById('closeModal').addEventListener('click', () => {
            comparisonManager.hideComparison();
        });

        // Close modals on background click
        document.getElementById('comparisonModal').addEventListener('click', (e) => {
            if (e.target.id === 'comparisonModal') {
                comparisonManager.hideComparison();
            }
        });

        const detailModalEl = document.getElementById('detailModal');
        if (detailModalEl) {
            detailModalEl.addEventListener('click', (e) => {
                // Close if clicking on modal background
                if (e.target.id === 'detailModal') {
                    this.hideDetailModal();
                }
            });
        }
    }

    applyFiltersAndSort() {
        // If no type selected, show nothing
        if (this.filters.types.length === 0) {
            this.filteredSchools = [];
            this.renderSchools();
            return;
        }

        // Start with all schools
        this.filteredSchools = [...this.schools];

        // Apply search filter
        if (this.filters.search) {
            this.filteredSchools = this.filteredSchools.filter(school => {
                return school.name.toLowerCase().includes(this.filters.search) ||
                       school.location.toLowerCase().includes(this.filters.search) ||
                       school.hashkafa.toLowerCase().includes(this.filters.search) ||
                       school.description.toLowerCase().includes(this.filters.search);
            });
        }

        // Apply type filter (multiple types)
        if (this.filters.types && this.filters.types.length > 0) {
            this.filteredSchools = this.filteredSchools.filter(school =>
                this.filters.types.includes(school.type)
            );
        }

        // Apply location filter (multiple locations)
        if (this.filters.locations && this.filters.locations.length > 0) {
            this.filteredSchools = this.filteredSchools.filter(school =>
                this.filters.locations.includes(school.location)
            );
        }

        // Apply hashkafa filter (multiple hashkafas)
        if (this.filters.hashkafas && this.filters.hashkafas.length > 0) {
            this.filteredSchools = this.filteredSchools.filter(school =>
                this.filters.hashkafas.includes(school.hashkafa)
            );
        }

        // Apply academic level filter (multiple levels)
        if (this.filters.academicLevels && this.filters.academicLevels.length > 0) {
            this.filteredSchools = this.filteredSchools.filter(school =>
                this.filters.academicLevels.includes(school.academicLevel)
            );
        }

        // Apply size filter (multiple sizes)
        if (this.filters.sizes && this.filters.sizes.length > 0) {
            this.filteredSchools = this.filteredSchools.filter(school =>
                this.filters.sizes.includes(school.size)
            );
        }

        // Apply sorting
        this.sortSchools();

        // Render results
        this.renderSchools();
    }

    sortSchools() {
        switch (this.currentSort) {
            case 'name':
                this.filteredSchools.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'rating':
                this.filteredSchools.sort((a, b) => b.rating - a.rating);
                break;
            case 'cost':
                this.filteredSchools.sort((a, b) => a.cost - b.cost);
                break;
            case 'size':
                this.filteredSchools.sort((a, b) => b.studentCount - a.studentCount);
                break;
            case 'hashkafa':
                this.filteredSchools.sort((a, b) => a.hashkafa.localeCompare(b.hashkafa));
                break;
            case 'academicLevel':
                const levelOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3, 'mixed': 4 };
                this.filteredSchools.sort((a, b) => {
                    const aLevel = levelOrder[a.academicLevel] || 5;
                    const bLevel = levelOrder[b.academicLevel] || 5;
                    return aLevel - bLevel;
                });
                break;
        }
    }

    clearFilters() {
        // Reset search input
        document.getElementById('searchInput').value = '';

        // Uncheck all filter checkboxes
        document.querySelectorAll('input[name="typeFilter"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        document.querySelectorAll('input[name="locationFilter"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        document.querySelectorAll('input[name="hashkafaFilter"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        document.querySelectorAll('input[name="academicLevelFilter"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        document.querySelectorAll('input[name="sizeFilter"]').forEach(checkbox => {
            checkbox.checked = false;
        });

        // Reset filter object
        this.filters = {
            search: '',
            types: [],
            locations: [],
            hashkafas: [],
            academicLevels: [],
            sizes: []
        };

        // Reapply filters and sort
        this.applyFiltersAndSort();
    }

    clearComparison() {
        comparisonManager.clearAll();
        this.updateCompareButton();

        // Update all checkboxes
        document.querySelectorAll('.compare-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });

        // Remove selected class from all cards
        document.querySelectorAll('.school-card').forEach(card => {
            card.classList.remove('selected');
        });
    }

    renderSchools() {
        const grid = document.getElementById('schoolsGrid');

        // Check if no type is selected
        if (this.filters.types.length === 0) {
            grid.innerHTML = '<div class="empty-state"><h3>Welcome to GapYearGuide!</h3><p>Please select what you\'re looking for above (Seminary, Yeshiva, or Gap Year Program) to browse schools.</p></div>';
            return;
        }

        if (this.filteredSchools.length === 0) {
            grid.innerHTML = '<div class="empty-state"><h3>No schools found</h3><p>Try adjusting your filters or search terms.</p></div>';
            return;
        }

        grid.innerHTML = this.filteredSchools.map(school => this.createSchoolCard(school)).join('');

        // Add event listeners to cards
        this.attachCardEventListeners();
    }

    createSchoolCard(school) {
        const isFavorite = this.favorites.includes(school.id);
        const isSelected = comparisonManager.isSelected(school.id);
        const ratingInfo = this.getSchoolRatingInfo(school.id);

        // Use real ratings from Firebase if available, otherwise show "No reviews yet"
        let ratingHTML;
        if (ratingInfo.hasReviews) {
            const stars = '⭐'.repeat(Math.floor(ratingInfo.rating));
            ratingHTML = `
                <div class="school-rating">
                    <span class="stars">${stars}</span>
                    <span class="rating-count">${ratingInfo.rating} (${ratingInfo.reviewCount} ${ratingInfo.reviewCount === 1 ? 'review' : 'reviews'})</span>
                </div>
            `;
        } else {
            ratingHTML = `
                <div class="school-rating">
                    <span class="rating-count" style="color: var(--text-secondary); font-style: italic;">No reviews yet</span>
                </div>
            `;
        }

        return `
            <div class="school-card ${isSelected ? 'selected' : ''}" data-school-id="${school.id}">
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

                ${ratingHTML}

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
                    <div class="info-row">
                        <span class="info-label">Shana Bet</span>
                        <span class="info-value">${this.formatShanaBet(school.shanaBet)}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Chessed Day</span>
                        <span class="info-value">${school.chessed.day}</span>
                    </div>
                </div>

                <div class="school-tags">
                    ${school.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
        `;
    }

    formatShanaBet(shanaBet) {
        if (!shanaBet.offered) {
            return 'Not offered';
        }

        const programType = shanaBet.programType === 'both'
            ? 'Madricha & Student'
            : shanaBet.programType === 'madricha'
                ? 'Madricha only'
                : 'Student only';

        const duration = shanaBet.duration === 'both'
            ? 'Full/Half year'
            : shanaBet.duration === 'full-year'
                ? 'Full year'
                : 'Half year';

        return `${programType} (${duration})`;
    }

    attachCardEventListeners() {
        // Card click to show details
        document.querySelectorAll('.school-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't trigger if clicking on checkbox, favorite button, or their children
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
        } else {
            this.favorites.push(schoolId);
        }

        this.saveFavorites();
        this.renderSchools();
    }

    loadFavorites() {
        const saved = localStorage.getItem('gapyear_favorites');
        return saved ? JSON.parse(saved) : [];
    }

    saveFavorites() {
        localStorage.setItem('gapyear_favorites', JSON.stringify(this.favorites));
    }

    trackSchoolView(schoolId) {
        // Get existing viewed schools
        const viewedStr = localStorage.getItem('gapyear_viewed_schools');
        let viewedSchools = viewedStr ? JSON.parse(viewedStr) : [];

        // Add this school if not already viewed
        if (!viewedSchools.includes(schoolId)) {
            viewedSchools.push(schoolId);
            localStorage.setItem('gapyear_viewed_schools', JSON.stringify(viewedSchools));
        }
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

        // Track that this school was viewed
        this.trackSchoolView(schoolId);

        // Load reviews for this school
        this.loadReviews(schoolId);

        // Attach close button listener directly after modal is shown
        const closeBtn = document.getElementById('closeDetailModal');
        if (closeBtn) {
            // Remove any existing listeners by cloning the button
            const newCloseBtn = closeBtn.cloneNode(true);
            closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);

            // Add fresh event listener
            newCloseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.hideDetailModal();
            });
        }
    }

    hideDetailModal() {
        document.getElementById('detailModal').classList.add('hidden');
    }

    generateSchoolDetail(school) {
        return `
            <div class="detail-section">
                <h3>Basic Information</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">Type</div>
                        <div class="detail-value">${this.formatType(school.type)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Location</div>
                        <div class="detail-value">${this.formatLocation(school.location)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Hashkafa</div>
                        <div class="detail-value">${this.formatHashkafa(school.hashkafa)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Student Count</div>
                        <div class="detail-value">${school.studentCount} students</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Annual Cost</div>
                        <div class="detail-value">$${school.cost.toLocaleString()}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Application Deadline</div>
                        <div class="detail-value">${school.applicationDeadline}</div>
                    </div>
                </div>
                <p style="margin-top: 1rem; color: var(--text-secondary);">${school.description}</p>
            </div>

            <div class="detail-section">
                <h3>Contact Information</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">Address</div>
                        <div class="detail-value">${school.address}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Phone</div>
                        <div class="detail-value">${school.phone}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Email</div>
                        <div class="detail-value">${school.email}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Website</div>
                        <div class="detail-value"><a href="${school.website}" target="_blank" style="color: var(--primary-color);">${school.website}</a></div>
                    </div>
                </div>
            </div>

            <div class="detail-section">
                <h3>Meals & Shabbos</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">Meals Per Day</div>
                        <div class="detail-value">${school.meals.perDay}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Meals Included</div>
                        <div class="detail-value">${school.meals.included.join(', ')}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Shabbos Pattern</div>
                        <div class="detail-value">${school.shabbos.pattern}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Shabbos Details</div>
                        <div class="detail-value">${school.shabbos.details}</div>
                    </div>
                </div>
            </div>

            <div class="detail-section">
                <h3>Location & Distances</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">Distance to Kotel</div>
                        <div class="detail-value">${school.distances.kotel}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Distance to Center City</div>
                        <div class="detail-value">${school.distances.centerCity}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Distance to Shopping</div>
                        <div class="detail-value">${school.distances.shopping}</div>
                    </div>
                </div>
            </div>

            <div class="detail-section">
                <h3>Transportation</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">Bus Lines</div>
                        <div class="detail-value">${school.transportation.buses.join(', ')}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Taxi Availability</div>
                        <div class="detail-value">${school.transportation.taxiAvailability}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Walkability</div>
                        <div class="detail-value">${school.transportation.walkability}</div>
                    </div>
                </div>
            </div>

            <div class="detail-section">
                <h3>Delivery Services</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">Food Delivery</div>
                        <div class="detail-value">${school.delivery.food ? 'Available' : 'Not Available'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Grocery Delivery</div>
                        <div class="detail-value">${school.delivery.groceries ? 'Available' : 'Not Available'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Delivery Services</div>
                        <div class="detail-value">${school.delivery.services.join(', ')}</div>
                    </div>
                </div>
            </div>

            <div class="detail-section">
                <h3>Amenities</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">On-Site Amenities</div>
                        <div class="detail-value">${school.amenities.onSite.join(', ')}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Nearby Amenities</div>
                        <div class="detail-value">${school.amenities.nearby.join(', ')}</div>
                    </div>
                </div>
            </div>

            <div class="detail-section">
                <h3>Shana Bet Programs</h3>
                <div class="detail-grid">
                    ${school.shanaBet.offered ? `
                        <div class="detail-item">
                            <div class="detail-label">Program Type</div>
                            <div class="detail-value">${
                                school.shanaBet.programType === 'both' ? 'Madricha & Student Programs' :
                                school.shanaBet.programType === 'madricha' ? 'Madricha Program Only' :
                                'Student Program Only'
                            }</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Duration Options</div>
                            <div class="detail-value">${
                                school.shanaBet.duration === 'both' ? 'Full Year & Half Year' :
                                school.shanaBet.duration === 'full-year' ? 'Full Year Only' :
                                'Half Year Only'
                            }</div>
                        </div>
                    ` : `
                        <div class="detail-item">
                            <div class="detail-label">Availability</div>
                            <div class="detail-value">Shana Bet not offered at this school</div>
                        </div>
                    `}
                </div>
            </div>

            <div class="detail-section">
                <h3>Chessed Opportunities</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">Chessed Day</div>
                        <div class="detail-value">${school.chessed.day}</div>
                    </div>
                    <div class="detail-item" style="grid-column: 1 / -1;">
                        <div class="detail-label">Available Opportunities</div>
                        <div class="detail-value">${school.chessed.opportunities.join(' • ')}</div>
                    </div>
                </div>
            </div>

        `;
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

    formatType(type) {
        return type.charAt(0).toUpperCase() + type.slice(1);
    }

    renderRecommendationsPreview() {
        const previewContainer = document.getElementById('recommendationsPreview');
        if (!previewContainer) return;

        // Get user from localStorage if logged in
        const userStr = localStorage.getItem('gapyear_user');
        let userPrefs;

        if (userStr) {
            const user = JSON.parse(userStr);
            const prefs = user.preferences || {
                hashkafa: ['modern-orthodox'],
                location: ['jerusalem'],
                size: 'medium',
                minBudget: 20000,
                maxBudget: 25000,
                programFocus: 'Academic & Spiritual Growth'
            };

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

            userPrefs = {
                type: schoolTypes,
                hashkafa: hashkafas,
                location: locations,
                size: prefs.size,
                minBudget: prefs.minBudget,
                maxBudget: prefs.maxBudget,
                programFocus: prefs.programFocus,
                importantFeatures: user.importantFeatures || []
            };
        } else {
            // Default preferences for non-logged-in users
            userPrefs = {
                type: ['seminary'],
                hashkafa: ['modern-orthodox'],
                location: ['jerusalem'],
                size: 'medium',
                minBudget: 20000,
                maxBudget: 25000,
                programFocus: 'Academic & Spiritual Growth',
                importantFeatures: []
            };
        }

        const engine = new RecommendationEngine(userPrefs);
        const recommendations = engine.getRecommendations(this.schools, 3);

        if (recommendations.length === 0) {
            const banner = document.getElementById('recommendationsBanner');
            if (banner) banner.style.display = 'none';
            return;
        }

        previewContainer.innerHTML = recommendations.map(school => `
            <div class="recommendation-mini-card" data-school-id="${school.id}">
                <span class="match-badge">${school.matchPercentage}% Match</span>
                <h4>${school.name}</h4>
                <p>${this.formatLocation(school.location)} • $${school.cost.toLocaleString()}</p>
            </div>
        `).join('');

        // Add click handlers
        previewContainer.querySelectorAll('.recommendation-mini-card').forEach(card => {
            card.addEventListener('click', () => {
                const schoolId = parseInt(card.dataset.schoolId);
                this.showSchoolDetail(schoolId);
            });
        });
    }

    // Load all reviews and cache them by school ID
    async loadAllReviews(retryCount = 0) {
        if (!window.reviewManager) {
            if (retryCount < 5) {
                setTimeout(() => this.loadAllReviews(retryCount + 1), 1000);
            } else {
                console.error('Firebase reviewManager failed to load for reviews cache');
            }
            return;
        }

        try {
            const result = await window.reviewManager.getAllReviews();

            if (result.success) {
                // Organize reviews by school ID
                this.reviewsCache = {};
                result.reviews.forEach(review => {
                    if (!this.reviewsCache[review.schoolId]) {
                        this.reviewsCache[review.schoolId] = [];
                    }
                    this.reviewsCache[review.schoolId].push(review);
                });

                console.log('Reviews cache loaded:', this.reviewsCache);

                // Re-render schools to show updated ratings
                this.renderSchools();
            }
        } catch (error) {
            console.error('Error loading all reviews:', error);
        }
    }

    // Get rating info for a school from cache
    getSchoolRatingInfo(schoolId) {
        const reviews = this.reviewsCache[schoolId] || [];

        if (reviews.length === 0) {
            return {
                rating: 0,
                reviewCount: 0,
                hasReviews: false
            };
        }

        const avgRating = window.reviewManager ?
            window.reviewManager.calculateAverageRating(reviews) : 0;

        return {
            rating: parseFloat(avgRating),
            reviewCount: reviews.length,
            hasReviews: true
        };
    }

    // Review System Methods
    async loadReviews(schoolId, retryCount = 0) {
        const reviewsContainer = document.getElementById('schoolReviews');

        if (!window.reviewManager) {
            if (retryCount < 5) {
                reviewsContainer.innerHTML = '<p class="loading-reviews">Loading review system...</p>';
                // Wait a bit for Firebase to load
                setTimeout(() => this.loadReviews(schoolId, retryCount + 1), 1000);
            } else {
                reviewsContainer.innerHTML = '<p class="no-reviews">Error loading review system. Please refresh the page.</p>';
                console.error('Firebase reviewManager failed to load after 5 retries');
            }
            return;
        }

        reviewsContainer.innerHTML = '<p class="loading-reviews">Loading reviews...</p>';

        try {
            const result = await window.reviewManager.getReviewsForSchool(schoolId);

            console.log('Reviews result for school', schoolId, ':', result);
            console.log('Number of reviews:', result.reviews ? result.reviews.length : 0);

            if (result.success && result.reviews.length > 0) {
                // Calculate average rating
                const avgRating = window.reviewManager.calculateAverageRating(result.reviews);
                const reviewCount = result.reviews.length;
                const stars = '★'.repeat(Math.floor(avgRating)) + '☆'.repeat(5 - Math.floor(avgRating));

                // Create rating summary
                const ratingSummary = `
                    <div class="review-summary">
                        <div class="review-summary-rating">
                            <span class="summary-stars">${stars}</span>
                            <span class="summary-text">${avgRating} out of 5 based on ${reviewCount} ${reviewCount === 1 ? 'review' : 'reviews'}</span>
                        </div>
                    </div>
                `;

                reviewsContainer.innerHTML = ratingSummary + result.reviews.map(review => this.createReviewHTML(review)).join('');
            } else {
                reviewsContainer.innerHTML = '<p class="no-reviews">No reviews yet. Be the first to share your experience!</p>';
            }
        } catch (error) {
            console.error('Error loading reviews:', error);
            reviewsContainer.innerHTML = '<p class="no-reviews">Error loading reviews. Please try again.</p>';
        }
    }

    createReviewHTML(review) {
        const date = review.timestamp?.toDate ? review.timestamp.toDate() : new Date();
        const dateStr = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const authorName = review.reviewerName || 'Anonymous';
        const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);

        return `
            <div class="review-item">
                <div class="review-header">
                    <span class="${review.reviewerName ? 'review-author' : 'review-anonymous'}">${authorName}</span>
                    <span class="review-date">${dateStr}</span>
                </div>
                <div class="review-rating">${stars}</div>
                <div class="review-year">Attended: ${review.yearAttended}</div>
                <div class="review-text">${review.reviewText}</div>
            </div>
        `;
    }

}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new GapYearGuideApp();
});
