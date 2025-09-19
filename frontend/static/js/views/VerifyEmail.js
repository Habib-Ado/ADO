import AbstractView from './AbstractView.js';

export default class VerifyEmail extends AbstractView {
    constructor() {
        super();
        this.setTitle('Verificazione Email - Artigianato on Ligne');
    }

    async getHtml() {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        
        if (!token) {
            return `
                <div class="container mt-5">
                    <div class="row justify-content-center">
                        <div class="col-md-6">
                            <div class="card shadow">
                                <div class="card-body text-center p-5">
                                    <i class="fas fa-exclamation-triangle text-warning" style="font-size: 4rem;"></i>
                                    <h2 class="mt-3 text-danger">Link invalido</h2>
                                    <p class="text-muted">Il link di verifica non è valodo oppure è scaduto.</p>
                                    <a href="/login" data-link class="btn btn-primary">
                                        <i class="fas fa-sign-in-alt me-2"></i>Login
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        return `
            <div class="container mt-5">
                <div class="row justify-content-center">
                    <div class="col-md-6">
                        <div class="card shadow">
                            <div class="card-body text-center p-5">
                                <i class="fas fa-envelope-open text-primary" style="font-size: 4rem;"></i>
                                <h2 class="mt-3">Verificazione del tuo account</h2>
                                <p class="text-muted">Cliccare sul bottone qui sotto per verificare l'email e acttivare il tuo account.</p>
                                
                                <div class="d-grid gap-2">
                                    <button id="verify-btn" class="btn btn-primary btn-lg">
                                        <i class="fas fa-check me-2"></i>Verificare mio account
                                    </button>
                                    
                                    <button id="resend-btn" class="btn btn-outline-secondary">
                                        <i class="fas fa-redo me-2"></i>Rinviare l'email
                                    </button>
                                </div>
                                
                                <div id="verification-status" class="mt-4" style="display: none;"></div>
                                
                                <div class="mt-4">
                                    <small class="text-muted">
                                        Non hai ricevuto l'email ? Verifica la tua cartella spam oppure
                                        <a href="#" id="resend-link">clicca qui</a> per rinviare di nuovo.
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async afterRender() {
        const verifyBtn = document.getElementById('verify-btn');
        const resendBtn = document.getElementById('resend-btn');
        const resendLink = document.getElementById('resend-link');
        const statusDiv = document.getElementById('verification-status');
        
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        // Fonction pour afficher le statut
        const showStatus = (message, type = 'info') => {
            statusDiv.innerHTML = `
                <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                    ${message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            `;
            statusDiv.style.display = 'block';
        };

        // Debug: vérifier que le bouton existe
        console.log('🔍 Debug VerifyEmail:', { 
            verifyBtn: !!verifyBtn, 
            token: token ? token.substring(0, 20) + '...' : 'null',
            url: window.location.href 
        });

        // Vérification du compte
        verifyBtn.addEventListener('click', async () => {
            try {
                verifyBtn.disabled = true;
                verifyBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Verificazione...';
                
                const response = await fetch('/api/auth/verify-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ token })
                });

                const data = await response.json();

                if (response.ok) {
                    showStatus(`
                        <i class="fas fa-check-circle me-2"></i>
                        <strong>Complimenti!</strong> Il tuo account è stato verificato con successo. 
                        Ora puoi logarti e comminciare a fare acquisti.
                    `, 'success');
                    
                    verifyBtn.innerHTML = '<i class="fas fa-check me-2"></i>Account verificato!';
                    verifyBtn.classList.remove('btn-primary');
                    verifyBtn.classList.add('btn-success');
                    
                    // Rindirizzamento automatico dopo 3 secondi
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 3000);
                } else {
                    showStatus(data.error, 'danger');
                    verifyBtn.disabled = false;
                    verifyBtn.innerHTML = '<i class="fas fa-check me-2"></i>Verificare mio account';
                }
            } catch (error) {
                console.error('Errore durante la verificazione:', error);
                showStatus('Un errore si è verificato durante la verifica. Sei pregato di riprovare.', 'danger');
                verifyBtn.disabled = false;
                verifyBtn.innerHTML = '<i class="fas fa-check me-2"></i>Verificare mio account';
            }
        });

        // Rinvio dell'email di verificazione
        const resendVerification = async () => {
            try {
                resendBtn.disabled = true;
                resendBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Envoi...';
                
                // Demander l'email à l'utilisateur
                const email = prompt('Veuillez entrer votre adresse email pour recevoir un nouveau lien de vérification :');
                
                if (!email) {
                    resendBtn.disabled = false;
                    resendBtn.innerHTML = '<i class="fas fa-redo me-2"></i>Renvoyer l\'email';
                    return;
                }

                const response = await fetch('/api/auth/resend-verification', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email })
                });

                const data = await response.json();

                if (response.ok) {
                    showStatus(`
                        <i class="fas fa-envelope me-2"></i>
                        Una nuova email di verificazione è stata inviata a <strong>${email}</strong>. 
                        Verificare la tua casella email.
                    `, 'success');
                } else {
                    showStatus(data.error, 'danger');
                }
            } catch (error) {
                console.error('Errore durante il rinvio:', error);
                showStatus('Un errore si è verificato durante l\'invio. Sei pregato di riprovare.', 'danger');
            } finally {
                resendBtn.disabled = false;
                resendBtn.innerHTML = '<i class="fas fa-redo me-2"></i>Rinviare l\'email';
            }
        };

        resendBtn.addEventListener('click', resendVerification);
        resendLink.addEventListener('click', (e) => {
            e.preventDefault();
            resendVerification();
        });
    }
} 