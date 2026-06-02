document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            
            if(targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Adjust for navbar height
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add scroll effect to navbar
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        } else {
            navbar.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
            navbar.style.background = 'rgba(255, 255, 255, 0.9)';
        }
    });

    // Interaction for buy buttons (Redirect to WhatsApp with product info)
    const buyButtons = document.querySelectorAll('.btn-buy');
    buyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.product-card');
            if (card) {
                const modelName = card.querySelector('h3').innerText;
                const imgElement = card.querySelector('.product-img');
                const imgSrc = imgElement ? imgElement.getAttribute('src') : '';
                
                // Base public image URL, falling back to production URL if testing locally
                let imgUrl = '';
                if (imgSrc) {
                    if (window.location.hostname === 'localhost' || window.location.protocol === 'file:') {
                        imgUrl = 'https://zapatini-web.vercel.app/' + imgSrc;
                    } else {
                        imgUrl = window.location.origin + '/' + imgSrc;
                    }
                }
                
                const phoneNumber = '573052048287';
                const messageText = `Hola!!❤️  Quisiera más información sobre este Teni: ${modelName}\n${imgUrl}`;
                const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(messageText)}`;
                
                // Open immediately to prevent browser popup blockers
                window.open(whatsappUrl, '_blank');
            }

            const originalText = this.innerText;
            this.innerText = 'Abriendo... 💬';
            this.style.background = '#98FB98'; // Mint color
            this.style.borderColor = '#98FB98';
            this.style.color = '#2D3436';
            
            setTimeout(() => {
                this.innerText = originalText;
                this.style.background = '';
                this.style.borderColor = '';
                this.style.color = '';
            }, 2000);
        });
    });

    // Preloader handler
    const preloader = document.getElementById('preloader');
    const preloaderText = document.getElementById('preloader-text');

    // Function to hide preloader smoothly
    function hidePreloader() {
        if (preloader && !preloader.classList.contains('fade-out')) {
            preloader.classList.add('fade-out');
        }
    }

    // Function to show preloader (used for offline or loading state)
    function showPreloader(message) {
        if (preloader) {
            if (message && preloaderText) {
                preloaderText.innerText = message;
            }
            preloader.classList.remove('fade-out');
        }
    }

    // Hide preloader when the window is fully loaded
    window.addEventListener('load', () => {
        // Add a slight delay for aesthetic feel
        setTimeout(hidePreloader, 800);
    });

    // Backup: hide preloader after 5 seconds max if window load event doesn't fire
    setTimeout(hidePreloader, 5000);

    // Online / Offline Detection
    function updateConnectionStatus() {
        if (navigator.onLine) {
            // Remove offline preloader if it was shown due to offline status
            if (preloaderText && preloaderText.innerText.includes('conexión')) {
                preloaderText.innerText = '¡Conexión recuperada! Cargando...';
                setTimeout(hidePreloader, 1000);
            }
            // Remove offline banner if it exists
            const banner = document.getElementById('offline-banner');
            if (banner) {
                banner.classList.remove('show');
            }
        } else {
            // Show rotating logo preloader when offline
            showPreloader('Sin conexión a Internet. Intentando reconectar...');
            
            // Or show an offline banner at the bottom
            let banner = document.getElementById('offline-banner');
            if (!banner) {
                banner = document.createElement('div');
                banner.id = 'offline-banner';
                banner.className = 'offline-banner';
                banner.innerHTML = '⚠️ Sin conexión a Internet';
                document.body.appendChild(banner);
            }
            setTimeout(() => banner.classList.add('show'), 100);
        }
    }

    window.addEventListener('online', updateConnectionStatus);
    window.addEventListener('offline', updateConnectionStatus);

    // Check initial connection status
    if (!navigator.onLine) {
        updateConnectionStatus();
    }
});
