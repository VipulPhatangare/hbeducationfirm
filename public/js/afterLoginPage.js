document.addEventListener('DOMContentLoaded', function() {
    const pathCards = document.querySelectorAll('.path-card');
    
    pathCards.forEach(card => {
        card.addEventListener('click', function() {
            const path = this.getAttribute('data-path');
            
            // Show loading state
            this.style.opacity = '0.7';
            
            // Redirect based on selected path
            switch(path) {
                case 'engineering':
                    window.location.href = '/pcm';
                    break;
                case 'pharmacy':
                    window.location.href = '/pcb';
                    break;
                case 'bba':
                    window.location.href = '/bba_bms';
                    break;
                case 'bca':
                    window.location.href = '/bca';
                    break;
                case 'neet':
                    window.location.href = '/neet';
                    break;
                default:
                    window.location.href = '/home';
            }
        });
    });
});