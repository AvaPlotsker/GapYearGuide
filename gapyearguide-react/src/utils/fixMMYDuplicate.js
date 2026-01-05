import { schoolManager } from '../services/firebase';

/**
 * Fix the Michlelet Mevaseret Yerushalayim duplicate
 * Keep the one with more info, add (MMY) to its name, delete the other
 */
export async function fixMMYDuplicate() {
  console.log('Fixing MMY duplicate...');

  const results = {
    found: [],
    kept: null,
    deleted: null,
    renamed: false,
    error: null
  };

  try {
    // Get all schools
    const response = await schoolManager.getAllSchools();
    if (!response.success) {
      throw new Error('Failed to fetch schools');
    }

    const schools = response.schools;

    // Find all MMY variants
    const mmySchools = schools.filter(s => {
      const nameLower = s.name.toLowerCase().trim();
      return nameLower.includes('michlelet mevaseret') ||
             nameLower.includes('mevaseret yerushalayim') ||
             nameLower === 'mmy';
    });

    console.log(`Found ${mmySchools.length} MMY schools:`, mmySchools.map(s => s.name));
    results.found = mmySchools.map(s => ({ id: s.id, name: s.name }));

    if (mmySchools.length < 2) {
      console.log('No duplicates found');
      return results;
    }

    // Sort by completeness (more info = higher score)
    mmySchools.sort((a, b) => {
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

    const toKeep = mmySchools[0];
    const toDelete = mmySchools.slice(1);

    console.log(`Keeping: ${toKeep.name} (ID: ${toKeep.id})`);
    console.log(`Deleting: ${toDelete.map(s => `${s.name} (ID: ${s.id})`).join(', ')}`);

    // Add (MMY) to the name if it doesn't already have it
    if (!toKeep.name.includes('(MMY)')) {
      const newName = `${toKeep.name} (MMY)`;
      console.log(`Renaming to: ${newName}`);

      await schoolManager.updateSchool(toKeep.id, {
        ...toKeep,
        name: newName
      });

      results.renamed = true;
      results.kept = {
        id: toKeep.id,
        oldName: toKeep.name,
        newName: newName
      };
    } else {
      results.kept = {
        id: toKeep.id,
        name: toKeep.name
      };
    }

    // Delete the duplicates
    const deletedSchools = [];
    for (const school of toDelete) {
      console.log(`Deleting: ${school.name} (ID: ${school.id})`);
      await schoolManager.deleteSchool(school.id);
      deletedSchools.push({
        id: school.id,
        name: school.name
      });

      // Small delay
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    results.deleted = deletedSchools;

    console.log('\n=== MMY Duplicate Fix Complete ===');
    console.log(`Kept: ${results.kept.newName || results.kept.name}`);
    console.log(`Deleted: ${results.deleted.length} duplicate(s)`);

    return results;
  } catch (error) {
    console.error('MMY duplicate fix failed:', error);
    results.error = error.message;
    return results;
  }
}
