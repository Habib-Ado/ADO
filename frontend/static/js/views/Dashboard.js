import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Tableau de Bord - Artisanat en Ligne");
        this.stats = {};
        this.recentOrders = [];
        this.products = [];
    }

    async getHtml() {
        return `
            <div class="container-fluid my-4">
                <!-- Header -->
                <div class="row mb-4">
                    <div class="col-12">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h1 class="h2 mb-1">Tableau de Bord</h1>
                                <p class="text-muted mb-0">Bienvenue, <span class="fw-bold" id="user-welcome-name">Caricamento...</span></p>
                            </div>
                            <div>
                                <button class="btn btn-primary me-2" onclick="addNewProduct()">
                                    <i class="fas fa-plus"></i> Nouveau Produit
                                </button>
                                <button class="btn btn-outline-secondary">
                                    <i class="fas fa-cog"></i> Paramètres
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Statistics Cards -->
                <div class="row g-4 mb-4">
                    <div class="col-xl-3 col-md-6">
                        <div class="card bg-primary text-white">
                            <div class="card-body">
                                <div class="d-flex justify-content-between">
                                    <div>
                                        <h4 class="mb-1" id="total-sales">0 €</h4>
                                        <p class="mb-0">Ventes du mois</p>
                                    </div>
                                    <div class="align-self-center">
                                        <i class="fas fa-euro-sign fa-2x"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-xl-3 col-md-6">
                        <div class="card bg-success text-white">
                            <div class="card-body">
                                <div class="d-flex justify-content-between">
                                    <div>
                                        <h4 class="mb-1" id="total-orders">0</h4>
                                        <p class="mb-0">Commandes</p>
                                    </div>
                                    <div class="align-self-center">
                                        <i class="fas fa-shopping-bag fa-2x"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-xl-3 col-md-6">
                        <div class="card bg-info text-white">
                            <div class="card-body">
                                <div class="d-flex justify-content-between">
                                    <div>
                                        <h4 class="mb-1" id="total-products">0</h4>
                                        <p class="mb-0">Produits actifs</p>
                                    </div>
                                    <div class="align-self-center">
                                        <i class="fas fa-box fa-2x"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-xl-3 col-md-6">
                        <div class="card bg-warning text-white">
                            <div class="card-body">
                                <div class="d-flex justify-content-between">
                                    <div>
                                        <h4 class="mb-1" id="pending-orders">0</h4>
                                        <p class="mb-0">En attente</p>
                                    </div>
                                    <div class="align-self-center">
                                        <i class="fas fa-clock fa-2x"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Charts and Recent Activity -->
                <div class="row g-4 mb-4">
                    <!-- Sales Chart -->
                    <div class="col-lg-8">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="mb-0">Évolution des ventes</h5>
                            </div>
                            <div class="card-body">
                                <canvas id="salesChart" width="400" height="200"></canvas>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Recent Orders -->
                    <div class="col-lg-4">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="mb-0">Commandes récentes</h5>
                            </div>
                            <div class="card-body">
                                <div id="recent-orders-list">
                                    <!-- Recent orders will be loaded here -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Products Management -->
                <div class="row g-4">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-header">
                                <div class="d-flex justify-content-between align-items-center">
                                    <h5 class="mb-0">Gestion des Produits</h5>
                                    <div class="input-group" style="width: 300px;">
                                        <input type="text" class="form-control" placeholder="Rechercher un produit..." id="product-search">
                                        <button class="btn btn-outline-secondary" type="button">
                                            <i class="fas fa-search"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="card-body">
                                <div class="table-responsive">
                                    <table class="table table-hover">
                                        <thead>
                                            <tr>
                                                <th>Produit</th>
                                                <th>Prix</th>
                                                <th>Stock</th>
                                                <th>Statut</th>
                                                <th>Ventes</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody id="products-table-body">
                                            <!-- Products will be loaded here -->
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Add Product Modal -->
            <div class="modal fade" id="addProductModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Ajouter un nouveau produit</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="add-product-form">
                                <div class="row g-3">
                                    <div class="col-md-8">
                                        <label class="form-label">Nom du produit</label>
                                        <input type="text" class="form-control" required>
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label">Prix (€)</label>
                                        <input type="number" class="form-control" step="0.01" min="0" required>
                                    </div>
                                    <div class="col-12">
                                        <label class="form-label">Description</label>
                                        <textarea class="form-control" rows="3" required></textarea>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Catégorie</label>
                                        <select class="form-select" required>
                                            <option value="">Choisir une catégorie</option>
                                            <option value="bijoux">Bijoux</option>
                                            <option value="decoration">Décoration</option>
                                            <option value="textile">Textile</option>
                                            <option value="ceramique">Céramique</option>
                                            <option value="bois">Bois</option>
                                            <option value="metal">Métal</option>
                                        </select>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Stock initial</label>
                                        <input type="number" class="form-control" min="0" required>
                                    </div>
                                    <div class="col-12">
                                        <label class="form-label">Image du produit</label>
                                        <input type="file" class="form-control" accept="image/*">
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                            <button type="submit" form="add-product-form" class="btn btn-primary">Ajouter le produit</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async init() {
        await this.loadUserData();
        this.loadDashboardData();
        this.setupEventListeners();
        this.initializeCharts();
    }

    async loadUserData() {
        try {
            const token = localStorage.getItem('jwt_token');
            if (!token) {
                console.error('Token non trovato');
                return;
            }

            const response = await fetch('/api/user/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                const user = data.user;
                
                // Aggiorna il nome utente nel dashboard con logica intelligente
                const welcomeElement = document.getElementById('user-welcome-name');
                if (welcomeElement) {
                    let displayName = '';
                    
                    // Verifica se abbiamo dati reali
                    if (user.first_name && user.last_name) {
                        displayName = `${user.first_name} ${user.last_name}`;
                        console.log('✅ Dashboard: Usando nome completo:', displayName);
                    } else if (user.first_name) {
                        displayName = user.first_name;
                        console.log('✅ Dashboard: Usando solo nome:', displayName);
                    } else if (user.last_name) {
                        displayName = user.last_name;
                        console.log('✅ Dashboard: Usando solo cognome:', displayName);
                    } else if (user.email) {
                        // Se non c'è nome, usa la parte prima della @ dell'email
                        const emailName = user.email.split('@')[0];
                        displayName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
                        console.log('✅ Dashboard: Usando nome dall\'email:', displayName);
                    } else {
                        displayName = 'Utente';
                        console.log('⚠️ Dashboard: Nessun dato disponibile, usando "Utente"');
                    }
                    
                    welcomeElement.textContent = displayName;
                    console.log('✅ Dashboard: Nome aggiornato a:', displayName);
                }

                console.log('✅ Dati utente caricati nel dashboard:', user);
            } else {
                console.error('❌ Errore caricamento dati utente nel dashboard:', response.status);
            }
        } catch (error) {
            console.error('❌ Errore caricamento dati utente nel dashboard:', error);
        }
    }

    setupEventListeners() {
        // Product search
        const searchInput = document.getElementById('product-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterProducts(e.target.value);
            });
        }

        // Add product form
        const addProductForm = document.getElementById('add-product-form');
        if (addProductForm) {
            addProductForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddProduct();
            });
        }
    }

    async loadDashboardData() {
        // Mock data - will be replaced with API calls
        this.stats = {
            totalSales: 1245.80,
            totalOrders: 23,
            totalProducts: 8,
            pendingOrders: 5
        };

        this.recentOrders = [
            {
                id: 1,
                customer: "Jean Dupont",
                product: "Bracelet en Cuir",
                amount: 45.00,
                status: "En cours",
                date: "2024-01-15"
            },
            {
                id: 2,
                customer: "Marie Martin",
                product: "Vase en Céramique",
                amount: 89.00,
                status: "Livré",
                date: "2024-01-14"
            },
            {
                id: 3,
                customer: "Pierre Bernard",
                product: "Écharpe en Laine",
                amount: 65.00,
                status: "En attente",
                date: "2024-01-13"
            }
        ];

        this.products = [
            {
                id: 1,
                name: "Bracelet en Cuir Artisanal",
                price: 45.00,
                stock: 12,
                status: "Actif",
                sales: 8
            },
            {
                id: 2,
                name: "Vase en Céramique Unique",
                price: 89.00,
                stock: 5,
                status: "Actif",
                sales: 3
            },
            {
                id: 3,
                name: "Écharpe en Laine Naturelle",
                price: 65.00,
                stock: 0,
                status: "Rupture",
                sales: 15
            }
        ];

        this.updateDashboard();
    }

    updateDashboard() {
        // Update statistics
        const totalSalesElement = document.getElementById('total-sales');
        const totalOrdersElement = document.getElementById('total-orders');
        const totalProductsElement = document.getElementById('total-products');
        const pendingOrdersElement = document.getElementById('pending-orders');

        if (totalSalesElement) totalSalesElement.textContent = `${this.stats.totalSales.toFixed(2)} €`;
        if (totalOrdersElement) totalOrdersElement.textContent = this.stats.totalOrders;
        if (totalProductsElement) totalProductsElement.textContent = this.stats.totalProducts;
        if (pendingOrdersElement) pendingOrdersElement.textContent = this.stats.pendingOrders;

        // Update recent orders
        this.displayRecentOrders();
        
        // Update products table
        this.displayProducts();
    }

    displayRecentOrders() {
        const container = document.getElementById('recent-orders-list');
        if (!container) return;

        container.innerHTML = this.recentOrders.map(order => `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h6 class="mb-1">${order.product}</h6>
                    <small class="text-muted">${order.customer} - ${order.date}</small>
                </div>
                <div class="text-end">
                    <span class="badge bg-${this.getStatusColor(order.status)}">${order.status}</span>
                    <div class="fw-bold">${order.amount.toFixed(2)} €</div>
                </div>
            </div>
        `).join('');
    }

    displayProducts() {
        const tbody = document.getElementById('products-table-body');
        if (!tbody) return;

        tbody.innerHTML = this.products.map(product => `
            <tr>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="me-3">
                            <div class="bg-light rounded" style="width: 40px; height: 40px;"></div>
                        </div>
                        <div>
                            <h6 class="mb-0">${product.name}</h6>
                            <small class="text-muted">ID: ${product.id}</small>
                        </div>
                    </div>
                </td>
                <td>${product.price.toFixed(2)} €</td>
                <td>
                    <span class="badge bg-${product.stock > 0 ? 'success' : 'danger'}">
                        ${product.stock}
                    </span>
                </td>
                <td>
                    <span class="badge bg-${this.getProductStatusColor(product.status)}">
                        ${product.status}
                    </span>
                </td>
                <td>${product.sales}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="editProduct(${product.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="deleteProduct(${product.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    getStatusColor(status) {
        switch (status) {
            case 'En cours': return 'primary';
            case 'Livré': return 'success';
            case 'En attente': return 'warning';
            default: return 'secondary';
        }
    }

    getProductStatusColor(status) {
        switch (status) {
            case 'Actif': return 'success';
            case 'Rupture': return 'danger';
            case 'Inactif': return 'secondary';
            default: return 'secondary';
        }
    }

    filterProducts(searchTerm) {
        // Filter products based on search term
        const filteredProducts = this.products.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        // Update display with filtered products
        this.displayFilteredProducts(filteredProducts);
    }

    displayFilteredProducts(products) {
        const tbody = document.getElementById('products-table-body');
        if (!tbody) return;

        if (products.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4">
                        <i class="fas fa-search fa-2x text-muted mb-2"></i>
                        <p class="text-muted">Aucun produit trouvé</p>
                    </td>
                </tr>
            `;
            return;
        }

        // Display filtered products
        this.displayProducts();
    }

    initializeCharts() {
        // Initialize sales chart using Chart.js
        const ctx = document.getElementById('salesChart');
        if (ctx) {
            // Mock chart data - will be replaced with real data
            const chartData = {
                labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
                datasets: [{
                    label: 'Ventes mensuelles',
                    data: [120, 190, 300, 500, 200, 300],
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.1
                }]
            };

            // Note: Chart.js needs to be included for this to work
            // For now, we'll just show a placeholder
            ctx.getContext('2d').fillStyle = '#f8f9fa';
            ctx.getContext('2d').fillRect(0, 0, ctx.width, ctx.height);
            
            const ctx2d = ctx.getContext('2d');
            ctx2d.fillStyle = '#6c757d';
            ctx2d.font = '14px Arial';
            ctx2d.textAlign = 'center';
            ctx2d.fillText('Graphique des ventes', ctx.width/2, ctx.height/2);
        }
    }

    handleAddProduct() {
        // Handle adding new product
        console.log('Adding new product...');
        // Close modal
        const modal = document.getElementById('addProductModal');
        if (modal) {
            const bootstrapModal = bootstrap.Modal.getInstance(modal);
            if (bootstrapModal) {
                bootstrapModal.hide();
            }
        }
        // Show success message
        alert('Produit ajouté avec succès !');
    }
}

// Global functions for dashboard actions
window.addNewProduct = function() {
    const modal = new bootstrap.Modal(document.getElementById('addProductModal'));
    modal.show();
};

window.editProduct = function(productId) {
    console.log('Edit product:', productId);
    // Navigate to edit product page
    window.location.href = `/edit-product/${productId}`;
};

window.deleteProduct = function(productId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
        console.log('Delete product:', productId);
        // Delete product logic
        alert('Produit supprimé avec succès !');
    }
};