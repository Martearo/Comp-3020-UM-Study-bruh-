// ==============================================
// --- 1. GLOBAL DATA AND INITIAL SETUP ---
// ==============================================

const hamburger = document.querySelector(".HamburgerMenu");
const sidebar = document.querySelector(".sidebar");
const closeBtn = document.getElementById("closeBtn"); 

const viewProfileLink = document.getElementById('viewProfileLink');

const ALL_ROOM_DATA = [
    {
        id: "D008", 
        buildingNameForLink: "Dafoe", 
        roomNumber: "D-008",
        title: "Dafoe Study Room 401",
        rating: "4.8",
        address: "401 Dafoe Hall, Central Campus",
        amenities: "Free WiFi, Study Rooms, Vending",
        description: "Large, quiet study area on the top floor of Dafoe Hall.",
        utilization: "Capacity: 60% (Moderate)",
        imageUrls: [
            '../Images/StudyRooms/Dafoe008.jpg',
        ]
    },
    {
        id: "M211", 
        buildingNameForLink: "Machray Hall", 
        roomNumber: "M-211",
        title: "Machray Study Room 211",
        rating: "3.9",
        address: "211 Machray Hall, Central Campus",
        amenities: "Free WiFi, Study Rooms, Vending",
        description: "Large, quiet study area on the top floor of Dafoe Hall.",
        utilization: "Capacity: 45% (Moderate)",
        imageUrls: [
            '../Images/StudyRooms/Machray211.jpg',
        ]
    },
    {
        id: "EITC2123",
        buildingNameForLink: "Engineering", 
        roomNumber: "EITC2 123",
        title: "Engineering Room EITC2 123",
        rating: "4.5",
        address: "123 Engineering, EITC II",
        amenities: "Projector, Whiteboard, Charging Ports",
        description: "Dedicated group study room in the newer Engineering complex.",
        utilization: "Capacity: 75% (High)",
        imageUrls: [
            '../Images/StudyRooms/EITC.png',
            '../Images/StudyRooms/Machray.png',
        ]
    },
    {
        id: "T100",
        buildingNameForLink: "Tier", 
        roomNumber: "T 100",
        title: "Engineering Room EITC2 123",
        rating: "4.5",
        address: "123 Engineering, EITC II",
        amenities: "Projector, Whiteboard, Charging Ports",
        description: "Dedicated group study room in the newer Engineering complex.",
        utilization: "Capacity: 75% (High)",
        imageUrls: [
            "../Images/StudyRooms/Tier01.png"
        ]
    }

    // ... add all your rooms here
];

if (viewProfileLink) {
        // 1. Remove the default navigation behavior (the href="#")
        viewProfileLink.addEventListener('click', (e) => {
            e.preventDefault(); 
            
            // 2. Display the alert message
            alert("Profile page is currently unimplemented. Not Part of Primary or Secondary Tasks!"); 
            
            // OPTIONAL: Hide the profile card immediately after clicking the link
            const profileCard = e.target.closest('.profile-info-card');
            if (profileCard) {
                // You'll need to use the CSS classes/styles you use to hide it
                // Assuming you're using CSS to show/hide on hover:
                // Since this click is inside the wrapper, it might not hide immediately based on pure CSS hover.
                // This will force it to hide:
                profileCard.style.opacity = '0';
                profileCard.style.visibility = 'hidden';
                profileCard.style.transform = 'translateY(-5px)';
            }
        });
    }

// Function to get the ID from the URL query parameter
function getRoomIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id'); 
}

// ==============================================
// --- 2. ROOM & CAROUSEL LOADING FUNCTIONS ---
// ==============================================

function loadRoomData(roomId) {
    const room = ALL_ROOM_DATA.find(r => r.id === roomId); 

    if (!room) {
        console.error(`Room data not found for ID: ${roomId}`);
        document.getElementById('buildingCrumbPlaceholder').textContent = 'Error'; 
        document.getElementById('roomCrumb').textContent = 'Room Not Found'; 
        return; 
    }

    // Data Population for Breadcrumbs
    const buildingCrumbPlaceholder = document.getElementById('buildingCrumbPlaceholder');
    const roomCrumb = document.getElementById('roomCrumb');
    
    const buildingName = room.buildingNameForLink;
    const buildingURL = `../Buildings/Buildings.html?building=${encodeURIComponent(buildingName)}`;
    
    buildingCrumbPlaceholder.innerHTML = `<a href="${buildingURL}">${buildingName}</a>`;
    roomCrumb.textContent = room.roomNumber;

    // Data Population for Main Content
    document.getElementById('roomDescription').textContent = room.description;
    document.getElementById('facilityRating').textContent = room.rating; 
    document.getElementById('roomNumberDisplay').textContent = room.roomNumber; 
    document.getElementById('roomAddress').textContent = room.address; 
    document.getElementById('roomAmenities').textContent = room.amenities; 
    document.getElementById('roomUtilization').textContent = room.utilization;
    
    // Update Image Carousel 
    const track = document.getElementById('carouselSlide');
    if (track) {
        track.innerHTML = room.imageUrls.map(url => 
            `<div class="carousel-image" style="background-image: url('${url}');"></div>`
        ).join('');
        initializeCarousel(); 
    }
}


