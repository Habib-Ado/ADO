import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Dashboard Admin - Artigianato on Ligne");
        this.orders = [];
        this.currentFilter = 'all';
    }

    async getHtml() {
        return `
            <div class="container-fluid my-4">
                <div class="row">
                    <!-- Sidebar -->
                    <div class="col-md-3">
                        <div class="card">
                            <div class="card-header">
                                <h5 class="mb-0">Gestione Ordini</h5>
                            </div>
                            <div class="card-body">
                                <div class="list-group">
                                    <button class="list-group-item list-group-item-action active" data-filter="all">
                                        <i class="fas fa-list me-2"></i>Tutti gli ordini
                                    </button>
                                    <button class="list-group-item list-group-item-action" data-filter="pending">
                                        <i class="fas fa-clock me-2"></i>In attesa di pagamento
                                    </button>
                                    <button class="list-group-item list-group-item-action" data-filter="payment_completed">
                                        <i class="fas fa-credit-card me-2"></i>Pagamento completato
                                    </button>
                                    <button class="list-group-item list-group-item-action" data-filter="processing">
                                        <i class="fas fa-cogs me-2"></i>In elaborazione
                                    </button>
                                    <button class="list-group-item list-group-item-action" data-filter="shipped">
                                        <i class="fas fa-shipping-fast me-2"></i>Spediti
                                    </button>
                                    <button class="list-group-item list-group-item-action" data-filter="delivered">
                                        <i class="fas fa-check-circle me-2"></i>Consegnati
                                    </button>
                                    <button class="list-group-item list-group-item-action" data-filter="cancelled">
                                        <i class="fas fa-times-circle me-2"></i>Cancellati
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Statistiche -->
                        <div class="card mt-3">
                            <div class="card-header">
                                <h6 class="mb-0">Statistiche</h6>
                            </div>
                            <div class="card-body">
                                <div class="row text-center">
                                    <div class="col-6">
                                        <h4 class="text-primary" id="total-orders">0</h4>
                                        <small>Totale ordini</small>
                                    </div>
                                    <div class="col-6">
                                        <h4 class="text-success" id="completed-orders">0</h4>
                                        <small>Completati</small>
                                    </div>
                                </div>
                                <div class="row text-center mt-2">
                                    <div class="col-6">
                                        <h4 class="text-warning" id="pending-orders">0</h4>
                                        <small>In attesa</small>
                                    </div>
                                    <div class="col-6">
                                        <h4 class="text-danger" id="cancelled-orders">0</h4>
                                        <small>Cancellati</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Contenuto principale -->
                    <div class="col-md-9">
                        <div class="card">
                            <div class="card-header d-flex justify-content-between align-items-center">
                                <h5 class="mb-0">Gestione Ordini</h5>
                                <div class="d-flex gap-2">
                                    <input type="text" class="form-control form-control-sm" id="search-orders" placeholder="Cerca ordini...">
                                    <button class="btn btn-primary btn-sm" id="refresh-orders">
                                        <i class="fas fa-sync-alt"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="card-body">
                                <div class="table-responsive">
                                    <table class="table table-hover">
                                        <thead>
                                            <tr>
                                                <th>ID Ordine</th>
                                                <th>Cliente</th>
                                                <th>Totale</th>
                                                <th>Stato</th>
                                                <th>Pagamento</th>
                                                <th>Data</th>
                                                <th>Azioni</th>
                                            </tr>
                                        </thead>
                                        <tbody id="orders-table-body">
                                            <!-- Gli ordini verranno caricati qui -->
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal per dettagli ordine -->
            <div class="modal fade" id="orderDetailsModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Dettagli Ordine</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body" id="order-details-content">
                            <!-- Contenuto del modal -->
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal per aggiornare stato -->
            <div class="modal fade" id="updateStatusModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Aggiorna Stato Ordine</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="update-status-form">
                                <div class="mb-3">
                                    <label class="form-label">Nuovo Stato</label>
                                    <select class="form-select" id="new-status" required>
                                        <option value="">Seleziona stato...</option>
                                        <option value="pending">In attesa di pagamento</option>
                                        <option value="payment_pending">Pagamento in corso</option>
                                        <option value="payment_completed">Pagamento completato</option>
                                        <option value="processing">In elaborazione</option>
                                        <option value="shipped">Spedito</option>
                                        <option value="delivered">Consegnato</option>
                                        <option value="cancelled">Cancellato</option>
                                        <option value="refunded">Rimborsato</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Stato Pagamento</label>
                                    <select class="form-select" id="new-payment-status">
                                        <option value="">Mantieni attuale</option>
                                        <option value="pending">In attesa</option>
                                        <option value="processing">In elaborazione</option>
                                        <option value="completed">Completato</option>
                                        <option value="failed">Fallito</option>
                                        <option value="refunded">Rimborsato</option>
                                        <option value="cancelled">Cancellato</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Note</label>
                                    <textarea class="form-control" id="status-notes" rows="3" placeholder="Note aggiuntive..."></textarea>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annulla</button>
                            <button type="button" class="btn btn-primary" id="save-status-btn">Salva</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal per tracking -->
            <div class="modal fade" id="trackingModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Aggiorna Tracking</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="tracking-form">
                                <div class="mb-3">
                                    <label class="form-label">Numero di Tracking</label>
                                    <input type="text" class="form-control" id="tracking-number" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Data di Consegna Stimata</label>
                                    <input type="date" class="form-control" id="estimated-delivery">
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annulla</button>
                            <button type="button" class="btn btn-primary" id="save-tracking-btn">Salva</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async init() {
        await this.loadOrders();
        this.setupEventListeners();
        this.updateStatistics();
    }

    setupEventListeners() {
        // Filtri
        document.querySelectorAll('[data-filter]').forEach(button => {
            button.addEventListener('click', (e) => {
                document.querySelectorAll('[data-filter]').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.filterOrders();
            });
        });

        // Ricerca
        document.getElementById('search-orders').addEventListener('input', (e) => {
            this.searchOrders(e.target.value);
        });

        // Refresh
        document.getElementById('refresh-orders').addEventListener('click', () => {
            this.loadOrders();
        });

        // Salva stato
        document.getElementById('save-status-btn').addEventListener('click', () => {
            this.updateOrderStatus();
        });

        // Salva tracking
        document.getElementById('save-tracking-btn').addEventListener('click', () => {
            this.saveTracking();
        });
    }

    async loadOrders() {
        try {
            const response = await fetch('/api/orders/admin', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.orders = data.orders;
                this.renderOrders();
                this.updateStatistics();
            } else {
                throw new Error('Errore nel caricamento degli ordini');
            }
        } catch (error) {
            console.error('Errore nel caricamento degli ordini:', error);
            this.showError('Errore nel caricamento degli ordini');
        }
    }

    renderOrders() {
        const tbody = document.getElementById('orders-table-body');
        if (!tbody) return;

        const filteredOrders = this.getFilteredOrders();

        tbody.innerHTML = filteredOrders.map(order => `
            <tr>
                <td><strong>#${order.id}</strong></td>
                <td>
                    <div>
                        <strong>${order.shipping_first_name} ${order.shipping_last_name}</strong><br>
                        <small class="text-muted">${order.shipping_email || 'N/A'}</small>
                    </div>
                </td>
                <td><strong>${order.total_amount} €</strong></td>
                <td>
                    <span class="badge ${this.getStatusBadgeClass(order.status)}">
                        ${this.getStatusLabel(order.status)}
                    </span>
                </td>
                <td>
                    <span class="badge ${this.getPaymentStatusBadgeClass(order.payment_status)}">
                        ${this.getPaymentStatusLabel(order.payment_status)}
                    </span>
                </td>
                <td>
                    <small>${new Date(order.created_at).toLocaleDateString('it-IT')}</small>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="this.viewOrderDetails(${order.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline-success" onclick="this.updateStatus(${order.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-info" onclick="this.updateTracking(${order.id})">
                            <i class="fas fa-truck"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    getFilteredOrders() {
        if (this.currentFilter === 'all') {
            return this.orders;
        }
        return this.orders.filter(order => order.status === this.currentFilter);
    }

    searchOrders(query) {
        if (!query) {
            this.renderOrders();
            return;
        }

        const filteredOrders = this.orders.filter(order => 
            order.id.toString().includes(query) ||
            order.shipping_first_name.toLowerCase().includes(query.toLowerCase()) ||
            order.shipping_last_name.toLowerCase().includes(query.toLowerCase()) ||
            order.shipping_email?.toLowerCase().includes(query.toLowerCase())
        );

        this.renderFilteredOrders(filteredOrders);
    }

    renderFilteredOrders(orders) {
        const tbody = document.getElementById('orders-table-body');
        if (!tbody) return;

        tbody.innerHTML = orders.map(order => `
            <tr>
                <td><strong>#${order.id}</strong></td>
                <td>
                    <div>
                        <strong>${order.shipping_first_name} ${order.shipping_last_name}</strong><br>
                        <small class="text-muted">${order.shipping_email || 'N/A'}</small>
                    </div>
                </td>
                <td><strong>${order.total_amount} €</strong></td>
                <td>
                    <span class="badge ${this.getStatusBadgeClass(order.status)}">
                        ${this.getStatusLabel(order.status)}
                    </span>
                </td>
                <td>
                    <span class="badge ${this.getPaymentStatusBadgeClass(order.payment_status)}">
                        ${this.getPaymentStatusLabel(order.payment_status)}
                    </span>
                </td>
                <td>
                    <small>${new Date(order.created_at).toLocaleDateString('it-IT')}</small>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="this.viewOrderDetails(${order.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline-success" onclick="this.updateStatus(${order.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-info" onclick="this.updateTracking(${order.id})">
                            <i class="fas fa-truck"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    updateStatistics() {
        const totalOrders = this.orders.length;
        const completedOrders = this.orders.filter(o => o.status === 'delivered').length;
        const pendingOrders = this.orders.filter(o => o.status === 'pending' || o.status === 'payment_pending').length;
        const cancelledOrders = this.orders.filter(o => o.status === 'cancelled').length;

        document.getElementById('total-orders').textContent = totalOrders;
        document.getElementById('completed-orders').textContent = completedOrders;
        document.getElementById('pending-orders').textContent = pendingOrders;
        document.getElementById('cancelled-orders').textContent = cancelledOrders;
    }

    getStatusBadgeClass(status) {
        const classes = {
            'pending': 'bg-warning',
            'payment_pending': 'bg-info',
            'payment_completed': 'bg-success',
            'processing': 'bg-primary',
            'shipped': 'bg-info',
            'delivered': 'bg-success',
            'cancelled': 'bg-danger',
            'refunded': 'bg-secondary'
        };
        return classes[status] || 'bg-secondary';
    }

    getPaymentStatusBadgeClass(status) {
        const classes = {
            'pending': 'bg-warning',
            'processing': 'bg-info',
            'completed': 'bg-success',
            'failed': 'bg-danger',
            'refunded': 'bg-secondary',
            'cancelled': 'bg-danger'
        };
        return classes[status] || 'bg-secondary';
    }

    getStatusLabel(status) {
        const labels = {
            'pending': 'In attesa',
            'payment_pending': 'Pagamento in corso',
            'payment_completed': 'Pagamento completato',
            'processing': 'In elaborazione',
            'shipped': 'Spedito',
            'delivered': 'Consegnato',
            'cancelled': 'Cancellato',
            'refunded': 'Rimborsato'
        };
        return labels[status] || status;
    }

    getPaymentStatusLabel(status) {
        const labels = {
            'pending': 'In attesa',
            'processing': 'In elaborazione',
            'completed': 'Completato',
            'failed': 'Fallito',
            'refunded': 'Rimborsato',
            'cancelled': 'Cancellato'
        };
        return labels[status] || status;
    }

    async viewOrderDetails(orderId) {
        try {
            const response = await fetch(`/api/orders/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.showOrderDetailsModal(data.order);
            } else {
                throw new Error('Errore nel caricamento dei dettagli');
            }
        } catch (error) {
            console.error('Errore nel caricamento dei dettagli:', error);
            this.showError('Errore nel caricamento dei dettagli');
        }
    }

    showOrderDetailsModal(order) {
        const modal = document.getElementById('orderDetailsModal');
        const content = document.getElementById('order-details-content');

        content.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <h6>Informazioni Cliente</h6>
                    <p><strong>Nome:</strong> ${order.shipping_first_name} ${order.shipping_last_name}</p>
                    <p><strong>Email:</strong> ${order.shipping_email || 'N/A'}</p>
                    <p><strong>Telefono:</strong> ${order.shipping_phone || 'N/A'}</p>
                    <p><strong>Indirizzo:</strong> ${order.shipping_address}</p>
                    <p><strong>Città:</strong> ${order.shipping_city}, ${order.shipping_postal_code}</p>
                </div>
                <div class="col-md-6">
                    <h6>Dettagli Ordine</h6>
                    <p><strong>ID Ordine:</strong> #${order.id}</p>
                    <p><strong>Data:</strong> ${new Date(order.created_at).toLocaleString('it-IT')}</p>
                    <p><strong>Stato:</strong> ${this.getStatusLabel(order.status)}</p>
                    <p><strong>Pagamento:</strong> ${this.getPaymentStatusLabel(order.payment_status)}</p>
                    <p><strong>Totale:</strong> ${order.total_amount} €</p>
                    ${order.tracking_number ? `<p><strong>Tracking:</strong> ${order.tracking_number}</p>` : ''}
                </div>
            </div>
            <hr>
            <h6>Prodotti</h6>
            <div class="table-responsive">
                <table class="table table-sm">
                    <thead>
                        <tr>
                            <th>Prodotto</th>
                            <th>Quantità</th>
                            <th>Prezzo</th>
                            <th>Totale</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map(item => `
                            <tr>
                                <td>${item.product_name}</td>
                                <td>${item.quantity}</td>
                                <td>${item.unit_price} €</td>
                                <td>${(item.quantity * item.unit_price).toFixed(2)} €</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    }

    updateStatus(orderId) {
        this.currentOrderId = orderId;
        const modal = document.getElementById('updateStatusModal');
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    }

    async updateOrderStatus() {
        try {
            const newStatus = document.getElementById('new-status').value;
            const newPaymentStatus = document.getElementById('new-payment-status').value;
            const notes = document.getElementById('status-notes').value;

            if (!newStatus) {
                this.showError('Seleziona un nuovo stato');
                return;
            }

            const response = await fetch(`/api/payments/order/${this.currentOrderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    status: newStatus,
                    paymentStatus: newPaymentStatus || undefined,
                    notes: notes
                })
            });

            if (response.ok) {
                const result = await response.json();
                this.showSuccess('Stato aggiornato con successo');
                this.loadOrders();
                
                // Chiudi modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('updateStatusModal'));
                modal.hide();
            } else {
                throw new Error('Errore nell\'aggiornamento dello stato');
            }
        } catch (error) {
            console.error('Errore nell\'aggiornamento dello stato:', error);
            this.showError('Errore nell\'aggiornamento dello stato');
        }
    }

    updateTracking(orderId) {
        this.currentOrderId = orderId;
        const modal = document.getElementById('trackingModal');
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    }

    async saveTracking() {
        try {
            const trackingNumber = document.getElementById('tracking-number').value;
            const estimatedDelivery = document.getElementById('estimated-delivery').value;

            if (!trackingNumber) {
                this.showError('Inserisci il numero di tracking');
                return;
            }

            const response = await fetch(`/api/payments/order/${this.currentOrderId}/tracking`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    trackingNumber: trackingNumber,
                    estimatedDelivery: estimatedDelivery
                })
            });

            if (response.ok) {
                this.showSuccess('Tracking aggiornato con successo');
                this.loadOrders();
                
                // Chiudi modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('trackingModal'));
                modal.hide();
            } else {
                throw new Error('Errore nell\'aggiornamento del tracking');
            }
        } catch (error) {
            console.error('Errore nell\'aggiornamento del tracking:', error);
            this.showError('Errore nell\'aggiornamento del tracking');
        }
    }

    showSuccess(message) {
        // Implementa notifica di successo
        alert(message); // Sostituisci con una notifica più elegante
    }

    showError(message) {
        // Implementa notifica di errore
        alert('Errore: ' + message); // Sostituisci con una notifica più elegante
    }
}
