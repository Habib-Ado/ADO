import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Accedi - Artigianato on Ligne");
        this.failedAttempts = 0;
        this.csrfToken = this.generateCSRFToken();
        this.lockoutTime = 0;
    }

    // Genera un token CSRF unico e lo memorizza in sessionStorage
    // per proteggere le richieste di login
    generateCSRFToken() {
        const token = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
        sessionStorage.setItem('loginCsrfToken', token);
        return token;
    }

    // Ritorna il markup HTML per la vista di login
    async getHtml() {
        return `
            <div class="auth-container">
                <div class="auth-card">
                    <div class="auth-header">
                        <h1><i class="fas fa-sign-in-alt me-3"></i>Accedi</h1>
                        <p>Accedi al tuo account per continuare</p>
                    </div>
                    
                    <form id="login-form" class="auth-form" novalidate>
                        <input type="hidden" name="csrfToken" value="${this.csrfToken}">
                        
                        <div class="form-group">
                            <label for="email">
                                <i class="fas fa-envelope me-2"></i>Email
                            </label>
                            <input type="email" id="email" name="email" required autocomplete="username" placeholder="Inserisci la tua email">
                            <div class="error-message" id="emailError"></div>
                        </div>
                        
                        <div class="form-group">
                            <label for="password">
                                <i class="fas fa-lock me-2"></i>Password
                            </label>
                            <input type="password" id="password" name="password" required autocomplete="current-password" placeholder="Inserisci la tua password">
                            <div class="error-message" id="passwordError"></div>
                            <div class="password-actions">
                                <input type="checkbox" id="showPassword"> 
                                <label for="showPassword">
                                    <i class="fas fa-eye me-1"></i>Mostra password
                                </label>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="submit-btn" id="login-button">
                                <i class="fas fa-sign-in-alt me-2"></i>Accedi
                            </button>
                            <button type="button" class="text-btn" id="forgot-password-button">
                                <i class="fas fa-key me-1"></i>Password dimenticata?
                            </button>
                        </div>
                        
                        <div class="form-footer">
                            <p>Non hai un account? <a href="/register" data-link>Registrati</a></p>
                        </div>
                        
                        <div class="form-feedback" id="login-feedback"></div>
                    </form>
                </div>
            </div>
        `;
    }

    // Inizializza la validazione del form e gli eventi al caricamento della vista
    async onMounted() {
        this.initFormValidation();
        this.initEventListeners();
    }

    // Inizializza la validazione del form e gli eventi
    // per la visualizzazione della password
    // e la gestione del recupero password
    initFormValidation() {
        const form = document.getElementById("login-form");
        const emailInput = form.email;
        const passwordInput = form.password;
        
        // Validazione in tempo reale
        emailInput.addEventListener('input', () => this.validateEmail(emailInput));
        passwordInput.addEventListener('input', () => this.validatePassword(passwordInput));
        
        // Mostra/nascondi password
        document.getElementById('showPassword').addEventListener('change', (e) => {
            passwordInput.type = e.target.checked ? 'text' : 'password';
        });
    }

    initEventListeners() {
        const form = document.getElementById("login-form");
        const forgotPasswordBtn = document.getElementById("forgot-password-button");
        
        form.addEventListener("submit", this.handleLogin.bind(this));
        forgotPasswordBtn.addEventListener("click", this.handleForgotPassword.bind(this));
    }

    // Validazione email e password
    // con messaggi di errore personalizzati
    // e gestione della classe CSS per gli input non validi
    validateEmail(emailInput) {
        const errorElement = document.getElementById("emailError");
        
        if (emailInput.validity.valid) {
            errorElement.textContent = '';
            emailInput.classList.remove('invalid');
            emailInput.classList.add('valid');
        } else {
            emailInput.classList.remove('valid');
            emailInput.classList.add('invalid');
            
            if (emailInput.validity.valueMissing) {
                errorElement.textContent = 'L\'email è obbligatoria';
            } else if (emailInput.validity.typeMismatch) {
                errorElement.textContent = 'Inserisci un indirizzo email valido';
            }
        }
    }

    validatePassword(passwordInput) {
        const errorElement = document.getElementById("passwordError");
        
        if (passwordInput.validity.valid) {
            errorElement.textContent = '';
            passwordInput.classList.remove('invalid');
            passwordInput.classList.add('valid');
        } else {
            passwordInput.classList.remove('valid');
            passwordInput.classList.add('invalid');
            
            if (passwordInput.validity.valueMissing) {
                errorElement.textContent = 'La password è obbligatoria';
            } else if (passwordInput.validity.tooShort) {
                errorElement.textContent = 'La password deve essere di almeno 8 caratteri';
            }
        }
    }

    validateForm() {
        const emailInput = document.getElementById("email");
        const passwordInput = document.getElementById("password");
        
        this.validateEmail(emailInput);
        this.validatePassword(passwordInput);
        
        return emailInput.validity.valid && passwordInput.validity.valid;
    }

    async handleLogin(event) {
        event.preventDefault();
        
        if (this.isAccountLocked()) {
            const remainingTime = this.getRemainingLockoutTime();
            this.showFeedback(`Account temporaneamente bloccato. Riprova tra ${remainingTime} secondi.`, 'error');
            return;
        }
        
        if (!this.validateForm()) {
            this.showFeedback('Per favore, correggi gli errori nel form.', 'error');
            return;
        }
        
        const form = event.target;
        const formData = new FormData(form);
        
        this.toggleLoading(true);
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.get('email'),
                    password: formData.get('password'),
                    csrfToken: formData.get('csrfToken')
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.handleLoginSuccess(data);
            } else {
                this.handleLoginError(data);
            }
        } catch (error) {
            console.error('Errore durante il login:', error);
            this.showFeedback('Errore di connessione. Riprova più tardi.', 'error');
        } finally {
            this.toggleLoading(false);
        }
    }

    handleLoginSuccess(data) {
        // Salva i dati nel localStorage
        localStorage.setItem('jwt_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Aggiorna l'interfaccia utente
        if (window.userInterface) {
            window.userInterface.user = data.user;
            window.userInterface.updateInterfaceForLoggedUser();
        }
        
        // Reset tentativi falliti
        this.failedAttempts = 0;
        
        this.showFeedback('Login effettuato con successo! Reindirizzamento...', 'success');
        
        // Reindirizza alla home dopo un breve delay
        setTimeout(() => {
            window.location.href = '/';
        }, 1500);
    }

    handleLoginError(errorData) {
        this.failedAttempts++;
        
        if (this.failedAttempts >= 5) {
            this.lockoutTime = Date.now() + (5 * 60 * 1000); // 5 minuti
            this.showFeedback('Troppi tentativi falliti. Account bloccato per 5 minuti.', 'error');
        } else {
            const remainingAttempts = 5 - this.failedAttempts;
            this.showFeedback(`Credenziali non valide. Tentativi rimanenti: ${remainingAttempts}`, 'error');
        }
        
        // Pulisci la password
        document.getElementById('password').value = '';
        document.getElementById('password').focus();
    }

    async handleForgotPassword() {
        const email = document.getElementById('email').value.trim();
        
        if (!email) {
            this.showFeedback('Inserisci la tua email per recuperare la password.', 'warning');
            document.getElementById('email').focus();
            return;
        }
        
        if (!this.validateEmail(document.getElementById('email'))) {
            this.showFeedback('Inserisci un indirizzo email valido.', 'warning');
            return;
        }
        
        this.toggleLoading(true);
        
        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.showFeedback('Email di recupero inviata! Controlla la tua casella di posta.', 'success');
            } else {
                this.showFeedback(data.error || 'Errore durante l\'invio dell\'email di recupero.', 'error');
            }
        } catch (error) {
            console.error('Errore durante il recupero password:', error);
            this.showFeedback('Errore di connessione. Riprova più tardi.', 'error');
        } finally {
            this.toggleLoading(false);
        }
    }

    isAccountLocked() {
        return this.lockoutTime > Date.now();
    }

    getRemainingLockoutTime() {
        return Math.ceil((this.lockoutTime - Date.now()) / 1000);
    }

    showFeedback(message, type) {
        const feedbackElement = document.getElementById('login-feedback');
        feedbackElement.textContent = message;
        feedbackElement.className = `form-feedback ${type}`;
        feedbackElement.style.display = 'block';
        
        // Nascondi il messaggio dopo 5 secondi
        setTimeout(() => {
            feedbackElement.style.display = 'none';
        }, 5000);
    }

    toggleLoading(isLoading) {
        const submitBtn = document.getElementById('login-button');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        
        if (isLoading) {
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
            emailInput.disabled = true;
            passwordInput.disabled = true;
        } else {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            emailInput.disabled = false;
            passwordInput.disabled = false;
        }
    }
}