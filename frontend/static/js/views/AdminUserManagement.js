import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle('Gestione Utenti - Admin');
        this.users = [];
    }

    async getHtml() {
        return `
            <div class="admin-container">
                <div class="admin-header">
                    <h1><i class="fas fa-users-cog me-3"></i>Gestione Utenti</h1>
                    <p>Gestisci tutti gli utenti della piattaforma</p>
                </div>
                
                <div class="admin-content">
                    <div class="users-section">
                        <div class="section-header">
                            <h3><i class="fas fa-list me-2"></i>Lista Utenti</h3>
                            <div class="header-actions">
                                <button class="refresh-btn" id="refreshUsersButton">
                                    <i class="fas fa-sync-alt me-2"></i>Aggiorna
                                </button>
                                <select class="form-select" id="statusFilter" style="width: auto;">
                                    <option value="">Tutti gli stati</option>
                                    <option value="active">Attivi</option>
                                    <option value="blocked">Bloccati</option>
                                </select>
                                <select class="form-select" id="roleFilter" style="width: auto;">
                                    <option value="">Tutti i ruoli</option>
                                    <option value="cliente">Clienti</option>
                                    <option value="artigiano">Artigiani</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="users-list" id="usersList">
                            <div class="loading-spinner">
                                <i class="fas fa-spinner fa-spin"></i>
                                <p>Caricamento utenti...</p>
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
        await this.loadUsers();
    }

    initEventListeners() {
        const refreshButton = document.getElementById('refreshUsersButton');
        const statusFilter = document.getElementById('statusFilter');
        const roleFilter = document.getElementById('roleFilter');
        
        refreshButton.addEventListener('click', this.loadUsers.bind(this));
        statusFilter.addEventListener('change', this.filterUsers.bind(this));
        roleFilter.addEventListener('change', this.filterUsers.bind(this));
    }

    async loadUsers() {
        const usersList = document.getElementById('usersList');
        const refreshButton = document.getElementById('refreshUsersButton');
        
        refreshButton.disabled = true;
        refreshButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Caricamento...';
        
        try {
            const response = await fetch('/api/admin/users');
            const data = await response.json();

            if (response.ok) {
                this.users = data.users;
                this.displayUsers(this.users);
            } else {
                this.showFeedback(data.error || 'Errore nel caricamento degli utenti.', 'error');
            }
        } catch (error) {
            console.error('Errore nel caricamento degli utenti:', error);
            this.showFeedback('Errore di connessione.', 'error');
        } finally {
            refreshButton.disabled = false;
            refreshButton.innerHTML = '<i class="fas fa-sync-alt me-2"></i>Aggiorna';
        }
    }

    filterUsers() {
        const statusFilter = document.getElementById('statusFilter').value;
        const roleFilter = document.getElementById('roleFilter').value;
        
        let filteredUsers = this.users;
        
        if (statusFilter) {
            filteredUsers = filteredUsers.filter(user => user.status === statusFilter);
        }
        
        if (roleFilter) {
            filteredUsers = filteredUsers.filter(user => user.role === roleFilter);
        }
        
        this.displayUsers(filteredUsers);
    }

    displayUsers(users) {
        const usersList = document.getElementById('usersList');
        
        if (users.length === 0) {
            usersList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users fa-3x mb-3"></i>
                    <h4>Nessun utente trovato</h4>
                    <p>Non ci sono utenti che corrispondono ai filtri selezionati.</p>
                </div>
            `;
            return;
        }

        usersList.innerHTML = users.map(user => `
            <div class="user-card" data-user-id="${user.id}">
                <div class="user-header">
                    <div class="user-info">
                        <h4>${user.username}</h4>
                        <p class="user-email">${user.email}</p>
                        <p class="user-date">
                            <i class="fas fa-calendar me-1"></i>
                            Registrato: ${new Date(user.created_at).toLocaleDateString('it-IT')}
                        </p>
                    </div>
                    <div class="user-status">
                        <span class="status-badge ${user.status}">
                            ${this.getStatusText(user.status)}
                        </span>
                        <span class="role-badge ${user.role}">
                            ${this.getRoleText(user.role)}
                        </span>
                        ${user.email_verified ? 
                            '<span class="verified-badge"><i class="fas fa-check-circle"></i> Verificato</span>' : 
                            '<span class="unverified-badge"><i class="fas fa-times-circle"></i> Non verificato</span>'
                        }
                    </div>
                </div>
                
                <div class="user-actions">
                    ${user.status === 'active' ? `
                        <button class="btn-block" onclick="this.blockUser(${user.id})">
                            <i class="fas fa-ban me-2"></i>Blocca
                        </button>
                    ` : `
                        <button class="btn-unblock" onclick="this.unblockUser(${user.id})">
                            <i class="fas fa-check me-2"></i>Sblocca
                        </button>
                    `}
                    <button class="btn-delete" onclick="this.deleteUser(${user.id})">
                        <i class="fas fa-trash me-2"></i>Cancella
                    </button>
                </div>
            </div>
        `).join('');

        // Bind delle funzioni agli elementi
        this.bindUserActions();
    }

    bindUserActions() {
        // Bind delle funzioni di gestione utenti
        window.blockUser = this.blockUser.bind(this);
        window.unblockUser = this.unblockUser.bind(this);
        window.deleteUser = this.deleteUser.bind(this);
    }

    getStatusText(status) {
        switch (status) {
            case 'active': return 'Attivo';
            case 'blocked': return 'Bloccato';
            default: return status;
        }
    }

    getRoleText(role) {
        switch (role) {
            case 'cliente': return 'Cliente';
            case 'artigiano': return 'Artigiano';
            case 'admin': return 'Admin';
            default: return role;
        }
    }

    async blockUser(userId) {
        if (!confirm('Sei sicuro di voler bloccare questo utente?')) {
            return;
        }
        
        await this.updateUserStatus(userId, 'block');
    }

    async unblockUser(userId) {
        if (!confirm('Sei sicuro di voler sbloccare questo utente?')) {
            return;
        }
        
        await this.updateUserStatus(userId, 'unblock');
    }

    async deleteUser(userId) {
        if (!confirm('ATTENZIONE: Sei sicuro di voler cancellare definitivamente questo utente? Questa azione non può essere annullata.')) {
            return;
        }
        
        const userCard = document.querySelector(`[data-user-id="${userId}"]`);
        const buttons = userCard.querySelectorAll('button');
        
        // Disabilita i pulsanti durante il processing
        buttons.forEach(btn => btn.disabled = true);
        
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (response.ok) {
                this.showFeedback(data.message, 'success');
                await this.loadUsers(); // Ricarica la lista
            } else {
                this.showFeedback(data.error || 'Errore durante la cancellazione.', 'error');
            }
        } catch (error) {
            console.error('Errore durante la cancellazione:', error);
            this.showFeedback('Errore di connessione.', 'error');
        } finally {
            // Riabilita i pulsanti
            buttons.forEach(btn => btn.disabled = false);
        }
    }

    async updateUserStatus(userId, action) {
        const userCard = document.querySelector(`[data-user-id="${userId}"]`);
        const buttons = userCard.querySelectorAll('button');
        
        // Disabilita i pulsanti durante il processing
        buttons.forEach(btn => btn.disabled = true);
        
        try {
            const response = await fetch(`/api/admin/users/${userId}/${action}`, {
                method: 'POST'
            });

            const data = await response.json();

            if (response.ok) {
                this.showFeedback(data.message, 'success');
                await this.loadUsers(); // Ricarica la lista
            } else {
                this.showFeedback(data.error || 'Errore durante l\'aggiornamento.', 'error');
            }
        } catch (error) {
            console.error('Errore durante l\'aggiornamento:', error);
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