import { schoolManager } from '../services/firebase';

/**
 * Import schools from a JSON file into Firebase
 *
 * Usage:
 * 1. Convert your Excel file to JSON (using online converter or Excel's "Save As" feature)
 * 2. Place the JSON file in the public folder
 * 3. Run this function from the browser console or a temporary component
 */

export async function importSchoolsFromJSON(schoolsData) {
  console.log(`Starting import of ${schoolsData.length} schools...`);

  const results = {
    success: [],
    failed: []
  };

  for (let i = 0; i < schoolsData.length; i++) {
    const school = schoolsData[i];

    try {
      // Map your Excel columns to the school data structure
      // Adjust these field mappings based on your Excel columns
      const schoolData = {
        name: school.name || school['School Name'] || '',
        type: (school.type || school['Type'] || 'seminary').toLowerCase(),
        location: (school.location || school['Location'] || 'jerusalem').toLowerCase().replace(/\s+/g, '-'),
        hashkafa: (school.hashkafa || school['Hashkafa'] || 'modern-orthodox').toLowerCase().replace(/\s+/g, '-'),
        size: (school.size || school['Size'] || 'medium').toLowerCase(),
        studentCount: parseInt(school.studentCount || school['Student Count'] || 0),
        cost: parseInt(school.cost || school['Annual Cost'] || 0),
        programFocus: school.programFocus || school['Program Focus'] || '',
        description: school.description || school['Description'] || '',
        website: school.website || school['Website'] || '',
        phone: school.phone || school['Phone'] || '',
        email: school.email || school['Email'] || '',
        address: school.address || school['Address'] || '',
        applicationDeadline: school.applicationDeadline || school['Application Deadline'] || '',
        academicLevel: (school.academicLevel || school['Academic Level'] || 'intermediate').toLowerCase(),

        // Meals
        meals: {
          perDay: parseInt(school.mealsPerDay || school['Meals Per Day'] || 3),
          included: school.mealsIncluded
            ? (Array.isArray(school.mealsIncluded) ? school.mealsIncluded : school.mealsIncluded.split(',').map(s => s.trim()))
            : ['Breakfast', 'Lunch', 'Dinner']
        },

        // Shabbos
        shabbos: {
          pattern: school.shabbosPattern || school['Shabbos Pattern'] || '',
          details: school.shabbosDetails || school['Shabbos Details'] || ''
        },

        // Distances
        distances: {
          kotel: school.distanceToKotel || school['Distance to Kotel'] || '',
          centerCity: school.distanceToCenter || school['Distance to Center'] || '',
          shopping: school.distanceToShopping || school['Distance to Shopping'] || ''
        },

        // Shana Bet
        shanaBet: {
          offered: school.shanaBetOffered === true || school['Shana Bet Offered'] === 'Yes' || school['Shana Bet Offered'] === true || false,
          programType: school.shanaBetType || school['Shana Bet Type'] || 'student',
          duration: school.shanaBetDuration || school['Shana Bet Duration'] || 'full-year'
        },

        // Chessed
        chessed: {
          required: school.chessedRequired === true || school['Chessed Required'] === 'Yes' || false,
          day: school.chessedDay || school['Chessed Day'] || '',
          hours: school.chessedHours || school['Chessed Hours'] || '',
          opportunities: school.chessedOpportunities
            ? (Array.isArray(school.chessedOpportunities) ? school.chessedOpportunities : school.chessedOpportunities.split(',').map(s => s.trim()))
            : []
        },

        // Amenities
        amenities: {
          nearby: school.amenitiesNearby
            ? (Array.isArray(school.amenitiesNearby) ? school.amenitiesNearby : school.amenitiesNearby.split(',').map(s => s.trim()))
            : [],
          onSite: school.amenitiesOnSite
            ? (Array.isArray(school.amenitiesOnSite) ? school.amenitiesOnSite : school.amenitiesOnSite.split(',').map(s => s.trim()))
            : []
        },

        // Transportation
        transportation: {
          buses: school.buses
            ? (Array.isArray(school.buses) ? school.buses : school.buses.split(',').map(s => s.trim()))
            : [],
          taxiAvailability: school.taxiAvailability || school['Taxi Availability'] || 'Medium',
          walkability: school.walkability || school['Walkability'] || 'Good'
        },

        // Delivery
        delivery: {
          food: school.foodDelivery === true || school['Food Delivery'] === 'Yes' || false,
          groceries: school.groceryDelivery === true || school['Grocery Delivery'] === 'Yes' || false,
          services: school.deliveryServices
            ? (Array.isArray(school.deliveryServices) ? school.deliveryServices : school.deliveryServices.split(',').map(s => s.trim()))
            : []
        },

        // Tags
        tags: school.tags
          ? (Array.isArray(school.tags) ? school.tags : school.tags.split(',').map(s => s.trim()))
          : []
      };

      const result = await schoolManager.addSchool(schoolData);

      if (result.success) {
        results.success.push({ name: schoolData.name, id: result.schoolId });
        console.log(`✓ Imported: ${schoolData.name} (${i + 1}/${schoolsData.length})`);
      } else {
        results.failed.push({ name: schoolData.name, error: result.error });
        console.error(`✗ Failed: ${schoolData.name} - ${result.error}`);
      }
    } catch (error) {
      results.failed.push({ name: school.name, error: error.message });
      console.error(`✗ Failed: ${school.name} - ${error.message}`);
    }
  }

  console.log('\n=== Import Complete ===');
  console.log(`Success: ${results.success.length}`);
  console.log(`Failed: ${results.failed.length}`);

  if (results.failed.length > 0) {
    console.log('\nFailed imports:', results.failed);
  }

  return results;
}

/**
 * Sample usage - call this from browser console:
 *
 * import { importSchoolsFromJSON } from './utils/importSchools';
 *
 * const data = [ your JSON array ];
 * importSchoolsFromJSON(data);
 */
