// Sidebar functionality
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const closeSidebar = document.getElementById('closeSidebar');

menuToggle.addEventListener('click', () => {
    sidebar.classList.add('show');
    sidebarOverlay.classList.add('show');
});

closeSidebar.addEventListener('click', () => {
    sidebar.classList.remove('show');
    sidebarOverlay.classList.remove('show');
});

sidebarOverlay.addEventListener('click', () => {
    sidebar.classList.remove('show');
    sidebarOverlay.classList.remove('show');
});

function navigateTo(destination) {
    sidebar.classList.remove('show');
    sidebarOverlay.classList.remove('show');
    
    switch(destination) {
        case 'profile':
            window.location.href = '/profile';
            break;
        case 'engineering':
            window.location.href = '/pcm';
            break;
        case 'pharmacy':
            window.location.href = '/pcb';
            break;
        case 'neet':
            window.location.href = '/neet';
            break;
        case 'bba_bms':
            window.location.href = '/bba_bca';
            break;
        case 'bca':
            window.location.href = '/bca';
            break;
        case 'logout':
            document.getElementById('logout').click();
            break;
    }
}

// Initialize College Swiper
const collegeSwiper = new Swiper(".collegeSwiper", {
    slidesPerView: 1,
    spaceBetween: 20,
    pagination: {
        el: ".swiper-pagination",
        clickable: true,
    },
    breakpoints: {
        640: {
            slidesPerView: 2,
        },
        1024: {
            slidesPerView: 3,
        },
    },
});

document.addEventListener('DOMContentLoaded', async function () {
  await collegeNames();
});


let colleges = [];

async function collegeNames() {
    try {
        const response = await fetch('/bba_bms/collegeNames');
        colleges = await response.json();
    } catch (error) {
        console.log(error);
    }
}

const searchInput = document.getElementById('collegeSearch');
const searchResults = document.getElementById('searchResults');

searchInput.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    searchResults.innerHTML = '';
    
    if (searchTerm.length < 2) {
        searchResults.style.display = 'none';
        return;
    }
    
    const filteredColleges = colleges.filter(college => 
        college.college_name.toLowerCase().includes(searchTerm)
    );
    
    if (filteredColleges.length === 0) {
        searchResults.innerHTML = '<div class="search-result-item">No colleges found</div>';
        searchResults.style.display = 'block';
        return;
    }
    
    filteredColleges.forEach(college => {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        resultItem.innerHTML = `
            <div class="college-name">${college.college_name}</div>
        `;
        resultItem.addEventListener('click', () => {
            viewCollegeDetails(college.college_code);
        });
        searchResults.appendChild(resultItem);
    });
    
    searchResults.style.display = 'block';
});

// Close search results when clicking outside
document.addEventListener('click', function(e) {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.style.display = 'none';
    }
});

// Show results when search input is focused
searchInput.addEventListener('focus', function() {
    if (this.value.length >= 2 && searchResults.children.length > 0) {
        searchResults.style.display = 'block';
    }
});


// Auto-scrolling updates with infinite loop
let currentUpdate = 0;
const updateItems = document.querySelectorAll('.update-item');
const updatesTrack = document.querySelector('.updates-track');
const totalUpdates = updateItems.length - 1; // Subtract 1 because we duplicated the first item
const updateWidth = 100; // 100% width per item
let isTransitioning = false;

function scrollToNextUpdate() {
    if (isTransitioning) return;
    
    currentUpdate++;
    updatesTrack.style.transition = 'transform 0.5s ease';
    updatesTrack.style.transform = `translateX(-${currentUpdate * updateWidth}%)`;
    isTransitioning = true;
    
    // When we reach the duplicate first item, instantly reset to the real first item
    if (currentUpdate === totalUpdates) {
        setTimeout(() => {
            updatesTrack.style.transition = 'none';
            currentUpdate = 0;
            updatesTrack.style.transform = `translateX(0)`;
            setTimeout(() => {
                isTransitioning = false;
            }, 50);
        }, 500);
    } else {
        setTimeout(() => {
            isTransitioning = false;
        }, 500);
    }
}

