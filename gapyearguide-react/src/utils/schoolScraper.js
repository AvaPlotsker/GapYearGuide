/**
 * School Scraper Utility
 * Helps fetch and structure school data from various sources
 *
 * Usage:
 * 1. Use WebFetch tool in Claude Code to fetch pages
 * 2. Parse and structure the data
 * 3. Validate and enrich
 * 4. Export to JSON for import
 */

/**
 * Main sources for gap year schools in Israel:
 * 1. israelgapyear.com - comprehensive directory
 * 2. applytosem.org - seminary application portal
 * 3. Individual school websites
 * 4. ou.org/life/travel/israel-programs/
 * 5. nbn.org.il - Nefesh B'Nefesh programs
 */

// Template for a complete school object
export const schoolTemplate = {
  name: "",
  type: "", // "seminary" | "yeshiva" | "gap-year-program"
  location: "", // jerusalem, ramat-beit-shemesh, etc.
  hashkafa: "", // modern-orthodox, yeshivish, chassidish, religious-zionist, mixed
  size: "", // small, medium, large
  studentCount: 0,
  cost: 0,
  programFocus: "",
  description: "",
  website: "",
  phone: "",
  email: "",
  address: "",
  applicationDeadline: "",
  academicLevel: "", // beginner, intermediate, advanced, mixed

  // Meals
  meals: {
    perDay: 0,
    included: [] // ["Breakfast", "Lunch", "Dinner"]
  },

  // Shabbos arrangements
  shabbos: {
    pattern: "", // "in/out/in", "all-in", "all-out", etc.
    details: ""
  },

  // Distances
  distances: {
    kotel: "",
    centerCity: "",
    shopping: ""
  },

  // Shana Bet options
  shanaBet: {
    offered: false,
    programType: "", // "student", "madricha", "both", ""
    duration: "" // "full-year", "half-year", "both", ""
  },

  // Chessed requirements
  chessed: {
    required: false,
    day: "",
    hours: "",
    opportunities: []
  },

  // Amenities
  amenities: {
    nearby: [],
    onSite: []
  },

  // Transportation
  transportation: {
    buses: [],
    taxiAvailability: "", // High, Medium, Low
    walkability: "" // Excellent, Good, Fair, Poor
  },

  // Delivery services
  delivery: {
    food: false,
    groceries: false,
    services: []
  },

  // Tags for filtering
  tags: [],

  // Ratings (if available)
  rating: 0,
  reviewCount: 0,
  photos: []
};

// Helper to normalize location names
export function normalizeLocation(location) {
  const locationMap = {
    'jerusalem': 'jerusalem',
    'yerushalayim': 'jerusalem',
    'j-m': 'jerusalem',
    'old city': 'jerusalem',
    'bayit vegan': 'jerusalem',
    'har nof': 'jerusalem',
    'ramat eshkol': 'jerusalem',
    'french hill': 'jerusalem',
    'maalot dafna': 'jerusalem',
    'givat shaul': 'jerusalem',
    'kiryat moshe': 'jerusalem',
    'katamon': 'jerusalem',
    'pat': 'pat-jerusalem',

    'ramat beit shemesh': 'ramat-beit-shemesh',
    'rbs': 'ramat-beit-shemesh',
    'beit shemesh': 'ramat-beit-shemesh',

    'bnei brak': 'bnei-brak',
    "b'nei brak": 'bnei-brak',
    'bnei braq': 'bnei-brak',

    'safed': 'safed',
    'tzfat': 'safed',
    'tzefat': 'safed',
    'tsfat': 'safed',

    'tel aviv': 'tel-aviv',
    'tlv': 'tel-aviv',

    'modi\'in': 'modiin',
    'modiin': 'modiin',

    'netanya': 'netanya',

    'herzliya': 'herzliya',
    'herzlia': 'herzliya'
  };

  const normalized = location.toLowerCase().trim();
  return locationMap[normalized] || normalized.replace(/\s+/g, '-');
}

// Helper to normalize hashkafa
export function normalizeHashkafa(hashkafa) {
  const hashkafaMap = {
    'modern orthodox': 'modern-orthodox',
    'mo': 'modern-orthodox',
    'modern-orthodox': 'modern-orthodox',

    'yeshivish': 'yeshivish',
    'yeshiva': 'yeshivish',
    'litvish': 'yeshivish',

    'chassidish': 'chassidish',
    'hasidic': 'chassidish',
    'chassidic': 'chassidish',

    'religious zionist': 'religious-zionist',
    'dati leumi': 'religious-zionist',
    'religious-zionist': 'religious-zionist',

    'mixed': 'mixed',
    'diverse': 'mixed'
  };

  const normalized = hashkafa.toLowerCase().trim();
  return hashkafaMap[normalized] || 'modern-orthodox';
}

// Helper to determine school type from name
export function determineSchoolType(name) {
  const nameLower = name.toLowerCase();

  // Check for yeshiva indicators
  if (nameLower.includes('yeshiva') ||
      nameLower.includes('yeshivah') ||
      nameLower.includes('kollel') ||
      nameLower.match(/\bfor (young )?men\b/i) ||
      nameLower.match(/\b(boys|guys)\b/i)) {
    return 'yeshiva';
  }

  // Check for seminary indicators
  if (nameLower.includes('seminary') ||
      nameLower.includes('midreshet') ||
      nameLower.includes('midrasha') ||
      nameLower.includes('machon') ||
      nameLower.includes('michlelet') ||
      nameLower.match(/\bfor (young )?women\b/i) ||
      nameLower.match(/\bgirls\b/i)) {
    return 'seminary';
  }

  // Check for program indicators
  if (nameLower.includes('program') ||
      nameLower.includes('experience') ||
      nameLower.includes('gap year')) {
    return 'gap-year-program';
  }

  // Default to seminary (most common)
  return 'seminary';
}

