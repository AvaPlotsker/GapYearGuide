// Sample school data
const schoolsData = [
    {
        id: 1,
        name: "Michlalah Jerusalem College",
        type: "seminary",
        location: "jerusalem",
        hashkafa: "modern-orthodox",
        size: "large",
        studentCount: 180,
        cost: 24000,
        programFocus: "Academic & Spiritual Growth",
        description: "A well-established seminary offering a balanced program of Torah learning and personal development. Known for excellent teaching staff and warm environment.",
        website: "https://www.michlalah.edu",
        phone: "+972-2-532-3567",
        email: "info@michlalah.edu",
        address: "Bayit Vegan, Jerusalem",
        applicationDeadline: "April 15, 2025",
        rating: 4.7,
        reviewCount: 89,
        photos: ["photo1.jpg", "photo2.jpg"],
        meals: {
            perDay: 3,
            included: ["Breakfast", "Lunch", "Dinner"]
        },
        shabbos: {
            pattern: "in/out/away",
            details: "First Shabbat in, second out, third away with families"
        },
        distances: {
            kotel: "4.2 km",
            centerCity: "3.8 km",
            shopping: "1.2 km"
        },
        amenities: {
            nearby: ["Supermarket", "Pharmacy", "Cafe", "Bookstore"],
            onSite: ["Library", "Computer Lab", "Study Halls", "Gym"]
        },
        transportation: {
            buses: ["18", "20", "74"],
            taxiAvailability: "High",
            walkability: "Good"
        },
        delivery: {
            food: true,
            groceries: true,
            services: ["Wolt", "Tenbis", "Yango Deli"]
        },
        tags: ["Academic", "Well-Established", "Warm Environment"],
        academicLevel: "intermediate",
        shanaBet: {
            offered: true,
            programType: "both",
            duration: "full-year"
        },
        chessed: {
            day: "Wednesday",
            opportunities: ["Ezer Mizion", "Yad Sarah", "Special Needs Programs", "Hospital Visits", "Food Distribution"]
        }
    },
    {
        id: 2,
        name: "Hakotel Academy",
        type: "yeshiva",
        location: "jerusalem",
        hashkafa: "modern-orthodox",
        size: "large",
        studentCount: 200,
        cost: 26000,
        programFocus: "Intensive Torah Study",
        description: "Located in the Old City with unparalleled access to the Kotel. Intensive learning program with diverse student body from around the world.",
        website: "https://www.hakotel.org",
        phone: "+972-2-627-1578",
        email: "admissions@hakotel.org",
        address: "Jewish Quarter, Old City, Jerusalem",
        applicationDeadline: "March 30, 2025",
        rating: 4.8,
        reviewCount: 124,
        photos: ["photo1.jpg"],
        meals: {
            perDay: 3,
            included: ["Breakfast", "Lunch", "Dinner"]
        },
        shabbos: {
            pattern: "in/in/out",
            details: "Two Shabbatot in, one out with host families"
        },
        distances: {
            kotel: "0.3 km",
            centerCity: "2.1 km",
            shopping: "2.5 km"
        },
        amenities: {
            nearby: ["Kotel", "Jewish Quarter Shops", "Restaurants"],
            onSite: ["Beit Midrash", "Dorms", "Kitchen"]
        },
        transportation: {
            buses: ["1", "3", "38"],
            taxiAvailability: "High",
            walkability: "Excellent"
        },
        delivery: {
            food: true,
            groceries: false,
            services: ["Wolt", "Tenbis"]
        },
        tags: ["Old City Location", "Intensive", "Diverse Community"],
        academicLevel: "advanced",
        shanaBet: {
            offered: true,
            programType: "student",
            duration: "full-year"
        },
        chessed: {
            day: "Thursday",
            opportunities: ["Old City Soup Kitchen", "Kotel Plaza Assistance", "Children's Programs", "Senior Homes", "Torah Tutoring"]
        }
    },
    {
        id: 3,
        name: "Darchei Binah",
        type: "seminary",
        location: "jerusalem",
        hashkafa: "yeshivish",
        size: "medium",
        studentCount: 120,
        cost: 22500,
        programFocus: "Personal Growth & Torah",
        description: "Focuses on personal growth and building strong Torah foundations. Known for individualized attention and mentorship.",
        website: "https://www.darcheibinah.org",
        phone: "+972-2-581-3456",
        email: "office@darcheibinah.org",
        address: "Har Nof, Jerusalem",
        applicationDeadline: "April 20, 2025",
        rating: 4.6,
        reviewCount: 67,
        photos: ["photo1.jpg", "photo2.jpg", "photo3.jpg"],
        meals: {
            perDay: 2,
            included: ["Breakfast", "Dinner"]
        },
        shabbos: {
            pattern: "out/out/in",
            details: "Two Shabbatot out, one in seminary"
        },
        distances: {
            kotel: "6.5 km",
            centerCity: "5.2 km",
            shopping: "0.8 km"
        },
        amenities: {
            nearby: ["Shopping Center", "Park", "Shuls"],
            onSite: ["Study Halls", "Lounge", "Laundry"]
        },
        transportation: {
            buses: ["56", "48", "40"],
            taxiAvailability: "Medium",
            walkability: "Good"
        },
        delivery: {
            food: true,
            groceries: true,
            services: ["Wolt", "Tenbis", "Yango Deli", "Rami Levy Delivery"]
        },
        tags: ["Personal Growth", "Mentorship", "Small Classes"],
        academicLevel: "beginner",
        shanaBet: {
            offered: true,
            programType: "madricha",
            duration: "both"
        },
        chessed: {
            day: "Wednesday",
            opportunities: ["Har Nof Special Ed", "Tomchei Shabbos", "Bikur Cholim", "Local Kindergartens", "Pantry Distribution"]
        }
    },
    {
        id: 4,
        name: "Machon Maayan",
        type: "seminary",
        location: "jerusalem",
        hashkafa: "modern-orthodox",
        size: "small",
        studentCount: 45,
        cost: 21000,
        programFocus: "In-Depth Learning",
        description: "Intimate setting with focus on in-depth textual analysis. Perfect for students seeking serious academic challenge.",
        website: "https://www.machonmaayan.org",
        phone: "+972-2-563-7890",
        email: "info@machonmaayan.org",
        address: "Katamon, Jerusalem",
        applicationDeadline: "May 1, 2025",
        rating: 4.9,
        reviewCount: 34,
        photos: ["photo1.jpg"],
        meals: {
            perDay: 2,
            included: ["Breakfast", "Lunch"]
        },
        shabbos: {
            pattern: "out/out/out",
            details: "All Shabbatot with host families"
        },
        distances: {
            kotel: "3.8 km",
            centerCity: "2.1 km",
            shopping: "0.5 km"
        },
        amenities: {
            nearby: ["Emek Refaim Street", "Cafes", "Shops", "Park"],
            onSite: ["Library", "Study Room", "Kitchen"]
        },
        transportation: {
            buses: ["4", "14", "18"],
            taxiAvailability: "High",
            walkability: "Excellent"
        },
        delivery: {
            food: true,
            groceries: true,
            services: ["Wolt", "Tenbis", "Yango Deli"]
        },
        tags: ["Intimate", "Academic", "In-Depth Learning"],
        academicLevel: "intermediate",
        shanaBet: {
            offered: false,
            programType: null,
            duration: null
        },
        chessed: {
            day: "Thursday",
            opportunities: ["Tutoring Programs", "Community Garden", "Women's Shelters", "Emek Refaim Programs", "Elderly Companionship"]
        }
    },
    {
        id: 5,
        name: "Shaalvim for Women",
        type: "seminary",
        location: "jerusalem",
        hashkafa: "modern-orthodox",
        size: "medium",
        studentCount: 95,
        cost: 23500,
        programFocus: "Leadership & Torah",
        description: "Empowering young women to become Torah leaders. Strong focus on Tanach and Jewish philosophy.",
        website: "https://www.shaalvim.org",
        phone: "+972-2-997-6543",
        email: "women@shaalvim.org",
        address: "Bayit Vegan, Jerusalem",
        applicationDeadline: "April 10, 2025",
        rating: 4.8,
        reviewCount: 78,
        photos: ["photo1.jpg", "photo2.jpg"],
        meals: {
            perDay: 3,
            included: ["Breakfast", "Lunch", "Dinner"]
        },
        shabbos: {
            pattern: "in/out/in",
            details: "Alternating in and out"
        },
        distances: {
            kotel: "5.1 km",
            centerCity: "4.2 km",
            shopping: "1.5 km"
        },
        amenities: {
            nearby: ["Park", "Shopping", "Shuls"],
            onSite: ["Beit Midrash", "Gym", "Computer Lab", "Music Room"]
        },
        transportation: {
            buses: ["18", "20", "19"],
            taxiAvailability: "High",
            walkability: "Good"
        },
        delivery: {
            food: true,
            groceries: true,
            services: ["Wolt", "Tenbis", "Yango Deli"]
        },
        tags: ["Leadership", "Tanach Focus", "Philosophy"],
        academicLevel: "mixed",
        shanaBet: {
            offered: true,
            programType: "both",
            duration: "both"
        },
        chessed: {
            day: "Tuesday",
            opportunities: ["Chaiyanu - Special Needs", "Shalva", "Shaare Zedek Hospital", "Meals on Wheels", "Youth Mentoring"]
        }
    },
    {
        id: 6,
        name: "Yeshivat Orayta",
        type: "yeshiva",
        location: "jerusalem",
        hashkafa: "modern-orthodox",
        size: "medium",
        studentCount: 110,
        cost: 25000,
        programFocus: "Gemara & Jewish Thought",
        description: "Rigorous Gemara learning combined with Jewish thought. Located in the Old City near the Kotel.",
        website: "https://www.orayta.org",
        phone: "+972-2-628-4567",
        email: "office@orayta.org",
        address: "Jewish Quarter, Old City, Jerusalem",
        applicationDeadline: "March 25, 2025",
        rating: 4.7,
        reviewCount: 92,
        photos: ["photo1.jpg", "photo2.jpg"],
        meals: {
            perDay: 3,
            included: ["Breakfast", "Lunch", "Dinner"]
        },
        shabbos: {
            pattern: "in/in/in",
            details: "Most Shabbatot in yeshiva"
        },
        distances: {
            kotel: "0.2 km",
            centerCity: "2.0 km",
            shopping: "2.3 km"
        },
        amenities: {
            nearby: ["Kotel", "Jewish Quarter", "Restaurants"],
            onSite: ["Beit Midrash", "Library", "Dining Hall", "Dorms"]
        },
        transportation: {
            buses: ["1", "3", "38"],
            taxiAvailability: "High",
            walkability: "Excellent"
        },
        delivery: {
            food: true,
            groceries: false,
            services: ["Wolt"]
        },
        tags: ["Old City", "Gemara Focus", "Rigorous"],
        academicLevel: "advanced",
        shanaBet: {
            offered: true,
            programType: "student",
            duration: "half-year"
        },
        chessed: {
            day: "Wednesday",
            opportunities: ["Kotel Outreach", "Old City Tours for At-Risk Youth", "Learning Programs", "Food Packing", "Hospital Chaplaincy"]
        }
    },
    {
        id: 7,
        name: "Tomer Devorah",
        type: "seminary",
        location: "ramat-beit-shemesh",
        hashkafa: "chassidish",
        size: "small",
        studentCount: 40,
        cost: 20000,
        programFocus: "Chassidus & Inspiration",
        description: "Warm, inspirational environment with focus on Chassidus and personal connection to Yiddishkeit.",
        website: "https://www.tomerdevorah.org",
        phone: "+972-2-999-8765",
        email: "info@tomerdevorah.org",
        address: "Ramat Beit Shemesh Aleph",
        applicationDeadline: "April 30, 2025",
        rating: 4.5,
        reviewCount: 28,
        photos: ["photo1.jpg"],
        meals: {
            perDay: 3,
            included: ["Breakfast", "Lunch", "Dinner"]
        },
        shabbos: {
            pattern: "in/in/out",
            details: "Two Shabbatot in, one out"
        },
        distances: {
            kotel: "32 km",
            centerCity: "35 km",
            shopping: "0.3 km"
        },
        amenities: {
            nearby: ["Shopping Centers", "Parks", "Community"],
            onSite: ["Study Halls", "Kitchen", "Lounge"]
        },
        transportation: {
            buses: ["400", "418", "497"],
            taxiAvailability: "Medium",
            walkability: "Good"
        },
        delivery: {
            food: true,
            groceries: true,
            services: ["Yango Deli", "Local Delivery"]
        },
        tags: ["Chassidish", "Warm", "Inspirational"],
        academicLevel: "beginner",
        shanaBet: {
            offered: false,
            programType: null,
            duration: null
        },
        chessed: {
            day: "Sunday",
            opportunities: ["Local Community Programs", "Beit Shemesh Food Bank", "Special Needs Activities", "After-School Programs", "Elderly Visits"]
        }
    },
    {
        id: 8,
        name: "Nishmat",
        type: "seminary",
        location: "jerusalem",
        hashkafa: "modern-orthodox",
        size: "medium",
        studentCount: 85,
        cost: 27000,
        programFocus: "Advanced Talmud Study",
        description: "Advanced learning program for women interested in serious Talmud study and halakhic reasoning.",
        website: "https://www.nishmat.net",
        phone: "+972-2-652-1234",
        email: "admissions@nishmat.net",
        address: "Bayit Vegan, Jerusalem",
        applicationDeadline: "March 15, 2025",
        rating: 4.9,
        reviewCount: 112,
        photos: ["photo1.jpg", "photo2.jpg", "photo3.jpg"],
        meals: {
            perDay: 2,
            included: ["Breakfast", "Lunch"]
        },
        shabbos: {
            pattern: "out/out/out",
            details: "All Shabbatot with host families"
        },
        distances: {
            kotel: "4.5 km",
            centerCity: "3.9 km",
            shopping: "1.0 km"
        },
        amenities: {
            nearby: ["Shopping", "Cafes", "Park"],
            onSite: ["Extensive Library", "Computer Lab", "Study Halls", "Kitchen"]
        },
        transportation: {
            buses: ["18", "20", "74"],
            taxiAvailability: "High",
            walkability: "Good"
        },
        delivery: {
            food: true,
            groceries: true,
            services: ["Wolt", "Tenbis", "Yango Deli"]
        },
        tags: ["Advanced", "Talmud", "Halakha"],
        academicLevel: "advanced",
        shanaBet: {
            offered: true,
            programType: "madricha",
            duration: "full-year"
        },
        chessed: {
            day: "Tuesday",
            opportunities: ["Yad Sarah Medical Equipment", "Hospital Volunteering", "Learning with Local Teens", "Soup Kitchen", "Crisis Hotline Support"]
        }
    },
    {
        id: 9,
        name: "Yeshivat Ashreinu",
        type: "yeshiva",
        location: "bnei-brak",
        hashkafa: "yeshivish",
        size: "small",
        studentCount: 35,
        cost: 19500,
        programFocus: "Intensive Gemara",
        description: "Small yeshiva with intensive focus on Gemara b'iyun. Very personalized learning experience.",
        website: "https://www.ashreinu.org",
        phone: "+972-3-618-9876",
        email: "office@ashreinu.org",
        address: "Central Bnei Brak",
        applicationDeadline: "May 15, 2025",
        rating: 4.6,
        reviewCount: 21,
        photos: ["photo1.jpg"],
        meals: {
            perDay: 3,
            included: ["Breakfast", "Lunch", "Dinner"]
        },
        shabbos: {
            pattern: "in/out/in",
            details: "Alternating in and out"
        },
        distances: {
            kotel: "18 km",
            centerCity: "15 km",
            shopping: "0.2 km"
        },
        amenities: {
            nearby: ["Shuls", "Supermarkets", "Seforim Stores"],
            onSite: ["Beit Midrash", "Dorms", "Kitchen"]
        },
        transportation: {
            buses: ["24", "53", "83"],
            taxiAvailability: "High",
            walkability: "Excellent"
        },
        delivery: {
            food: true,
            groceries: true,
            services: ["Wolt", "Tenbis", "Yango Deli"]
        },
        tags: ["Small", "Intensive", "Personalized"],
        academicLevel: "intermediate",
        shanaBet: {
            offered: false,
            programType: null,
            duration: null
        },
        chessed: {
            day: "Thursday",
            opportunities: ["Kollel Avreichim Families", "Torah Learning with Children", "Ezrat Achim", "Community Chesed Center", "Shabbos Packages"]
        }
    },
    {
        id: 10,
        name: "Midreshet Rachel V'Chaya",
        type: "seminary",
        location: "jerusalem",
        hashkafa: "mixed",
        size: "large",
        studentCount: 165,
        cost: 23000,
        programFocus: "Diverse Learning Tracks",
        description: "Offers multiple tracks to accommodate different learning styles and backgrounds. Very diverse student body.",
        website: "https://www.midreshetrvc.org",
        phone: "+972-2-567-3456",
        email: "info@midreshetrvc.org",
        address: "Mekor Baruch, Jerusalem",
        applicationDeadline: "April 5, 2025",
        rating: 4.7,
        reviewCount: 143,
        photos: ["photo1.jpg", "photo2.jpg"],
        meals: {
            perDay: 3,
            included: ["Breakfast", "Lunch", "Dinner"]
        },
        shabbos: {
            pattern: "in/out/away",
            details: "Rotating schedule with various options"
        },
        distances: {
            kotel: "2.8 km",
            centerCity: "1.5 km",
            shopping: "0.4 km"
        },
        amenities: {
            nearby: ["Machane Yehuda Market", "Cafes", "Shopping"],
            onSite: ["Multiple Study Halls", "Computer Lab", "Gym", "Music Room"]
        },
        transportation: {
            buses: ["2", "4", "13", "20"],
            taxiAvailability: "High",
            walkability: "Excellent"
        },
        delivery: {
            food: true,
            groceries: true,
            services: ["Wolt", "Tenbis", "Yango Deli", "Ten Bis"]
        },
        tags: ["Diverse", "Multiple Tracks", "Central Location"],
        academicLevel: "mixed",
        shanaBet: {
            offered: true,
            programType: "both",
            duration: "both"
        },
        chessed: {
            day: "Wednesday",
            opportunities: ["Machane Yehuda Outreach", "Matnat Beit Yisrael", "Youth at Risk Programs", "Refugee Assistance", "Pantry Sorting"]
        }
    }
];

