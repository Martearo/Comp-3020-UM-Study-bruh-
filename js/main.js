// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Load buildings
    loadBuildings();

    // Menu functionality
    initializeMenu();

    // Map functionality
    initializeMap();
});

async function loadBuildings() {
    const buildingsContainer = document.getElementById('buildingsList');
    try {
        const response = await fetch('data/buildings.json');
        const data = await response.json();
        buildingsContainer.innerHTML = '';
        
        data.buildings.forEach(building => {
            const button = document.createElement('button');
            button.className = 'wide-button';
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'building-name';
            nameSpan.textContent = building.name;
            
            const ratingSpan = document.createElement('span');
            ratingSpan.className = 'building-rating';
            
            // Add stars
            addStarRating(ratingSpan, building.rating);

            const statusSpan = document.createElement('span');
            statusSpan.className = `building-status ${building.isOpen ? 'status-open' : 'status-closed'}`;
            statusSpan.textContent = building.isOpen ? 'Open' : 'Closed';
            
            button.appendChild(nameSpan);
            button.appendChild(ratingSpan);
            button.appendChild(statusSpan);
            buildingsContainer.appendChild(button);
        });
    } catch (error) {
        console.error('Error loading buildings:', error);
    }
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

function initializeMenu() {
    const hamburger = document.querySelector('.hamburger');
    const sideMenu = document.getElementById('sideMenu');
    const closeMenu = document.getElementById('closeMenu');
    const menuOverlay = document.getElementById('menuOverlay');

    function openMenu() {
        sideMenu.classList.add('open');
        menuOverlay.classList.add('visible');
        document.body.style.overflow = 'hidden';
    }

    function closeMenuHandler() {
        sideMenu.classList.remove('open');
        menuOverlay.classList.remove('visible');
        document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', openMenu);
    closeMenu.addEventListener('click', closeMenuHandler);
    menuOverlay.addEventListener('click', closeMenuHandler);
}

function initializeMap() {
    const container = document.getElementById('imageContainer');
    const image = document.getElementById('panZoomImage');
    let isDragging = false;
    let startX, startY, translateX = 0, translateY = 0;
    let scale = 1.0;
    let isZoomed = false;
    const minScale = 0.5;
    const maxScale = 3.0;

    function updateTransform() {
        container.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    }

    // Zoom controls
    document.getElementById('zoomIn').addEventListener('click', () => {
        if (scale < maxScale) {
            scale = Math.min(scale * 1.2, maxScale);
            updateTransform();
        }
    });

    document.getElementById('zoomOut').addEventListener('click', () => {
        if (scale > minScale) {
            scale = Math.max(scale / 1.2, minScale);
            updateTransform();
        }
    });

    document.getElementById('resetView').addEventListener('click', () => {
        scale = 1.0;
        translateX = 0;
        translateY = 0;
        updateTransform();
    });

    // Double click to zoom
    container.addEventListener('dblclick', (e) => {
        e.preventDefault();
        if (!isZoomed) {
            scale = 2;
            isZoomed = true;
        } else {
            scale = 1;
            translateX = 0;
            translateY = 0;
            isZoomed = false;
        }
        updateTransform();
    });

    // Mouse wheel zoom
    container.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        scale = Math.min(Math.max(1, scale + delta), 3);
        isZoomed = scale > 1;
        updateTransform();
    });

    // Pan functionality
    container.addEventListener('mousedown', (e) => {
        if (scale > 1) {
            isDragging = true;
            startX = e.clientX - translateX;
            startY = e.clientY - translateY;
            container.style.cursor = 'grabbing';
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            translateX = e.clientX - startX;
            translateY = e.clientY - startY;
            updateTransform();
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        container.style.cursor = 'grab';
    });
}