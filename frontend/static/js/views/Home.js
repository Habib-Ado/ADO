import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Artigianato on Ligne - Scopri l'Artigianato Locale");
    }

    async getHtml() {
        // Controlla se l'utente è loggato
        const isLoggedIn = this.isUserLoggedIn();
        const userData = this.getUserData();
        
        return `
            <!-- Hero Carousel Section -->
            <div id="carouselExampleRide" class="carousel slide" data-bs-ride="true">
                <div class="carousel-inner">
                    <div class="carousel-item active">
                        <div class="hero-slide d-flex align-items-center justify-content-center" style="height: 600px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                            <div class="container text-center text-white">
                                ${isLoggedIn ? `
                                    <h1 class="display-3 fw-bold mb-4">Benvenuto, ${userData.username}!</h1>
                                    <p class="lead mb-4 fs-5">Scopri le ultime creazioni artigianali e inizia a fare acquisti</p>
                                    <div class="d-flex justify-content-center gap-3 flex-wrap">
                                        <a href="/prodotti" class="btn btn-light btn-lg px-4 py-3 fw-semibold" data-link>
                                            <i class="fas fa-shopping-cart me-2"></i>Inizia a Comprare
                                        </a>
                                        <a href="/carrello" class="btn btn-outline-light btn-lg px-4 py-3 fw-semibold" data-link>
                                            <i class="fas fa-shopping-bag me-2"></i>Il Mio Carrello
                                        </a>
                                    </div>
                                ` : `
                                    <h1 class="display-3 fw-bold mb-4">Scopri l'Artigianato Locale</h1>
                                    <p class="lead mb-4 fs-5">Una piattaforma unica per scoprire e comprare creazioni artigianali d'eccezione</p>
                                    <div class="d-flex justify-content-center gap-3 flex-wrap">
                                        <a href="/prodotti" class="btn btn-light btn-lg px-4 py-3 fw-semibold" data-link>
                                            <i class="fas fa-search me-2"></i>Esplora i Prodotti
                                        </a>
                                        <a href="/register" class="btn btn-outline-light btn-lg px-4 py-3 fw-semibold" data-link>
                                            <i class="fas fa-user-plus me-2"></i>Diventa Artigiano
                                        </a>
                                </div>
                                `}
                            </div>
                        </div>
                    </div>
                    <div class="carousel-item">
                        <div class="hero-slide d-flex align-items-center justify-content-center" style="height: 600px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                            <div class="container text-center text-white">
                                ${isLoggedIn ? `
                                    <h1 class="display-3 fw-bold mb-4">Le Tue Creazioni Preferite</h1>
                                    <p class="lead mb-4 fs-5">Salva i tuoi prodotti preferiti e ricevi notifiche sui nuovi arrivi</p>
                                    <div class="d-flex justify-content-center gap-3 flex-wrap">
                                        <a href="/prodotti" class="btn btn-light btn-lg px-4 py-3 fw-semibold" data-link>
                                            <i class="fas fa-heart me-2"></i>I Miei Preferiti
                                        </a>
                                        <a href="/ordini" class="btn btn-outline-light btn-lg px-4 py-3 fw-semibold" data-link>
                                            <i class="fas fa-list me-2"></i>I Miei Ordini
                                        </a>
                                    </div>
                                ` : `
                                    <h1 class="display-3 fw-bold mb-4">Creazioni Uniche</h1>
                                    <p class="lead mb-4 fs-5">Ogni pezzo racconta una storia, ogni artigiano porta la sua passione</p>
                                    <div class="d-flex justify-content-center gap-3 flex-wrap">
                                        <a href="/prodotti" class="btn btn-light btn-lg px-4 py-3 fw-semibold" data-link>
                                            <i class="fas fa-heart me-2"></i>Scopri le Storie
                                        </a>
                                        <a href="/artigiani" class="btn btn-outline-light btn-lg px-4 py-3 fw-semibold" data-link>
                                            <i class="fas fa-users me-2"></i>Conosci gli Artigiani
                                        </a>
                                </div>
                                `}
                            </div>
                        </div>
                    </div>
                    <div class="carousel-item">
                        <div class="hero-slide d-flex align-items-center justify-content-center" style="height: 600px; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
                            <div class="container text-center text-white">
                                ${isLoggedIn ? `
                                    <h1 class="display-3 fw-bold mb-4">Supporta gli Artigiani</h1>
                                    <p class="lead mb-4 fs-5">Con ogni acquisto sostieni l'artigianato locale e preservi le tradizioni</p>
                                    <div class="d-flex justify-content-center gap-3 flex-wrap">
                                        <a href="/prodotti" class="btn btn-light btn-lg px-4 py-3 fw-semibold" data-link>
                                            <i class="fas fa-shopping-cart me-2"></i>Continua a Comprare
                                        </a>
                                        <a href="/messaggi" class="btn btn-outline-light btn-lg px-4 py-3 fw-semibold" data-link>
                                            <i class="fas fa-comments me-2"></i>Contatta Artigiani
                                        </a>
                                    </div>
                                ` : `
                                    <h1 class="display-3 fw-bold mb-4">Supporta l'Artigianato</h1>
                                    <p class="lead mb-4 fs-5">Sostieni gli artigiani locali e contribuisci a preservare le nostre tradizioni</p>
                                    <div class="d-flex justify-content-center gap-3 flex-wrap">
                                        <a href="/prodotti" class="btn btn-light btn-lg px-4 py-3 fw-semibold" data-link>
                                            <i class="fas fa-shopping-cart me-2"></i>Inizia a Comprare
                                        </a>
                                        <a href="/about" class="btn btn-outline-light btn-lg px-4 py-3 fw-semibold" data-link>
                                            <i class="fas fa-info-circle me-2"></i>Scopri di Più
                                        </a>
                                </div>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
                <button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleRide" data-bs-slide="prev">
                    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span class="visually-hidden">Precedente</span>
                </button>
                <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleRide" data-bs-slide="next">
                    <span class="carousel-control-next-icon" aria-hidden="true"></span>
                    <span class="visually-hidden">Successivo</span>
                </button>
            </div>

            <!-- Welcome Section per Utenti Loggati -->
            ${isLoggedIn ? `
                <section class="py-5 bg-primary text-white">
                    <div class="container">
                        <div class="row align-items-center">
                            <div class="col-lg-8">
                                <h2 class="display-5 fw-bold mb-3">🎉 Bentornato, ${userData.username}!</h2>
                                <p class="lead mb-4">La tua esperienza personalizzata ti aspetta. Scopri prodotti su misura per te e gestisci i tuoi acquisti.</p>
                                <div class="d-flex gap-3 flex-wrap">
                                    <a href="/prodotti" class="btn btn-light btn-lg" data-link>
                                        <i class="fas fa-search me-2"></i>Esplora Prodotti
                                    </a>
                                    <a href="/ordini" class="btn btn-outline-light btn-lg" data-link>
                                        <i class="fas fa-list me-2"></i>I Miei Ordini
                                    </a>
                                    <a href="/messaggi" class="btn btn-outline-light btn-lg" data-link>
                                        <i class="fas fa-comments me-2"></i>Messaggi
                                    </a>
                                </div>
                            </div>
                            <div class="col-lg-4 text-center">
                                <div class="welcome-icon">
                                    <i class="fas fa-user-circle fa-6x text-light"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            ` : ''}

            <!-- Features Section -->
            <section class="py-5 bg-light">
                <div class="container">
                <div class="row g-4">
                        <div class="col-lg-4 col-md-6">
                            <div class="feature-card text-center p-4 h-100 bg-white rounded-3 shadow-sm border-0">
                                <div class="feature-icon mb-4">
                                    <div class="icon-circle bg-primary text-white d-inline-flex align-items-center justify-content-center" style="width: 80px; height: 80px; border-radius: 50%;">
                                        <i class="fas fa-palette fa-2x"></i>
                                    </div>
                                </div>
                                <h4 class="fw-bold mb-3">Creazioni Uniche</h4>
                                <p class="text-muted mb-0">Scopri pezzi unici creati con passione da artigiani locali. Ogni prodotto racconta una storia speciale.</p>
                            </div>
                        </div>
                        <div class="col-lg-4 col-md-6">
                            <div class="feature-card text-center p-4 h-100 bg-white rounded-3 shadow-sm border-0">
                                <div class="feature-icon mb-4">
                                    <div class="icon-circle bg-success text-white d-inline-flex align-items-center justify-content-center" style="width: 80px; height: 80px; border-radius: 50%;">
                                        <i class="fas fa-shipping-fast fa-2x"></i>
                        </div>
                    </div>
                                <h4 class="fw-bold mb-3">Spedizione Sicura</h4>
                                <p class="text-muted mb-0">Ricevi le tue creazioni artigianali direttamente a casa con imballaggio sicuro e tracciamento in tempo reale.</p>
                            </div>
                        </div>
                        <div class="col-lg-4 col-md-6">
                            <div class="feature-card text-center p-4 h-100 bg-white rounded-3 shadow-sm border-0">
                                <div class="feature-icon mb-4">
                                    <div class="icon-circle bg-warning text-white d-inline-flex align-items-center justify-content-center" style="width: 80px; height: 80px; border-radius: 50%;">
                                        <i class="fas fa-heart fa-2x"></i>
                        </div>
                    </div>
                                <h4 class="fw-bold mb-3">Supporto Locale</h4>
                                <p class="text-muted mb-0">Sostieni l'artigianato locale e contribuisci a preservare le nostre tradizioni e la cultura artigianale.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Featured Products Section -->
            <section class="py-5">
                <div class="container">
                    <div class="text-center mb-5">
                        <h2 class="display-5 fw-bold mb-3">Prodotti in Evidenza</h2>
                        <p class="lead text-muted">Scopri le creazioni più apprezzate dai nostri artigiani</p>
                    </div>
                <div class="row g-4" id="featured-products">
                    <!-- Products will be loaded dynamically -->
                </div>
                    <div class="text-center mt-5">
                        <a href="/prodotti" class="btn btn-primary btn-lg px-5 py-3 fw-semibold" data-link>
                            <i class="fas fa-th-large me-2"></i>Vedi Tutti i Prodotti
                        </a>
                    </div>
                </div>
            </section>

            <!-- Categories Section -->
            <section class="py-5 bg-light">
                <div class="container">
                    <div class="text-center mb-5">
                        <h2 class="display-5 fw-bold mb-3">Categorie Popolari</h2>
                        <p class="lead text-muted">Esplora le diverse categorie di artigianato</p>
                    </div>
                <div class="row g-4">
                        <div class="col-lg-3 col-md-6">
                            <div class="category-card text-center p-4 bg-white rounded-3 shadow-sm border-0 h-100">
                                <div class="category-icon mb-3">
                                    <div class="icon-circle bg-primary text-white d-inline-flex align-items-center justify-content-center" style="width: 60px; height: 60px; border-radius: 50%;">
                                        <i class="fas fa-gem fa-lg"></i>
                                    </div>
                                </div>
                                <h5 class="fw-bold">Gioielli Artigianali</h5>
                                <p class="text-muted small mb-0">Creazioni uniche in metalli preziosi</p>
                            </div>
                        </div>
                        <div class="col-lg-3 col-md-6">
                            <div class="category-card text-center p-4 bg-white rounded-3 shadow-sm border-0 h-100">
                            <div class="category-icon mb-3">
                                    <div class="icon-circle bg-success text-white d-inline-flex align-items-center justify-content-center" style="width: 60px; height: 60px; border-radius: 50%;">
                                        <i class="fas fa-home fa-lg"></i>
                                    </div>
                                </div>
                                <h5 class="fw-bold">Decorazione Casa</h5>
                                <p class="text-muted small mb-0">Arredi e decorazioni per la tua casa</p>
                            </div>
                        </div>
                        <div class="col-lg-3 col-md-6">
                            <div class="category-card text-center p-4 bg-white rounded-3 shadow-sm border-0 h-100">
                                <div class="category-icon mb-3">
                                    <div class="icon-circle bg-warning text-white d-inline-flex align-items-center justify-content-center" style="width: 60px; height: 60px; border-radius: 50%;">
                                        <i class="fas fa-tshirt fa-lg"></i>
                                    </div>
                                </div>
                                <h5 class="fw-bold">Tessuti e Abbigliamento</h5>
                                <p class="text-muted small mb-0">Tessuti naturali e abbigliamento artigianale</p>
                        </div>
                    </div>
                        <div class="col-lg-3 col-md-6">
                            <div class="category-card text-center p-4 bg-white rounded-3 shadow-sm border-0 h-100">
                            <div class="category-icon mb-3">
                                    <div class="icon-circle bg-info text-white d-inline-flex align-items-center justify-content-center" style="width: 60px; height: 60px; border-radius: 50%;">
                                        <i class="fas fa-mug-hot fa-lg"></i>
                                    </div>
                                </div>
                                <h5 class="fw-bold">Ceramica e Vetro</h5>
                                <p class="text-muted small mb-0">Vasi, piatti e oggetti in ceramica</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Statistics Section -->
            <section class="py-5">
                <div class="container">
                    <div class="row g-4 text-center">
                        <div class="col-lg-3 col-md-6">
                            <div class="stat-card">
                                <div class="stat-number display-4 fw-bold text-primary mb-2" id="artisans-count">150+</div>
                                <div class="stat-label text-muted fw-semibold">Artigiani Attivi</div>
                            </div>
                        </div>
                        <div class="col-lg-3 col-md-6">
                            <div class="stat-card">
                                <div class="stat-number display-4 fw-bold text-success mb-2" id="products-count">1000+</div>
                                <div class="stat-label text-muted fw-semibold">Prodotti Unici</div>
                            </div>
                        </div>
                        <div class="col-lg-3 col-md-6">
                            <div class="stat-card">
                                <div class="stat-number display-4 fw-bold text-warning mb-2" id="customers-count">5000+</div>
                                <div class="stat-label text-muted fw-semibold">Clienti Soddisfatti</div>
                        </div>
                    </div>
                        <div class="col-lg-3 col-md-6">
                            <div class="stat-card">
                                <div class="stat-number display-4 fw-bold text-info mb-2" id="orders-count">10000+</div>
                                <div class="stat-label text-muted fw-semibold">Ordini Completati</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Call to Action -->
            <section class="py-5 bg-primary text-white">
                <div class="container text-center">
                    <h3 class="display-6 fw-bold mb-3">Pronto a Scoprire l'Artigianato Locale?</h3>
                    <p class="lead mb-4">Unisciti alla nostra comunità e sostieni gli artigiani locali</p>
                    <div class="d-flex justify-content-center gap-3 flex-wrap">
                        <a href="/register" class="btn btn-light btn-lg px-5 py-3 fw-semibold" data-link>
                            <i class="fas fa-user-plus me-2"></i>Inizia l'Avventura
                        </a>
                        <a href="/prodotti" class="btn btn-outline-light btn-lg px-5 py-3 fw-semibold" data-link>
                            <i class="fas fa-shopping-bag me-2"></i>Esplora Ora
                        </a>
                    </div>
                </div>
            </section>

            <!-- Newsletter Section -->
            <section class="py-5 bg-light">
                <div class="container">
                    <div class="row justify-content-center">
                        <div class="col-lg-6 text-center">
                            <h4 class="fw-bold mb-3">Rimani Aggiornato</h4>
                            <p class="text-muted mb-4">Ricevi le ultime novità sui nuovi prodotti e gli artigiani</p>
                            <div class="input-group mb-3">
                                <input type="email" class="form-control form-control-lg" placeholder="La tua email" id="newsletter-email">
                                <button class="btn btn-primary btn-lg" type="button" id="newsletter-subscribe">
                                    <i class="fas fa-paper-plane me-2"></i>Iscriviti
                                </button>
                            </div>
                            <small class="text-muted">Non invieremo spam, solo contenuti interessanti!</small>
                        </div>
                </div>
            </div>
            </section>
        `;
    }

    async init() {
        // Inizializza il carousel
        this.initCarousel();
        
        // Inizializza la newsletter
        this.initNewsletter();
        
        // Carica i prodotti in evidenza
        await this.loadFeaturedProducts();
        
        // Carica le statistiche
        await this.loadStatistics();
        
        // Aggiorna l'interfaccia per utenti loggati
        this.updateInterfaceForUser();
    }

    // Metodi per gestire lo stato dell'utente
    isUserLoggedIn() {
        const token = localStorage.getItem('jwt_token');
        const user = localStorage.getItem('user');
        return !!(token && user);
    }

    getUserData() {
        const user = localStorage.getItem('user');
        if (user) {
            try {
                return JSON.parse(user);
            } catch (error) {
                console.error('Errore nel parsing dei dati utente:', error);
                return null;
            }
        }
        return null;
    }

    updateInterfaceForUser() {
        const isLoggedIn = this.isUserLoggedIn();
        const userData = this.getUserData();
        
        if (isLoggedIn && userData) {
            // Aggiorna elementi specifici per utenti loggati
            this.updateWelcomeSection(userData);
            this.updateProductSection();
        }
    }

    updateWelcomeSection(userData) {
        // Aggiorna la sezione di benvenuto se esiste
        const welcomeSection = document.querySelector('.welcome-section');
        if (welcomeSection) {
            const usernameElement = welcomeSection.querySelector('.username');
            if (usernameElement) {
                usernameElement.textContent = userData.username;
            }
        }
    }

    updateProductSection() {
        // Aggiorna la sezione prodotti per utenti loggati
        const productSection = document.querySelector('.featured-products');
        if (productSection) {
            // Aggiungi pulsanti "Aggiungi al carrello" per utenti loggati
            const addToCartButtons = productSection.querySelectorAll('.add-to-cart-btn');
            addToCartButtons.forEach(button => {
                button.style.display = 'block';
            });
        }
    }

    initCarousel() {
        // Inizializza il carousel Bootstrap
        const carousel = document.getElementById('carouselExampleRide');
        if (carousel) {
            // Il carousel si avvia automaticamente con data-bs-ride="true"
            // Aggiungi controlli personalizzati se necessario
        }
    }

    initNewsletter() {
        const subscribeBtn = document.getElementById('newsletter-subscribe');
        const emailInput = document.getElementById('newsletter-email');
        
        if (subscribeBtn && emailInput) {
            subscribeBtn.addEventListener('click', () => {
                const email = emailInput.value.trim();
                if (this.validateEmail(email)) {
                    this.subscribeNewsletter(email);
                } else {
                    this.showAlert('Inserisci un indirizzo email valido', 'warning');
                }
            });
        }
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    async subscribeNewsletter(email) {
        try {
            // Simula l'iscrizione alla newsletter
            await new Promise(resolve => setTimeout(resolve, 1000));
            this.showAlert('Iscrizione alla newsletter completata con successo!', 'success');
            document.getElementById('newsletter-email').value = '';
        } catch (error) {
            this.showAlert('Errore durante l\'iscrizione. Riprova più tardi.', 'danger');
        }
    }

    showAlert(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(alertDiv);
        
        // Rimuovi automaticamente dopo 5 secondi
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }

    async loadFeaturedProducts() {
        try {
            // Carica i prodotti dal server
            const response = await fetch('/api/products');
            const data = await response.json();
            
            let products = [];
            if (data.success && data.products) {
                products = data.products.slice(0, 4); // Prendi i primi 4 prodotti 
            } else {
                // Fallback con dati di esempio
                products = [
            {
                id: 1,
                name: "Bracciale in Pelle Artigianale",
                price: 45.00,
                        image_url: "/static/images/bracelet.jpg",
                        description: "Bracciale in pelle naturale lavorato a mano"
            },
            {
                id: 2,
                name: "Vaso in Ceramica Unico",
                price: 89.00,
                        image_url: "/static/images/vase.jpg",
                        description: "Vaso in ceramica dipinto a mano"
            },
            {
                id: 3,
                name: "Sciarpa in Lana Naturale",
                price: 65.00,
                        image_url: "/static/images/scarf.jpg",
                        description: "Sciarpa in lana naturale lavorata a maglia"
            },
            {
                id: 4,
                name: "Pendente in Argento",
                price: 120.00,
                        image_url: "/static/images/necklace.jpg",
                        description: "Pendente in argento 925 lavorato a mano"
                    }
                ];
            }

        // Mostra i prodotti in evidenza
        const productsContainer = document.getElementById('featured-products');
        if (productsContainer) {
            const isLoggedIn = this.isUserLoggedIn();
            
            productsContainer.innerHTML = products.map(product => `
                <div class="col-lg-3 col-md-6">
                    <div class="product-card h-100 bg-white rounded-3 shadow-sm border-0 overflow-hidden">
                        <div class="product-image position-relative">
                            <img src="${product.image_url || '/static/images/placeholder.jpg'}" 
                                 alt="${product.name}" 
                                 class="img-fluid w-100" 
                                 style="height: 200px; object-fit: cover;">
                            <div class="product-overlay position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center opacity-0" 
                                 style="transition: opacity 0.3s ease;">
                                <button class="btn btn-light btn-sm" onclick="window.location.href='/prodotti/${product.id}'">
                                    <i class="fas fa-eye me-1"></i>Vedi Dettagli
                                </button>
                            </div>
                        </div>
                        <div class="product-info p-3">
                            <h5 class="product-title fw-bold mb-2">${product.name}</h5>
                            <p class="product-description text-muted small mb-3">${product.description || 'Prodotto artigianale unico'}</p>
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="product-price fw-bold text-primary fs-5">${product.price.toFixed(2)} €</span>
                                ${isLoggedIn ? `
                                    <button class="btn btn-primary btn-sm add-to-cart-btn" onclick="addToCart(${product.id})">
                                        <i class="fas fa-cart-plus me-1"></i>Aggiungi al Carrello
                                    </button>
                                ` : `
                                    <button class="btn btn-outline-primary btn-sm" onclick="window.location.href='/login'">
                                        <i class="fas fa-sign-in-alt me-1"></i>Accedi per Comprare
                                    </button>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');

                // Aggiungi effetti hover
                const productCards = productsContainer.querySelectorAll('.product-card');
                productCards.forEach(card => {
                    card.addEventListener('mouseenter', () => {
                        card.querySelector('.product-overlay').classList.remove('opacity-0');
                    });
                    card.addEventListener('mouseleave', () => {
                        card.querySelector('.product-overlay').classList.add('opacity-0');
                    });
                });
            }
        } catch (error) {
            console.error('Errore nel caricamento dei prodotti:', error);
            // Mostra un messaggio di errore
            const productsContainer = document.getElementById('featured-products');
            if (productsContainer) {
                productsContainer.innerHTML = `
                    <div class="col-12 text-center">
                        <div class="alert alert-info">
                            <i class="fas fa-info-circle me-2"></i>
                            Caricamento prodotti in corso...
                    </div>
                </div>
                `;
            }
        }
    }

    async loadStatistics() {
        // Simula il caricamento delle statistiche
        const stats = [
            { id: 'artisans-count', value: '150+' },
            { id: 'products-count', value: '1000+' },
            { id: 'customers-count', value: '5000+' },
            { id: 'orders-count', value: '10000+' }
        ];

        stats.forEach(stat => {
            const element = document.getElementById(stat.id);
            if (element) {
                // Animazione del contatore
                this.animateCounter(element, stat.value);
            }
        });
    }

    animateCounter(element, target) {
        const targetNumber = parseInt(target.replace('+', ''));
        let current = 0;
        const increment = targetNumber / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= targetNumber) {
                current = targetNumber;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current) + '+';
        }, 50);
    }
}

// Funzione globale per aggiungere al carrello
function addToCart(productId) {
    // Implementa la logica per aggiungere al carrello
    console.log('Aggiunto al carrello:', productId);
    // Qui puoi implementare la chiamata API per aggiungere al carrello
}