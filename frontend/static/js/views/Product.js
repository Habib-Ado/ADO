import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Catalogue - Artisanat en Ligne");
        this.products = [];
        this.filteredProducts = [];
        this.currentFilters = {
            category: '',
            priceRange: '',
            availability: 'all'
        };
    }

    async getHtml() {
        return `
            <div class="container my-4">
                <!-- Intestazione -->
                <div class="row mb-4">
                    <div class="col-md-8">
                        <h1 class="h2">Catalogo dei Prodotti</h1>
                        <p class="text-muted">Scopri le nostre creazioni artigianali uniche</p>
                    </div>
                    <div class="col-md-4 text-end">
                        <span class="badge bg-primary fs-6" id="product-count">0 produits</span>
                    </div>
                </div>

                <!-- Filtri e Ricerca -->
                <div class="row mb-4">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-body">
                                <div class="row g-3">
                                    <!-- Search -->
                                    <div class="col-md-4">
                                        <div class="input-group">
                                            <span class="input-group-text"><i class="fas fa-search"></i></span>
                                            <input type="text" class="form-control" id="search-input" placeholder="Rechercher un produit...">
                                        </div>
                                    </div>
                                    
                                    <!-- Category Filter -->
                                    <div class="col-md-3">
                                        <select class="form-select" id="category-filter">
                                            <option value="">Tutte le categorie</option>
                                            <option value="bijoux">Gioielli</option>
                                            <option value="decoration">Decorazione</option>
                                            <option value="textile">Tessile</option>
                                            <option value="ceramique">Ceramica</option>
                                            <option value="bois">Bois</option>
                                            <option value="metal">Metallo</option>
                                        </select>
                                    </div>
                                    
                                    <!-- Price Range -->
                                    <div class="col-md-3">
                                        <select class="form-select" id="price-filter">
                                            <option value="">Tutti i prezzi</option>
                                            <option value="0-50">0€ - 50€</option>
                                            <option value="50-100">50€ - 100€</option>
                                            <option value="100-200">100€ - 200€</option>
                                            <option value="200+">200€ e più</option>
                                        </select>
                                    </div>
                                    
                                    <!-- Availability -->
                                    <div class="col-md-2">
                                        <select class="form-select" id="availability-filter">
                                            <option value="all">Disponibilità</option>
                                            <option value="in-stock">In magazzino</option>
                                            <option value="out-of-stock">Rottura</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Griglia dei prodotti -->
                <div class="row g-4" id="products-grid">
                    <!-- I prodotti verranno caricati qui -->
                </div>

                <!-- Paginazione -->
                <div class="row mt-4">
                    <div class="col-12">
                        <nav aria-label="Navigazione dei prodotti">
                            <ul class="pagination justify-content-center" id="pagination">
                                <!-- La paginazione verrà generata qui -->
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
        `;
    }

    async init() {
        this.loadProducts();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Funzionalità di ricerca
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterProducts();
            });
        }

        // Cambiamenti dei filtri
        const categoryFilter = document.getElementById('category-filter');
        const priceFilter = document.getElementById('price-filter');
        const availabilityFilter = document.getElementById('availability-filter');

        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => {
                this.currentFilters.category = categoryFilter.value;
                this.filterProducts();
            });
        }

        if (priceFilter) {
            priceFilter.addEventListener('change', () => {
                this.currentFilters.priceRange = priceFilter.value;
                this.filterProducts();
            });
        }

        if (availabilityFilter) {
            availabilityFilter.addEventListener('change', () => {
                this.currentFilters.availability = availabilityFilter.value;
                this.filterProducts();
            });
        }
    }

    async loadProducts() {
        // Dati mock - saranno sostituiti con chiamate API
        this.products = [
            {
                id: 1,
                name: "Bracelet en Cuir Artisanal",
                description: "Bracelet unique en cuir véritable, fabriqué à la main",
                price: 45.00,
                category: "bijoux",
                image: "/static/img/placeholder.jpg",
                artisan: "Marie Dubois",
                inStock: true,
                rating: 4.8
            },
            {
                id: 2,
                name: "Vase en Céramique Unique",
                description: "Vase décoratif en céramique émaillée, pièce unique",
                price: 89.00,
                category: "ceramique",
                image: "/static/img/placeholder.jpg",
                artisan: "Pierre Martin",
                inStock: true,
                rating: 4.9
            },
            {
                id: 3,
                name: "Écharpe en Laine Naturelle",
                description: "Écharpe douce et chaude en laine naturelle",
                price: 65.00,
                category: "textile",
                image: "/static/img/placeholder.jpg",
                artisan: "Sophie Bernard",
                inStock: false,
                rating: 4.7
            },
            {
                id: 4,
                name: "Pendentif en Argent",
                description: "Pendentif élégant en argent 925, design exclusif",
                price: 120.00,
                category: "bijoux",
                image: "/static/img/placeholder.jpg",
                artisan: "Jean Moreau",
                inStock: true,
                rating: 5.0
            },
            {
                id: 5,
                name: "Lampe en Bois Massif",
                description: "Lampe d'appoint en bois massif de chêne",
                price: 150.00,
                category: "bois",
                image: "/static/img/placeholder.jpg",
                artisan: "Claude Dubois",
                inStock: true,
                rating: 4.6
            },
            {
                id: 6,
                name: "Coussin Décoratif",
                description: "Coussin brodé à la main avec motifs traditionnels",
                price: 35.00,
                category: "textile",
                image: "/static/img/placeholder.jpg",
                artisan: "Anne Petit",
                inStock: true,
                rating: 4.5
            }
        ];

        this.filteredProducts = [...this.products];
        this.displayProducts();
        this.updateProductCount();
    }

    filterProducts() {
        const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
        
        this.filteredProducts = this.products.filter(product => {
            // Filtro ricerca
            const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                                product.description.toLowerCase().includes(searchTerm) ||
                                product.artisan.toLowerCase().includes(searchTerm);
            
            // Filtro categoria
            const matchesCategory = !this.currentFilters.category || 
                                  product.category === this.currentFilters.category;
            
            // Filtro prezzo
            let matchesPrice = true;
            if (this.currentFilters.priceRange) {
                const [min, max] = this.currentFilters.priceRange.split('-').map(Number);
                if (max) {
                    matchesPrice = product.price >= min && product.price <= max;
                } else {
                    matchesPrice = product.price >= min;
                }
            }
            
            // Filtro disponibilità
            let matchesAvailability = true;
            if (this.currentFilters.availability === 'in-stock') {
                matchesAvailability = product.inStock;
            } else if (this.currentFilters.availability === 'out-of-stock') {
                matchesAvailability = !product.inStock;
            }
            
            return matchesSearch && matchesCategory && matchesPrice && matchesAvailability;
        });
        
        this.displayProducts();
        this.updateProductCount();
    }

    displayProducts() {
        const productsGrid = document.getElementById('products-grid');
        if (!productsGrid) return;

        if (this.filteredProducts.length === 0) {
            productsGrid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-search fa-3x text-muted mb-3"></i>
                    <h4>Nessun prodotto trovato</h4>
                    <p class="text-muted">Prova a modificare i tuoi criteri di ricerca</p>
                </div>
            `;
            return;
        }

        productsGrid.innerHTML = this.filteredProducts.map(product => `
            <div class="col-lg-4 col-md-6">
                <div class="product-card h-100">
                    <div class="product-image position-relative">
                        <img src="${product.image}" alt="${product.name}" class="img-fluid w-100" style="height: 200px; object-fit: cover;">
                        ${!product.inStock ? '<span class="badge bg-danger position-absolute top-0 end-0 m-2">Rupture</span>' : ''}
                        <div class="product-overlay">
                            <button class="btn btn-primary btn-sm" onclick="viewProduct(${product.id})">
                                <i class="fas fa-eye"></i> Visualizza
                            </button>
                        </div>
                    </div>
                    <div class="product-info p-3">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="product-title mb-1">${product.name}</h5>
                            <span class="product-price fw-bold text-primary">${product.price.toFixed(2)} €</span>
                        </div>
                        <p class="product-description text-muted small mb-2">${product.description}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted">Par ${product.artisan}</small>
                            <div class="d-flex align-items-center">
                                <i class="fas fa-star text-warning me-1"></i>
                                <small>${product.rating}</small>
                            </div>
                        </div>
                        <div class="mt-3">
                            <button class="btn btn-outline-primary btn-sm w-100" onclick="addToCart(${product.id})" ${!product.inStock ? 'disabled' : ''}>
                                <i class="fas fa-shopping-cart"></i> Aggiungi al carrello
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateProductCount() {
        const countElement = document.getElementById('product-count');
        if (countElement) {
            countElement.textContent = `${this.filteredProducts.length} produit${this.filteredProducts.length > 1 ? 's' : ''}`;
        }
    }
}

// Funzioni globali per le azioni dei prodotti
window.viewProduct = function(productId) {
    // Navigazione alla pagina di dettaglio del prodotto
    window.location.href = `/product/${productId}`;
};

window.addToCart = function(productId) {
    // Funzionalità di aggiunta al carrello - sarà implementata in seguito
    console.log('Aggiungendo prodotto al carrello:', productId);
    // Mostra messaggio di successo
    alert('Prodotto aggiunto al carrello!');
};