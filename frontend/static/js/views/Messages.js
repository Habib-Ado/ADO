import AbstractView from './AbstractView.js';

export default class Messages extends AbstractView {
    constructor() {
        super();
        this.setTitle('Messages - Artisanat en Ligne');
        this.conversations = [];
        this.currentConversation = null;
        this.currentRecipient = null;
    }

    async getHtml() {
        return `
            <div class="container-fluid mt-4">
                <div class="row">
                    <!-- Liste des conversations -->
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-header d-flex justify-content-between align-items-center">
                                <h5 class="mb-0">
                                    <i class="fas fa-comments me-2"></i>Messages
                                </h5>
                                <button class="btn btn-primary btn-sm" id="new-message-btn">
                                    <i class="fas fa-plus me-1"></i>Nouveau
                                </button>
                            </div>
                            <div class="card-body p-0">
                                <div id="conversations-list" class="list-group list-group-flush">
                                    <!-- Les conversations seront chargées ici -->
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Zone de conversation -->
                    <div class="col-md-8">
                        <div class="card">
                            <div class="card-header" id="conversation-header" style="display: none;">
                                <h5 class="mb-0">
                                    <i class="fas fa-user me-2"></i>
                                    <span id="recipient-name">Nom du destinataire</span>
                                </h5>
                            </div>
                            <div class="card-body" id="conversation-body">
                                <div class="text-center text-muted py-5" id="no-conversation">
                                    <i class="fas fa-comments" style="font-size: 3rem;"></i>
                                    <h5 class="mt-3">Sélectionnez une conversation</h5>
                                    <p>Choisissez une conversation dans la liste à gauche pour commencer à discuter.</p>
                                </div>
                                
                                <div id="messages-container" style="display: none;">
                                    <div id="messages-list" class="mb-3" style="max-height: 400px; overflow-y: auto;">
                                        <!-- Les messages seront chargés ici -->
                                    </div>
                                    
                                    <div id="message-input-container">
                                        <div class="input-group">
                                            <input type="text" class="form-control" id="message-input" 
                                                   placeholder="Tapez votre message..." maxlength="500">
                                            <button class="btn btn-primary" id="send-message-btn" disabled>
                                                <i class="fas fa-paper-plane"></i>
                                            </button>
                                        </div>
                                        <small class="text-muted" id="char-count">0/500</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Modal pour nouveau message -->
            <div class="modal fade" id="newMessageModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-envelope me-2"></i>Nouveau message
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="new-message-form">
                                <div class="mb-3">
                                    <label for="recipient-select" class="form-label">Destinataire (Artisan)</label>
                                    <select class="form-select" id="recipient-select" required>
                                        <option value="">Sélectionnez un artisan...</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label for="message-subject" class="form-label">Sujet (optionnel)</label>
                                    <input type="text" class="form-control" id="message-subject" 
                                           placeholder="Sujet du message">
                                </div>
                                <div class="mb-3">
                                    <label for="message-content" class="form-label">Message</label>
                                    <textarea class="form-control" id="message-content" rows="4" 
                                              placeholder="Tapez votre message..." required maxlength="500"></textarea>
                                    <small class="text-muted" id="modal-char-count">0/500</small>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                            <button type="button" class="btn btn-primary" id="send-new-message-btn">
                                <i class="fas fa-paper-plane me-2"></i>Envoyer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async afterRender() {
        await this.loadConversations();
        this.setupEventListeners();
        this.loadArtisans();
    }

    async loadConversations() {
        try {
            const response = await fetch('/api/messages/conversations', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.conversations = data.conversations;
                this.renderConversations();
            } else {
                console.error('Erreur lors du chargement des conversations');
            }
        } catch (error) {
            console.error('Erreur lors du chargement des conversations:', error);
        }
    }

    async loadArtisans() {
        try {
            const response = await fetch('/api/products/artisans');
            if (response.ok) {
                const data = await response.json();
                this.renderArtisansSelect(data.artisans);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des artisans:', error);
        }
    }

    renderConversations() {
        const container = document.getElementById('conversations-list');
        
        if (this.conversations.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4 text-muted">
                    <i class="fas fa-inbox" style="font-size: 2rem;"></i>
                    <p class="mt-2">Aucune conversation</p>
                    <small>Commencez par envoyer un message à un artisan</small>
                </div>
            `;
            return;
        }

        container.innerHTML = this.conversations.map(conv => `
            <div class="list-group-item list-group-item-action conversation-item" 
                 data-user-id="${conv.other_user_id}" style="cursor: pointer;">
                <div class="d-flex w-100 justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <h6 class="mb-1">${conv.first_name} ${conv.last_name}</h6>
                        <small class="text-muted">@${conv.other_username}</small>
                        ${conv.is_artisan ? '<span class="badge bg-info ms-2">Artisan</span>' : ''}
                    </div>
                    <div class="text-end">
                        <small class="text-muted d-block">
                            ${this.formatDate(conv.last_message_time)}
                        </small>
                        ${conv.unread_count > 0 ? 
                            `<span class="badge bg-primary">${conv.unread_count}</span>` : ''}
                    </div>
                </div>
            </div>
        `).join('');

