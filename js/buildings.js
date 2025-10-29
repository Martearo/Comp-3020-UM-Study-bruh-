async function loadBuildings() {
    try {
        const response = await fetch('data/buildings.json');
        const data = await response.json();
        const buildingsContainer = document.getElementById('buildingsList');

        data.buildings.forEach(building => {
            const button = document.createElement('button');
            button.className = 'wide-button';
            
            // Create the building name element
            const nameSpan = document.createElement('span');
            nameSpan.className = 'building-name';
            nameSpan.textContent = building.name;
            
            // Create the star rating element
            const ratingSpan = document.createElement('span');
            ratingSpan.className = 'building-rating';
            const fullStars = Math.floor(building.rating);
            const hasHalfStar = building.rating % 1 >= 0.5;
            
            // Add full stars
            for (let i = 0; i < fullStars; i++) {
                const star = document.createElement('span');
                star.className = 'star';
                star.textContent = '★';
                ratingSpan.appendChild(star);
            }
            
            // Add half star if needed
            if (hasHalfStar) {
                const halfStar = document.createElement('span');
                halfStar.className = 'star half-star';
                halfStar.textContent = '★';
                ratingSpan.appendChild(halfStar);
            }

            // Add empty stars to make total of 5
            const emptyStars = 5 - Math.ceil(building.rating);
            for (let i = 0; i < emptyStars; i++) {
                const emptyStar = document.createElement('span');
                emptyStar.className = 'star';
                emptyStar.textContent = '☆';
                ratingSpan.appendChild(emptyStar);
            }

            // Create status element
            const statusSpan = document.createElement('span');
            statusSpan.className = `building-status ${building.isOpen ? 'status-open' : 'status-closed'}`;
            statusSpan.textContent = building.isOpen ? 'Open' : 'Closed';
            
            // Add all elements to the button
            button.appendChild(nameSpan);
            button.appendChild(ratingSpan);
            button.appendChild(statusSpan);
            
            // Create the status element
            const statusSpan = document.createElement('span');
            statusSpan.className = `building-status ${building.isOpen ? 'open' : 'closed'}`;
            statusSpan.textContent = building.isOpen ? 'Open' : 'Closed';
            
            // Add all elements to the button
            button.appendChild(nameSpan);
            button.appendChild(ratingSpan);
            button.appendChild(statusSpan);
            
            buildingsContainer.appendChild(button);
        });
    } catch (error) {
        console.error('Error loading buildings:', error);
    }
}

// Load buildings when the page loads
document.addEventListener('DOMContentLoaded', loadBuildings);