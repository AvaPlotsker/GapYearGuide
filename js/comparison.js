m// Comparison functionality
class ComparisonManager {
    constructor() {
        this.selectedSchools = [];
        this.maxCompare = 4;
    }

    addSchool(schoolId) {
        if (this.selectedSchools.includes(schoolId)) {
            return false;
        }

        if (this.selectedSchools.length >= this.maxCompare) {
            alert(`You can only compare up to ${this.maxCompare} schools at once.`);
            return false;
        }

        this.selectedSchools.push(schoolId);
        return true;
    }

    removeSchool(schoolId) {
        const index = this.selectedSchools.indexOf(schoolId);
        if (index > -1) {
            this.selectedSchools.splice(index, 1);
            return true;
        }
        return false;
    }

    toggleSchool(schoolId) {
        if (this.selectedSchools.includes(schoolId)) {
            this.removeSchool(schoolId);
            return false;
        } else {
            return this.addSchool(schoolId);
        }
    }

    clearAll() {
        this.selectedSchools = [];
    }

    getSelectedCount() {
        return this.selectedSchools.length;
    }

    getSelectedSchools() {
        return this.selectedSchools.map(id => getSchoolById(id));
    }

    isSelected(schoolId) {
        return this.selectedSchools.includes(schoolId);
    }

    generateComparisonTable() {
        const schools = this.getSelectedSchools();

        if (schools.length === 0) {
            return '<div class="empty-state"><h3>No schools selected for comparison</h3><p>Select schools from the main list to compare them here.</p></div>';
        }

        const comparisonFields = [
            { label: 'School Name', key: 'name', class: 'comparison-header' },
            { label: 'Type', key: 'type' },
            { label: 'Location', key: 'location' },
            { label: 'Hashkafa', key: 'hashkafa' },
            { label: 'Student Count', key: 'studentCount' },
            { label: 'Annual Cost', key: 'cost', format: (val) => `$${val.toLocaleString()}` },
            { label: 'Program Focus', key: 'programFocus' },
            { label: 'Rating', key: 'rating', format: (val, school) => `${val} ⭐ (${school.reviewCount} reviews)` },
            { label: 'Meals Per Day', key: 'meals.perDay' },
            { label: 'Meals Included', key: 'meals.included', format: (val) => val.join(', ') },
            { label: 'Shabbos Pattern', key: 'shabbos.pattern' },
            { label: 'Shabbos Details', key: 'shabbos.details' },
            { label: 'Shana Bet Offered', key: 'shanaBet.offered', format: (val) => val ? 'Yes' : 'No' },
            { label: 'Shana Bet Type', key: 'shanaBet', format: (val) => {
                if (!val.offered) return 'N/A';
                return val.programType === 'both' ? 'Madricha & Student' :
                       val.programType === 'madricha' ? 'Madricha Only' : 'Student Only';
            }},
            { label: 'Shana Bet Duration', key: 'shanaBet', format: (val) => {
                if (!val.offered) return 'N/A';
                return val.duration === 'both' ? 'Full/Half Year' :
                       val.duration === 'full-year' ? 'Full Year' : 'Half Year';
            }},
            { label: 'Chessed Day', key: 'chessed.day' },
            { label: 'Chessed Opportunities', key: 'chessed.opportunities', format: (val) => val.join(', ') },
            { label: 'Distance to Kotel', key: 'distances.kotel' },
            { label: 'Distance to Center', key: 'distances.centerCity' },
            { label: 'Distance to Shopping', key: 'distances.shopping' },
            { label: 'Bus Lines', key: 'transportation.buses', format: (val) => val.join(', ') },
            { label: 'Taxi Availability', key: 'transportation.taxiAvailability' },
            { label: 'Walkability', key: 'transportation.walkability' },
            { label: 'Food Delivery', key: 'delivery.food', format: (val) => val ? 'Yes' : 'No' },
            { label: 'Delivery Services', key: 'delivery.services', format: (val) => val.join(', ') },
            { label: 'Phone', key: 'phone' },
            { label: 'Email', key: 'email' },
            { label: 'Website', key: 'website', format: (val) => `<a href="${val}" target="_blank" style="color: var(--primary-color);">${val}</a>` },
            { label: 'Application Deadline', key: 'applicationDeadline' }
        ];

        let html = `<div class="comparison-table" data-school-count="${schools.length}">`;

        comparisonFields.forEach(field => {
            html += '<div class="comparison-row">';
            html += `<div class="comparison-label">${field.label}</div>`;

            schools.forEach(school => {
                const value = this.getNestedValue(school, field.key);
                const displayValue = field.format ? field.format(value, school) : value;
                const cellClass = field.class ? `comparison-cell ${field.class}` : 'comparison-cell';
                html += `<div class="${cellClass}">${displayValue || 'N/A'}</div>`;
            });

            html += '</div>';
        });

        html += '</div>';
        return html;
    }

    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    showComparison() {
        const modal = document.getElementById('comparisonModal');
        const tableContainer = document.getElementById('comparisonTable');

        tableContainer.innerHTML = this.generateComparisonTable();
        modal.classList.remove('hidden');
    }

    hideComparison() {
        const modal = document.getElementById('comparisonModal');
        modal.classList.add('hidden');
    }
}

// Initialize comparison manager
const comparisonManager = new ComparisonManager();
