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

    // ==========================================
    // SHOPPING CART SYSTEM LOGIC
    // ==========================================

    let cart = JSON.parse(localStorage.getItem('zapatini_cart')) || [];

    const cartFloatBtn = document.getElementById('cart-float-btn');
    const cartCountBadge = document.getElementById('cart-count-badge');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartOverlay = document.getElementById('cart-overlay');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const continueShoppingBtn = document.getElementById('continue-shopping-btn');
    const cartDrawerItems = document.getElementById('cart-drawer-items');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const checkoutWhatsappBtn = document.getElementById('checkout-whatsapp-btn');

    // Open/Close Cart Drawer
    function toggleCart(isOpen) {
        if (isOpen) {
            cartDrawer.classList.add('open');
            cartOverlay.classList.add('open');
            document.body.style.overflow = 'hidden'; // Prevent main page scrolling
        } else {
            cartDrawer.classList.remove('open');
            cartOverlay.classList.remove('open');
            document.body.style.overflow = ''; // Restore scrolling
        }
    }

    if (cartFloatBtn) cartFloatBtn.addEventListener('click', () => toggleCart(true));
    if (closeCartBtn) closeCartBtn.addEventListener('click', () => toggleCart(false));
    if (cartOverlay) cartOverlay.addEventListener('click', () => toggleCart(false));
    if (continueShoppingBtn) continueShoppingBtn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleCart(false);
        const target = document.querySelector('#coleccion');
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });

    // Save cart to local storage and update UI
    function saveCart() {
        localStorage.setItem('zapatini_cart', JSON.stringify(cart));
        renderCart();
    }

    // Add item to cart
    function addToCart(name, price, imgSrc) {
        const existingItem = cart.find(item => item.name === name);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                name: name,
                price: price,
                imgSrc: imgSrc,
                quantity: 1
            });
        }
        saveCart();
        
        // Trigger bounce animation on the float button
        if (cartFloatBtn) {
            cartFloatBtn.classList.remove('cart-pulse');
            // Trigger reflow to restart animation
            void cartFloatBtn.offsetWidth;
            cartFloatBtn.classList.add('cart-pulse');
        }
    }

    // Update Item Quantity
    window.updateCartQty = function(name, change) {
        const item = cart.find(item => item.name === name);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                removeFromCart(name);
            } else {
                saveCart();
            }
        }
    };

    // Remove Item from Cart
    window.removeFromCart = function(name) {
        cart = cart.filter(item => item.name !== name);
        saveCart();
    };

    // Render Cart HTML
    function renderCart() {
        // Calculate items count and total
        let totalCount = 0;
        let totalPrice = 0;
        
        // Clear items display (keeping empty state template ready)
        cartDrawerItems.innerHTML = '';
        
        if (cart.length === 0) {
            // Render empty state
            cartDrawerItems.innerHTML = `
                <div class="cart-empty-state">
                    <span class="empty-icon">👟</span>
                    <p>Tu carrito está vacío.</p>
                    <a href="#coleccion" id="continue-shopping-btn" class="btn-continue-shopping">Ver Catálogo</a>
                </div>
            `;
            // Re-bind the click event for continue shopping button
            const newContinueBtn = document.getElementById('continue-shopping-btn');
            if (newContinueBtn) {
                newContinueBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    toggleCart(false);
                    const target = document.querySelector('#coleccion');
                    if (target) {
                        window.scrollTo({
                            top: target.offsetTop - 80,
                            behavior: 'smooth'
                        });
                    }
                });
            }
        } else {
            cart.forEach(item => {
                totalCount += item.quantity;
                totalPrice += item.price * item.quantity;
                
                // Render item node
                const itemEl = document.createElement('div');
                itemEl.className = 'cart-item';
                itemEl.innerHTML = `
                    <div class="cart-item-img-container">
                        <img src="${item.imgSrc}" alt="${item.name}" class="cart-item-img">
                    </div>
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <div class="cart-item-price">$${(item.price).toLocaleString('es-CO')} COP</div>
                        <div class="cart-item-controls">
                            <button class="cart-qty-btn" onclick="updateCartQty('${item.name}', -1)">-</button>
                            <span class="cart-qty-val">${item.quantity}</span>
                            <button class="cart-qty-btn" onclick="updateCartQty('${item.name}', 1)">+</button>
                        </div>
                    </div>
                    <button class="cart-item-remove-btn" onclick="removeFromCart('${item.name}')">🗑️</button>
                `;
                cartDrawerItems.appendChild(itemEl);
            });
        }
        
        // Update total values and count badges
        if (cartCountBadge) {
            cartCountBadge.innerText = totalCount;
            // Hide badge if empty
            cartCountBadge.style.transform = totalCount > 0 ? 'scale(1)' : 'scale(0)';
        }
        
        if (cartTotalPrice) {
            cartTotalPrice.innerText = `$${totalPrice.toLocaleString('es-CO')} COP`;
        }

        // Dynamic Shipping Notice Calculation
        const cartShippingNotice = document.getElementById('cart-shipping-notice');
        if (cartShippingNotice) {
            if (totalCount === 0) {
                cartShippingNotice.style.display = 'none';
            } else {
                cartShippingNotice.style.display = 'block';
                let pct = Math.min((totalCount / 3) * 100, 100);
                let text = '';
                if (totalCount === 1) {
                    text = '¡Agrega 2 pares más para obtener <b>Domicilio Gratis</b>! 🚚';
                    cartShippingNotice.classList.remove('free-shipping');
                } else if (totalCount === 2) {
                    text = '¡Agrega 1 par más para obtener <b>Domicilio Gratis</b>! 🚚';
                    cartShippingNotice.classList.remove('free-shipping');
                } else {
                    text = '🎉 ¡Felicidades! Tienes <b>Domicilio GRATIS</b> 🚚';
                    cartShippingNotice.classList.add('free-shipping');
                }
                
                cartShippingNotice.innerHTML = `
                    <div class="shipping-notice-text">${text}</div>
                    <div class="shipping-progress-bar-container">
                        <div class="shipping-progress-bar" style="width: ${pct}%"></div>
                    </div>
                `;
            }
        }
    }


    // Checkout to WhatsApp
    if (checkoutWhatsappBtn) {
        checkoutWhatsappBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('Tu carrito está vacío. Agrega algunos tenis antes de pedir.');
                return;
            }
            
            const phoneNumber = '573052048287';
            let messageText = `Hola!!❤️  Quisiera más información sobre estos Tenis:\n\n`;
            
            let totalPrice = 0;
            let totalCount = 0;
            cart.forEach(item => {
                const subtotal = item.price * item.quantity;
                totalPrice += subtotal;
                totalCount += item.quantity;
                
                // Add public image URL for visual previews in WhatsApp
                let imgUrl = '';
                if (item.imgSrc) {
                    if (window.location.hostname === 'localhost' || window.location.protocol === 'file:') {
                        imgUrl = 'https://zapatini-web.vercel.app/' + item.imgSrc;
                    } else {
                        imgUrl = window.location.origin + '/' + item.imgSrc;
                    }
                }
                
                messageText += `👟 *${item.name}*\n   Cantidad: ${item.quantity}\n   Precio: $${(item.price).toLocaleString('es-CO')} COP c/u\n   Foto: ${imgUrl}\n\n`;
            });
            
            // Add delivery status
            if (totalCount > 2) {
                messageText += `🚚 *Envío: GRATIS* (Promoción de más de 2 tenis)\n`;
            } else {
                messageText += `🚚 *Envío: Por definir / Contra entrega*\n`;
            }
            
            messageText += `💰 *Total a pagar: $${totalPrice.toLocaleString('es-CO')} COP*`;
            
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(messageText)}`;
            window.open(whatsappUrl, '_blank');
        });
    }

    // Initialize/Bind buy buttons in Catalog
    const buyButtons = document.querySelectorAll('.btn-buy');
    buyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.product-card');
            if (card) {
                const modelName = card.querySelector('h3').innerText;
                const imgElement = card.querySelector('.product-img');
                const imgSrc = imgElement ? imgElement.getAttribute('src') : '';
                
                // Extract clean price number (e.g. "$60.000 COP" -> 60000)
                const priceText = card.querySelector('.price').innerText;
                const priceVal = parseInt(priceText.replace(/[^0-9]/g, ''), 10) || 60000;
                
                addToCart(modelName, priceVal, imgSrc);
            }

            const originalText = this.innerText;
            this.innerText = '¡Añadido! 🛒';
            this.style.background = '#98FB98'; // Mint color
            this.style.borderColor = '#98FB98';
            this.style.color = '#2D3436';
            
            setTimeout(() => {
                this.innerText = originalText;
                this.style.background = '';
                this.style.borderColor = '';
                this.style.color = '';
            }, 1200);
        });
    });

    // Render cart on page load
    renderCart();

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

    // Toggle expandable cards in Benefits section
    window.toggleFeatureCard = function(cardEl) {
        const isActive = cardEl.classList.contains('active');
        
        // Close all other expandable cards
        document.querySelectorAll('.expandable-card').forEach(card => {
            card.classList.remove('active');
        });
        
        // Toggle the clicked one
        if (!isActive) {
            cardEl.classList.add('active');
        }
    };
});
