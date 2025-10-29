// Building-related functionality
async function fetchBuildings() {
    try {
        const response = await fetch('data/buildings.json');
        const data = await response.json();
        return data.buildings;
    } catch (error) {
        console.error('Error fetching buildings:', error);
        return [];
    }
}

function createBuildingElement(building) {
    const button = document.createElement('button');
    button.className = 'wide-button';
    
    // Create name and hours container
    const nameContainer = document.createElement('div');
    nameContainer.className = 'building-info';
    
    const nameSpan = document.createElement('div');
    nameSpan.className = 'building-name';
    nameSpan.textContent = building.name;
    
    const hoursSpan = document.createElement('div');
    hoursSpan.className = 'building-hours';
    hoursSpan.textContent = building.hours;
    
    nameContainer.appendChild(nameSpan);
    nameContainer.appendChild(hoursSpan);
    
    // Create rating container
    const ratingContainer = document.createElement('div');
    ratingContainer.className = 'rating-container';
    
    const ratingSpan = document.createElement('div');
    ratingSpan.className = 'building-rating';
    addStarRating(ratingSpan, building.rating);
    
    const statusSpan = document.createElement('div');
    statusSpan.className = `building-status ${building.isOpen ? 'status-open' : 'status-closed'}`;
    statusSpan.textContent = building.isOpen ? 'Open' : 'Closed';
    
    ratingContainer.appendChild(ratingSpan);
    ratingContainer.appendChild(statusSpan);
    
    // Add all elements to the button
    button.appendChild(nameContainer);
    button.appendChild(ratingContainer);
    
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