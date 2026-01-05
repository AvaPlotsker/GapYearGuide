import { schoolManager } from '../services/firebase';

/**
 * Fix specific schools that were incorrectly marked as yeshivas
 * These are schools that should be seminaries
 */
export async function fixSpecificSchoolsToSeminary() {
  console.log('Fixing specific schools back to seminary...');

  const results = {
    checked: 0,
    updated: [],
    notFound: [],
    errors: []
  };

  // Schools that should be seminaries, not yeshivas
  const schoolsToFix = [
    'michlelet mevaseret yerushalayim',
    'sha\'alvim for women',
    'shaalvim for women',
    'midreshet lev hatorah',
    'aish gesher for women',
    'mevaseret'  // if it's the women's program
  ];

  try {
    // Get all schools
    const response = await schoolManager.getAllSchools();
    if (!response.success) {
      throw new Error('Failed to fetch schools');
    }

    const schools = response.schools;
    console.log(`Checking ${schools.length} schools...`);

    for (const schoolNameToFix of schoolsToFix) {
      results.checked++;

      // Find the school
      const school = schools.find(s =>
        s.name.toLowerCase().trim().includes(schoolNameToFix) ||
        s.name.toLowerCase().trim() === schoolNameToFix
      );

      if (!school) {
        console.log(`School not found: ${schoolNameToFix}`);
        results.notFound.push(schoolNameToFix);
        continue;
      }

      // Check if it needs updating
      if (school.type !== 'seminary') {
        console.log(`Updating ${school.name} from ${school.type} to seminary`);

        try {
          await schoolManager.updateSchool(school.id, {
            ...school,
            type: 'seminary'
          });

          results.updated.push({
            id: school.id,
            name: school.name,
            oldType: school.type,
            newType: 'seminary'
          });

          // Small delay to avoid overwhelming Firebase
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          console.error(`Error updating ${school.name}:`, error);
          results.errors.push({
            id: school.id,
            name: school.name,
            error: error.message
          });
        }
      } else {
        console.log(`${school.name} is already a seminary`);
      }
    }

    console.log('\n=== Specific Schools Fix Complete ===');
    console.log(`Schools checked: ${results.checked}`);
    console.log(`Schools updated: ${results.updated.length}`);
    console.log(`Not found: ${results.notFound.length}`);
    console.log(`Errors: ${results.errors.length}`);

    return results;
  } catch (error) {
    console.error('Fix failed:', error);
    results.errors.push({
      general: error.message
    });
    return results;
  }
}
