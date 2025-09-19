// ========================================
// GESTIONE INTERFACCIA UTENTE
// ========================================

class UserInterfaceManager {
    constructor() {
        this.user = null;
        this.init();
    }

    init() {
        this.checkAuthStatus();
        this.setupEventListeners();
    }

    async checkAuthStatus() {
        const token = localStorage.getItem('jwt_token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
            try {
                this.user = JSON.parse(userData);
                
                // Valida il token con il server
                const isValid = await this.validateToken(token);
                
                if (isValid) {
                    this.updateInterfaceForLoggedUser();
                } else {
                    console.log('Token non valido, logout automatico');
                    this.clearAuthData();
                    this.updateInterfaceForGuest();
                }
            } catch (error) {
                console.error('Errore nel parsing dei dati utente:', error);
                this.clearAuthData();
                this.updateInterfaceForGuest();
            }
        } else {
            this.updateInterfaceForGuest();
        }
    }

    async validateToken(token) {
        try {
            const response = await fetch('/api/auth/validate-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            return response.ok;
        } catch (error) {
            console.error('Errore validazione token:', error);
            return false;
        }
    }

    updateInterfaceForLoggedUser() {
        // Mostra il menu utente
        const userMenu = document.getElementById('user-menu');
        const authButtons = document.getElementById('auth-buttons');
        
        if (userMenu) userMenu.style.display = 'block';
        if (authButtons) authButtons.style.display = 'none';
        
        // Aggiorna il nome utente
        const userName = document.getElementById('user-name');
        if (userName && this.user) {
            userName.textContent = this.user.username || this.user.first_name || 'Utente';
        }
        
        // Gestisci i link del menu secondo il ruolo
        this.updateMenuLinks();
    }

    updateInterfaceForGuest() {
        // Nascondi il menu utente
        const userMenu = document.getElementById('user-menu');
        const authButtons = document.getElementById('auth-buttons');
        
        if (userMenu) userMenu.style.display = 'none';
        if (authButtons) authButtons.style.display = 'flex';
    }

    updateMenuLinks() {
        if (!this.user) return;

        const artisanRequestLink = document.getElementById('artisan-request-link');
        const adminLink = document.getElementById('admin-link');
        const adminArtisanRequestsLink = document.getElementById('admin-artisan-requests-link');
        const adminUsersLink = document.getElementById('admin-users-link');

        // Link per richiesta artigiano (solo per clienti)
        if (artisanRequestLink) {
            if (this.user.role === 'cliente' || (!this.user.is_artisan && !this.user.is_admin)) {
                artisanRequestLink.style.display = 'block';
            } else {
                artisanRequestLink.style.display = 'none';
            }
        }

        // Link per amministrazione (solo per admin)
        if (adminLink) {
            if (this.user.is_admin) {
                adminLink.style.display = 'block';
            } else {
                adminLink.style.display = 'none';
            }
        }

        // Link per gestione richieste artigiani (solo per admin)
        if (adminArtisanRequestsLink) {
            if (this.user.is_admin) {
                adminArtisanRequestsLink.style.display = 'block';
            } else {
                adminArtisanRequestsLink.style.display = 'none';
            }
        }

        // Link per gestione utenti (solo per admin)
        if (adminUsersLink) {
            if (this.user.is_admin) {
                adminUsersLink.style.display = 'block';
            } else {
                adminUsersLink.style.display = 'none';
            }
        }
    }

    setupEventListeners() {
        // Gestione logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }

        // Gestione click sui link del menu
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-link]')) {
                // Aggiorna l'interfaccia dopo la navigazione
                setTimeout(() => {
                    this.checkAuthStatus();
                }, 100);
            }
        });
    }

    logout() {
        // Rimuovi i dati di autenticazione
        this.clearAuthData();
        
        // Aggiorna l'interfaccia
        this.updateInterfaceForGuest();
        
        // Reindirizza alla home
        window.location.href = '/';
    }

    clearAuthData() {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user');
        this.user = null;
    }

    // Metodo per aggiornare i dati utente (es. dopo login)
    updateUserData(userData) {
        this.user = userData;
        localStorage.setItem('user', JSON.stringify(userData));
        this.updateInterfaceForLoggedUser();
    }

    clearAuthData() {
        this.user = null;
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user');
        this.updateInterfaceForGuest();
    }

    // Metodo per verificare se l'utente è autenticato
    isAuthenticated() {
        return this.user !== null;
    }

    // Metodo per verificare se l'utente è admin
    isAdmin() {
        return this.user && this.user.is_admin;
    }

    // Metodo per verificare se l'utente è artigiano
    isArtisan() {
        return this.user && (this.user.is_artisan || this.user.role === 'artigiano');
    }

    // Metodo per verificare se l'utente è cliente
    isClient() {
        return this.user && (this.user.role === 'cliente' || (!this.user.is_artisan && !this.user.is_admin));
    }

    // Metodo per ottenere l'ID utente
    getUserId() {
        return this.user ? this.user.id : null;
    }

    // Metodo per ottenere il token JWT
    getToken() {
        return localStorage.getItem('jwt_token');
    }
}

// Inizializza il gestore dell'interfaccia utente
const userInterface = new UserInterfaceManager();

// Esporta per uso globale
window.userInterface = userInterface;

// Aggiorna l'interfaccia quando la pagina è caricata
document.addEventListener('DOMContentLoaded', () => {
    userInterface.checkAuthStatus();
});

// Aggiorna l'interfaccia quando la pagina cambia (per SPA)
window.addEventListener('popstate', () => {
    setTimeout(() => {
        userInterface.checkAuthStatus();
    }, 100);
}); 