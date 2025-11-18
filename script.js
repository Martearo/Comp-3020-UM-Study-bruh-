document.addEventListener("DOMContentLoaded", () => {
    // --- Configuration & Element Selectors ---
    const IS_ROOMS_PAGE = window.location.pathname.includes('Rooms/Rooms.html');
    
    // Select elements (safely handle if they don't exist on one page)
    const hamburger = document.querySelector(".HamburgerMenu");
    const sidebar = document.querySelector(".sidebar");
    const closeBtn = document.getElementById("closeBtn"); 
    const searchInput = document.getElementById("searchInput");
    
    // Containers
    const buttonList = document.getElementById("button-list"); // Used on index.html
    const roombuttonList = document.getElementById("room-button-list"); // Used on Rooms/Rooms.html

    const mapContainer = document.querySelector(".map-container"); // NEW: Select the map container
    const mapContent = document.querySelector(".map-content"); // 🔑 NEW: The element that holds the map and pins, and is scaled.
    const mapImage = document.querySelector(".map-image"); // Select the map image

    const pinPopupRoot = document.getElementById("pin-popup-root");

    // NEW: Zoom controls
    const zoomInBtn = document.getElementById("zoomInBtn");
    const zoomOutBtn = document.getElementById("zoomOutBtn");
    const resetViewBtn = document.getElementById("resetViewBtn");

    // --- NEW: Sort Elements ---
    const sortBtn = document.getElementById("sortBtn");
    const sortDropdown = document.getElementById("sortDropdown");
    // --- NEW: Sort State ---
    let currentSortBy = 'rating'; // Default sort key
    let currentSortOrder = 'desc'; // Default sort order

    const DEFAULT_ZOOM = 1.2; 
    
    let currentZoom = DEFAULT_ZOOM;
    let currentPopup = null; // Track the currently visible popup
    const MAX_ZOOM = 3.0;
    const MIN_ZOOM = 1.0; 
    const ZOOM_STEP = 0.2;


    // --- Data Definitions ---
    const studySpots = [
        { name: "Dafoe", image: "Images/StudyRooms/Dafoe.jpg", mapImage: "../Images/RoomMaps/Dafoe.png", rating: 4.5, open: 7, close: 22, x: 67, y: 29, pinImage: "Images/PinIcon.png" },
        { name: "Engineering", image: "Images/StudyRooms/EITC.png", mapImage: "../Images/RoomMaps/EITC.png", rating: 4.0, open: 7, close: 24, x: 55, y: 50, pinImage: "Images/PinIcon.png" },
        { name: "Machray Hall", image: "Images/StudyRooms/Machray.png", mapImage: "../Images/RoomMaps/Machray.png", rating: 2.9, open: 9, close: 20, x: 57, y: 18, pinImage: "Images/PinIcon.png" },
        { name: "Tier", image: "Images/StudyRooms/Tier.png", mapImage: "../Images/RoomMaps/Tier.png", rating: 4.1, open: 8, close: 23, x: 70, y: 38, pinImage: "Images/PinIcon.png" },
        { name: "Gym", image: "Images/Map.png", mapImage: "../Images/RoomMaps/Gym.png", rating: 3.9, open: 6, close: 22, x: 15, y: 70, pinImage: "Images/PinIcon.png" },
    ];
    
    const studyRooms = [
        { building: "Dafoe", room: "D-401", image: "../Images/StudyRooms/StudyRoom.png", rating: 4.8, bookmark: false, x: 20, y: 35 },
        { building: "Dafoe", room: "D-402", image: "../Images/StudyRooms/StudyRoom.png", rating: 4.2, bookmark: true, x: 55, y: 45 },
        
        // Engineering Pins (Coordinates relative to EITC.png map)
        { building: "Engineering", room: "EITC2 123", image: "../Images/StudyRooms/StudyRoom.png", rating: 4.5, bookmark: false, x: 30, y: 60 },
        { building: "Engineering", room: "EITC1 222", image: "../Images/StudyRooms/StudyRoom.png", rating: 4.0, bookmark: true, x: 75, y: 20 },
        
        // Machray and Tier (Add coordinates for all, using samples)
        { building: "Machray Hall", room: "M-300", image: "../Images/StudyRooms/StudyRoom.png", rating: 3.0, bookmark: false, x: 40, y: 40 },
        { building: "Tier", room: "T-100", image: "../Images/StudyRooms/StudyRoom.png", rating: 3.5, bookmark: false, x: 50, y: 50 },
    ];


    // NEW: Applies the current scale to the map image
    function applyMapTransform() {
        if (mapContent) {
            // Only apply scale (no translate/pan needed)
            mapContent.style.transform = `scale(${currentZoom})`; 
            mapContent.style.setProperty('--current-zoom', currentZoom); // <--- ADD THIS LINE

            // Disable buttons at min/max zoom
            if (zoomInBtn) {
                zoomInBtn.disabled = currentZoom >= MAX_ZOOM;
            }
            if (zoomOutBtn) {
                zoomOutBtn.disabled = currentZoom <= MIN_ZOOM;
            }
        }
    }

    // NEW: Function to zoom in
    function zoomIn() {
        if (currentZoom < MAX_ZOOM) {
            currentZoom += ZOOM_STEP;
            if (currentZoom > MAX_ZOOM) currentZoom = MAX_ZOOM;
            applyMapTransform();
        }
    }

    // NEW: Function to zoom out
    function zoomOut() {
        if (currentZoom > MIN_ZOOM) {
            currentZoom -= ZOOM_STEP;
            if (currentZoom < MIN_ZOOM) currentZoom = MIN_ZOOM;
            applyMapTransform();
        }
    }

    // NEW: Function to reset view
    function resetView() {
        currentZoom = DEFAULT_ZOOM;
        // Resetting translation is not needed as it's not supported
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


    // ⭐ NEW FUNCTION: Sorting logic
    function sortStudySpots(spots, sortBy, sortOrder) {
        // Clone the array to avoid modifying the original 'studySpots' array in place
        const sortedSpots = [...spots]; 

        sortedSpots.sort((a, b) => {
            let valA = a[sortBy];
            let valB = b[sortBy];

            // Handle string comparisons (e.g., 'name')
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

        return sortedSpots;
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
    function renderStudySpots(spots) {
        if (!buttonList) return;
        buttonList.innerHTML = '';

        spots.forEach(spot => {
            const anchor = document.createElement("a");
            
            // Path: From root index.html to Rooms/Rooms.html
            anchor.href = `Rooms/Rooms.html?building=${encodeURIComponent(spot.name)}`; 
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
            buttonList.appendChild(anchor);
        });
    }

    // ----------------------------------------------------
    // --- ROOMS.HTML: Dynamic Content and Rendering ---
    // ----------------------------------------------------
    
    function updateMapImage(buildingName) {
        const mapImageElement = document.querySelector('.map-image');
        const spotData = studySpots.find(spot => spot.name.toLowerCase() === buildingName.toLowerCase());
        
        if (mapImageElement && spotData && spotData.mapImage) {
            mapImageElement.src = spotData.mapImage; 
            mapImageElement.alt = `Map of ${buildingName} Study Rooms`;
        }
    }

    function updateRoomsPageContent(buildingName) {
        if (!buildingName) {
            buildingName = "All Rooms";
        }
        
        const breadcrumbsContainer = document.querySelector('.breadcrumbs');
        
        if (breadcrumbsContainer) {
            const studySpotsSpan = breadcrumbsContainer.querySelector('span');
            
            if (studySpotsSpan) {
                const buildingSpan = document.createElement('span');
                buildingSpan.textContent = ` (${buildingName})`; // Added space before bracket
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

    function filterRoomsByBuilding(rooms, buildingName) {
        if (!buildingName) return [];
        return rooms.filter(room => room.building.toLowerCase() === buildingName.toLowerCase());
    }

    // 🔑 UPDATED: Using SVG Icons and setting initial data attribute
    function renderStudyRooms(rooms) {
        if (!roombuttonList) return;
        roombuttonList.innerHTML = ''; 

        rooms.forEach(room => {
            const btn = document.createElement("button");
            btn.classList.add("room-btn"); 

            let stars = Math.floor(room.rating);
            let amountStars = "⭐".repeat(stars);
            
            const isBookmarked = room.bookmark;
            
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

            btn.addEventListener("click", () => {
                alert(`You clicked ${room.room}`);
            });

            roombuttonList.appendChild(btn);
        });

        // 🔑 NEW: Attach the single click listener to the container (Event Delegation)
        if (roombuttonList) {
            roombuttonList.addEventListener("click", e => {
                const bookmarkIconSpan = e.target.closest(".room-bookmark");
                if (!bookmarkIconSpan) return; // only proceed if a bookmark was clicked
                e.stopPropagation(); // prevent triggering room button click

                const isBookmarked = bookmarkIconSpan.dataset.bookmarked === "true";
                const filledSVG = `<svg class="bookmark-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="gold" width="24" height="24"><path d="M6 4a2 2 0 0 0-2 2v16l8-4 8 4V6a2 2 0 0 0-2-2H6z"/></svg>`;
                const emptySVG = `<svg class="bookmark-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="gold" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`;

                // toggle bookmark state
                bookmarkIconSpan.dataset.bookmarked = (!isBookmarked).toString();

                // swap SVG
                bookmarkIconSpan.innerHTML = !isBookmarked ? filledSVG : emptySVG;
            });
        }
    }

    // --- Search/Filter Logic for both pages ---
    function filterAndRender() {
        if (!searchInput) return;

        const searchTerm = searchInput.value.toLowerCase().trim();

        if (IS_ROOMS_PAGE) {
            const currentBuilding = getBuildingNameFromUrl();
            const roomsToFilter = filterRoomsByBuilding(studyRooms, currentBuilding);
            
            let filteredRooms = roomsToFilter.filter(room => {
                return room.room.toLowerCase().includes(searchTerm) || room.building.toLowerCase().includes(searchTerm);
            });


            // ⭐ NEW: Add sorting for Rooms page
            filteredRooms = sortStudySpots(filteredRooms, currentSortBy, currentSortOrder); 
            
            renderStudyRooms(filteredRooms);
            // ⭐ NEW: Filter the room pins too
            renderRoomPins(filteredRooms);

        } else {
            let filteredSpots = studySpots.filter(spot => {
                return spot.name.toLowerCase().includes(searchTerm);
            });

            filteredSpots = sortStudySpots(filteredSpots, currentSortBy, currentSortOrder);

            renderStudySpots(filteredSpots);
            renderMapPins(filteredSpots); // NEW: Update map pins based on filtered spots
        }
    }


    // --- Initialization: Run once the page loads ---
    if (IS_ROOMS_PAGE) {
        if (mapContent) {
            applyMapTransform();
        }

        const currentBuilding = getBuildingNameFromUrl();
        updateRoomsPageContent(currentBuilding);
        updateMapImage(currentBuilding); 
        
        const roomsToRender = filterRoomsByBuilding(studyRooms, currentBuilding);
        renderStudyRooms(roomsToRender);
        
        renderRoomPins(roomsToRender);

    } else {
        // This runs on index.html, with NEW zoom initialization
        if (mapContainer && mapImage) {
            // Apply default zoom and transform on load (This sets the map to 1.2x immediately)
            applyMapTransform();

            // Attach zoom event listeners
            if (zoomInBtn) zoomInBtn.addEventListener('click', zoomIn);
            if (zoomOutBtn) zoomOutBtn.addEventListener('click', zoomOut);
            if (resetViewBtn) resetViewBtn.addEventListener('click', resetView);
        }

        filterAndRender();
    }

    // Attach the filter function to the search input 'input' event (for both pages)
    if (searchInput) {
        searchInput.addEventListener('input', filterAndRender);
    }

    // ----------------------------------------------------
    // --- NEW: Sort Dropdown Logic ---
    // ----------------------------------------------------

    if (sortBtn && sortDropdown) {
        // Toggle the dropdown visibility
        sortBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sortDropdown.classList.toggle('active');
        });

        // Handle selection from the dropdown
        sortDropdown.addEventListener('click', (e) => {
            const listItem = e.target.closest('li');
            if (!listItem) return;

            // Get sort parameters from data attributes
            const sortBy = listItem.dataset.sortBy;
            const sortOrder = listItem.dataset.sortOrder;

            // Update the state
            currentSortBy = sortBy;
            currentSortOrder = sortOrder;

            // Close the dropdown
            sortDropdown.classList.remove('active');
            
            // Re-render the list with the new sorting
            filterAndRender();
        });

        // Hide dropdown when clicking elsewhere
        document.addEventListener('click', (e) => {
            if (!sortDropdown.contains(e.target) && !sortBtn.contains(e.target)) {
                sortDropdown.classList.remove('active');
            }
        });
    }


    // **NEW FUNCTION: Render Map Pins**
    // **NEW FUNCTION: Render Map Pins**
    function renderMapPins(spots) {
        if (!mapContent || IS_ROOMS_PAGE) return; 

        // CRITICAL: Remove all existing pins before adding new ones (needed for filtering)
        document.querySelectorAll('.map-content .map-pin-container').forEach(pin => pin.remove());        // NOTE: Changed selector from .map-pin to the new .map-pin-container

        // Clear the floating popup root before rendering new pins
        pinPopupRoot.innerHTML = '';

        spots.forEach(spot => {
            // Ensure coordinates exist before trying to place a pin
            if (spot.x === undefined || spot.y === undefined) return; 

            // 🌟 Rework: Pin is now a DIV container
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

            // --- 🌟 Add the Info Card Content ---
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
            
            // --- 🌟 NEW: Event Listeners for Hover/Positioning ---
            pinContainer.addEventListener('mouseenter', () => {
                // 1. Hide any currently visible popup
                if (currentPopup && currentPopup !== infoCard) {
                    currentPopup.classList.remove('visible');
                }

                // 2. Calculate the exact screen position of the pin image
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
                window.location.href = `Rooms/Rooms.html?building=${encodeURIComponent(spot.name)}`;
            });

            mapContent.appendChild(pinContainer);
        });
    }


    function renderRoomPins(rooms) {
        if (!mapContent) return; 

        // Remove existing pins from the map content before adding new ones
        document.querySelectorAll('.map-content .room-pin-container').forEach(pin => pin.remove());
        
        // Check if the pin popup root exists and clear it (if you are using the same popup logic)
        if (pinPopupRoot) {
            pinPopupRoot.innerHTML = ''; 
        }
        
        // Get the current building's map data
        const currentBuilding = getBuildingNameFromUrl();
        const spotData = studySpots.find(spot => spot.name.toLowerCase() === currentBuilding.toLowerCase());
        
        // Use a generic pin image for rooms, or define one in studyRooms
        const defaultRoomPin = spotData && spotData.pinImage 
            ? `../${spotData.pinImage}` 
            : "../Images/PinIcon.png"; 

        rooms.forEach(room => {
            // Skip rendering if coordinates are missing
            if (room.x === undefined || room.y === undefined) return; 

            // 1. Create Pin Container
            const pinContainer = document.createElement("div"); 
            pinContainer.classList.add("map-pin-container", "room-pin-container"); // Add a new class for room pins
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

            // --- Add Info Card (for hover functionality, using existing logic) ---
            const infoCard = document.createElement("div");
            infoCard.classList.add("floating-pin-info-card");
            
            const bookmarkStatus = room.bookmark ? 'Bookmarked' : 'Unbookmarked';

            infoCard.innerHTML = `
                <img src="${room.image}" alt="${room.room} interior" class="info-card-img">
                <div class="info-card-details">
                    <span class="info-name">${room.room} (${room.building})</span>
                    <span class="info-rating">Rating: ${room.rating}</span>
                    <span class="info-status">${bookmarkStatus}</span>
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
            
            // 4. Add Event Listeners (You can reuse your existing pin listener logic here)
            pinContainer.addEventListener('click', (event) => {
                alert(`Room pin clicked: ${room.room}. Now show room details.`);
                // In a real app, this would open a modal or navigate to a room detail page.
            });


            mapContent.appendChild(pinContainer);
        });
    }

});



/* ----------------- STAR RATING ----------------- */

const stars = document.querySelectorAll(".star");
let rating = 0;

stars.forEach((star) => {
    star.addEventListener("mouseover", () => {
        resetStars();
        highlight(star.dataset.value);
    });

    star.addEventListener("mouseout", () => {
        resetStars();
        highlight(rating);
    });

    star.addEventListener("click", () => {
        rating = star.dataset.value;
        highlight(rating);
    });
});

function highlight(num) {
    stars.forEach((star) => {
        if (star.dataset.value <= num) {
            star.classList.add("active");
        }
    });
}

function resetStars() {
    stars.forEach((star) => star.classList.remove("active"));
}


/* ----------------- POST REVIEW ----------------- */

document.getElementById("postBtn").addEventListener("click", () => {
    const reviewText = document.getElementById("reviewBox").value.trim();

    if (reviewText === "" || rating === 0) {
        alert("Please rate and write a review!");
        return;
    }


    const reviewData = {
        rating: rating,
        text: reviewText
    }

    localStorage.setItem("newReview", JSON.stringify(reviewData));


    window.location.href = "";
   
});