import { schoolManager } from '../services/firebase';

/**
 * Fix school types by detecting yeshivas based on name
 * Updates schools that should be yeshivas but are marked as seminaries
 */
export async function fixSchoolTypes() {
  console.log('Starting school type fix...');

  const results = {
    checked: 0,
    updated: [],
    alreadyCorrect: [],
    errors: []
  };

  try {
    // Get all schools
    const response = await schoolManager.getAllSchools();
    if (!response.success) {
      throw new Error('Failed to fetch schools');
    }

    const schools = response.schools;
    console.log(`Checking ${schools.length} schools for type corrections...`);

    // Seminary indicators (these override yeshiva detection)
    const seminaryKeywords = [
      'for women',
      'for girls',
      'midreshet',
      'midrasha',
      'seminary',
      'michlelet',
      'women\'s'
    ];

    // Common yeshiva keywords
    const yeshivaKeywords = [
      'yeshiva',
      'yeshivah',
      'yeshivat',
      'kollel',
      'beis medrash',
      'beit medrash',
      'bros',
      'for boys',
      'for men'
    ];

    // Specific yeshiva names (case-insensitive matching)
    // ONLY include the men's versions, not women's programs
    const knownYeshivas = [
      'aish hatorah',
      'ashreinu',
      'derech eitz chaim',
      'derech ohr sameach',
      'eretz hatzvi',
      'kerem b\'yavneh',
      'kby',
      'mercaz harav',
      'migdal hatorah',
      'moreshet yerushalaim',
      'netiv aryeh',
      'ohr somayach',
      'orayta',
      'reishit',
      'ruach hanegev',
      'shraga',
      'torat moshe',
      'tomo',
      'torah tech',
      'torat chaim',
      'yeshivat hakotel',
      'yeshivat har etzion',
      'har etzion',
      'yishrei lev',
      'ytva'
    ];

    // Exact matches only (to avoid catching "Sha'alvim for Women" when looking for "Sha'alvim")
    const exactYeshivaNames = [
      'aish gesher',  // NOT "Aish Gesher for Women"
      'efg @aish',
      'efg @ aish',
      'hakotel',
      'gush',
      'sha\'alvim',   // NOT "Sha'alvim for Women"
      'shaalvim'      // NOT "Sha'alvim for Women"
    ];

    for (const school of schools) {
      results.checked++;
      const nameLower = school.name.toLowerCase().trim();

      // First check if it's clearly a seminary
      const isSeminary = seminaryKeywords.some(keyword => nameLower.includes(keyword));

      if (isSeminary) {
        // Skip this school - it's a seminary
        results.alreadyCorrect.push({
          id: school.id,
          name: school.name,
          type: school.type
        });
        continue;
      }

      // Check if name contains yeshiva keywords
      const hasYeshivaKeyword = yeshivaKeywords.some(keyword => nameLower.includes(keyword));

      // Check if it's a known yeshiva name (partial match)
      const isKnownYeshiva = knownYeshivas.some(yeshivaName => {
        return nameLower.includes(yeshivaName);
      });

      // Check exact matches
      const isExactYeshiva = exactYeshivaNames.some(yeshivaName => {
        return nameLower === yeshivaName;
      });

      const shouldBeYeshiva = hasYeshivaKeyword || isKnownYeshiva || isExactYeshiva;

      if (shouldBeYeshiva && school.type !== 'yeshiva') {
        // Need to update to yeshiva
        console.log(`Updating ${school.name} from ${school.type} to yeshiva`);

        try {
          await schoolManager.updateSchool(school.id, {
            ...school,
            type: 'yeshiva'
          });

          results.updated.push({
            id: school.id,
            name: school.name,
            oldType: school.type,
            newType: 'yeshiva'
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
        results.alreadyCorrect.push({
          id: school.id,
          name: school.name,
          type: school.type
        });
      }
    }

    console.log('\n=== Type Fix Complete ===');
    console.log(`Schools checked: ${results.checked}`);
    console.log(`Schools updated: ${results.updated.length}`);
    console.log(`Already correct: ${results.alreadyCorrect.length}`);
    console.log(`Errors: ${results.errors.length}`);

    return results;
  } catch (error) {
    console.error('Type fix failed:', error);
    results.errors.push({
      general: error.message
    });
    return results;
  }
}
