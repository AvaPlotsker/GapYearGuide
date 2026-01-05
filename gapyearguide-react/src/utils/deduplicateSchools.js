import { schoolManager } from '../services/firebase';

/**
 * Find and remove duplicate schools from Firebase
 * Keeps the most recently added version of each duplicate
 */
export async function deduplicateSchools() {
  console.log('Starting deduplication process...');

  const results = {
    duplicatesFound: [],
    duplicatesRemoved: [],
    errors: []
  };

  try {
    // Get all schools
    const response = await schoolManager.getAllSchools();
    if (!response.success) {
      throw new Error('Failed to fetch schools');
    }

    const schools = response.schools;
    console.log(`Found ${schools.length} total schools`);

    // Group schools by name (case-insensitive)
    const schoolsByName = {};

    schools.forEach(school => {
      const nameLower = school.name.toLowerCase().trim();
      if (!schoolsByName[nameLower]) {
        schoolsByName[nameLower] = [];
      }
      schoolsByName[nameLower].push(school);
    });

    // Find duplicates
    for (const [name, duplicateSchools] of Object.entries(schoolsByName)) {
      if (duplicateSchools.length > 1) {
        console.log(`Found ${duplicateSchools.length} duplicates of: ${duplicateSchools[0].name}`);

        results.duplicatesFound.push({
          name: duplicateSchools[0].name,
          count: duplicateSchools.length,
          schools: duplicateSchools.map(s => ({
            id: s.id,
            location: s.location,
            cost: s.cost,
            hasWebsite: !!s.website,
            hasPhone: !!s.phone
          }))
        });

        // Sort by completeness (more info = keep this one)
        // Criteria: has website, has phone, has email, has description length
        duplicateSchools.sort((a, b) => {
          const scoreA =
            (a.website ? 10 : 0) +
            (a.phone ? 10 : 0) +
            (a.email ? 10 : 0) +
            (a.description?.length || 0) / 10;

          const scoreB =
            (b.website ? 10 : 0) +
            (b.phone ? 10 : 0) +
            (b.email ? 10 : 0) +
            (b.description?.length || 0) / 10;

          return scoreB - scoreA; // Higher score first (most complete)
        });

        // Keep the first one (most complete), delete the rest
        const toKeep = duplicateSchools[0];
        const toDelete = duplicateSchools.slice(1);

        console.log(`  Keeping: ${toKeep.id} (website: ${!!toKeep.website}, phone: ${!!toKeep.phone})`);

        for (const school of toDelete) {
          try {
            console.log(`  Deleting: ${school.id}`);
            await schoolManager.deleteSchool(school.id);
            results.duplicatesRemoved.push({
              id: school.id,
              name: school.name,
              location: school.location
            });

            // Small delay to avoid overwhelming Firebase
            await new Promise(resolve => setTimeout(resolve, 200));
          } catch (error) {
            console.error(`  Error deleting ${school.id}:`, error);
            results.errors.push({
              id: school.id,
              name: school.name,
              error: error.message
            });
          }
        }
      }
    }

    console.log('\n=== Deduplication Complete ===');
    console.log(`Duplicate sets found: ${results.duplicatesFound.length}`);
    console.log(`Schools removed: ${results.duplicatesRemoved.length}`);
    console.log(`Errors: ${results.errors.length}`);

    return results;
  } catch (error) {
    console.error('Deduplication failed:', error);
    results.errors.push({
      general: error.message
    });
    return results;
  }
}