// Start auto-scrolling (change every 5 seconds)
let updateInterval = setInterval(scrollToNextUpdate, 5000);

// Pause auto-scrolling when user hovers over updates
updatesTrack.addEventListener('mouseenter', () => {
    clearInterval(updateInterval);
});

// Resume auto-scrolling when user leaves
updatesTrack.addEventListener('mouseleave', () => {
    updateInterval = setInterval(scrollToNextUpdate, 5000);
});

// Handle touch events for mobile
let touchStartX = 0;
let touchEndX = 0;

updatesTrack.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    clearInterval(updateInterval);
});

updatesTrack.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
    updateInterval = setInterval(scrollToNextUpdate, 5000);
});

function handleSwipe() {
    const threshold = 50; // minimum swipe distance
    
    if (touchStartX - touchEndX > threshold) {
        // Swipe left - next update
        scrollToNextUpdate();
    } else if (touchEndX - touchStartX > threshold) {
        // Swipe right - previous update
        if (currentUpdate > 0) {
            currentUpdate--;
            updatesTrack.style.transform = `translateX(-${currentUpdate * updateWidth}%)`;
        }
    }
}




document.getElementById('topCollgesbba_bms').addEventListener('click',()=>{
    window.location.href = '/bba_bms/topCollegeBbaBMS';
});

//logout
document.getElementById('logout').addEventListener('click',async ()=>{
    try {
        const response = await fetch('/pcm/logout');
        const data = await response.json();

        if(data.islogout){
            window.location.href = '/';
        }else{
            console.log(data.msg);
        }
    } catch (error) {
        console.log(error);
    }
});


document.getElementById('collegePredictorBBABMS').addEventListener('click',()=>{
    window.location.href = '/bba_bms/collegePredictorBBABMS';
});


// View College Details
async function viewCollegeDetails(id) {
    window.location.href = `/collegePageBBABMS/${id}`;
}

// Payment Modal Functions
let selectedPlan = null;

function openPaymentModal() {
    document.getElementById('paymentModal').style.display = 'flex';
}

function closePaymentModal() {
    document.getElementById('paymentModal').style.display = 'none';
}

function selectPlan(planType) {
    selectedPlan = planType;
    const basicPlan = document.getElementById('basicPlan');
    const premiumPlan = document.getElementById('premiumPlan');
    
    if (planType === 'basic') {
        basicPlan.classList.add('selected');
        premiumPlan.classList.remove('selected');
    } else {
        premiumPlan.classList.add('selected');
        basicPlan.classList.remove('selected');
    }
}

function proceedToPayment() {
    if (!selectedPlan) {
        alert('Please select a plan first');
        return;
    }
    
    const planName = selectedPlan === 'basic' ? 'Basic Plan (₹500)' : 'Premium Plan (₹1000)';
    alert(`Redirecting to payment gateway for ${planName}`);
    // In actual implementation, this would redirect to payment gateway
    // window.location.href = `/payment?plan=${selectedPlan}`;
}

// Mobile Menu Toggle
document.querySelector('.mobile-menu-btn').addEventListener('click', function() {
    const navLinks = document.querySelector('.nav-links');
    const authButtons = document.querySelector('.auth-buttons');
    
    if (navLinks.style.display === 'flex') {
        navLinks.style.display = 'none';
        authButtons.style.display = 'none';
    } else {
        navLinks.style.display = 'flex';
        authButtons.style.display = 'flex';
        navLinks.style.flexDirection = 'column';
        authButtons.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '100%';
        navLinks.style.left = '0';
        navLinks.style.width = '100%';
        navLinks.style.backgroundColor = '#0a0a1a';
        navLinks.style.padding = '1rem';
        authButtons.style.position = 'absolute';
        authButtons.style.top = 'calc(100% + 150px)';
        authButtons.style.left = '0';
        authButtons.style.width = '100%';
        authButtons.style.backgroundColor = '#0a0a1a';
        authButtons.style.padding = '1rem';
        authButtons.style.gap = '1rem';
    }
});

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('paymentModal');
    if (event.target === modal) {
        closePaymentModal();
    }
}


