const hamburger = document.querySelector(".HamburgerMenu");
const sidebar = document.querySelector(".sidebar");

// Step 2: Get the container for the buttons
const buttonList = document.getElementById("button-list");

// 1. Get the new search input element
const searchInput = document.getElementById("searchInput");

const studySpots = [
  { name: "Dafoe", image: "Images/StudyRooms/Dafoe.jpg", rating: 4.5, open: 7, close: 22},
  { name: "Engineering", image: "Images/StudyRooms/EITC.png", rating: 4.0, open: 7, close: 24 },
  { name: "Machray Hall", image: "Images/StudyRooms/Machray.png", rating: 2.9, open: 9, close: 20 },
  { name: "Tier", image: "Images/StudyRooms/Tier.png", rating: 4.1, open: 8, close: 23 },
  { name: "Gym", image: "Images/Map.png", rating: 3.9, open: 6, close: 22 },
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
            alert(`You clicked ${spot.name}`);
        });

        buttonList.appendChild(btn);
    });
}


// 3. Filtering logic executed on every keystroke
function filterAndRender() {
    const searchTerm = searchInput.value.toLowerCase().trim();

    const filteredSpots = studySpots.filter(spot => {
        // Check if the spot name includes the search term (case-insensitive)
        return spot.name.toLowerCase().includes(searchTerm);
    });

    renderStudySpots(filteredSpots);
}

renderStudySpots(studySpots);

// 4. Attach the filter function to the search input 'input' event
searchInput.addEventListener('input', filterAndRender);