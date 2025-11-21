document.addEventListener("DOMContentLoaded", () => {


    // --- Configuration & Element Selectors ---
    const IS_BUILDINGS_PAGE = window.location.pathname.includes('Buildings/Buildings.html'); 
    
    const IS_ROOMS_PAGE = window.location.pathname.includes('Rooms/Rooms.html');
    const IS_BOOKMARK_PAGE = window.location.pathname.includes('Bookmark.html');


    // Select elements (safely handle if they don't exist on one page)
    const hamburger = document.querySelector(".HamburgerMenu");
    const sidebar = document.querySelector(".sidebar");
    const closeBtn = document.getElementById("closeBtn"); 
    const searchInput = document.getElementById("searchInput");
    
    // Containers
    const buildingListContainer = document.getElementById("button-list"); // Used on index.html
    const roomListContainer = document.getElementById("room-button-list"); // Used on Buildings/Buildings.html

    const mapContainer = document.querySelector(".map-container"); 
    const mapContent = document.querySelector(".map-content"); 
    const mapImage = document.querySelector(".map-image"); 

    const pinPopupRoot = document.getElementById("pin-popup-root");

    // NEW: Zoom controls
    const zoomInBtn = document.getElementById("zoomInBtn");
    const zoomOutBtn = document.getElementById("zoomOutBtn");
    const resetViewBtn = document.getElementById("resetViewBtn");

    // --- NEW: Sort Elements ---
    const sortBtn = document.getElementById("sortBtn");
    const sortDropdown = document.getElementById("sortDropdown");
    const roomSortBtn = document.getElementById("roomSortBtn");
    const roomSortDropdown = document.getElementById("roomSortDropdown");

    const viewProfileLink = document.getElementById('viewProfileLink');

    // --- NEW: Sort State ---
    let currentSortBy = 'rating'; // Default sort key
    let currentSortOrder = 'desc'; // Default sort order

    const DEFAULT_ZOOM = 1.2; 
    
    let currentZoom = DEFAULT_ZOOM;
    let currentPopup = null; // Track the currently visible popup
    const MAX_ZOOM = 3.0;
    const MIN_ZOOM = 1.0; 
    const ZOOM_STEP = 0.2;
    

    // Add this at the top of your DOMContentLoaded event for debugging

    // --- Data Definitions ---
    // Buildings:
    const buildingData = [
        { name: "Dafoe", image: "Images/StudyRooms/Dafoe.jpg", mapImage: "../Images/RoomMaps/Dafoe.png", rating: 4.5, open: 7, close: 22, x: 67, y: 29, pinImage: "Images/PinIcon.png" },
        { name: "Engineering", image: "Images/StudyRooms/EITC.png", mapImage: "../Images/RoomMaps/EITC.png", rating: 4.0, open: 7, close: 24, x: 55, y: 50, pinImage: "Images/PinIcon.png" },
        { name: "Machray Hall", image: "Images/StudyRooms/Machray.png", mapImage: "../Images/RoomMaps/Machray.png", rating: 2.9, open: 9, close: 20, x: 57, y: 18, pinImage: "Images/PinIcon.png" },
        { name: "Tier", image: "Images/StudyRooms/Tier.png", mapImage: "../Images/RoomMaps/Tier.png", rating: 4.1, open: 8, close: 23, x: 70, y: 38, pinImage: "Images/PinIcon.png" },
        { name: "Agriculture", image: "Images/StudyRooms/Agriculture.png", mapImage: "../Images/RoomMaps/Agriculture.png", rating: 3.9, open: 6, close: 22, x: 58, y: 60, pinImage: "Images/PinIcon.png" },
    ];
    
    // Rooms:
    const roomData = [
        { building: "Dafoe", room: "D401", image: "../Images/StudyRooms/StudyRoom.png", rating: 4.8, bookmark: false, x: 80, y: 22 },
        { building: "Dafoe", room: "D402", image: "../Images/StudyRooms/StudyRoom.png", rating: 4.2, bookmark: true, x: 89, y: 22 },
        { building: "Dafoe", room: "D008", image: "../Images/StudyRooms/Dafoe008.jpg", rating: 4.2, bookmark: true, x: 20, y: 30 },

        // Engineering Pins (Coordinates relative to EITC.png map)
        { building: "Engineering", room: "EITC2123", image: "../Images/StudyRooms/StudyRoom.png", rating: 4.5, bookmark: false, x: 30, y: 60 },
        { building: "Engineering", room: "EITC1222", image: "../Images/StudyRooms/StudyRoom.png", rating: 4.0, bookmark: true, x: 75, y: 20 },

        { building: "Machray Hall", room: "M211", image: "../Images/StudyRooms/Machray211.jpg", rating: 3.0, bookmark: false, x: 70, y: 80 },

        { building: "Tier", room: "T100", image: "../Images/StudyRooms/Tier01.png", rating: 3.5, bookmark: false, x: 40, y: 70 },

        { building: "Agriculture", room: "A205", image: "../Images/StudyRooms/Agriculture125.png", rating: 4.2, bookmark: true, x: 20, y: 30 },

    ];

    // Initialize bookmarkState from localStorage or from roomData
const bookmarkState = (() => {
    // Try to load from localStorage first
    const savedBookmarks = localStorage.getItem('bookmarkState');
    if (savedBookmarks) {
        return JSON.parse(savedBookmarks);
    }
    
    // If no saved state, initialize from roomData
    const initialState = {};
    roomData.forEach(room => {
        initialState[room.room] = room.bookmark;
    });
    return initialState;
})();


    if (viewProfileLink) {
        viewProfileLink.addEventListener('click', (e) => {
            e.preventDefault(); 
            
            // 2. Display the alert message
            alert("Profile page is currently unimplemented. Not Part of Primary or Secondary Tasks!"); 
            
            // Hide the profile card immediately after clicking the link
            const profileCard = e.target.closest('.profile-info-card');
            if (profileCard) {
                profileCard.style.opacity = '0';
                profileCard.style.visibility = 'hidden';
                profileCard.style.transform = 'translateY(-5px)';
            }
        });
    }

    function showToast(message) {
        const toast = document.getElementById("bookmark-toast");
        const toastMessage = document.getElementById("toast-message");
        
        if (toast && toastMessage) {
            // Set the message
            toastMessage.textContent = message;
            
            // Show the toast (applies the 'show' class which triggers the slide-down)
            toast.classList.add("show");
            
            // Hide the toast after 3 seconds
            setTimeout(() => {
                toast.classList.remove("show");
            }, 3000); // 3 seconds
        }
    }

    function filterAndRender() {
    if (!searchInput) return;

    const searchTerm = searchInput.value.toLowerCase().trim();

    if (IS_BUILDINGS_PAGE) {
        const currentBuilding = getBuildingNameFromUrl();
        const roomsToFilter = filterRoomsForBuilding(roomData, currentBuilding);
        
        let filteredRooms = roomsToFilter.filter(room => {
            return room.room.toLowerCase().includes(searchTerm) || room.building.toLowerCase().includes(searchTerm);
        });

        filteredRooms = sortBuildingOrRoomData(filteredRooms, currentSortBy, currentSortOrder); 
        
        renderRooms(filteredRooms);
        renderRoomPinsForBuilding(filteredRooms);

    } else if (IS_BOOKMARK_PAGE) {
        let filteredRooms = roomData.filter(room => {
            const isBookmarked = bookmarkState[room.room];
            const matchesSearch = room.room.toLowerCase().includes(searchTerm) || room.building.toLowerCase().includes(searchTerm);
            return isBookmarked && matchesSearch;
        });

        filteredRooms = sortBuildingOrRoomData(filteredRooms, currentSortBy, currentSortOrder);
        renderBookmarkedRooms(filteredRooms);

    } else {
        let filteredSpots = buildingData.filter(spot => {
            return spot.name.toLowerCase().includes(searchTerm);
        });

        filteredSpots = sortBuildingOrRoomData(filteredSpots, currentSortBy, currentSortOrder);
        renderBuildings(filteredSpots);
        renderMapPins(filteredSpots); 
    }
}

    // Apply the current scale to the map image
    function applyMapTransform() {
        if (mapContent) {
            // Apply scale
            mapContent.style.transform = `scale(${currentZoom})`; 
            mapContent.style.setProperty('--current-zoom', currentZoom);

            // Disable buttons at min/max zoom
            if (zoomInBtn) {
                zoomInBtn.disabled = currentZoom >= MAX_ZOOM;
            }
            if (zoomOutBtn) {
                zoomOutBtn.disabled = currentZoom <= MIN_ZOOM;
            }
        }
    }

    

    function zoomIn() {
        if (currentZoom < MAX_ZOOM) {
            currentZoom += ZOOM_STEP;
            if (currentZoom > MAX_ZOOM) currentZoom = MAX_ZOOM;
            applyMapTransform();
        }
    }

    function zoomOut() {
        if (currentZoom > MIN_ZOOM) {
            currentZoom -= ZOOM_STEP;
            if (currentZoom < MIN_ZOOM) currentZoom = MIN_ZOOM;
            applyMapTransform();
        }
    }

    function resetView() {
        currentZoom = DEFAULT_ZOOM;
        applyMapTransform();
    }


    // --- Helper Functions ---
    function isSpotOpen(openHour, closeHour) {
        const now = new Date();
        const currentHour = now.getHours();
        return currentHour >= openHour && currentHour < closeHour;
    }
    
    function getBuildingNameFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('building'); 
    }

    

    
    function sortBuildingOrRoomData(data, sortBy, sortOrder) {
        // Clone the array to avoid modifying the original array in place
        const sortedData = [...data]; 

        sortedData.sort((a, b) => {
            let valA = a[sortBy];
            let valB = b[sortBy];

            // Handle string comparisons (e.g., 'name' or 'room')
            if (typeof valA === 'string') {
                valA = valA.toLowerCase();
                valB = valB.toLowerCase();
                
                if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
                if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
                return 0; // names are equal
            }

            // Handle numeric comparisons (e.g., 'rating')
            if (sortOrder === 'asc') {
                return valA - valB;
            } else {
                return valB - valA; // 'desc'
            }
        });

        return sortedData;
    }


    // --- Sidebar Functionality ---
    if (hamburger && sidebar) {
        hamburger.addEventListener("click", (e) => {
            e.stopPropagation();
            hamburger.classList.toggle("active");
            sidebar.classList.toggle("active");
        });
    }

    if (closeBtn && sidebar && hamburger) {
        closeBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            hamburger.classList.remove("active");
            sidebar.classList.remove("active");
        });
        
        document.addEventListener('click', (e) => {
            if (!sidebar.contains(e.target) && !hamburger.contains(e.target)) {
                sidebar.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    }
    
    // ----------------------------------------------------
    // --- INDEX.HTML: Building Spot Rendering ---
    // ----------------------------------------------------
    function renderBuildings(spots) {
        if (!buildingListContainer) return;
        buildingListContainer.innerHTML = '';

        spots.forEach(spot => {
            const anchor = document.createElement("a");
            
            anchor.href = `Buildings/Buildings.html?building=${encodeURIComponent(spot.name)}`; 
            anchor.classList.add("spot-btn");

            let stars = Math.floor(spot.rating);
            let amountStars = "⭐".repeat(stars);

            const isOpen = isSpotOpen(spot.open, spot.close);
            const statusText = isOpen ? "Open" : "Closed";
            const statusClass = isOpen ? "open" : "closed";

            anchor.innerHTML = `
                <div class="spot-img-wrapper">
                    <img src="${spot.image}" alt="${spot.name}" class="spot-img">
                </div>
                <span class="spot-name">${spot.name}</span>
                <span class="spot-rating">${amountStars} ${spot.rating}</span>
                <span class="spot-status ${statusClass}">${statusText}</span>
            `;
            buildingListContainer.appendChild(anchor);
        });
    }

    // ----------------------------------------------------
    // --- BUILDINGS.HTML: Dynamic Content and Rendering ---
    // ----------------------------------------------------
    function updateMapImage(buildingName) {
        const mapImageElement = document.querySelector('.map-image');
        const spotData = buildingData.find(spot => spot.name.toLowerCase() === buildingName.toLowerCase());
        
        if (mapImageElement && spotData && spotData.mapImage) {
            mapImageElement.src = spotData.mapImage; 
            mapImageElement.alt = `Map of ${buildingName} Study Rooms`;
        }
    }

    function updateBuildingsPageContent(buildingName) {
        if (!buildingName) {
            buildingName = "All Buildings";
        }
        
        const breadcrumbsContainer = document.querySelector('.breadcrumbs');
        
        if (breadcrumbsContainer) {
            const studySpotsSpan = breadcrumbsContainer.querySelector('span');
            
            if (studySpotsSpan) {
                const buildingSpan = document.createElement('span');
                buildingSpan.textContent = ` (${buildingName})`; 
                buildingSpan.classList.add('building-name-breadcrumb');
                
                // Check if the span is already there to prevent duplication
                if (!breadcrumbsContainer.querySelector('.building-name-breadcrumb')) {
                    studySpotsSpan.insertAdjacentElement('afterend', buildingSpan);
                }
            }
        }
        
        if (searchInput) {
            searchInput.placeholder = `Search rooms in ${buildingName}...`;
        }
    }

    function filterRoomsForBuilding(rooms, buildingName) {
        if (!buildingName) return [];
        return rooms.filter(room => room.building.toLowerCase() === buildingName.toLowerCase());
    }

function renderRooms(rooms) {
    if (!roomListContainer) return;
    roomListContainer.innerHTML = ''; 

    rooms.forEach(room => {
        const btn = document.createElement("button");
        btn.classList.add("room-btn"); 

        let stars = Math.floor(room.rating);
        let amountStars = "⭐".repeat(stars);
        
        const isBookmarked = bookmarkState[room.room] || false;
        
        const filledSVG = `<svg class="bookmark-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="gold" width="24" height="24"><path d="M6 4a2 2 0 0 0-2 2v16l8-4 8 4V6a2 2 0 0 0-2-2H6z"/></svg>`;
        const emptySVG = `<svg class="bookmark-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="gold" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`;
        
        // Set initial HTML and data attribute
        btn.innerHTML = `
            <div class="room-img-wrapper">
                <img src="${room.image}" alt="${room.room}" class="room-img">
            </div>
            <div class="room-info">
                <span class="room-building">${room.building}</span>
                <span class ="room-number">${room.room}</span>
                <span class="room-rating">${amountStars} ${room.rating}</span>
                <span class="room-bookmark" data-bookmarked="${isBookmarked}">
                    ${isBookmarked ? filledSVG : emptySVG}
                </span>
            </div>
        `;

        // --- UNIFIED CLICK HANDLER (Combines Navigation and Bookmark Logic) ---
        btn.addEventListener("click", (e) => {
    const bookmarkIconSpan = e.target.closest(".room-bookmark"); 

    // Logic for handling the bookmark click
    if (bookmarkIconSpan) {
        e.stopPropagation(); 
        
        const currentState = bookmarkIconSpan.dataset.bookmarked === "true";
        const newState = !currentState; 

        bookmarkState[room.room] = newState; 
        
        // Save to localStorage
        saveBookmarkState();
        
        // toggle bookmark state in the DOM
        bookmarkIconSpan.dataset.bookmarked = newState.toString();

        // swap SVG
        bookmarkIconSpan.innerHTML = newState ? filledSVG : emptySVG;
        
        const action = newState ? 'Bookmarked' : 'Unbookmarked';
        const message = `Room ${room.room} has been ${action}.`;
        showToast(message);

        filterAndRender();
        
        return; 
    }

    // Logic for handling the navigation click
    window.location.href = `../Rooms/Rooms.html?id=${encodeURIComponent(room.room)}`;
});

        roomListContainer.appendChild(btn); 
    }); 
} 
    




    // --- Initialization: Run once the page loads ---
if (IS_BUILDINGS_PAGE) {
    if (mapContent) {
        applyMapTransform();
    }

    const currentBuilding = getBuildingNameFromUrl();
    updateBuildingsPageContent(currentBuilding);
    updateMapImage(currentBuilding); 
    
    const roomsToRender = filterRoomsForBuilding(roomData, currentBuilding);
    renderRooms(roomsToRender);
    renderRoomPinsForBuilding(roomsToRender);

} else if (IS_BOOKMARK_PAGE) {
    // Handle bookmark page - use the actual bookmarkState, not roomData bookmarks
    const bookmarkedRooms = roomData.filter(room => bookmarkState[room.room]);
    
    if (searchInput) {
        searchInput.placeholder = "Search bookmarked rooms...";
    }

    renderBookmarkedRooms(bookmarkedRooms);
    
} else {
    // This runs on index.html (main page)
    if (mapContainer && mapImage) {
        applyMapTransform();

        // Attach zoom event listeners
        if (zoomInBtn) zoomInBtn.addEventListener('click', zoomIn);
        if (zoomOutBtn) zoomOutBtn.addEventListener('click', zoomOut);
        if (resetViewBtn) resetViewBtn.addEventListener('click', resetView);
    }

    renderBuildings(buildingData);
    renderMapPins(buildingData);
}

    // Attach the filter function to the search input 'input' event (for both pages)
    if (searchInput) {
        searchInput.addEventListener('input', filterAndRender);
    }

    // ----------------------------------------------------
    // --- NEW: Sort Dropdown Logic (Refactored for both pages) ---
    // ----------------------------------------------------
    function initializeSortDropdown(btn, dropdown) {
        if (!btn || !dropdown) return;

        // Toggle the dropdown visibility
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('active');
        });

        // Handle selection from the dropdown
        dropdown.addEventListener('click', (e) => {
            const listItem = e.target.closest('li');
            if (!listItem) return;

            // Get sort parameters from data attributes
            const sortBy = listItem.dataset.sortBy;
            const sortOrder = listItem.dataset.sortOrder;

            // Update the global sort state
            currentSortBy = sortBy;
            currentSortOrder = sortOrder;

            // Close the dropdown
            dropdown.classList.remove('active');
            
            // Re-render the list with the new sorting
            filterAndRender(); 
        });

        // Hide dropdown when clicking elsewhere
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target) && !btn.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });
    }

    // Initialize sorting for the main index page
    initializeSortDropdown(sortBtn, sortDropdown);

    // Initialize sorting for the Rooms/Buildings page
    initializeSortDropdown(roomSortBtn, roomSortDropdown);


    // **NEW FUNCTION: Render Map Pins for Buildings**
    function renderMapPins(spots) {
        if (!mapContent || IS_BUILDINGS_PAGE) return; 

        // Remove all existing pins before adding new ones (needed for filtering)
        document.querySelectorAll('.map-content .map-pin-container').forEach(pin => pin.remove()); 
        
        // Clear the floating popup root before rendering new pins
        pinPopupRoot.innerHTML = '';

        spots.forEach(spot => {
            // Ensure coordinates exist before trying to place a pin
            if (spot.x === undefined || spot.y === undefined) return; 

            const pinContainer = document.createElement("div"); 
            pinContainer.classList.add("map-pin-container"); // Use a container class
            pinContainer.setAttribute('data-name', spot.name); 

            // Create the actual clickable image element
            const pinImage = document.createElement("img");
            pinImage.src = spot.pinImage;
            pinImage.alt = `${spot.name} location pin`;
            pinImage.classList.add("map-pin-icon"); // Use a specific class for the icon

            // Position the pin container
            pinContainer.style.left = `${spot.x}%`;
            pinContainer.style.top = `${spot.y}%`;
            pinContainer.prepend(pinImage);

            // Add the info card content
            const isOpen = isSpotOpen(spot.open, spot.close);
            const statusText = isOpen ? "Open" : "Closed";
            const statusClass = isOpen ? "open" : "closed";
            const stars = "⭐".repeat(Math.floor(spot.rating));
            
            const infoCard = document.createElement("div");
            infoCard.classList.add("floating-pin-info-card");
            infoCard.innerHTML = `
                <img src="${spot.image}" alt="${spot.name} exterior" class="info-card-img">
                <div class="info-card-details">
                    <span class="info-name">${spot.name}</span>
                    <span class="info-rating">${stars} ${spot.rating}</span>
                    <span class="info-status ${statusClass}">${statusText}</span>
                    <span class="info-action">Click Pin to View Rooms</span>
                </div>
            `;

            pinPopupRoot.appendChild(infoCard);
            
            // Event listeners for hover/positioning 
            pinContainer.addEventListener('mouseenter', () => {
                // Hide any currently visible popup
                if (currentPopup && currentPopup !== infoCard) {
                    currentPopup.classList.remove('visible');
                }

                // Calculate the exact screen position of the pin image
                const rect = pinImage.getBoundingClientRect();
                
                // Calculate position for the info card relative to the viewport
                // Card will appear to the right of the pin.
                const cardLeft = rect.right + 25; // 25px offset from the right edge of the pin
                const cardTop = rect.top + (rect.height / 2); // Center vertically with the pin

                // Apply calculated position
                infoCard.style.left = `${cardLeft}px`;
                infoCard.style.top = `${cardTop}px`;
                
                // Show the info card
                infoCard.classList.add('visible');
                currentPopup = infoCard;
            });
            
            pinContainer.addEventListener('mouseleave', () => {
                // Delay hiding the card to allow quick re-entry or mouse movement
                setTimeout(() => {
                    // Only hide if the mouse is not over the pin container or the card itself
                    if (!pinContainer.matches(':hover') && !infoCard.matches(':hover')) {
                        infoCard.classList.remove('visible');
                        currentPopup = null;
                    }
                }, 100); 
            });
            
            // Ensure the card hides if the mouse leaves the card itself
            infoCard.addEventListener('mouseleave', () => {
                infoCard.classList.remove('visible');
                currentPopup = null;
            });

            // Make the pin container clickable, linking to the Rooms page (UNCHANGED)
            pinContainer.addEventListener('click', (event) => {
                window.location.href = `Buildings/Buildings.html?building=${encodeURIComponent(spot.name)}`;
            });

            mapContent.appendChild(pinContainer);
        });
    }


    function renderRoomPinsForBuilding(rooms) {
        if (!mapContent) return; 

        // Remove existing pins from the map content before adding new ones
        document.querySelectorAll('.map-content .room-pin-container').forEach(pin => pin.remove());
        
        // Check if the pin popup root exists and clear it (if you are using the same popup logic)
        if (pinPopupRoot) {
            pinPopupRoot.innerHTML = ''; 
        }
        
        // Get the current building's map data (buildingData)
        const currentBuilding = getBuildingNameFromUrl();
        const spotData = buildingData.find(spot => spot.name.toLowerCase() === currentBuilding.toLowerCase());
        
        // Use a generic pin image for rooms, or define one in studyRooms
        const defaultRoomPin = spotData && spotData.pinImage 
            ? `../${spotData.pinImage}` 
            : "../Images/PinIcon.png"; 

        rooms.forEach(room => {
            // Skip rendering if coordinates are missing
            if (room.x === undefined || room.y === undefined) return; 

            // 1. Create Pin Container
            const pinContainer = document.createElement("div"); 
            pinContainer.classList.add("map-pin-container", "room-pin-container");
            pinContainer.setAttribute('data-name', room.room); 

            // 2. Create Pin Icon
            const pinImage = document.createElement("img");
            pinImage.src = defaultRoomPin;
            pinImage.alt = `${room.room} location pin`;
            pinImage.classList.add("map-pin-icon", "room-pin-icon"); 

            // 3. Position the pin (relative to the building map image)
            pinContainer.style.left = `${room.x}%`;
            pinContainer.style.top = `${room.y}%`;
            pinContainer.prepend(pinImage);

            // Add info card
            const infoCard = document.createElement("div");
            infoCard.classList.add("floating-pin-info-card");
            
            const currentBookmarkStatus = bookmarkState[room.room] || false; 
            const bookmarkStatusText = currentBookmarkStatus ? 'Bookmarked' : 'Unbookmarked';

            infoCard.innerHTML = `
                <img src="${room.image}" alt="${room.room} interior" class="info-card-img">
                <div class="info-card-details">
                    <span class="info-name">${room.room} (${room.building})</span>
                    <span class="info-rating">Rating: ${room.rating}</span>
                    <span class="info-status">${bookmarkStatusText}</span>
                    <span class="info-action">Click to Read Reviews/View Details</span>
                </div>
            `;

            if (pinPopupRoot) {
                pinPopupRoot.appendChild(infoCard);
            }


            pinContainer.addEventListener('mouseenter', () => {
                if (currentPopup && currentPopup !== infoCard) {
                    currentPopup.classList.remove('visible');
                }

                const rect = pinImage.getBoundingClientRect();
                const cardLeft = rect.right + 25; 
                const cardTop = rect.top + (rect.height / 2); 

                infoCard.style.left = `${cardLeft}px`;
                infoCard.style.top = `${cardTop}px`;
                
                infoCard.classList.add('visible');
                currentPopup = infoCard;
            });
            
            pinContainer.addEventListener('mouseleave', () => {
                setTimeout(() => {
                    if (!pinContainer.matches(':hover') && !infoCard.matches(':hover')) {
                        infoCard.classList.remove('visible');
                        currentPopup = null;
                    }
                }, 100); 
            });
            
            infoCard.addEventListener('mouseleave', () => {
                infoCard.classList.remove('visible');
                currentPopup = null;
            });
            
            // Add event listeners 
            pinContainer.addEventListener('click', (event) => {
                window.location.href = `../Rooms/rooms.html?id=${encodeURIComponent(room.room.replace(/\s/g, ''))}`;
            });


            mapContent.appendChild(pinContainer);
        });
    }



