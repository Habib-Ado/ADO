import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Ordine - Artigianato on Ligne");
        this.orderData = {};
        this.shippingOptions = [
            { id: 'standard', name: 'Livraison standard', price: 5.90, days: '5-7 jours' },
            { id: 'express', name: 'Livraison express', price: 12.90, days: '2-3 jours' }
        ];
    }

    async getHtml() {
        return `
            <div class="container my-4">
                <div class="row">
                    <!-- Riepilogo Ordine -->
                    <div class="col-lg-8">
                        <div class="card mb-4">
                            <div class="card-header">
                                <h5 class="mb-0">Riepilogo del tuo ordine</h5>
                            </div>
                            <div class="card-body">
                                <div id="order-items">
                                    <!-- Gli elementi dell'ordine verranno caricati qui -->
                                </div>
                            </div>
                        </div>

                        <!-- Informazioni di spedizione -->
                        <div class="card mb-4">
                            <div class="card-header">
                                <h5 class="mb-0">Informazioni di spedizione</h5>
                            </div>
                            <div class="card-body">
                                <form id="shipping-form">
                                    <div class="row g-3">
                                        <div class="col-md-6">
                                            <label class="form-label">Nome *</label>
                                            <input type="text" class="form-control" id="shipping-firstname" required>
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label">Cognome *</label>
                                            <input type="text" class="form-control" id="shipping-lastname" required>
                                        </div>
                                        <div class="col-12">
                                            <label class="form-label">Indirizzo *</label>
                                            <input type="text" class="form-control" id="shipping-address" required>
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label">CAP *</label>
                                            <input type="text" class="form-control" id="shipping-postal" required>
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label">Città *</label>
                                            <input type="text" class="form-control" id="shipping-city" required>
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label">Nazione *</label>
                                            <select class="form-select" id="shipping-country" required>
                                                <option value="">Seleziona una nazione</option>
                                                <option value="FR">France</option>
                                                <option value="BE">Belgique</option>
                                                <option value="CH">Suisse</option>
                                                <option value="CA">Canada</option>
                                            </select>
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label">Telefono *</label>
                                            <input type="tel" class="form-control" id="shipping-phone" required>
                                        </div>
                                        <div class="col-12">
                                            <div class="form-check">
                                                <input class="form-check-input" type="checkbox" id="same-billing">
                                                <label class="form-check-label" for="same-billing">
                                                    Utilizzare la stessa indirizzo per la fatturazione
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <!-- Informazioni di fatturazione -->
                        <div class="card mb-4" id="billing-section" style="display: none;">
                            <div class="card-header">
                                <h5 class="mb-0">Informazioni di fatturazione</h5>
                            </div>
                            <div class="card-body">
                                <form id="billing-form">
                                    <div class="row g-3">
                                        <div class="col-md-6">
                                            <label class="form-label">Nome *</label>
                                            <input type="text" class="form-control" id="billing-firstname" required>
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label">Cognome *</label>
                                            <input type="text" class="form-control" id="billing-lastname" required>
                                        </div>
                                        <div class="col-12">
                                            <label class="form-label">Indirizzo *</label>
                                            <input type="text" class="form-control" id="billing-address" required>
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label">CAP *</label>
                                            <input type="text" class="form-control" id="billing-postal" required>
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label">Città *</label>
                                            <input type="text" class="form-control" id="billing-city" required>
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label">Nazione *</label>
                                            <select class="form-select" id="billing-country" required>
                                                <option value="">Seleziona una nazione</option>
                                                <option value="FR">France</option>
                                                <option value="BE">Belgique</option>
                                                <option value="CH">Suisse</option>
                                                <option value="CA">Canada</option>
                                            </select>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <!-- Metodo di pagamento -->
                        <div class="card mb-4">
                            <div class="card-header">
                                <h5 class="mb-0">Metodo di pagamento</h5>
                            </div>
                            <div class="card-body">
                                <div class="row g-3">
                                    <div class="col-md-6">
                                        <div class="form-check">
                                            <input class="form-check-input" type="radio" name="payment-method" id="card-payment" value="card" checked>
                                            <label class="form-check-label" for="card-payment">
                                                <i class="fas fa-credit-card me-2"></i>Carte bancarie
                                            </label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-check">
                                            <input class="form-check-input" type="radio" name="payment-method" id="paypal-payment" value="paypal">
                                            <label class="form-check-label" for="paypal-payment">
                                                <i class="fab fa-paypal me-2"></i>PayPal
                                            </label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-check">
                                            <input class="form-check-input" type="radio" name="payment-method" id="google-pay-payment" value="google_pay">
                                            <label class="form-check-label" for="google-pay-payment">
                                                <i class="fab fa-google-pay me-2"></i>Google Pay
                                            </label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-check">
                                            <input class="form-check-input" type="radio" name="payment-method" id="cash-payment" value="cash">
                                            <label class="form-check-label" for="cash-payment">
                                                <i class="fas fa-money-bill-wave me-2"></i>Pagamento in Contanti
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Dettagli carta bancaria -->
                                <div id="card-details" class="mt-3">
                                    <div class="row g-3">
                                        <div class="col-12">
                                            <label class="form-label">Numero di carta *</label>
                                            <input type="text" class="form-control" id="card-number" placeholder="1234 5678 9012 3456" maxlength="19">
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label">Data di scadenza *</label>
                                            <input type="text" class="form-control" id="card-expiry" placeholder="MM/AA" maxlength="5">
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label">Codice di sicurezza *</label>
                                            <input type="text" class="form-control" id="card-cvv" placeholder="123" maxlength="4">
                                        </div>
                                        <div class="col-12">
                                            <label class="form-label">Nome del titolare *</label>
                                            <input type="text" class="form-control" id="card-holder" placeholder="Nome come appare sulla carta">
                                        </div>
                                    </div>
                                </div>

                                <!-- Selezione filiale per pagamento in contanti -->
                                <div id="cash-details" class="mt-3" style="display: none;">
                                    <div class="row g-3">
                                        <div class="col-12">
                                            <label class="form-label">Seleziona la filiale *</label>
                                            <select class="form-select" id="branch-select" required>
                                                <option value="">Scegli una filiale...</option>
                                            </select>
                                        </div>
                                        <div class="col-12">
                                            <div class="alert alert-info">
                                                <i class="fas fa-info-circle me-2"></i>
                                                <strong>Pagamento in contanti:</strong> Dovrai pagare presso la filiale selezionata entro 24 ore dalla conferma dell'ordine. Porta con te il numero dell'ordine.
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Google Pay Button -->
                                <div id="google-pay-details" class="mt-3" style="display: none;">
                                    <div class="row g-3">
                                        <div class="col-12">
                                            <div id="google-pay-button" class="w-100" style="height: 40px;"></div>
                                        </div>
                                        <div class="col-12">
                                            <div class="alert alert-info">
                                                <i class="fab fa-google-pay me-2"></i>
                                                <strong>Carta di Credito:</strong> Inserisci i dati della tua carta per completare il pagamento.
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- PayPal Button -->
                                <div id="paypal-details" class="mt-3" style="display: none;">
                                    <div class="row g-3">
                                        <div class="col-12">
                                            <div id="paypal-button-container"></div>
                                        </div>
                                        <div class="col-12">
                                            <div class="alert alert-info">
                                                <i class="fab fa-paypal me-2"></i>
                                                <strong>PayPal:</strong> Clicca sul pulsante per completare il pagamento con PayPal.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Riepilogo Ordine Sidebar -->
                    <div class="col-lg-4">
                        <div class="card sticky-top" style="top: 2rem;">
                            <div class="card-header">
                                <h5 class="mb-0">Riepilogo dell'ordine</h5>
                            </div>
                            <div class="card-body">
                                <div class="d-flex justify-content-between mb-2">
                                    <span>Subtotale :</span>
                                    <span id="subtotal">0,00 €</span>
                                </div>
                                <div class="d-flex justify-content-between mb-2">
                                    <span>Costo di spedizione :</span>
                                    <span id="shipping-cost">0,00 €</span>
                                </div>
                                <hr>
                                <div class="d-flex justify-content-between mb-3">
                                    <strong>Totale :</strong>
                                    <strong id="total-amount">0,00 €</strong>
                                </div>
                                
                                <button class="btn btn-primary w-100 mb-2" id="place-order-btn" disabled>
                                    <i class="fas fa-lock me-2"></i>Conferma l'ordine
                                </button>
                                
                                <div class="text-center">
                                    <small class="text-muted">
                                        <i class="fas fa-shield-alt me-1"></i>
                                        Pagamento sicuro SSL
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async init() {
        await this.loadOrderData();
        this.setupEventListeners();
        this.updateOrderSummary();
    }

    setupEventListeners() {
        // Checkbox per lo stesso indirizzo di fatturazione
        const sameBillingCheckbox = document.getElementById('same-billing');
        if (sameBillingCheckbox) {
            sameBillingCheckbox.addEventListener('change', (e) => {
                this.toggleBillingSection(e.target.checked);
            });
        }

        // Cambio del metodo di pagamento
        const paymentMethods = document.querySelectorAll('input[name="payment-method"]');
        paymentMethods.forEach(method => {
            method.addEventListener('change', (e) => {
                this.togglePaymentDetails(e.target.value);
            });
        });

        // Pulsante per confermare l'ordine
        const placeOrderBtn = document.getElementById('place-order-btn');
        if (placeOrderBtn) {
            placeOrderBtn.addEventListener('click', () => {
                this.placeOrder();
            });
        }

        // Validazione dei form
        this.setupFormValidation();
        
        // Carica le filiali per il pagamento in contanti
        this.loadBranches();
    }

    async loadBranches() {
        try {
            const response = await fetch('/api/branches');
            if (response.ok) {
                const data = await response.json();
                this.renderBranchesSelect(data.branches);
            }
        } catch (error) {
            console.error('Errore nel caricamento delle filiali:', error);
        }
    }

    renderBranchesSelect(branches) {
        const select = document.getElementById('branch-select');
        if (!select) return;

        select.innerHTML = '<option value="">Scegli una filiale...</option>' +
            branches.map(branch => 
                `<option value="${branch.id}">${branch.name} - ${branch.city}</option>`
            ).join('');
    }

    setupFormValidation() {
        // Formattazione del numero di carta
        const cardNumber = document.getElementById('card-number');
        if (cardNumber) {
            cardNumber.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\s/g, '');
                value = value.replace(/\D/g, '');
                value = value.replace(/(\d{4})/g, '$1 ').trim();
                e.target.value = value;
            });
        }

        // Formattazione della data di scadenza
        const cardExpiry = document.getElementById('card-expiry');
        if (cardExpiry) {
            cardExpiry.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) {
                    value = value.substring(0, 2) + '/' + value.substring(2, 4);
                }
                e.target.value = value;
            });
        }

        // Validazione del CVV
        const cardCvv = document.getElementById('card-cvv');
        if (cardCvv) {
            cardCvv.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '');
            });
        }

        // Validazione Google Pay
        this.setupGooglePayValidation();
    }

    setupGooglePayValidation() {
        // Verifica se Google Pay è disponibile
        if (window.google && window.google.payments) {
            this.initGooglePay();
        } else {
            // Google Pay non disponibile, nascondi l'opzione
            const googlePayOption = document.getElementById('google-pay-payment');
            if (googlePayOption) {
                googlePayOption.disabled = true;
                googlePayOption.parentElement.style.opacity = '0.5';
                googlePayOption.parentElement.title = 'Google Pay non disponibile in questo browser';
            }
        }
    }

    initGooglePay() {
        // Inizializza Google Pay
        if (window.google && window.google.payments) {
            const paymentsClient = new google.payments.api.PaymentsClient({
                environment: 'TEST' // Cambia in 'PRODUCTION' per produzione
            });

            const baseRequest = {
                apiVersion: 2,
                apiVersionMinor: 0
            };

            const allowedCardNetworks = ["VISA", "MASTERCARD", "AMEX"];
            const allowedCardAuthMethods = ["PAN_ONLY", "CRYPTOGRAM_3DS"];

            const tokenizationSpecification = {
                type: 'PAYMENT_GATEWAY',
                parameters: {
                    gateway: 'stripe',
                    gatewayMerchantId: 'your_stripe_merchant_id'
                }
            };

            const baseCardPaymentMethod = {
                type: 'CARD',
                parameters: {
                    allowedAuthMethods: allowedCardAuthMethods,
                    allowedCardNetworks: allowedCardNetworks
                }
            };

            const cardPaymentMethod = Object.assign(
                {tokenizationSpecification: tokenizationSpecification},
                baseCardPaymentMethod
            );

            const paymentDataRequest = Object.assign({}, baseRequest, {
                allowedPaymentMethods: [cardPaymentMethod],
                transactionInfo: {
                    totalPriceStatus: 'FINAL',
                    totalPrice: this.calculateTotal().toString(),
                    currencyCode: 'EUR',
                    countryCode: 'FR'
                },
                merchantInfo: {
                    merchantName: 'Artisanat en Ligne'
                }
            });

            const button = paymentsClient.createButton({
                onClick: this.onGooglePayClick.bind(this)
            });

            const container = document.getElementById('google-pay-button');
            if (container) {
                container.innerHTML = '';
                container.appendChild(button);
            }
        }
    }

    onGooglePayClick() {
        // Gestisce il click su Google Pay
        console.log('Google Pay clicked');
        // Qui implementeresti la logica di pagamento Google Pay
    }

    initPayPal() {
        // Inizializza PayPal
        if (window.paypal) {
            paypal.Buttons({
                createOrder: (data, actions) => {
                    return actions.order.create({
                        purchase_units: [{
                            amount: {
                                value: this.calculateTotal().toString()
                            },
                            description: 'Ordine Artisanat en Ligne'
                        }]
                    });
                },
                onApprove: (data, actions) => {
                    return actions.order.capture().then((details) => {
                        this.processPayment('paypal', {
                            orderId: data.orderID,
                            payerId: details.payer.payer_id
                        });
                    });
                }
            }).render('#paypal-button-container');
        }
    }

    async processPayment(method, paymentData) {
        try {
            const response = await fetch('/api/payments/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    method: method,
                    amount: this.calculateTotal(),
                    orderId: this.orderId, // Dovrà essere impostato dopo la creazione dell'ordine
                    paymentData: paymentData
                })
            });

            const result = await response.json();

            if (result.success) {
                this.showPaymentSuccess(result);
            } else {
                this.showError(result.error);
            }
        } catch (error) {
            console.error('Errore nel processamento del pagamento:', error);
            this.showError('Errore durante il pagamento');
        }
    }

    showPaymentSuccess(result) {
        // Mostra il successo del pagamento
        const appContainer = document.getElementById('app');
        if (appContainer) {
            appContainer.innerHTML = `
                <div class="container my-5">
                    <div class="row justify-content-center">
                        <div class="col-md-8 text-center">
                            <div class="card">
                                <div class="card-body py-5">
                                    <i class="fas fa-check-circle fa-5x text-success mb-4"></i>
                                    <h2 class="mb-3">Pagamento completato!</h2>
                                    <p class="lead mb-2">Il tuo ordine è stato confermato e il pagamento è stato processato con successo.</p>
                                    <p class="text-muted mb-4">Numero ordine: <strong>${result.transactionId}</strong></p>
                                    ${result.instructions ? `<p class="alert alert-info">${result.instructions}</p>` : ''}
                                    <div class="d-grid gap-2 d-md-block">
                                        <a href="/dashboard" class="btn btn-primary me-md-2" data-link>
                                            <i class="fas fa-tachometer-alt me-2"></i>Vedi i tuoi ordini
                                        </a>
                                        <a href="/prodotti" class="btn btn-outline-primary" data-link>
                                            <i class="fas fa-store me-2"></i>Continua gli acquisti
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    async loadOrderData() {
        try {
            // Carica i dati del carrello dal backend
            const response = await fetch('/api/cart', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const cartData = await response.json();
                this.orderData.items = cartData.items || [];
                
                if (this.orderData.items.length === 0) {
                    this.showEmptyCart();
                    return;
                }
            } else if (response.status === 401) {
                // Utente non autenticato, reindirizza al login
                window.location.href = '/login';
                return;
            } else {
                throw new Error('Errore nel caricamento del carrello');
        }

        this.orderData.shipping = this.shippingOptions[0]; // Default a spedizione standard
        this.displayOrderItems();
            
        } catch (error) {
            console.error('Errore nel caricamento dei dati dell\'ordine:', error);
            this.showError('Errore nel caricamento del carrello. Per favore, riprova.');
        }
    }

    showEmptyCart() {
        const appContainer = document.getElementById('app');
        if (appContainer) {
            appContainer.innerHTML = `
                <div class="container my-5">
                    <div class="row justify-content-center">
                        <div class="col-md-8 text-center">
                            <div class="card">
                                <div class="card-body py-5">
                                    <i class="fas fa-shopping-cart fa-5x text-muted mb-4"></i>
                                    <h2 class="mb-3">Il tuo carrello è vuoto</h2>
                                    <p class="lead mb-4">Non ci sono prodotti nel tuo carrello. Aggiungi alcuni prodotti per procedere con l'ordine.</p>
                                    <a href="/prodotti" class="btn btn-primary" data-link>
                                        <i class="fas fa-store me-2"></i>Vai ai prodotti
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    displayOrderItems() {
        const container = document.getElementById('order-items');
        if (!container) return;

        if (this.orderData.items.length === 0) {
            container.innerHTML = '<p class="text-muted">Nessun prodotto nel carrello</p>';
            return;
        }

        container.innerHTML = this.orderData.items.map(item => `
            <div class="d-flex align-items-center mb-3">
                <div class="me-3">
                    <img src="${item.main_image || '/static/img/placeholder.jpg'}" alt="${item.name}" class="rounded" style="width: 60px; height: 60px; object-fit: cover;">
                </div>
                <div class="flex-grow-1">
                    <h6 class="mb-1">${item.name}</h6>
                    <small class="text-muted">Quantità: ${item.quantity}</small>
                </div>
                <div class="text-end">
                    <span class="fw-bold">${(item.price * item.quantity).toFixed(2)} €</span>
                </div>
            </div>
        `).join('');
    }

    toggleBillingSection(useSameAddress) {
        const billingSection = document.getElementById('billing-section');
        if (!billingSection) return;

        if (useSameAddress) {
            billingSection.style.display = 'none';
            this.copyShippingToBilling();
        } else {
            billingSection.style.display = 'block';
        }
    }

    copyShippingToBilling() {
        const fields = ['firstname', 'lastname', 'address', 'postal', 'city', 'country'];
        fields.forEach(field => {
            const shippingValue = document.getElementById(`shipping-${field}`)?.value;
            const billingField = document.getElementById(`billing-${field}`);
            if (billingField && shippingValue) {
                billingField.value = shippingValue;
            }
        });
    }

    updateOrderSummary() {
        const subtotal = this.orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shippingCost = this.orderData.shipping.price;
        const total = subtotal + shippingCost;

        const subtotalElement = document.getElementById('subtotal');
        const shippingCostElement = document.getElementById('shipping-cost');
        const totalElement = document.getElementById('total-amount');

        if (subtotalElement) subtotalElement.textContent = `${subtotal.toFixed(2)} €`;
        if (shippingCostElement) shippingCostElement.textContent = `${shippingCost.toFixed(2)} €`;
        if (totalElement) totalElement.textContent = `${total.toFixed(2)} €`;

        // Abilita il pulsante per confermare l'ordine
        const placeOrderBtn = document.getElementById('place-order-btn');
        if (placeOrderBtn) {
            placeOrderBtn.disabled = this.orderData.items.length === 0;
        }
    }

    async placeOrder() {
        // Validazione dei form
        if (!this.validateForms()) {
            return;
        }

        // Mostra lo stato di caricamento
        const placeOrderBtn = document.getElementById('place-order-btn');
        if (placeOrderBtn) {
            placeOrderBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Traitement...';
            placeOrderBtn.disabled = true;
        }

        try {
            // Raccoglie i dati dell'ordine
            const orderData = {
                items: this.orderData.items.map(item => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    price: item.price
                })),
                shipping: this.getShippingData(),
                billing: this.getBillingData(),
                payment: this.getPaymentData(),
                shipping_method: this.orderData.shipping.id,
                shipping_cost: this.orderData.shipping.price,
                total: this.calculateTotal()
            };

            // Invia l'ordine al backend
            const response = await fetch('/api/orders/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(orderData)
            });

            if (response.ok) {
                const result = await response.json();
                
                // Pulisci il carrello
                await this.clearCart();

            // Mostra il successo e reindirizza
                this.showOrderSuccess(result.order_id);
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Errore durante la creazione dell\'ordine');
            }

        } catch (error) {
            console.error('Error placing order:', error);
            this.showError(error.message || 'Si è verificato un errore durante l\'ordine. Per favore, riprova.');
            
            // Reset del pulsante
            if (placeOrderBtn) {
                placeOrderBtn.innerHTML = '<i class="fas fa-lock me-2"></i>Conferma l\'ordine';
                placeOrderBtn.disabled = false;
            }
        }
    }

    async clearCart() {
        try {
            await fetch('/api/cart/clear', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
        } catch (error) {
            console.error('Errore nella pulizia del carrello:', error);
        }
    }

    validateForms() {
        // Validazione del form di spedizione
        const shippingForm = document.getElementById('shipping-form');
        if (!shippingForm.checkValidity()) {
            shippingForm.reportValidity();
            return false;
        }

        // Validazione del form di fatturazione se visibile
        const billingSection = document.getElementById('billing-section');
        if (billingSection.style.display !== 'none') {
            const billingForm = document.getElementById('billing-form');
            if (!billingForm.checkValidity()) {
                billingForm.reportValidity();
                return false;
            }
        }

        // Validazione del metodo di pagamento
        const paymentMethod = document.querySelector('input[name="payment-method"]:checked')?.value;
        
        if (paymentMethod === 'card') {
            const cardFields = ['card-number', 'card-expiry', 'card-cvv', 'card-holder'];
            for (const fieldId of cardFields) {
                const field = document.getElementById(fieldId);
                if (!field || !field.value.trim()) {
                    this.showError('Per favore, riempi tutti i campi della carta bancaria.');
                    return false;
                }
            }
            
            // Validazione formato carta
            const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
            if (cardNumber.length < 13 || cardNumber.length > 19) {
                this.showError('Il numero della carta deve essere tra 13 e 19 cifre.');
                return false;
            }
            
            // Validazione data scadenza
            const expiry = document.getElementById('card-expiry').value;
            if (!/^\d{2}\/\d{2}$/.test(expiry)) {
                this.showError('Formato data scadenza non valido. Usa MM/AA.');
                return false;
            }
            
            // Validazione CVV
            const cvv = document.getElementById('card-cvv').value;
            if (cvv.length < 3 || cvv.length > 4) {
                this.showError('Il codice CVV deve essere di 3 o 4 cifre.');
                return false;
            }
        } else if (paymentMethod === 'google_pay') {
            // Verifica che Google Pay sia disponibile
            if (!window.google || !window.google.payments) {
                this.showError('Google Pay non è disponibile in questo browser. Scegli un altro metodo di pagamento.');
                return false;
            }
        }

        return true;
    }

    getShippingData() {
        return {
            firstname: document.getElementById('shipping-firstname')?.value,
            lastname: document.getElementById('shipping-lastname')?.value,
            address: document.getElementById('shipping-address')?.value,
            postal: document.getElementById('shipping-postal')?.value,
            city: document.getElementById('shipping-city')?.value,
            country: document.getElementById('shipping-country')?.value,
            phone: document.getElementById('shipping-phone')?.value
        };
    }

    getBillingData() {
        const sameBilling = document.getElementById('same-billing')?.checked;
        if (sameBilling) {
            return this.getShippingData();
        }

        return {
            firstname: document.getElementById('billing-firstname')?.value,
            lastname: document.getElementById('billing-lastname')?.value,
            address: document.getElementById('billing-address')?.value,
            postal: document.getElementById('billing-postal')?.value,
            city: document.getElementById('billing-city')?.value,
            country: document.getElementById('billing-country')?.value
        };
    }

    getPaymentData() {
        const paymentMethod = document.querySelector('input[name="payment-method"]:checked')?.value;
        
        if (paymentMethod === 'card') {
            return {
                method: 'card',
                cardNumber: document.getElementById('card-number')?.value.replace(/\s/g, ''),
                expiry: document.getElementById('card-expiry')?.value,
                cvv: document.getElementById('card-cvv')?.value,
                holder: document.getElementById('card-holder')?.value
            };
        } else if (paymentMethod === 'paypal') {
            return {
                method: 'paypal',
                save: document.getElementById('paypal-save')?.checked
            };
        } else if (paymentMethod === 'google_pay') {
            return {
                method: 'google_pay',
                save: document.getElementById('googlepay-save')?.checked
            };
        } else if (paymentMethod === 'cash') {
            return {
                method: 'cash',
                branchId: document.getElementById('branch-select')?.value
            };
        }
        return {};
    }

    calculateTotal() {
        const subtotal = this.orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shippingCost = this.orderData.shipping.price;
        return subtotal + shippingCost;
    }

    showOrderSuccess(orderId) {
        const appContainer = document.getElementById('app');
        if (appContainer) {
            appContainer.innerHTML = `
                <div class="container my-5">
                    <div class="row justify-content-center">
                        <div class="col-md-8 text-center">
                            <div class="card">
                                <div class="card-body py-5">
                                    <i class="fas fa-check-circle fa-5x text-success mb-4"></i>
                                    <h2 class="mb-3">Ordine confermato!</h2>
                                    <p class="lead mb-2">Il tuo ordine è stato trattato con successo.</p>
                                    <p class="text-muted mb-4">Numero ordine: <strong>${orderId}</strong></p>
                                    <p class="mb-4">Riceverai un'email di conferma in pochi minuti.</p>
                                    <div class="d-grid gap-2 d-md-block">
                                        <a href="/dashboard" class="btn btn-primary me-md-2" data-link>
                                            <i class="fas fa-tachometer-alt me-2"></i>Vedi i tuoi ordini
                                        </a>
                                        <a href="/prodotti" class="btn btn-outline-primary" data-link>
                                            <i class="fas fa-store me-2"></i>Continua gli acquisti
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    showError(message) {
        // Crea una notifica di errore
        const toast = document.createElement('div');
        toast.className = 'toast align-items-center text-white bg-danger border-0';
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas fa-exclamation-circle me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;

        // Aggiungi al contenitore di toast
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
            toastContainer.style.zIndex = '9999';
            document.body.appendChild(toastContainer);
        }

        toastContainer.appendChild(toast);

        // Mostra il toast
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();

        // Rimuovi dopo la visualizzazione
        toast.addEventListener('hidden.bs.toast', () => {
            if (toastContainer.contains(toast)) {
                toastContainer.removeChild(toast);
            }
        });
    }
}