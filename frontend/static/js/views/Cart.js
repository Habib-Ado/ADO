import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Panier - Artisanat en Ligne");
        this.cartItems = [];
        this.total = 0;
    }

    async getHtml() {
        return `
            <div class="cart-page">
                <div class="container">
                    <div class="cart-header">
                        <h1><i class="fas fa-shopping-cart me-3"></i>Il tuo Carrello</h1>
                        <p>Gestisci i tuoi prodotti selezionati</p>
                    </div>
                    
                    <div class="row">
                        <!-- Cart Items -->
                        <div class="col-lg-8">
                            <div class="cart-items-card">
                                <div class="cart-items-header">
                                    <i class="fas fa-box me-2"></i>Prodotti nel Carrello
                                </div>
                                <div class="cart-items-body">
                                    <div id="cart-items-container">
                                        <!-- Cart items will be loaded here -->
                                    </div>
                                    
                                    <div id="empty-cart" class="empty-cart" style="display: none;">
                                        <i class="fas fa-shopping-cart"></i>
                                        <h4>Il tuo carrello è vuoto</h4>
                                        <p>Scopri i nostri prodotti artigianali e inizia i tuoi acquisti</p>
                                        <a href="/prodotti" class="btn btn-primary btn-lg" data-link>
                                            <i class="fas fa-search me-2"></i>Esplora i Prodotti
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Order Summary -->
                        <div class="col-lg-4">
                            <div class="order-summary-card">
                                <div class="order-summary-header">
                                    <i class="fas fa-receipt me-2"></i>Riepilogo Ordine
                                </div>
                                <div class="order-summary-body">
                                    <div class="summary-row">
                                        <span>Subtotale:</span>
                                        <span id="subtotal">0,00 €</span>
                                    </div>
                                    <div class="summary-row">
                                        <span>Spedizione:</span>
                                        <span id="shipping">0,00 €</span>
                                    </div>
                                    <div class="summary-row total">
                                        <span>Totale:</span>
                                        <span id="total-amount">0,00 €</span>
                                    </div>
                                    
                                    <button class="checkout-btn" id="checkout-btn" disabled>
                                        <i class="fas fa-credit-card me-2"></i>Procedi al Pagamento
                                    </button>
                                    
                                    <button class="continue-shopping-btn" id="continue-shopping">
                                        <i class="fas fa-arrow-left me-2"></i>Continua gli Acquisti
                                    </button>
                                </div>
                            </div>
                            
                            <!-- Shipping Options -->
                            <div class="shipping-card">
                                <div class="shipping-header">
                                    <i class="fas fa-truck me-2"></i>Opzioni di Spedizione
                                </div>
                                <div class="shipping-body">
                                    <div class="shipping-option">
                                        <input type="radio" name="shipping" id="standard-shipping" checked>
                                        <label for="standard-shipping">
                                            <strong>Spedizione Standard</strong><br>
                                            <small>5-7 giorni lavorativi - 5,90 €</small>
                                        </label>
                                    </div>
                                    <div class="shipping-option">
                                        <input type="radio" name="shipping" id="express-shipping">
                                        <label for="express-shipping">
                                            <strong>Spedizione Express</strong><br>
                                            <small>2-3 giorni lavorativi - 12,90 €</small>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async init() {
        this.loadCart();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Continue shopping button
        const continueBtn = document.getElementById('continue-shopping');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                window.location.href = '/prodotti';
            });
        }

        // Checkout button
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                this.proceedToCheckout();
            });
        }

        // Shipping options
        const standardShipping = document.getElementById('standard-shipping');
        const expressShipping = document.getElementById('express-shipping');
        
        if (standardShipping) {
            standardShipping.addEventListener('change', () => {
                this.updateShippingCost(5.90);
            });
        }
        
        if (expressShipping) {
            expressShipping.addEventListener('change', () => {
                this.updateShippingCost(12.90);
            });
        }
    }

    loadCart() {
        // Load cart from localStorage or API
        const savedCart = localStorage.getItem('artisanat-cart');
        if (savedCart) {
            this.cartItems = JSON.parse(savedCart);
        } else {
            // Mock data for demonstration
            this.cartItems = [
                {
                    id: 1,
                    name: "Bracelet en Cuir Artisanal",
                    price: 45.00,
                    image: "/static/img/placeholder.jpg",
                    quantity: 1,
                    artisan: "Marie Dubois"
                },
                {
                    id: 2,
                    name: "Vase en Céramique Unique",
                    price: 89.00,
                    image: "/static/img/placeholder.jpg",
                    quantity: 1,
                    artisan: "Pierre Martin"
                }
            ];
        }
        
        this.displayCart();
        this.calculateTotal();
    }

    displayCart() {
        const container = document.getElementById('cart-items-container');
        const emptyCart = document.getElementById('empty-cart');
        
        if (!container || !emptyCart) return;
        
        if (this.cartItems.length === 0) {
            container.style.display = 'none';
            emptyCart.style.display = 'block';
            return;
        }
        
        container.style.display = 'block';
        emptyCart.style.display = 'none';
        
        container.innerHTML = this.cartItems.map(item => `
            <div class="cart-item" data-product-id="${item.id}">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h5 class="cart-item-title">${item.name}</h5>
                    <p class="text-muted small mb-1">Di ${item.artisan}</p>
                    <p class="cart-item-price">${item.price.toFixed(2)} €</p>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="this.updateQuantity(${item.id}, -1)">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn" onclick="this.updateQuantity(${item.id}, 1)">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <button class="remove-btn" onclick="this.removeFromCart(${item.id})">
                        <i class="fas fa-trash me-1"></i>Rimuovi
                    </button>
                </div>
            </div>
        `).join('');
    }

    updateQuantity(productId, change) {
        const item = this.cartItems.find(item => item.id === productId);
        if (item) {
            if (typeof change === 'number') {
                item.quantity = Math.max(1, item.quantity + change);
            } else {
                item.quantity = Math.max(1, parseInt(change));
            }
            
            this.saveCart();
            this.displayCart();
            this.calculateTotal();
        }
    }

    removeFromCart(productId) {
        this.cartItems = this.cartItems.filter(item => item.id !== productId);
        this.saveCart();
        this.displayCart();
        this.calculateTotal();
    }

    calculateTotal() {
        this.total = this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Update display
        const subtotalElement = document.getElementById('subtotal');
        const totalElement = document.getElementById('total-amount');
        const checkoutBtn = document.getElementById('checkout-btn');
        
        if (subtotalElement) subtotalElement.textContent = `${this.total.toFixed(2)} €`;
        if (totalElement) totalElement.textContent = `${this.total.toFixed(2)} €`;
        if (checkoutBtn) checkoutBtn.disabled = this.cartItems.length === 0;
        
        // Update shipping cost
        this.updateShippingCost(5.90); // Default to standard shipping
    }

    updateShippingCost(cost) {
        const shippingElement = document.getElementById('shipping');
        const totalElement = document.getElementById('total-amount');
        
        if (shippingElement) shippingElement.textContent = `${cost.toFixed(2)} €`;
        if (totalElement) totalElement.textContent = `${(this.total + cost).toFixed(2)} €`;
    }

    saveCart() {
        localStorage.setItem('artisanat-cart', JSON.stringify(this.cartItems));
    }

    proceedToCheckout() {
        if (this.cartItems.length === 0) return;
        
        // Navigate to checkout page
        window.location.href = '/checkout';
    }
}

// Global functions for cart actions
window.updateQuantity = function(productId, change) {
    // This will be handled by the Cart class instance
    console.log('Update quantity:', productId, change);
};

window.removeFromCart = function(productId) {
    // This will be handled by the Cart class instance
    console.log('Remove from cart:', productId);
};