// Handle bookmark page rendering
function renderBookmarkedRooms(rooms) {
    if (!roomListContainer) return;
    
    roomListContainer.innerHTML = '';

    if (rooms.length === 0) {
        // Show empty state
        const emptyState = document.getElementById('empty-state');
        if (emptyState) {
            emptyState.style.display = 'block';
        }
        return;
    }

    // Hide empty state
    const emptyState = document.getElementById('empty-state');
    if (emptyState) {
        emptyState.style.display = 'none';
    }

    rooms.forEach(room => {
        const btn = document.createElement("button");
        btn.classList.add("room-btn");

        let stars = Math.floor(room.rating);
        let amountStars = "⭐".repeat(stars);
        
        const isBookmarked = bookmarkState[room.room] || false;
        
        const filledSVG = `<svg class="bookmark-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="gold" width="24" height="24"><path d="M6 4a2 2 0 0 0-2 2v16l8-4 8 4V6a2 2 0 0 0-2-2H6z"/></svg>`;
        const emptySVG = `<svg class="bookmark-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="gold" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`;
        
        let roomImage = room.image;
        if (IS_BOOKMARK_PAGE) {
            // If we're on the bookmark page, adjust the image path
            if (room.image.startsWith('../')) {
                // Remove the leading '../' to make paths relative to root
                roomImage = room.image.substring(3);
            }
            // If image path doesn't start with '../', leave it as is
        }
        
        btn.innerHTML = `
            <div class="room-img-wrapper">
                <img src="${roomImage}" alt="${room.room}" class="room-img">
            </div>
            <div class="room-info">
                <span class="room-building">${room.building}</span>
                <span class ="room-number">${room.room}</span>
                <span class="room-rating">${amountStars} ${room.rating}</span>
                <span class="room-bookmark" data-bookmarked="${isBookmarked}">
                    ${isBookmarked ? filledSVG : emptySVG}
                </span>
            </div>
        `;

        // --- SINGLE UNIFIED CLICK HANDLER ---
        btn.addEventListener("click", (e) => {
    const bookmarkIconSpan = e.target.closest(".room-bookmark"); 

    if (bookmarkIconSpan) {
        // Logic for handling the bookmark click
        e.stopPropagation(); 
        e.preventDefault();
        
        const currentState = bookmarkIconSpan.dataset.bookmarked === "true";
        const newState = !currentState; 

        // Update state
        bookmarkState[room.room] = newState; 
        
        // Save to localStorage
        saveBookmarkState();
        
        bookmarkIconSpan.dataset.bookmarked = newState.toString();
        bookmarkIconSpan.innerHTML = newState ? filledSVG : emptySVG;
        
        const action = newState ? 'Bookmarked' : 'Unbookmarked';
        const message = `Room ${room.room} has been ${action}.`;
        showToast(message);

        // If unbookmarking on bookmark page, remove the card
        if (!newState) {
            btn.remove();
            
            // Show empty state if no more bookmarks
            const remainingRooms = roomListContainer.querySelectorAll('.room-btn');
            if (remainingRooms.length === 0) {
                const emptyState = document.getElementById('empty-state');
                if (emptyState) {
                    emptyState.style.display = 'block';
                }
            }
        }
        return; 
    }

    // Logic for handling the navigation click
    window.location.href = `Rooms/Rooms.html?id=${encodeURIComponent(room.room)}`;
});

        roomListContainer.appendChild(btn);
    });
}


function saveBookmarkState() {
    localStorage.setItem('bookmarkState', JSON.stringify(bookmarkState));
}

});
