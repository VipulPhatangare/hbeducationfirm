// Function to handle exam selection
function selectExam(examType) {
    localStorage.setItem('selectedExam', examType);
    window.location.href = `/login`;
    
}

// Mobile menu functions - now slides from right
function openMobileMenu() {
    document.getElementById('mobileMenu').classList.add('active');
    document.getElementById('overlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
    document.getElementById('mobileMenu').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
    document.body.style.overflow = 'auto';
}


function openLoginModal() {
    closeMobileMenu();
    window.location.href = '/login';
}

function openRegisterModal() {
    closeMobileMenu();
    window.location.href = '/register';
}

// Animation on scroll
document.addEventListener('DOMContentLoaded', function() {
    const fadeElements = document.querySelectorAll('.fade-in');
    
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    fadeElements.forEach(el => {
        el.style.opacity = 0;
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        fadeObserver.observe(el);
    });
});