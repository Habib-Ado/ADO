import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle('Gestione Richieste Artigiani - Admin');
    }

    async getHtml() {
        return `
            <div class="admin-container">
                <div class="admin-header">
                    <h1><i class="fas fa-users-cog me-3"></i>Gestione Richieste Artigiani</h1>
                    <p>Gestisci le richieste di promozione ad artigiano</p>
                </div>
                
                <div class="admin-content">
                    <div class="requests-section">
                        <div class="section-header">
                            <h3><i class="fas fa-list me-2"></i>Richieste in Attesa</h3>
                            <button class="refresh-btn" id="refreshButton">
                                <i class="fas fa-sync-alt me-2"></i>Aggiorna
                            </button>
                        </div>
                        
                        <div class="requests-list" id="requestsList">
                            <div class="loading-spinner">
                                <i class="fas fa-spinner fa-spin"></i>
                                <p>Caricamento richieste...</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="admin-feedback" id="adminFeedback"></div>
            </div>
        `;
    }

    async onMounted() {
        this.initEventListeners();
        await this.loadRequests();
    }

    initEventListeners() {
        const refreshButton = document.getElementById('refreshButton');
        refreshButton.addEventListener('click', this.loadRequests.bind(this));
    }

    async loadRequests() {
        const requestsList = document.getElementById('requestsList');
        const refreshButton = document.getElementById('refreshButton');
        
        refreshButton.disabled = true;
        refreshButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Caricamento...';
        
        try {
            const response = await fetch('/api/admin/artisan-requests');
            const data = await response.json();

            if (response.ok) {
                this.displayRequests(data.requests);
            } else {
                this.showFeedback(data.error || 'Errore nel caricamento delle richieste.', 'error');
            }
        } catch (error) {
            console.error('Errore nel caricamento delle richieste:', error);
            this.showFeedback('Errore di connessione.', 'error');
        } finally {
            refreshButton.disabled = false;
            refreshButton.innerHTML = '<i class="fas fa-sync-alt me-2"></i>Aggiorna';
        }
    }

    displayRequests(requests) {
        const requestsList = document.getElementById('requestsList');
        
        if (requests.length === 0) {
            requestsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox fa-3x mb-3"></i>
                    <h4>Nessuna richiesta in attesa</h4>
                    <p>Tutte le richieste sono state processate.</p>
                </div>
            `;
            return;
        }

        requestsList.innerHTML = requests.map(request => `
            <div class="request-card" data-request-id="${request.id}">
                <div class="request-header">
                    <div class="user-info">
                        <h4>${request.username}</h4>
                        <p class="user-email">${request.email}</p>
                        <p class="request-date">
                            <i class="fas fa-calendar me-1"></i>
                            Richiesta: ${new Date(request.request_date).toLocaleDateString('it-IT')}
                        </p>
                    </div>
                    <div class="request-status ${request.status}">
                        <span class="status-badge">
                            ${this.getStatusText(request.status)}
                        </span>
                    </div>
                </div>
                
                ${request.status === 'pending' ? `
                    <div class="request-actions">
                        <button class="btn-approve" onclick="this.approveRequest(${request.id})">
                            <i class="fas fa-check me-2"></i>Approva
                        </button>
                        <button class="btn-reject" onclick="this.rejectRequest(${request.id})">
                            <i class="fas fa-times me-2"></i>Rifiuta
                        </button>
                    </div>
                ` : `
                    <div class="request-processed">
                        <p><strong>Processata il:</strong> ${new Date(request.processed_date).toLocaleDateString('it-IT')}</p>
                        ${request.admin_notes ? `<p><strong>Note:</strong> ${request.admin_notes}</p>` : ''}
                    </div>
                `}
            </div>
        `).join('');

        // Bind delle funzioni agli elementi
        this.bindRequestActions();
    }

    bindRequestActions() {
        // Bind delle funzioni di approvazione e rifiuto
        window.approveRequest = this.approveRequest.bind(this);
        window.rejectRequest = this.rejectRequest.bind(this);
    }

    getStatusText(status) {
        switch (status) {
            case 'pending': return 'In Attesa';
            case 'approved': return 'Approvata';
            case 'rejected': return 'Rifiutata';
            default: return status;
        }
    }

    async approveRequest(requestId) {
        await this.processRequest(requestId, 'approve');
    }

    async rejectRequest(requestId) {
        const notes = prompt('Inserisci una nota per il rifiuto (opzionale):');
        await this.processRequest(requestId, 'reject', notes);
    }

    async processRequest(requestId, action, notes = '') {
        const requestCard = document.querySelector(`[data-request-id="${requestId}"]`);
        const buttons = requestCard.querySelectorAll('button');
        
        // Disabilita i pulsanti durante il processing
        buttons.forEach(btn => btn.disabled = true);
        
        try {
            const response = await fetch('/api/admin/process-artisan-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    requestId: requestId,
                    action: action,
                    adminNotes: notes
                })
            });

            const data = await response.json();

            if (response.ok) {
                this.showFeedback(data.message, 'success');
                await this.loadRequests(); // Ricarica la lista
            } else {
                this.showFeedback(data.error || 'Errore durante il processing.', 'error');
            }
        } catch (error) {
            console.error('Errore durante il processing:', error);
            this.showFeedback('Errore di connessione.', 'error');
        } finally {
            // Riabilita i pulsanti
            buttons.forEach(btn => btn.disabled = false);
        }
    }

    showFeedback(message, type) {
        const feedbackElement = document.getElementById('adminFeedback');
        feedbackElement.textContent = message;
        feedbackElement.className = `admin-feedback ${type}`;
        feedbackElement.style.display = 'block';
        
        // Nascondi il messaggio dopo 5 secondi
        setTimeout(() => {
            feedbackElement.style.display = 'none';
        }, 5000);
    }
} 