import { schoolManager } from '../services/firebase';

// Cache for schools to avoid repeated Firebase calls
let schoolsCache = null;
let lastFetchTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to get schools - tries Firebase first, falls back to local data
async function getSchoolsAsync() {
    try {
        // Check if cache is still valid
        if (schoolsCache && lastFetchTime && (Date.now() - lastFetchTime < CACHE_DURATION)) {
            return schoolsCache;
        }

        // Fetch from Firebase
        const result = await schoolManager.getAllSchools();
        if (result.success && result.schools.length > 0) {
            schoolsCache = result.schools;
            lastFetchTime = Date.now();
            return result.schools;
        }

        // Fall back to local data if Firebase has no schools
        return schoolsData;
    } catch (error) {
        console.error('Error fetching schools:', error);
        // Fall back to local data on error
        return schoolsData;
    }
}

// Synchronous version for backward compatibility - returns local data
function getSchools() {
    // Return cached Firebase data if available, otherwise local data
    return schoolsCache || schoolsData;
}

// Helper function to get school by ID
function getSchoolById(id) {
    const schools = schoolsCache || schoolsData;
    // Handle both numeric and string IDs
    return schools.find(school => school.id === id || school.id === parseInt(id) || school.id === String(id));
}

// Clear cache function (useful after adding/editing/deleting schools)
function clearSchoolsCache() {
    schoolsCache = null;
    lastFetchTime = null;
}

export { schoolsData, getSchools, getSchoolById, getSchoolsAsync, clearSchoolsCache };
