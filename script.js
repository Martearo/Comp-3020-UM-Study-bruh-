// Sidebar functionality
const hamburgerMenu = document.getElementById('hamburgerMenu');
const sidebar = document.getElementById('sidebar');
const closeBtn = document.getElementById('closeBtn');

hamburgerMenu.addEventListener('click', () => {
    sidebar.style.left = '0';
});

closeBtn.addEventListener('click', () => {
    sidebar.style.left = '-300px';
});

// Carousel functionality
const carouselSlide = document.getElementById('carouselSlide');
const carouselDots = document.getElementById('carouselDots');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

const images = document.querySelectorAll('.carousel-image');
const totalImages = images.length;
let currentIndex = 0;

// Create dots for carousel
for (let i = 0; i < totalImages; i++) {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => {
        goToSlide(i);
    });
    carouselDots.appendChild(dot);
}

const dots = document.querySelectorAll('.dot');

// Function to update carousel position
function updateCarousel() {
    carouselSlide.style.transform = `translateX(-${currentIndex * 100}%)`;
    
    // Update active dot
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex);
    });
}

// Function to go to specific slide
function goToSlide(index) {
    currentIndex = index;
    updateCarousel();
}

// Next button functionality
nextBtn.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % totalImages;
    updateCarousel();
});

// Previous button functionality
prevBtn.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + totalImages) % totalImages;
    updateCarousel();
});

// Auto-advance carousel every 5 seconds
setInterval(() => {
    currentIndex = (currentIndex + 1) % totalImages;
    updateCarousel();
}, 5000);

// Scroll functionality for reviews
const scrollDownBtn = document.getElementById('scrollDownBtn');
const reviewsContainer = document.getElementById('reviewsContainer');

scrollDownBtn.addEventListener('click', () => {
    reviewsContainer.scrollBy({
        top: 200,
        behavior: 'smooth'
    });
});

// Write Review Modal functionality
const writeReviewBtn = document.getElementById('writeReviewBtn');
const reviewModal = document.getElementById('reviewModal');
const closeReviewModal = document.getElementById('closeReviewModal');
const reviewForm = document.getElementById('reviewForm');
const stars = document.querySelectorAll('.star');
const reviewRatingInput = document.getElementById('reviewRating');

writeReviewBtn.addEventListener('click', () => {
    reviewModal.style.display = 'flex';
});

closeReviewModal.addEventListener('click', () => {
    reviewModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === reviewModal) {
        reviewModal.style.display = 'none';
    }
});

// Star rating functionality
stars.forEach(star => {
    star.addEventListener('click', () => {
        const rating = star.getAttribute('data-rating');
        reviewRatingInput.value = rating;
        
        stars.forEach(s => {
            if (s.getAttribute('data-rating') <= rating) {
                s.classList.add('active');
            } else {
                s.classList.remove('active');
            }
        });
    });
});

// Form submission
reviewForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('reviewerName').value;
    const rating = document.getElementById('reviewRating').value;
    const text = document.getElementById('reviewText').value;
    
    if (rating === '0') {
        alert('Please select a rating');
        return;
    }
    
    // In a real application, you would send this data to a server
    alert(`Thank you for your review, ${name}!`);
    
    // Reset form and close modal
    reviewForm.reset();
    stars.forEach(star => star.classList.remove('active'));
    reviewModal.style.display = 'none';
});

// Voting functionality
const upvoteButtons = document.querySelectorAll('.upvote-btn');
const downvoteButtons = document.querySelectorAll('.downvote-btn');
const facilityRating = document.getElementById('facilityRating');
const ratingChange = document.getElementById('ratingChange');

// Track user votes to prevent multiple votes
const userVotes = {};

// Initial facility rating data
let facilityRatingValue = 4.7;
let totalVotes = 125; // Simulated total number of votes

// Function to update the facility rating display
function updateFacilityRating() {
    facilityRating.textContent = facilityRatingValue.toFixed(1);
}