function initializeCarousel() {
    const track = document.getElementById('carouselSlide');
    const slides = Array.from(document.querySelectorAll('#carouselSlide .carousel-image')); 
    const nextButton = document.getElementById('nextBtn');
    const prevButton = document.getElementById('prevBtn');
    const dotsContainer = document.getElementById('carouselDots');
    
    if (!track || slides.length === 0) return; 

    let currentSlideIndex = 0;
    const totalSlides = slides.length;

    // Move to Slide Logic
    const moveToSlide = (index) => {
        if (index < 0) {
            currentSlideIndex = totalSlides - 1;
        } else if (index >= totalSlides) {
            currentSlideIndex = 0;
        } else {
            currentSlideIndex = index;
        }
        track.style.transform = `translateX(-${currentSlideIndex * 100}%)`; 
        updateDots();
    };

    // Create Dots Logic
    const createDots = () => {
        if (!dotsContainer) return;
        dotsContainer.innerHTML = ''; // Clear existing dots
        
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            dot.setAttribute('data-slide-index', i);
            dot.addEventListener('click', () => moveToSlide(i));
            dotsContainer.appendChild(dot);
        }
        updateDots();
    };

    // Update Dots Visuals
    const updateDots = () => {
        const dots = document.querySelectorAll('#carouselDots .dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlideIndex);
        });
    };
    
    // Event Listeners for arrows (using cloneNode to prevent stacking)
    if (nextButton) {
        const newNext = nextButton.cloneNode(true);
        nextButton.parentNode.replaceChild(newNext, nextButton);
        newNext.addEventListener('click', () => moveToSlide(currentSlideIndex + 1));
    }

    if (prevButton) {
        const newPrev = prevButton.cloneNode(true);
        prevButton.parentNode.replaceChild(newPrev, prevButton);
        newPrev.addEventListener('click', () => moveToSlide(currentSlideIndex - 1));
    }

    // Initialization
    createDots();
    moveToSlide(0);
}


// ==============================================
// --- 3. DOM READY LOGIC (All Event Listeners) ---
// ==============================================

