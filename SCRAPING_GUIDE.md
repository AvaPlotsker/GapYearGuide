# School Scraping Guide

## Quick Start

You now have a complete system to scrape and import school data into your database!

### What's Available

1. **Scraper Utility** (`src/utils/schoolScraper.js`)
   - Data validation and normalization
   - School object templates
   - Helper functions for parsing data

2. **Interactive Scraper Page** (`/scraper` route)
   - Manual school entry form
   - Data preview and editing
   - Export to JSON
   - Direct import to Firebase

3. **Recommended Sources**
   - Israel Gap Year (israelgapyear.com/program-directory/)
   - ApplyToSem.org
   - OU Israel Programs
   - Individual school websites

## How to Scrape Schools

### Method 1: Use Claude Code (Recommended)

1. Ask Claude to fetch a website:
   ```
   Can you use WebFetch to scrape https://www.israelgapyear.com/program-directory/
   and extract all the seminary and yeshiva information?
   ```

2. Claude will extract the data and can help you format it

3. You can then either:
   - Paste the data into the manual entry form at `/scraper`
   - Or ask Claude to create a JSON file that you can import

### Method 2: Manual Entry

1. Navigate to `/scraper` in your app
2. Use the manual entry form to add schools one by one
3. The system will auto-detect type from school name
4. Review in the table below
5. Export or import when ready

### Method 3: Bulk JSON Import

1. Create or obtain a JSON file with school data
2. Use the existing `/import` page
3. Import using the "Quick Import" feature

## Schools Found from Israel Gap Year

### Seminaries (26 found):
1. Amudim (Katamon, Jerusalem) - amudimisrael.org
2. Baer Miriam (Har Nof, Jerusalem) - baermiriam.com
3. Bnot Torah (Sanhedria, Jerusalem) - bnottorah.com
4. Darchei Binah (Bayit Vegan, Jerusalem) - darcheibinah.org
5. Jewel Israel (Old City, Jerusalem) - jewelisrael.com
6. Machon Mayan (Givat Washington) - machonmaayan.org
7. Machon Alte (Safed) - machonalte.com
8. Meorot Yerushalayim (Har Nof, Jerusalem) - gomeorot.com
9. Michlala Yerushalayim (Bayit Vegan, Jerusalem) - michlalahmachal.com
10. MMY (Baka, Jerusalem) - mevaseret.org
11. Midreshet Amit (Gilo, Jerusalem) - midreshetamit.org
12. Midreshet Eshel (Old City, Jerusalem) - sephardicseminary.org
13. Midreshet Harova (Old City, Jerusalem) - harova.org
14. Midreshet Lindenbaum (Arnona, Jerusalem) - midreshet-lindenbaum.org.il
15. Midreshet Moriah (Baka, Jerusalem) - midreshetmoriah.org
16. Midreshet Rachel V'Chaya (Givat Shaul, Jerusalem) - darchenoam.org
17. Midreshet Tehillah (Har Nof, Jerusalem) - midreshettehillah.com
18. Midreshet Torat Chessed (Netanya) - toratchessed.com
19. Midreshet Torah V'Avodah (Katamon, Jerusalem) - tvaisrael.org
20. Migdal Oz (Kibbutz Migdal Oz) - skamigdaloz.org
21. Nishmat (Pat, Jerusalem) - nishmat.net
22. Sha'alvim for Women (Malcha, Jerusalem) - shaalvim.org
23. Tiferet (Ramat Bet Shemesh) - tiferetcenter.com
24. Tomer Devorah (Sanhedria Murchevet, Jerusalem) - tomerdevorah.net
25. Midreshet Lev Hatorah (Ramat Beit Shemesh) - midreshetlev.org
26. Ruach Hanegev (The Negev) - ruachhanegev.org

### Yeshivas (6+ found, page was truncated):
1. Ashreinu (Ramat Beit Shemesh) - ashreinu.org.il
2. Derech Ohr Sameach (Malot Dafnah, Jerusalem) - derechinstitute.com
3. EFG @Aish (Old City, Jerusalem) - aishgesher.com
4. Eretz Hatzvi (Givat Mordechai, Jerusalem) - eretzhatzvi.org
5. Hakotel (Old City, Jerusalem) - hakotel.org.il
6. Har Etzion/Gush (Alon Shevut) - haretzion.org

## Next Steps

### For More Complete Data

Now that you have the school names and websites, you can:

1. **Visit individual school websites** to get detailed info:
   - Cost/tuition
   - Program focus
   - Contact details
   - Meal plans
   - Shabbos arrangements
   - Chessed programs
   - Application deadlines

2. **Ask Claude to scrape individual schools**:
   ```
   Can you scrape https://nishmat.net and extract:
   - Full description
   - Cost
   - Contact info (phone, email, address)
   - Program details
   - Application information
   ```

3. **Enrich existing data** by updating your seminaryData.json

## Tips for Efficient Scraping

- Start with major directories (israelgapyear.com, applytosem.org)
- Get basic info for all schools first
- Then scrape individual websites for details
- Use the scraper page to review and organize
- Export to JSON frequently as backup
- Import to Firebase when data is clean

## Automating the Process

You can ask Claude to:
1. Scrape multiple schools in parallel
2. Format the data automatically
3. Create a complete JSON file
4. Validate and normalize all fields

Example prompt:
```
Can you scrape the websites for these 5 seminaries and create a complete
JSON file with all their information: [list of schools]
```

## Data Quality

The scraper utility automatically:
- Normalizes locations (e.g., "Tel Aviv" → "tel-aviv")
- Detects school type from name
- Validates required fields
- Formats phone numbers and emails
- Structures complex data (meals, shabbos, amenities)

## Current Database Status

- **Current schools**: 19 (in seminaryData.json)
- **Potential new schools**: 32+ (from israelgapyear.com alone)
- **Other sources**: Many more available from other directories

## Questions?

The scraper page at `/scraper` has:
- Full list of recommended sources
- Major seminaries and yeshivas to research
- Manual entry form
- Data preview and validation
- Export and import functions