// Helper to determine size from student count
export function determineSize(studentCount) {
  if (studentCount < 50) return 'small';
  if (studentCount <= 150) return 'medium';
  return 'large';
}

// Helper to parse cost from text
export function parseCost(costText) {
  if (!costText) return 0;

  // Remove currency symbols and commas
  const cleaned = costText.replace(/[$,₪]/g, '');

  // Extract number
  const match = cleaned.match(/(\d+)/);
  if (match) {
    const num = parseInt(match[1]);

    // If it's in shekels (₪ or ILS), convert to USD (rough approximation)
    if (costText.includes('₪') || costText.includes('ILS') || costText.includes('NIS')) {
      return Math.round(num / 3.5); // Rough conversion rate
    }

    return num;
  }

  return 0;
}

// Validate a school object
export function validateSchool(school) {
  const errors = [];

  if (!school.name || school.name.trim() === '') {
    errors.push('Name is required');
  }

  if (!school.type || !['seminary', 'yeshiva', 'gap-year-program'].includes(school.type)) {
    errors.push('Valid type is required (seminary, yeshiva, or gap-year-program)');
  }

  if (!school.location || school.location.trim() === '') {
    errors.push('Location is required');
  }

  if (!school.hashkafa || school.hashkafa.trim() === '') {
    errors.push('Hashkafa is required');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Create a school object from raw data
export function createSchoolFromData(rawData) {
  const school = { ...schoolTemplate };

  // Basic info
  school.name = rawData.name || '';
  school.type = rawData.type || determineSchoolType(school.name);
  school.location = normalizeLocation(rawData.location || 'jerusalem');
  school.hashkafa = normalizeHashkafa(rawData.hashkafa || 'modern-orthodox');
  school.description = rawData.description || '';
  school.website = rawData.website || '';
  school.phone = rawData.phone || '';
  school.email = rawData.email || '';
  school.address = rawData.address || '';

  // Student count and size
  school.studentCount = parseInt(rawData.studentCount) || 100;
  school.size = rawData.size || determineSize(school.studentCount);

  // Cost
  school.cost = typeof rawData.cost === 'number' ? rawData.cost : parseCost(rawData.cost);

  // Program details
  school.programFocus = rawData.programFocus || 'Torah Study & Personal Growth';
  school.academicLevel = rawData.academicLevel || 'intermediate';
  school.applicationDeadline = rawData.applicationDeadline || 'Contact school for details';

  // Complex objects
  if (rawData.meals) {
    school.meals = rawData.meals;
  }

  if (rawData.shabbos) {
    school.shabbos = rawData.shabbos;
  }

  if (rawData.distances) {
    school.distances = rawData.distances;
  }

  if (rawData.shanaBet) {
    school.shanaBet = rawData.shanaBet;
  }

  if (rawData.chessed) {
    school.chessed = rawData.chessed;
  }

  if (rawData.amenities) {
    school.amenities = rawData.amenities;
  }

  if (rawData.transportation) {
    school.transportation = rawData.transportation;
  }

  if (rawData.delivery) {
    school.delivery = rawData.delivery;
  }

  if (rawData.tags && Array.isArray(rawData.tags)) {
    school.tags = rawData.tags;
  }

  return school;
}

// Export schools to JSON file
export function exportToJSON(schools) {
  return JSON.stringify(schools, null, 2);
}

// Key websites to scrape from
export const scrapeSources = {
  directories: [
    {
      name: 'Israel Gap Year',
      url: 'https://www.israelgapyear.com',
      notes: 'Comprehensive directory of seminaries and yeshivas'
    },
    {
      name: 'Apply to Sem',
      url: 'https://www.applytosem.org',
      notes: 'Seminary application portal with listings'
    },
    {
      name: 'OU Israel Programs',
      url: 'https://www.ou.org/life/travel/israel-programs/',
      notes: 'Orthodox Union program listings'
    },
    {
      name: 'Nefesh B\'Nefesh',
      url: 'https://www.nbn.org.il',
      notes: 'Gap year and aliyah programs'
    }
  ],

  // Major seminaries to scrape individually
  majorSeminaries: [
    'Midreshet Lindenbaum',
    'Nishmat',
    'Michlalah',
    'Darchei Binah',
    'Tiferet',
    'Shaalvim for Women',
    'Naaleh',
    'Migdal Oz',
    'Matan',
    'Neve Yerushalayim',
    'MMY',
    'Hadar',
    'Tomer Devorah',
    'Machon Maayan',
    'Sha\'arei Bina',
    'Brovenders',
    'Baer Miriam',
    'Nachshon',
    'Machon Alte',
    'Ateret'
  ],

  // Major yeshivas to scrape individually
  majorYeshivas: [
    'Hakotel',
    'Orayta',
    'Ashreinu',
    'Lev Hatorah',
    'Aish HaTorah',
    'Or Somayach',
    'Machon Shlomo',
    'Shapell\'s',
    'Yeshivat Hamivtar',
    'Torat Shraga',
    'Netiv Aryeh',
    'Kerem B\'Yavneh',
    'Har Etzion',
    'Sha\'alvim',
    'Reishit',
    'Eretz HaTzvi',
    'Birkat Moshe',
    'Tiferet Tzvi'
  ]
};

export default {
  schoolTemplate,
  normalizeLocation,
  normalizeHashkafa,
  determineSchoolType,
  determineSize,
  parseCost,
  validateSchool,
  createSchoolFromData,
  exportToJSON,
  scrapeSources
};
