// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    await loadBuildings();
    initializeMenu();
    initializeMap();
});

// Load and display buildings
async function loadBuildings() {
    const buildingsContainer = document.getElementById('buildingsList');
    if (!buildingsContainer) return;

    try {
        buildingsContainer.innerHTML = '';
        const buildings = await fetchBuildings();
        
        buildings.forEach(building => {
            const buildingElement = createBuildingElement(building);
            buildingsContainer.appendChild(buildingElement);
        });
    } catch (error) {
        console.error('Error loading buildings:', error);
    }
}

function initializeMenu() {
    const elements = {
        hamburger: document.querySelector('.hamburger'),
        sideMenu: document.getElementById('sideMenu'),
        closeMenu: document.getElementById('closeMenu'),
        menuOverlay: document.getElementById('menuOverlay')
    };

    // Check if all required elements exist
    if (!Object.values(elements).every(element => element)) {
        console.error('Some menu elements are missing');
        return;
    }

    function toggleMenu(isOpen) {
        elements.sideMenu.classList.toggle('open', isOpen);
        elements.menuOverlay.classList.toggle('visible', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    // Event handlers
    elements.hamburger.addEventListener('click', () => toggleMenu(true));
    elements.closeMenu.addEventListener('click', () => toggleMenu(false));
    elements.menuOverlay.addEventListener('click', () => toggleMenu(false));
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