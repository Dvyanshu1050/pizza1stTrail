document.addEventListener('DOMContentLoaded', () => {
    const preloader = document.querySelector('.preloader');
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const cartToggle = document.getElementById('cart-toggle');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartClose = document.getElementById('cart-close');
    const addToCartButtons = document.querySelectorAll('.btn-add-cart');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalSpan = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    const successModal = document.getElementById('success-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const orderDetailsDiv = document.getElementById('order-details');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const menuCards = document.querySelectorAll('.menu-card');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.createElement('div');
    const lightboxContent = document.createElement('img');
    const lightboxClose = document.createElement('span');
    let cart = [];

    // New flag to manage active link state during click-triggered scrolls
    let isScrollingByClick = false;

    // --- Preloader Animation ---
    gsap.to('.pizza-slice', {
        rotation: 360,
        duration: 1.5,
        repeat: -1,
        ease: 'linear',
        stagger: 0.1,
        transformOrigin: '100% 100%'
    });
    gsap.to(preloader, {
        opacity: 0,
        duration: 0.8,
        delay: 2,
        onComplete: () => {
            preloader.classList.add('hidden');
            document.body.style.overflow = ''; // Re-enable scrolling
        }
    });

    // --- Navbar Scroll Effect ---
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // --- Mobile Navigation Toggle ---
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('open');
        navToggle.classList.toggle('active');
    });

    // --- Navigation Link Click Handler ---
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                // Immediately update active link on click
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                // Set flag to prevent scroll listener from overriding active state
                isScrollingByClick = true;

                gsap.to(window, {
                    duration: 1,
                    scrollTo: {
                        y: targetSection,
                        offsetY: navbar.offsetHeight // Account for fixed navbar height
                    },
                    ease: 'power2.inOut',
                    onComplete: () => {
                        // Reset flag after scroll completes
                        isScrollingByClick = false;
                    }
                });

                // Close mobile menu after clicking a link
                if (navMenu.classList.contains('open')) {
                    navMenu.classList.remove('open');
                    navToggle.classList.remove('active');
                }
            }
        });
    });

    // --- Scroll-based Active Navbar Link ---
    const sections = document.querySelectorAll('section');
    window.addEventListener('scroll', () => {
        // Skip update if currently scrolling via a click event
        if (isScrollingByClick) return;

        let current = '';
        sections.forEach(section => {
            // Adjust sectionTop to account for fixed navbar and add a small buffer
            const sectionTop = section.offsetTop - navbar.offsetHeight - 1;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop && pageYOffset < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });

    // --- Cart Sidebar Toggle ---
    cartToggle.addEventListener('click', () => {
        cartSidebar.classList.add('open');
    });

    cartClose.addEventListener('click', () => {
        cartSidebar.classList.remove('open');
    });

    // --- Add to Cart Functionality ---
    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const name = button.dataset.name;
            const price = parseFloat(button.dataset.price);
            const image = button.closest('.menu-card').querySelector('img').src;
            addItemToCart(name, price, image);
            showCartNotification(name);
            e.stopPropagation(); // Prevent card hover effect from interfering
        });
    });

    function addItemToCart(name, price, image) {
        const existingItem = cart.find(item => item.name === name);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ name, price, image, quantity: 1 });
        }
        updateCartUI();
    }

    function removeItemFromCart(name) {
        cart = cart.filter(item => item.name !== name);
        updateCartUI();
    }

    function updateItemQuantity(name, delta) {
        const item = cart.find(item => item.name === name);
        if (item) {
            item.quantity += delta;
            if (item.quantity <= 0) {
                removeItemFromCart(name);
            } else {
                updateCartUI();
            }
        }
    }

    function updateCartUI() {
        cartItemsContainer.innerHTML = '';
        let total = 0;
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Your cart is empty</p>
                </div>
            `;
        } else {
            cart.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.classList.add('cart-item');
                itemElement.innerHTML = `
                    <div class="cart-item-image">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <span class="price">$${item.price.toFixed(2)}</span>
                        <div class="cart-item-quantity">
                            <button class="quantity-minus" data-name="${item.name}">-</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-plus" data-name="${item.name}">+</button>
                        </div>
                    </div>
                    <button class="cart-item-remove" data-name="${item.name}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                `;
                cartItemsContainer.appendChild(itemElement);
                total += item.price * item.quantity;
            });
        }
        cartTotalSpan.textContent = total.toFixed(2);
        document.querySelector('.cart-count').textContent = cart.reduce((sum, item) => sum + item.quantity, 0);

        // Add event listeners for quantity and remove buttons
        cartItemsContainer.querySelectorAll('.quantity-minus').forEach(button => {
            button.addEventListener('click', (e) => {
                updateItemQuantity(e.target.dataset.name, -1);
            });
        });
        cartItemsContainer.querySelectorAll('.quantity-plus').forEach(button => {
            button.addEventListener('click', (e) => {
                updateItemQuantity(e.target.dataset.name, 1);
            });
        });
        cartItemsContainer.querySelectorAll('.cart-item-remove').forEach(button => {
            button.addEventListener('click', (e) => {
                removeItemFromCart(e.target.dataset.name || e.target.closest('button').dataset.name);
            });
        });
    }

    function showCartNotification(itemName) {
        const notification = document.createElement('div');
        notification.classList.add('cart-notification');
        notification.textContent = `${itemName} added to cart!`;
        document.body.appendChild(notification);
        gsap.fromTo(notification,
            { y: 50, opacity: 0, x: '-50%' },
            { y: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }
        );
        gsap.to(notification, {
            opacity: 0,
            y: -50,
            delay: 2,
            duration: 0.5,
            onComplete: () => notification.remove()
        });
    }

    // --- Checkout Process ---
    checkoutBtn.addEventListener('click', () => {
        if (cart.length > 0) {
            displayOrderDetails();
            successModal.classList.add('open');
            cartSidebar.classList.remove('open');
            cart = []; // Clear cart after checkout
            updateCartUI();
        } else {
            alert('Your cart is empty. Please add items before checking out.');
        }
    });

    closeModalBtn.addEventListener('click', () => {
        successModal.classList.remove('open');
    });

    function displayOrderDetails() {
        orderDetailsDiv.innerHTML = '';
        let total = 0;
        cart.forEach(item => {
            const itemDetail = document.createElement('div');
            itemDetail.innerHTML = `<span>${item.name}</span> x ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`;
            orderDetailsDiv.appendChild(itemDetail);
            total += item.price * item.quantity;
        });
        const totalDetail = document.createElement('div');
        totalDetail.innerHTML = `<strong>Total: $${total.toFixed(2)}</strong>`;
        orderDetailsDiv.appendChild(totalDetail);
    }

    // --- Menu Filtering ---
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const filter = button.dataset.filter;
            gsap.to(menuCards, {
                opacity: 0,
                y: 20,
                duration: 0.3,
                stagger: 0.05,
                onComplete: () => {
                    menuCards.forEach(card => {
                        if (filter === 'all' || card.dataset.category === filter) {
                            card.classList.remove('hidden');
                        } else {
                            card.classList.add('hidden');
                        }
                    });
                    gsap.fromTo(menuCards,
                        { opacity: 0, y: 20 },
                        {
                            opacity: 1,
                            y: 0,
                            duration: 0.5,
                            stagger: 0.08,
                            ease: 'power2.out',
                            clearProps: 'all' // Remove GSAP styles after animation
                        }
                    );
                }
            });
        });
    });

    // --- Gallery Lightbox ---
    lightbox.id = 'lightbox';
    lightboxContent.classList.add('lightbox-content');
    lightboxClose.classList.add('lightbox-close');
    lightboxClose.innerHTML = '&times;'; // Times symbol
    lightbox.appendChild(lightboxContent);
    lightbox.appendChild(lightboxClose);
    document.body.appendChild(lightbox);

    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            lightbox.classList.add('open'); // Use class for transition
            lightboxContent.src = item.querySelector('img').src;
        });
    });

    lightboxClose.addEventListener('click', () => {
        lightbox.classList.remove('open');
    });

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.classList.remove('open');
        }
    });

    // --- GSAP Animations ---
    gsap.registerPlugin(ScrollTrigger, TextPlugin, ScrollToPlugin);

    // Hero Section Animations (after intro)
    const heroTimeline = gsap.timeline({ paused: true });
    heroTimeline.from('.hero-title .title-word', {
        opacity: 0,
        y: 50,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power3.out'
    })
    .from('.hero-subtitle', {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: 'power2.out'
    }, "-=0.5")
    .from('.hero-description', {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: 'power2.out'
    }, "-=0.5")
    .from('.hero-buttons .btn', {
        opacity: 0,
        y: 20,
        stagger: 0.2,
        duration: 0.6,
        ease: 'power2.out'
    }, "-=0.4");

    // Floating pizza and ingredients
    gsap.to('.pizza-image', {
        y: -15,
        repeat: -1,
        yoyo: true,
        duration: 3,
        ease: 'sine.inOut'
    });
    gsap.to('.floating-elements .element', {
        opacity: 1,
        y: (i) => (i % 2 === 0 ? -20 : 20),
        x: (i) => (i % 2 === 0 ? 20 : -20),
        rotation: (i) => (i % 2 === 0 ? 15 : -15),
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: 0.5,
        delay: 0.5 // Slight delay after hero text appears
    });

    // Stats Counter Animation
    const statItems = document.querySelectorAll('.stat-item');
    statItems.forEach(item => {
        const numElement = item.querySelector('.stat-number');
        const target = parseInt(numElement.dataset.target);
        let current = 0;
        ScrollTrigger.create({
            trigger: item,
            start: 'top 80%',
            onEnter: () => {
                gsap.to({ val: current }, {
                    val: target,
                    duration: 2,
                    ease: 'power1.out',
                    onUpdate: function() {
                        numElement.textContent = Math.ceil(this.targets()[0].val).toLocaleString();
                    }
                });
            },
            once: true
        });
    });

    // Section Header Animations
    gsap.utils.toArray('.section-header').forEach(header => {
        gsap.from(header.children, {
            opacity: 0,
            y: 50,
            stagger: 0.2,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: header,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        });
    });

    // Menu Card Animations
    gsap.utils.toArray('.menu-card').forEach(card => {
        gsap.from(card, {
            opacity: 0,
            y: 50,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: card,
                start: 'top 90%',
                toggleActions: 'play none none reverse'
            }
        });
    });

    // About Section Animations
    gsap.from('.about-text', {
        opacity: 0,
        x: -100,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
            trigger: '.about',
            start: 'top 70%',
            toggleActions: 'play none none reverse'
        }
    });
    gsap.from('.about-visual', {
        opacity: 0,
        x: 100,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
            trigger: '.about',
            start: 'top 70%',
            toggleActions: 'play none none reverse'
        }
    });
    gsap.from('.feature', {
        opacity: 0,
        y: 30,
        stagger: 0.2,
        duration: 0.7,
        ease: 'power1.out',
        scrollTrigger: {
            trigger: '.about-features',
            start: 'top 85%',
            toggleActions: 'play none none reverse'
        }
    });

    // Advertisement Section Animations
    gsap.from('.advertisement-text', {
        opacity: 0,
        x: -100,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
            trigger: '.advertisement',
            start: 'top 70%',
            toggleActions: 'play none none reverse'
        }
    });
    gsap.from('.advertisement-visual', {
        opacity: 0,
        x: 100,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
            trigger: '.advertisement',
            start: 'top 70%',
            toggleActions: 'play none none reverse'
        }
    });
    gsap.from('.advertisement-points li', {
        opacity: 0,
        y: 20,
        stagger: 0.1,
        duration: 0.6,
        ease: 'power1.out',
        scrollTrigger: {
            trigger: '.advertisement-points',
            start: 'top 85%',
            toggleActions: 'play none none reverse'
        }
    });

    // Gallery Section Animations
    gsap.utils.toArray('.gallery-item').forEach(item => {
        gsap.from(item, {
            opacity: 0,
            scale: 0.8,
            duration: 0.8,
            ease: 'back.out(1.7)',
            scrollTrigger: {
                trigger: item,
                start: 'top 90%',
                toggleActions: 'play none none reverse'
            }
        });
    });

    // Contact Section Animations
    gsap.from('.contact-info', {
        opacity: 0,
        x: -50,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
            trigger: '.contact',
            start: 'top 70%',
            toggleActions: 'play none none reverse'
        }
    });
    gsap.from('.contact-form', {
        opacity: 0,
        x: 50,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
            trigger: '.contact',
            start: 'top 70%',
            toggleActions: 'play none none reverse'
        }
    });

    // Form input animations on focus
    document.querySelectorAll('.form-group input, .form-group textarea').forEach(input => {
        input.addEventListener('focus', () => {
            gsap.to(input, { borderColor: 'var(--color-primary)', duration: 0.3 });
        });
        input.addEventListener('blur', () => {
            gsap.to(input, { borderColor: '#ccc', duration: 0.3 });
        });
    });

    // Initial cart UI update
    updateCartUI();

    // Intro Animation and Hero display
    gsap.from("#intro .intro-title", {y: 50, opacity: 0, duration: 1, ease: "power3.out"});
    gsap.from("#intro .intro-tagline", {y: 30, opacity: 0, duration: 1, delay: 0.5, ease: "power3.out"});

    setTimeout(() => {
        gsap.to("#intro", {
            opacity: 0,
            duration: 1,
            onComplete: () => {
                document.getElementById("intro").style.display = "none";
                document.querySelector(".hero").style.display = "flex"; // Change to flex to match hero's display
                heroTimeline.play(); // Play hero animations after intro fades
            }
        });
    }, 5000); // 5 seconds for intro
});