document.addEventListener('DOMContentLoaded', () => {
    // Load the specific room data based on URL ID
    const roomId = getRoomIdFromUrl();
    loadRoomData(roomId); 

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

    // --- Profile Card Dropdown ---
    const profileToggle = document.querySelector('.navbar-profile');
    const profileCard = document.getElementById('profile-card');

    if (profileToggle && profileCard) {
        profileToggle.addEventListener('click', (e) => {
            e.stopPropagation(); 
            profileCard.style.display = profileCard.style.display === 'block' ? 'none' : 'block';
        });

        document.addEventListener('click', (e) => {
            if (profileCard.style.display === 'block' && !profileCard.contains(e.target) && !profileToggle.contains(e.target)) {
                profileCard.style.display = 'none';
            }
        });
    }


    // --- Review Modal, Submission, and Voting ---
    const reviewsContainer = document.getElementById('reviewsContainer');
    const modal = document.getElementById('reviewModal');
    const openBtn = document.getElementById('writeReviewBtn');
    const closeBtnModal = document.getElementById('closeReviewModal');
    const form = document.getElementById('reviewForm');
    const ratingStars = document.querySelectorAll('#ratingStars .star');
    const ratingInput = document.getElementById('reviewRating');
    let currentRating = 0;

    // 1. Modal Open/Close
    if (modal && openBtn && closeBtnModal) {
        openBtn.addEventListener('click', () => modal.style.display = 'flex');
        closeBtnModal.addEventListener('click', () => modal.style.display = 'none');
        window.addEventListener('click', (event) => {
            if (event.target === modal) modal.style.display = 'none';
        });
    }
    
    // 2. Star Rating Logic
    if (ratingStars.length > 0) {
        ratingStars.forEach(star => {
            star.addEventListener('click', function() {
                currentRating = parseInt(this.getAttribute('data-rating'));
                ratingInput.value = currentRating;
                
                // Update Visuals
                ratingStars.forEach(s => s.classList.remove('filled'));
                for (let i = 0; i < currentRating; i++) {
                    ratingStars[i].classList.add('filled');
                }
            });
        });
    }

    // 3. Form Submission
    if (form && reviewsContainer) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('reviewerName').value;
            const rating = parseInt(ratingInput.value);
            const text = document.getElementById('reviewText').value;
            
            if (rating === 0 || isNaN(rating)) {
                alert("Please select a star rating.");
                return;
            }

            const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const newReviewId = Date.now(); 
            
            // Generate Star HTML
            let starsHtml = '';
            for(let i=0; i<5; i++) starsHtml += i < rating ? '★' : '☆';

            // Construct the HTML for the new review
            const newReviewHTML = `
                <div class="review-item">
                    <div class="review-header">
                        <div class="reviewer">${name}</div>
                        <div class="review-date">${date}</div>
                    </div>
                    <div class="review-text">"${text}"</div>
                    <div class="review-rating">${starsHtml}</div>
                    <div class="vote-container">
                        <button class="vote-btn upvote-btn" data-review="${newReviewId}">
                            <i class="fas fa-thumbs-up"></i>
                        </button>
                        <span class="vote-count" id="voteCount${newReviewId}">0</span>
                        <button class="vote-btn downvote-btn" data-review="${newReviewId}">
                            <i class="fas fa-thumbs-down"></i>
                        </button>
                    </div>
                </div>
            `;

            // Insert the new review at the TOP
            reviewsContainer.insertAdjacentHTML('afterbegin', newReviewHTML);
            reviewsContainer.scrollTop = 0;

            // Reset Form and Close Modal
            form.reset();
            ratingInput.value = 0;
            ratingStars.forEach(s => s.classList.remove('filled')); 
            modal.style.display = 'none';
        });
    }

    // 4. Scroll Down Button
    const scrollDownBtn = document.getElementById('scrollDownBtn');
    if (reviewsContainer && scrollDownBtn) {
        scrollDownBtn.addEventListener('click', () => {
            reviewsContainer.scroll({
                top: reviewsContainer.scrollHeight,
                behavior: 'smooth'
            });
        });
    }

    // 5. Review Voting Functionality (Event Delegation)
    if (reviewsContainer) {
        reviewsContainer.addEventListener('click', function(e) {
            const button = e.target.closest('.vote-btn');
            if (!button) return;

            e.preventDefault();
            
            const reviewId = button.getAttribute('data-review');
            const isUpvote = button.classList.contains('upvote-btn');
            const voteCountElement = document.getElementById(`voteCount${reviewId}`);
            
            // Find the specific buttons for this review within the container
            const upvoteBtn = reviewsContainer.querySelector(`.upvote-btn[data-review="${reviewId}"]`);
            const downvoteBtn = reviewsContainer.querySelector(`.downvote-btn[data-review="${reviewId}"]`);

            if (!reviewId || !voteCountElement) return;
            
            let currentCount = parseInt(voteCountElement.textContent.trim());
            if (isNaN(currentCount)) currentCount = 0;
            
            // --- Determine the vote change ---
            let voteChange = 0;
            const alreadyActive = button.classList.contains('active');
            
            // 1. Unvote (Clicking the active button again)
            if (alreadyActive) {
                button.classList.remove('active');
                voteChange = isUpvote ? -1 : 1; 
            
            // 2. Swap Vote (Clicking the opposite button)
            } else if ((upvoteBtn && upvoteBtn.classList.contains('active')) || (downvoteBtn && downvoteBtn.classList.contains('active'))) {
                if (upvoteBtn.classList.contains('active')) {
                    upvoteBtn.classList.remove('active');
                    voteChange = -1; 
                } else if (downvoteBtn.classList.contains('active')) {
                    downvoteBtn.classList.remove('active');
                    voteChange = 1; 
                }
                // Apply new vote
                button.classList.add('active');
                voteChange += isUpvote ? 1 : -1;
                
            // 3. New Vote
            } else {
                button.classList.add('active');
                voteChange = isUpvote ? 1 : -1;
            }

            // --- Update the Count ---
            currentCount += voteChange;
            voteCountElement.textContent = currentCount; 

            // Animation
            if (voteChange !== 0) {
                voteCountElement.classList.add('changed');
                setTimeout(() => {
                    voteCountElement.classList.remove('changed');
                }, 500);
            }
        });
    }

});