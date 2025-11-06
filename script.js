document.addEventListener("DOMContentLoaded", () => {
const hamburger = document.querySelector(".HamburgerMenu");
const sidebar = document.querySelector(".sidebar");

let buttonList = null;
let roombuttonList = null;
// Step 2: Get the container for the buttons
if(document.title == "StudyDen"){
    buttonList = document.getElementById("button-list");
}
if(document.title == "StudyDen/Rooms"){
    roombuttonList = document.getElementById("room-button-list");
}

const closeBtn = document.getElementById("closeBtn");

// 1. Get the new search input element
const searchInput = document.getElementById("searchInput");

const studySpots = [
  { name: "Dafoe", image: "Images/StudyRooms/Dafoe.jpg", rating: 4.5, open: 7, close: 22},
  { name: "Engineering", image: "Images/StudyRooms/EITC.png", rating: 4.0, open: 7, close: 24 },
  { name: "Machray Hall", image: "Images/StudyRooms/Machray.png", rating: 2.9, open: 9, close: 20 },
  { name: "Tier", image: "Images/StudyRooms/Tier.png", rating: 4.1, open: 8, close: 23 },
  { name: "Gym", image: "Images/Map.png", rating: 3.9, open: 6, close: 22 },
];

const studyRooms = [
  { building: "Engineering", room: "EITC2 123", image: "Images/StudyRooms/StudyRoom.png", rating: 4.5, bookmark: false},
  { building: "Engineering",room: "EITC1 222", image: "Images/StudyRooms/StudyRoom.png", rating: 4.0, bookmark: true},
  { building: "Engineering", room: "EITC2 240", image: "Images/StudyRooms/StudyRoom.png", rating: 2.9, bookmark: false},
  { building: "Engineering", room: "EITC3 321", image: "Images/StudyRooms/StudyRoom.png", rating: 4.1, bookmark: true},
  { building: "Engineering", room: "EITC1 510", image: "Images/StudyRooms/StudyRoom.png", rating: 3.9, bookmark: true},
];

function isSpotOpen(openHour, closeHour) {
  const now = new Date();
  const currentHour = now.getHours();

  // Check if the current hour is within the defined operating hours
  // The spot is considered closed *at* the closeHour
  return currentHour >= openHour && currentHour < closeHour;
}

hamburger.addEventListener("click", (e) => {
    e.stopPropagation(); // stop click from bubbling up
    hamburger.classList.toggle("active");
    sidebar.classList.toggle("active");
});


closeBtn.addEventListener("click", (e) => {
    e.stopPropagation(); // stop click from bubbling up
    hamburger.classList.remove("active");
    sidebar.classList.remove("active");
});


// close sidebar when clicking outside
document.addEventListener('click', (e) => {
  // check if click is outside both sidebar & hamburger
  if (!sidebar.contains(e.target) && !hamburger.contains(e.target)) {
    sidebar.classList.remove('active');
    hamburger.classList.remove('active');
  }
});


// 2. Function to render study spots
function renderStudySpots(spots) {
    if(!buttonList) return;
    // Clear all existing buttons
    buttonList.innerHTML = '';

    spots.forEach(spot => {
        const btn = document.createElement("button");
        btn.classList.add("spot-btn");

        let stars = Math.floor(spot.rating);
        let amountStars = "";

        for (let i = 0; i < stars; i++) {
            amountStars += "⭐";
        }

        const isOpen = isSpotOpen(spot.open, spot.close);
        const statusText = isOpen ? "Open" : "Closed";
        const statusClass = isOpen ? "open" : "closed";

        btn.innerHTML = `
            <div class="spot-img-wrapper">
                <img src="${spot.image}" alt="${spot.name}" class="spot-img">
            </div>
            <span class="spot-name">${spot.name}</span>
            <span class="spot-rating">${amountStars} ${spot.rating}</span>
            <span class="spot-status ${statusClass}">${statusText}</span>
        `;

        btn.addEventListener("click", () => {
             if (spot.name === "Engineering") {
                window.location.href = "Rooms.html";
            } 
            else{
                alert(`You clicked ${spot.name}`);
            }
        });

        buttonList.appendChild(btn);
    });
}



if(studyRooms){
function renderStudyRooms(rooms) {
    // Clear the container
    if(!roombuttonList) return;
    roombuttonList.innerHTML = '';

    rooms.forEach(room => {
        const btn = document.createElement("button");
        btn.classList.add("room-btn"); // use the new class

        let stars = Math.floor(room.rating);
        let amountStars = "";
        for (let i = 0; i < stars; i++) {
            amountStars += "⭐";
        }
        
        

        btn.innerHTML = `
            <div class="room-img-wrapper">
                <img src="${room.image}" alt="${room.name}" class="room-img">
            </div>
            <div class="room-info">
                <span class="room-building">${room.building}</span>
                <span class ="room-number">${room.room}</span>
                <span class="room-rating">${amountStars} ${room.rating}</span>
                <span class="room-bookmark">${room.bookmark 
                      ? `<svg class="bookmark-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="24" height="24">
             <path d="M6 4a2 2 0 0 0-2 2v16l8-4 8 4V6a2 2 0 0 0-2-2H6z"/>
           </svg>`
        : `<svg class="bookmark-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24">
             <path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
           </svg>`
                }</span>
                
            </div>
        `;

        btn.addEventListener("click", () => {
                alert(`You clicked ${room.room}`);
        });

        roombuttonList.appendChild(btn);
    });
    
    roombuttonList.addEventListener("click", e => {
        const bookmarkIcon = e.target.closest(".room-bookmark");
        if (!bookmarkIcon) return; // only proceed if a bookmark was clicked
        e.stopPropagation(); // prevent triggering room button click

        // toggle bookmark state
        const isBookmarked = bookmarkIcon.dataset.bookmarked === "true";
        bookmarkIcon.dataset.bookmarked = (!isBookmarked).toString();

        // swap SVG
        bookmarkIcon.innerHTML = !isBookmarked
            ? `<svg class="bookmark-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="gold" width="24" height="24">
            <path d="M6 4a2 2 0 0 0-2 2v16l8-4 8 4V6a2 2 0 0 0-2-2H6z"/>
            </svg>`
            : `<svg class="bookmark-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="gold" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24">
            <path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>`;
});
}
}






renderStudySpots(studySpots)
renderStudyRooms(studyRooms)




});
