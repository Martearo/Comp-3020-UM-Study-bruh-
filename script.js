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

    // --- Data Definitions ---
    const studySpots = [
        { name: "Dafoe", image: "Images/StudyRooms/Dafoe.jpg", mapImage: "../Images/RoomMaps/Dafoe.png", rating: 4.5, open: 7, close: 22},
        { name: "Engineering", image: "Images/StudyRooms/EITC.png", mapImage: "../Images/RoomMaps/EITC.png", rating: 4.0, open: 7, close: 24 },
        { name: "Machray Hall", image: "Images/StudyRooms/Machray.png", mapImage: "../Images/RoomMaps/Machray.png", rating: 2.9, open: 9, close: 20 },
        { name: "Tier", image: "Images/StudyRooms/Tier.png", mapImage: "../Images/RoomMaps/Tier.png", rating: 4.1, open: 8, close: 23 },
        { name: "Gym", image: "Images/Map.png", mapImage: "../Images/RoomMaps/Gym.png", rating: 3.9, open: 6, close: 22 },
    ];
    
    const studyRooms = [
        { building: "Dafoe", room: "D-401", image: "../Images/StudyRooms/StudyRoom.png", rating: 4.8, bookmark: false},
        { building: "Dafoe", room: "D-402", image: "../Images/StudyRooms/StudyRoom.png", rating: 4.2, bookmark: true},
        { building: "Engineering", room: "EITC2 123", image: "../Images/StudyRooms/StudyRoom.png", rating: 4.5, bookmark: false },
        { building: "Engineering", room: "EITC1 222", image: "../Images/StudyRooms/StudyRoom.png", rating: 4.0, bookmark: true },
        { building: "Machray Hall", room: "M-300", image: "../Images/StudyRooms/StudyRoom.png", rating: 3.0, bookmark: false },
        { building: "Tier", room: "T-100", image: "../Images/StudyRooms/StudyRoom.png", rating: 3.5, bookmark: false },
    ];


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
    // ... (rest of the script remains the same)

    // --- Search/Filter Logic for both pages ---
    function filterAndRender() {
        if (!searchInput) return;

        const searchTerm = searchInput.value.toLowerCase().trim();

        if (IS_ROOMS_PAGE) {
            const currentBuilding = getBuildingNameFromUrl();
            const roomsToFilter = filterRoomsByBuilding(studyRooms, currentBuilding);
            
            const filteredRooms = roomsToFilter.filter(room => {
                return room.room.toLowerCase().includes(searchTerm) || room.building.toLowerCase().includes(searchTerm);
            });
            renderStudyRooms(filteredRooms);
        } else {
            const filteredSpots = studySpots.filter(spot => {
                return spot.name.toLowerCase().includes(searchTerm);
            });
            renderStudySpots(filteredSpots);
        }
    }


    // --- Initialization: Run once the page loads ---
    if (IS_ROOMS_PAGE) {
        const currentBuilding = getBuildingNameFromUrl();
        updateRoomsPageContent(currentBuilding);
        updateMapImage(currentBuilding); 
        const roomsToRender = filterRoomsByBuilding(studyRooms, currentBuilding);
        renderStudyRooms(roomsToRender);
    } else {
        // This runs on index.html
        renderStudySpots(studySpots);
    }

    // Attach the filter function to the search input 'input' event (for both pages)
    if (searchInput) {
        searchInput.addEventListener('input', filterAndRender);
    }
});