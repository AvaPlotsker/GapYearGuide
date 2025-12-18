# GapYearGuide

A modern web application for high school seniors to compare and choose gap year programs (seminaries/yeshivas) in Israel.

## Features

### Implemented ✅
- **Side-by-side Comparison** - Compare up to 4 schools at once with detailed information
- **Advanced Search** - Search by name, location, hashkafa, or description
- **Filtering System** - Filter by type, location, hashkafa, and size
- **Sorting Options** - Sort by name, rating, cost, or size
- **Favorites/Bookmarking** - Save favorite schools (persists in browser)
- **Responsive Design** - Works on desktop, tablet, and mobile devices
- **Modern Dark Theme** - Clean, professional interface with gradient accents
- **Detailed School Information** - Comprehensive details including:
  - Basic info (type, location, hashkafa, size, cost)
  - Contact information
  - Meals and Shabbos schedules
  - Distances to key locations
  - Transportation options
  - Delivery service availability
  - On-site and nearby amenities

### Future Enhancements 🚀
- **Interactive Map** - Visual representation of school locations with distances
- **User Reviews System** - Allow students to submit and read reviews
- **Advanced Filtering** - Cost range sliders, multi-select filters
- **School Photos** - Image galleries for each school
- **Comparison Export** - Download comparison tables as PDF

## Project Structure

```
GapYearGuide/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # Modern dark theme styles
├── js/
│   ├── app.js          # Main application logic
│   ├── comparison.js   # Comparison functionality
│   └── data.js         # School data
├── images/             # School photos (to be added)
└── README.md           # This file
```

## Getting Started

1. Open `index.html` in a modern web browser
2. No build process or server required - it's a static website!

## Usage

### Searching & Filtering
1. Use the search bar to find schools by name, location, or hashkafa
2. Click "Filters" to access advanced filtering options
3. Select your preferred type, location, hashkafa, and size
4. Click "Apply Filters" to see results
5. Use the sort dropdown to order results

### Comparing Schools
1. Check the boxes on school cards you want to compare (up to 4)
2. Click "Compare Selected" button
3. View side-by-side comparison in the modal
4. Click X or outside the modal to close

### Viewing Details
- Click anywhere on a school card to view full details
- See comprehensive information about meals, Shabbos, transportation, etc.

### Favorites
- Click the heart icon to add/remove schools from favorites
- Favorites are saved in your browser

## Data Structure

Each school includes:
- Name, type, location, hashkafa
- Student count, cost, program focus
- Contact information (phone, email, website, address)
- Application deadline
- Rating and review count
- Meals offered (per day, which meals)
- Shabbos schedule (pattern and details)
- Distances (Kotel, city center, shopping)
- Transportation (bus lines, taxi availability, walkability)
- Delivery services (food, groceries, service providers)
- Amenities (on-site and nearby)
- Tags

## Customization

### Adding More Schools
Edit `js/data.js` and add new school objects to the `schoolsData` array following the existing structure.

### Changing Colors
Edit CSS variables in `css/styles.css` under the `:root` selector to customize the color scheme.

### Modifying Filters
Add new filter options in `index.html` and update the filtering logic in `js/app.js`.

## Browser Compatibility

Works best on modern browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Technologies Used

- HTML5
- CSS3 (with CSS Grid and Flexbox)
- Vanilla JavaScript (ES6+)
- LocalStorage API for favorites

## Future Development

To add the map feature:
1. Integrate Google Maps API or Leaflet.js
2. Add coordinates to each school in data.js
3. Create interactive markers with school information
4. Show distances and nearby amenities visually

To add user reviews:
1. Set up a backend (Node.js, Firebase, etc.)
2. Create review submission form
3. Implement rating system
4. Add moderation capability

## License

This is a personal project. Feel free to use and modify as needed.
