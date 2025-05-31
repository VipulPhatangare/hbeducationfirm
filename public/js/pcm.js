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



document.getElementById('percentilePredictor').addEventListener('click',()=>{
    window.location.href = '/pcm/percentilePredictor';
});

document.getElementById('topCollgesPCM').addEventListener('click',()=>{
    window.location.href = '/pcm/topCollegePCM';
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


document.getElementById('collegePredictorPCM').addEventListener('click',()=>{
    window.location.href = '/pcm/collegePredictorPCM';
});


// View College Details
function viewCollegeDetails(collegeName) {
    // In actual implementation, this would redirect to college details page
    alert(`Viewing details for ${collegeName}. This would redirect to the college details page.`);
    // window.location.href = `/college/${collegeName.toLowerCase()}`;
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
