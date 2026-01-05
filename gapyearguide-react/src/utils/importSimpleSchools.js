import { schoolManager } from '../services/firebase';

/**
 * Import schools from a simple Excel file with just names and locations
 *
 * Expected columns:
 * - Column 1: School names (sems/yeshivas)
 * - Column 2: Location
 * - Column 3: (untitled - will be ignored)
 */

export async function importSimpleSchools(excelData) {
  console.log(`Starting import of ${excelData.length} schools...`);

  const results = {
    success: [],
    failed: [],
    skipped: []
  };

  for (let i = 0; i < excelData.length; i++) {
    const row = excelData[i];

    // Get the first two columns regardless of header names
    const keys = Object.keys(row);
    const schoolName = row[keys[0]]; // First column = school name
    const location = row[keys[1]]; // Second column = location

    // Skip empty rows
    if (!schoolName || schoolName.trim() === '') {
      results.skipped.push({ row: i + 1, reason: 'Empty school name' });
      continue;
    }

    try {
      // Determine if it's a seminary or yeshiva based on the name
      const schoolNameLower = schoolName.toLowerCase();
      let schoolType = 'seminary'; // default

      if (schoolNameLower.includes('yeshiva') ||
          schoolNameLower.includes('yeshivah') ||
          schoolNameLower.includes('kollel')) {
        schoolType = 'yeshiva';
      }

      // Clean up location
      let cleanLocation = (location || 'jerusalem').toLowerCase().trim();

      // Map common location variations
      const locationMap = {
        'yerushalayim': 'jerusalem',
        'jlem': 'jerusalem',
        'j-m': 'jerusalem',
        'ramat beit shemesh': 'beit-shemesh',
        'rbs': 'beit-shemesh',
        'beit shemesh': 'beit-shemesh',
        'tzfat': 'safed',
        'tsfat': 'safed',
        'telz stone': 'telz-stone'
      };

      cleanLocation = locationMap[cleanLocation] || cleanLocation.replace(/\s+/g, '-');

      const schoolData = {
        name: schoolName.trim(),
        type: schoolType,
        location: cleanLocation,
        hashkafa: 'modern-orthodox', // default - can be updated later in Admin
        size: 'medium',
        studentCount: 100,
        cost: 24000,
        programFocus: 'Torah Study & Personal Growth',
        description: `A ${schoolType} program located in ${cleanLocation}. More details to be added.`,
        website: '',
        phone: '',
        email: '',
        address: `${cleanLocation}, Israel`,
        applicationDeadline: 'Contact school for details',
        academicLevel: 'intermediate',

        meals: {
          perDay: 3,
          included: ['Breakfast', 'Lunch', 'Dinner']
        },

        shabbos: {
          pattern: 'Contact school for details',
          details: ''
        },

        distances: {
          kotel: '',
          centerCity: '',
          shopping: ''
        },

        shanaBet: {
          offered: false,
          programType: '',
          duration: ''
        },

        chessed: {
          required: false,
          day: '',
          hours: '',
          opportunities: []
        },

        amenities: {
          nearby: [],
          onSite: []
        },

        transportation: {
          buses: [],
          taxiAvailability: 'Medium',
          walkability: 'Good'
        },

        delivery: {
          food: false,
          groceries: false,
          services: []
        },

        tags: []
      };

      const result = await schoolManager.addSchool(schoolData);

      if (result.success) {
        results.success.push({
          name: schoolData.name,
          location: schoolData.location,
          id: result.schoolId
        });
        console.log(`✓ Imported: ${schoolData.name} - ${schoolData.location} (${i + 1}/${excelData.length})`);
      } else {
        results.failed.push({
          name: schoolData.name,
          error: result.error
        });
        console.error(`✗ Failed: ${schoolData.name} - ${result.error}`);
      }
    } catch (error) {
      results.failed.push({
        name: schoolName,
        error: error.message
      });
      console.error(`✗ Failed: ${schoolName} - ${error.message}`);
    }

    // Add a small delay to avoid overwhelming Firebase
    if (i % 10 === 0 && i > 0) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  console.log('\n=== Import Complete ===');
  console.log(`Success: ${results.success.length}`);
  console.log(`Failed: ${results.failed.length}`);
  console.log(`Skipped: ${results.skipped.length}`);

  if (results.failed.length > 0) {
    console.log('\nFailed imports:', results.failed);
  }

  if (results.skipped.length > 0) {
    console.log('\nSkipped rows:', results.skipped);
  }

  return results;
}
