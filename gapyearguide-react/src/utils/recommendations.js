export class RecommendationEngine {
  constructor(userPrefs) {
    this.userPrefs = userPrefs;
  }

  calculateMatchScore(school) {
    let score = 0;
    let maxScore = 0;

    // Type match (20 points)
    maxScore += 20;
    const userTypes = Array.isArray(this.userPrefs.type)
      ? this.userPrefs.type
      : [this.userPrefs.type];

    if (userTypes.includes(school.type)) {
      score += 20;
    }

    // Hashkafa match (25 points)
    maxScore += 25;
    const userHashkafas = Array.isArray(this.userPrefs.hashkafa)
      ? this.userPrefs.hashkafa
      : [this.userPrefs.hashkafa];

    if (userHashkafas.includes(school.hashkafa)) {
      score += 25;
    } else if (school.hashkafa === 'mixed') {
      score += 15;
    }

    // Location match (15 points)
    maxScore += 15;
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
      score += 18;
    } else {
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
