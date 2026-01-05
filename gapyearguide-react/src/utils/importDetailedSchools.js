import { schoolManager } from '../services/firebase';

/**
 * Import schools from detailed JSON data with complete school information
 *
 * Expected format: Array of school objects matching our Firebase schema
 */
export async function importDetailedSchools(schoolsData) {
  console.log(`Starting detailed import of ${schoolsData.length} schools...`);

  const results = {
    success: [],
    failed: [],
    skipped: [],
    updated: []
  };

  // Get existing schools to check for duplicates
  const existingSchoolsResult = await schoolManager.getAllSchools();
  const existingSchools = existingSchoolsResult.success ? existingSchoolsResult.schools : [];
  const existingNames = new Set(existingSchools.map(s => s.name.toLowerCase()));

  for (let i = 0; i < schoolsData.length; i++) {
    const schoolData = schoolsData[i];

    // Skip if no name
    if (!schoolData.name || schoolData.name.trim() === '') {
      results.skipped.push({ row: i + 1, reason: 'Empty school name' });
      continue;
    }

    try {
      // Check if school already exists
      const schoolNameLower = schoolData.name.toLowerCase();

      if (existingNames.has(schoolNameLower)) {
        console.log(`⊘ Skipped (already exists): ${schoolData.name}`);
        results.skipped.push({
          name: schoolData.name,
          reason: 'School already exists in database'
        });
        continue;
      }

      // Validate and set defaults for required fields
      const completeSchoolData = {
        name: schoolData.name.trim(),
        type: schoolData.type || 'seminary',
        location: schoolData.location || 'jerusalem',
        hashkafa: schoolData.hashkafa || 'modern-orthodox',
        size: schoolData.size || 'medium',
        studentCount: parseInt(schoolData.studentCount) || 100,
        cost: parseInt(schoolData.cost) || 24000,
        programFocus: schoolData.programFocus || 'Torah Study & Personal Growth',
        description: schoolData.description || '',
        website: schoolData.website || '',
        phone: schoolData.phone || '',
        email: schoolData.email || '',
        address: schoolData.address || '',
        applicationDeadline: schoolData.applicationDeadline || 'Contact school for details',
        academicLevel: schoolData.academicLevel || 'intermediate',

        meals: {
          perDay: parseInt(schoolData.meals?.perDay) || 3,
          included: schoolData.meals?.included || ['Breakfast', 'Lunch', 'Dinner']
        },

        shabbos: {
          pattern: schoolData.shabbos?.pattern || 'Contact school for details',
          details: schoolData.shabbos?.details || ''
        },

        distances: {
          kotel: schoolData.distances?.kotel || '',
          centerCity: schoolData.distances?.centerCity || '',
          shopping: schoolData.distances?.shopping || ''
        },

        shanaBet: {
          offered: schoolData.shanaBet?.offered || false,
          programType: schoolData.shanaBet?.programType || '',
          duration: schoolData.shanaBet?.duration || ''
        },

        chessed: {
          required: schoolData.chessed?.required || false,
          day: schoolData.chessed?.day || '',
          hours: schoolData.chessed?.hours || ''
        },

        amenities: {
          nearby: schoolData.amenities?.nearby || [],
          onSite: schoolData.amenities?.onSite || []
        },

        transportation: {
          buses: schoolData.transportation?.buses || [],
          taxiAvailability: schoolData.transportation?.taxiAvailability || 'Medium',
          walkability: schoolData.transportation?.walkability || 'Good'
        },

        delivery: {
          food: schoolData.delivery?.food || false,
          groceries: schoolData.delivery?.groceries || false,
          services: schoolData.delivery?.services || []
        },

        tags: schoolData.tags || []
      };

      const result = await schoolManager.addSchool(completeSchoolData);

      if (result.success) {
        results.success.push({
          name: completeSchoolData.name,
          location: completeSchoolData.location,
          id: result.schoolId
        });
        console.log(`✓ Imported: ${completeSchoolData.name} - ${completeSchoolData.location} (${i + 1}/${schoolsData.length})`);
      } else {
        results.failed.push({
          name: completeSchoolData.name,
          error: result.error
        });
        console.error(`✗ Failed: ${completeSchoolData.name} - ${result.error}`);
      }
    } catch (error) {
      results.failed.push({
        name: schoolData.name,
        error: error.message
      });
      console.error(`✗ Failed: ${schoolData.name} - ${error.message}`);
    }

    // Add a small delay to avoid overwhelming Firebase
    if (i % 5 === 0 && i > 0) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  console.log('\n=== Detailed Import Complete ===');
  console.log(`Success: ${results.success.length}`);
  console.log(`Failed: ${results.failed.length}`);
  console.log(`Skipped: ${results.skipped.length}`);

  if (results.failed.length > 0) {
    console.log('\nFailed imports:', results.failed);
  }

  if (results.skipped.length > 0) {
    console.log('\nSkipped:', results.skipped);
  }

  return results;
}
