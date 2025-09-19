import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle('Richiesta Artigiano - Artigianato on Ligne');
    }

    async getHtml() {
        return `
            <div class="artisan-request-container">
                <div class="artisan-request-card">
                    <div class="artisan-request-header">
                        <h1><i class="fas fa-hands-helping me-3"></i>Diventa Artigiano</h1>
                        <p>Richiedi di diventare un artigiano sulla nostra piattaforma</p>
                    </div>
                    
                    <div class="artisan-request-content">
                        <div class="info-section">
                            <h3><i class="fas fa-info-circle me-2"></i>Informazioni</h3>
                            <p>Come artigiano potrai:</p>
                            <ul>
                                <li><i class="fas fa-check me-2"></i>Vendere i tuoi prodotti artigianali</li>
                                <li><i class="fas fa-check me-2"></i>Gestire il tuo negozio online</li>
                                <li><i class="fas fa-check me-2"></i>Comunicare direttamente con i clienti</li>
                                <li><i class="fas fa-check me-2"></i>Accedere a statistiche di vendita</li>
                            </ul>
                        </div>
                        
                        <div class="request-section" id="requestSection">
                            <h3><i class="fas fa-paper-plane me-2"></i>Invia Richiesta</h3>
                            <p>La tua richiesta sarà esaminata dall'amministratore. Riceverai una notifica una volta processata.</p>
                            
                            <button class="request-btn" id="requestButton">
                                <i class="fas fa-paper-plane me-2"></i>Richiedi Promozione ad Artigiano
                            </button>
                        </div>
                        
                        <div class="status-section" id="statusSection" style="display: none;">
                            <h3><i class="fas fa-clock me-2"></i>Stato Richiesta</h3>
                            <div id="statusContent"></div>
                        </div>
                    </div>
                    
                    <div class="artisan-request-footer">
                        <a href="/profile" class="back-link" data-link>
                            <i class="fas fa-arrow-left me-2"></i>Torna al Profilo
                        </a>
                    </div>
                    
                    <div class="request-feedback" id="requestFeedback"></div>
                </div>
            </div>
        `;
    }

    async onMounted() {
        this.initEventListeners();
        await this.checkRequestStatus();
    }

    initEventListeners() {
        const requestButton = document.getElementById('requestButton');
        requestButton.addEventListener('click', this.handleRequest.bind(this));
    }

    async checkRequestStatus() {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user || !user.id) {
                this.showFeedback('Devi essere connesso per accedere a questa pagina.', 'error');
                return;
            }

            const response = await fetch(`/api/artisan/request-status/${user.id}`);
            const data = await response.json();

            if (response.ok) {
                if (data.hasRequest) {
                    this.showRequestStatus(data.request);
                } else {
                    this.showRequestForm();
                }
            } else {
                this.showFeedback(data.error || 'Errore nel controllo dello stato.', 'error');
            }
        } catch (error) {
            console.error('Errore nel controllo dello stato:', error);
            this.showFeedback('Errore di connessione.', 'error');
        }
    }

    showRequestForm() {
        document.getElementById('requestSection').style.display = 'block';
        document.getElementById('statusSection').style.display = 'none';
    }

    showRequestStatus(request) {
        const statusSection = document.getElementById('statusSection');
        const statusContent = document.getElementById('statusContent');
        const requestSection = document.getElementById('requestSection');
        
        requestSection.style.display = 'none';
        statusSection.style.display = 'block';

        let statusText = '';
        let statusClass = '';
        let statusIcon = '';

        switch (request.status) {
            case 'pending':
                statusText = 'In Attesa';
                statusClass = 'pending';
                statusIcon = 'fas fa-clock';
                break;
            case 'approved':
                statusText = 'Approvata';
                statusClass = 'approved';
                statusIcon = 'fas fa-check-circle';
                break;
            case 'rejected':
                statusText = 'Rifiutata';
                statusClass = 'rejected';
                statusIcon = 'fas fa-times-circle';
                break;
        }

        statusContent.innerHTML = `
            <div class="status-card ${statusClass}">
                <div class="status-header">
                    <i class="${statusIcon} me-2"></i>
                    <strong>Stato: ${statusText}</strong>
                </div>
                <div class="status-details">
                    <p><strong>Data Richiesta:</strong> ${new Date(request.requestDate).toLocaleDateString('it-IT')}</p>
                    ${request.processedDate ? `<p><strong>Data Processamento:</strong> ${new Date(request.processedDate).toLocaleDateString('it-IT')}</p>` : ''}
                    ${request.adminNotes ? `<p><strong>Note Admin:</strong> ${request.adminNotes}</p>` : ''}
                </div>
            </div>
        `;
    }

    async handleRequest() {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.id) {
            this.showFeedback('Devi essere connesso per fare questa richiesta.', 'error');
            return;
        }

        const requestButton = document.getElementById('requestButton');
        requestButton.disabled = true;
        requestButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Invio in corso...';

        try {
            const response = await fetch('/api/artisan/request-promotion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user.id
                })
            });

            const data = await response.json();

            if (response.ok) {
                this.showFeedback(data.message, 'success');
                await this.checkRequestStatus(); // Ricarica lo stato
            } else {
                this.showFeedback(data.error || 'Errore durante l\'invio della richiesta.', 'error');
            }
        } catch (error) {
            console.error('Errore durante la richiesta:', error);
            this.showFeedback('Errore di connessione. Riprova più tardi.', 'error');
        } finally {
            requestButton.disabled = false;
            requestButton.innerHTML = '<i class="fas fa-paper-plane me-2"></i>Richiedi Promozione ad Artigiano';
        }
    }

    showFeedback(message, type) {
        const feedbackElement = document.getElementById('requestFeedback');
        feedbackElement.textContent = message;
        feedbackElement.className = `request-feedback ${type}`;
        feedbackElement.style.display = 'block';
        
        // Nascondi il messaggio dopo 5 secondi
        setTimeout(() => {
            feedbackElement.style.display = 'none';
        }, 5000);
    }
} 