// Function to show rating change
function showRatingChange(change, isPositive) {
    ratingChange.textContent = (isPositive ? '+' : '') + change.toFixed(1);
    ratingChange.className = 'rating-change ' + (isPositive ? 'positive' : 'negative');
    
    // Hide the change indicator after 3 seconds
    setTimeout(() => {
        ratingChange.className = 'rating-change';
    }, 3000);
}

// Function to calculate new facility rating
function calculateNewRating(reviewImpact) {
    // Simulate how a single vote affects the overall rating
    // In a real app, this would be calculated based on all votes
    const ratingChange = reviewImpact / totalVotes;
    facilityRatingValue += ratingChange;
    totalVotes++;
    
    // Ensure rating stays within bounds
    if (facilityRatingValue > 5) facilityRatingValue = 5;
    if (facilityRatingValue < 0) facilityRatingValue = 0;
    
    return ratingChange;
}

upvoteButtons.forEach(button => {
    button.addEventListener('click', () => {
        const reviewId = button.getAttribute('data-review');
        handleVote(reviewId, 'upvote');
    });
});

downvoteButtons.forEach(button => {
    button.addEventListener('click', () => {
        const reviewId = button.getAttribute('data-review');
        handleVote(reviewId, 'downvote');
    });
});

function handleVote(reviewId, voteType) {
    // Check if user already voted on this review
    if (userVotes[reviewId]) {
        // If clicking the same vote again, remove the vote
        if (userVotes[reviewId] === voteType) {
            removeVote(reviewId);
            return;
        }
        // If changing vote, remove previous vote first
        removeVote(reviewId);
    }
    
    // Add new vote
    const voteCountElement = document.getElementById(`voteCount${reviewId}`);
    let currentCount = parseInt(voteCountElement.textContent);
    
    // Calculate impact on facility rating
    const ratingImpact = voteType === 'upvote' ? 0.1 : -0.1;
    const ratingChangeValue = calculateNewRating(ratingImpact);
    
    if (voteType === 'upvote') {
        voteCountElement.textContent = currentCount + 1;
        document.querySelector(`.upvote-btn[data-review="${reviewId}"]`).classList.add('active');
        showRatingChange(ratingChangeValue, true);
    } else {
        voteCountElement.textContent = currentCount - 1;
        document.querySelector(`.downvote-btn[data-review="${reviewId}"]`).classList.add('active');
        showRatingChange(ratingChangeValue, false);
    }
    
    // Update facility rating display
    updateFacilityRating();
    
    // Add visual feedback for vote count change
    voteCountElement.classList.add('changed');
    setTimeout(() => {
        voteCountElement.classList.remove('changed');
    }, 300);
    
    // Store user's vote
    userVotes[reviewId] = voteType;
}

function removeVote(reviewId) {
    const voteType = userVotes[reviewId];
    const voteCountElement = document.getElementById(`voteCount${reviewId}`);
    let currentCount = parseInt(voteCountElement.textContent);
    
    // Calculate impact on facility rating (reverse the previous impact)
    const ratingImpact = voteType === 'upvote' ? -0.1 : 0.1;
    const ratingChangeValue = calculateNewRating(ratingImpact);
    
    if (voteType === 'upvote') {
        voteCountElement.textContent = currentCount - 1;
        document.querySelector(`.upvote-btn[data-review="${reviewId}"]`).classList.remove('active');
        showRatingChange(ratingChangeValue, false);
    } else {
        voteCountElement.textContent = currentCount + 1;
        document.querySelector(`.downvote-btn[data-review="${reviewId}"]`).classList.remove('active');
        showRatingChange(ratingChangeValue, true);
    }
    
    // Update facility rating display
    updateFacilityRating();
    
    // Add visual feedback for vote count change
    voteCountElement.classList.add('changed');
    setTimeout(() => {
        voteCountElement.classList.remove('changed');
    }, 300);
    
    // Remove user's vote record
    delete userVotes[reviewId];
}

// Add animation to cards on page load
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 200);
    });
    
    // Initialize facility rating display
    updateFacilityRating();
});