        // Ajouter les événements de clic
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.addEventListener('click', () => {
                const userId = item.dataset.userId;
                this.loadConversation(userId);
                
                // Mettre en surbrillance la conversation sélectionnée
                document.querySelectorAll('.conversation-item').forEach(i => 
                    i.classList.remove('active'));
                item.classList.add('active');
            });
        });
    }

    renderArtisansSelect(artisans) {
        const select = document.getElementById('recipient-select');
        select.innerHTML = '<option value="">Sélectionnez un artisan...</option>' +
            artisans.map(artisan => 
                `<option value="${artisan.id}">${artisan.first_name} ${artisan.last_name} (@${artisan.username})</option>`
            ).join('');
    }

    async loadConversation(userId) {
        try {
            const response = await fetch(`/api/messages/conversation/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.currentConversation = data.messages;
                this.currentRecipient = data.other_user;
                this.displayConversation();
            } else {
                console.error('Erreur lors du chargement de la conversation');
            }
        } catch (error) {
            console.error('Erreur lors du chargement de la conversation:', error);
        }
    }

    displayConversation() {
        const header = document.getElementById('conversation-header');
        const noConversation = document.getElementById('no-conversation');
        const messagesContainer = document.getElementById('messages-container');
        const recipientName = document.getElementById('recipient-name');

        header.style.display = 'block';
        noConversation.style.display = 'none';
        messagesContainer.style.display = 'block';
        recipientName.textContent = `${this.currentRecipient.first_name} ${this.currentRecipient.last_name}`;

        this.renderMessages();
    }

    renderMessages() {
        const container = document.getElementById('messages-list');
        
        container.innerHTML = this.currentConversation.map(msg => `
            <div class="d-flex mb-3 ${msg.sender_id === this.currentRecipient.id ? 'justify-content-start' : 'justify-content-end'}">
                <div class="message-bubble ${msg.sender_id === this.currentRecipient.id ? 'bg-light' : 'bg-primary text-white'}" 
                     style="max-width: 70%; border-radius: 15px; padding: 10px 15px;">
                    ${msg.subject ? `<div class="fw-bold mb-1">${msg.subject}</div>` : ''}
                    <div class="message-text">${msg.message}</div>
                    <small class="text-muted d-block mt-1">
                        ${this.formatDate(msg.created_at)}
                    </small>
                </div>
            </div>
        `).join('');

        // Faire défiler vers le bas
        container.scrollTop = container.scrollHeight;
    }

    setupEventListeners() {
        // Nouveau message
        document.getElementById('new-message-btn').addEventListener('click', () => {
            const modal = new bootstrap.Modal(document.getElementById('newMessageModal'));
            modal.show();
        });

        // Envoi de message dans une conversation existante
        const messageInput = document.getElementById('message-input');
        const sendBtn = document.getElementById('send-message-btn');

        messageInput.addEventListener('input', (e) => {
            const text = e.target.value.trim();
            sendBtn.disabled = !text || !this.currentRecipient;
        });

        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        sendBtn.addEventListener('click', () => this.sendMessage());

        // Nouveau message modal
        const contentInput = document.getElementById('message-content');
        const modalSendBtn = document.getElementById('send-new-message-btn');
        const modalCharCount = document.getElementById('modal-char-count');

        contentInput.addEventListener('input', (e) => {
            const text = e.target.value;
            modalCharCount.textContent = `${text.length}/500`;
            modalSendBtn.disabled = !text.trim();
        });

        modalSendBtn.addEventListener('click', () => this.sendNewMessage());
    }

    async sendMessage() {
        if (!this.currentRecipient) return;

        const messageInput = document.getElementById('message-input');
        const message = messageInput.value.trim();
        
        if (!message) return;

        try {
            const response = await fetch('/api/messages/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    recipient_id: this.currentRecipient.id,
                    message: message
                })
            });

            if (response.ok) {
                messageInput.value = '';
                document.getElementById('send-message-btn').disabled = true;
                
                // Recharger la conversation
                await this.loadConversation(this.currentRecipient.id);
                await this.loadConversations(); // Mettre à jour la liste
            } else {
                const data = await response.json();
                alert(`Erreur: ${data.error}`);
            }
        } catch (error) {
            console.error('Erreur lors de l\'envoi du message:', error);
            alert('Erreur lors de l\'envoi du message');
        }
    }

    async sendNewMessage() {
        const recipientId = document.getElementById('recipient-select').value;
        const subject = document.getElementById('message-subject').value;
        const content = document.getElementById('message-content').value.trim();

        if (!recipientId || !content) return;

        try {
            const response = await fetch('/api/messages/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    recipient_id: recipientId,
                    subject: subject || null,
                    message: content
                })
            });

            if (response.ok) {
                // Fermer le modal et recharger
                const modal = bootstrap.Modal.getInstance(document.getElementById('newMessageModal'));
                modal.hide();
                
                // Réinitialiser le formulaire
                document.getElementById('new-message-form').reset();
                document.getElementById('modal-char-count').textContent = '0/500';
                
                // Recharger les conversations
                await this.loadConversations();
                
                // Ouvrir la nouvelle conversation
                this.loadConversation(recipientId);
            } else {
                const data = await response.json();
                alert(`Erreur: ${data.error}`);
            }
        } catch (error) {
            console.error('Erreur lors de l\'envoi du message:', error);
            alert('Erreur lors de l\'envoi du message');
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        } else if (diffInHours < 48) {
            return 'Hier';
        } else {
            return date.toLocaleDateString('fr-FR');
        }
    }
}
