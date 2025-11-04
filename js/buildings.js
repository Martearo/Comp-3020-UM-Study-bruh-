// Building-related functionality
async function fetchBuildings() {
    try {
        const response = await fetch('data/buildings.json');
        const data = await response.json();
        return data.buildings;
    } catch (error) {
        console.error('Error fetching buildings:', error);
        // Fallback: return an embedded dataset so the UI still works when
        // the page is opened via file:// or no HTTP server is running.
        return FALLBACK_BUILDINGS.slice();
    }
}

// Embedded fallback data (keeps the UI usable without a server)
const FALLBACK_BUILDINGS = [
    { "name": "Engineering & Information Technology Complex (EITC)", "rating": 4.5, "isOpen": true, "hours": "7:00 AM - 11:00 PM" },
    { "name": "Elizabeth Dafoe Library", "rating": 4.8, "isOpen": true, "hours": "8:00 AM - 10:00 PM" },
    { "name": "University Centre", "rating": 4.2, "isOpen": true, "hours": "7:00 AM - 11:00 PM" },
    { "name": "Frank Kennedy Centre", "rating": 3.9, "isOpen": false, "hours": "6:00 AM - 9:00 PM" },
    { "name": "Drake Centre (Asper School of Business)", "rating": 4.3, "isOpen": true, "hours": "7:30 AM - 10:00 PM" },
    { "name": "Sciences & Technology Library", "rating": 4.6, "isOpen": false, "hours": "8:00 AM - 9:00 PM" },
    { "name": "Tier Building", "rating": 3.7, "isOpen": true, "hours": "7:00 AM - 6:00 PM" },
    { "name": "Allen Building (Administration)", "rating": 4.0, "isOpen": false, "hours": "8:30 AM - 4:30 PM" },
    { "name": "ARTlab", "rating": 4.7, "isOpen": true, "hours": "8:00 AM - 10:00 PM" },
    { "name": "Max Bell Centre", "rating": 4.1, "isOpen": true, "hours": "6:00 AM - 11:00 PM" }
];

function createBuildingElement(building) {
    // Build a full-width row-style button with an image on the left,
    // centered star rating, and building name on the left of the content area.
    const button = document.createElement('button');
    button.className = 'building-row-button';

    // Left image area (30-40% width)
    const imgWrap = document.createElement('div');
    imgWrap.className = 'button-image';
    const img = document.createElement('img');
    img.src = 'cutout.jpg';
    img.alt = building.name || 'building image';
    img.className = 'button-img';
    imgWrap.appendChild(img);

    // Gradient overlay (optional separate element for clarity)
    const gradient = document.createElement('div');
    gradient.className = 'button-image-gradient';
    imgWrap.appendChild(gradient);

    // Content area
    const content = document.createElement('div');
    content.className = 'button-content';

    // Building name (left aligned inside content area)
    const nameDiv = document.createElement('div');
    nameDiv.className = 'button-name';
    nameDiv.textContent = building.name;

    // Rating (we'll center this within the content area)
    const ratingDiv = document.createElement('div');
    ratingDiv.className = 'button-rating';
    addStarRating(ratingDiv, building.rating || 0);

    // Append name and rating to content
    content.appendChild(nameDiv);
    content.appendChild(ratingDiv);

    // Append everything to button
    button.appendChild(imgWrap);
    button.appendChild(content);

    return button;
}

function addStarRating(container, rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
        const star = document.createElement('span');
        star.className = 'star';
        star.textContent = '★';
        container.appendChild(star);
    }
    
    // Add half star if needed
    if (hasHalfStar) {
        const halfStar = document.createElement('span');
        halfStar.className = 'star half-star';
        halfStar.textContent = '★';
        container.appendChild(halfStar);
    }
    
    // Add empty stars
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        const emptyStar = document.createElement('span');
        emptyStar.className = 'star';
        emptyStar.textContent = '☆';
        container.appendChild(emptyStar);
    }
}