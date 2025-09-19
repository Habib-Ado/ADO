import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Registrazione - Artigianato on Ligne");
        this.csrfToken = this.generateCSRFToken();
    }

    generateCSRFToken() {
        const token = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
        sessionStorage.setItem('csrfToken', token);
        return token;
    }

    async getHtml() {
        return `
            <div class="registration-container">
                <form id="registerForm" class="auth-form">
                    <div class="auth-header">
                        <h1><i class="fas fa-user-plus me-3"></i>Crea Account</h1>
                        <p>Unisciti alla nostra comunità di artigiani</p>
                    </div>
                    
                    <input type="hidden" name="csrfToken" value="${this.csrfToken}">
                    
                    <div class="row">
                        <div class="col-md-6">
            <div class="form-group">
                                <label for="name">
                                    <i class="fas fa-user me-2"></i>Nome
                                </label>
                                <input type="text" id="name" name="name" minlength="2" maxlength="50" placeholder="Il tuo nome" required>
                <div class="error-message" id="nameError"></div>
                            </div>
            </div>
            
                        <div class="col-md-6">
            <div class="form-group">
                                <label for="surname">
                                    <i class="fas fa-user me-2"></i>Cognome
                                </label>
                                <input type="text" id="surname" name="surname" minlength="2" maxlength="50" placeholder="Il tuo cognome" required>
                <div class="error-message" id="surnameError"></div>
                            </div>
                        </div>
            </div>
            
                    <div class="row">
                        <div class="col-md-6">
            <div class="form-group">
                                <label for="birthdate">
                                    <i class="fas fa-calendar me-2"></i>Data di nascita
                                </label>
                                <input type="date" id="birthdate" name="birthdate" required>
                <div class="error-message" id="birthdateError"></div>
                            </div>
            </div>
            
                        <div class="col-md-6">
            <div class="form-group">
                                <label for="phone">
                                    <i class="fas fa-phone me-2"></i>Telefono
                                </label>
                                <input type="tel" id="phone" name="phone" pattern="\\+?[0-9]{10,15}" placeholder="+39 123 456 7890" required>
                <div class="error-message" id="phoneError"></div>
                            </div>
                        </div>
            </div>
            
            <div class="form-group">
                        <label for="address">
                            <i class="fas fa-map-marker-alt me-2"></i>Indirizzo
                        </label>
                        <input type="text" id="address" name="address" minlength="5" maxlength="100" placeholder="Il tuo indirizzo completo" required>
                <div class="error-message" id="addressError"></div>
            </div>
            
            <div class="form-group">
                        <div class="role-info">
                            <i class="fas fa-info-circle me-2"></i>
                            <strong>Ruolo:</strong> Tutti i nuovi utenti sono registrati come <strong>Clienti</strong>.
                            <br>
                            <small class="text-muted">
                                Se desideri diventare un <strong>Artigiano</strong>, potrai fare richiesta dopo aver effettuato l'accesso.
                            </small>
                        </div>
            </div>

            <div class="form-group">
                        <label for="email">
                            <i class="fas fa-envelope me-2"></i>Email
                        </label>
                        <input type="email" id="email" name="email" placeholder="la-tua-email@esempio.com" required>
                <div class="error-message" id="emailError"></div>
            </div>
            
            <div class="form-group">
                        <label for="password">
                            <i class="fas fa-lock me-2"></i>Password
                        </label>
                        <input type="password" id="password" name="password" minlength="8" placeholder="Crea una password sicura" required>
                <div class="password-strength-meter">
                            <div class="strength-bar" id="strengthBar"></div>
                </div>
                <div class="password-requirements">
                            <i class="fas fa-info-circle me-1"></i>
                    La password deve contenere almeno 8 caratteri, un numero e un carattere speciale
                </div>
                <div class="error-message" id="passwordError"></div>
            </div>
            
            <div class="form-group">
                        <label for="confirmPassword">
                            <i class="fas fa-lock me-2"></i>Conferma Password
                        </label>
                        <input type="password" id="confirmPassword" name="confirmPassword" placeholder="Conferma la password" required>
                <div class="error-message" id="confirmPasswordError"></div>
            </div>
            
                    <div class="form-actions">
                        <button type="submit" class="submit-btn" id="registerButton">
                            <i class="fas fa-user-plus me-2"></i>Registrati
                        </button>
                    </div>
            
            <div class="form-footer">
                <p>Hai già un account? <a href="/login" data-link>Accedi</a></p>
            </div>
            
            <div class="form-feedback" id="formFeedback"></div>
        </form>
            </div>
        `;
    }

    async onMounted() {
        this.initFormValidation();
        this.initEventListeners();
    }

    initFormValidation() {
        const form = document.getElementById("registerForm");
        const inputs = form.querySelectorAll('input, select');
        
        inputs.forEach(input => {
            input.addEventListener('input', () => this.validateField(input));
            input.addEventListener('blur', () => this.validateField(input));
        });
        
        // Password strength meter
        const passwordInput = document.getElementById('password');
        passwordInput.addEventListener('input', () => {
            this.validatePassword(passwordInput);
            this.updatePasswordStrength(passwordInput.value);
        });
        
        // Confirm password validation
        const confirmPasswordInput = document.getElementById('confirmPassword');
        confirmPasswordInput.addEventListener('input', () => {
            this.validateConfirmPassword(confirmPasswordInput);
        });
    }

    initEventListeners() {
        const form = document.getElementById("registerForm");
        form.addEventListener("submit", this.handleRegistration.bind(this));
    }

    validateField(field) {
        const errorElement = document.getElementById(field.name + 'Error');
        let isValid = true;
        let errorMessage = '';
        
        // Validazione specifica per ogni campo
        switch(field.name) {
            case 'name':
            case 'surname':
                if (field.value.length < 2) {
                    isValid = false;
                    errorMessage = 'Deve contenere almeno 2 caratteri';
                } else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(field.value)) {
                    isValid = false;
                    errorMessage = 'Solo lettere e spazi sono permessi';
                }
                break;
                
            case 'birthdate':
                const birthDate = new Date(field.value);
                const today = new Date();
                const age = today.getFullYear() - birthDate.getFullYear();
                if (age < 18 || age > 100) {
                    isValid = false;
                    errorMessage = 'Devi avere almeno 18 anni';
                }
                break;
                
            case 'phone':
                if (!/^\+?[0-9]{10,15}$/.test(field.value.replace(/\s/g, ''))) {
                    isValid = false;
                    errorMessage = 'Inserisci un numero di telefono valido';
                }
                break;
                
            case 'address':
                if (field.value.length < 5) {
                    isValid = false;
                    errorMessage = 'L\'indirizzo deve essere più dettagliato';
                }
                break;
                
            case 'email':
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
                    isValid = false;
                    errorMessage = 'Inserisci un indirizzo email valido';
                }
                break;
        }
        
        // Validazione generale
        if (field.hasAttribute('required') && !field.value.trim()) {
            isValid = false;
            errorMessage = 'Questo campo è obbligatorio';
        }
        
        // Aggiorna UI
        if (isValid) {
            field.classList.remove('invalid');
            field.classList.add('valid');
            errorElement.textContent = '';
        } else {
            field.classList.remove('valid');
            field.classList.add('invalid');
            errorElement.textContent = errorMessage;
        }
        
        return isValid;
    }

    validatePassword(passwordInput) {
        const errorElement = document.getElementById('passwordError');
        const password = passwordInput.value;
        let isValid = true;
        let errorMessage = '';
        
        if (password.length < 8) {
            isValid = false;
            errorMessage = 'La password deve essere di almeno 8 caratteri';
        } else if (!/\d/.test(password)) {
            isValid = false;
            errorMessage = 'La password deve contenere almeno un numero';
        } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            isValid = false;
            errorMessage = 'La password deve contenere almeno un carattere speciale';
        }
        
        if (isValid) {
            passwordInput.classList.remove('invalid');
            passwordInput.classList.add('valid');
            errorElement.textContent = '';
        } else {
            passwordInput.classList.remove('valid');
            passwordInput.classList.add('invalid');
            errorElement.textContent = errorMessage;
        }
        
        return isValid;
    }

    validateConfirmPassword(confirmPasswordInput) {
        const errorElement = document.getElementById('confirmPasswordError');
        const password = document.getElementById('password').value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (confirmPassword !== password) {
            confirmPasswordInput.classList.remove('valid');
            confirmPasswordInput.classList.add('invalid');
            errorElement.textContent = 'Le password non coincidono';
            return false;
        } else {
            confirmPasswordInput.classList.remove('invalid');
            confirmPasswordInput.classList.add('valid');
            errorElement.textContent = '';
            return true;
        }
    }

    updatePasswordStrength(password) {
        const strengthBar = document.getElementById('strengthBar');
        let strength = 0;
        
        if (password.length >= 8) strength++;
        if (/\d/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
        
        strengthBar.className = 'strength-bar';
        
        if (strength <= 2) {
            strengthBar.classList.add('weak');
        } else if (strength <= 3) {
            strengthBar.classList.add('medium');
        } else {
            strengthBar.classList.add('strong');
        }
    }

    validateForm() {
        const form = document.getElementById("registerForm");
        const requiredFields = ['name', 'surname', 'birthdate', 'phone', 'address', 'email', 'password', 'confirmPassword'];
        let isValid = true;
        let missingFields = [];
        
        // Verifica tutti i campi obbligatori
        requiredFields.forEach(fieldName => {
            const field = form.querySelector(`[name="${fieldName}"]`);
            if (!field || !field.value.trim()) {
                isValid = false;
                missingFields.push(fieldName);
                if (field) {
                    field.classList.add('invalid');
                    const errorElement = document.getElementById(fieldName + 'Error');
                    if (errorElement) {
                        errorElement.textContent = 'Questo campo è obbligatorio';
                    }
                }
            } else {
                if (!this.validateField(field)) {
                    isValid = false;
                }
            }
        });
        
        // Validazioni speciali
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        
        if (passwordInput && !this.validatePassword(passwordInput)) {
            isValid = false;
        }
        
        if (confirmPasswordInput && !this.validateConfirmPassword(confirmPasswordInput)) {
            isValid = false;
        }
        
        if (!isValid && missingFields.length > 0) {
            console.error('Campi mancanti nella validazione:', missingFields);
        }
        
        return isValid;
    }

    async handleRegistration(event) {
        event.preventDefault();
        
        // Debug: mostra i valori del form
        const form = event.target;
        const formData = new FormData(form);
        
        // Verifica che tutti i campi siano presenti
        const requiredFields = ['name', 'surname', 'birthdate', 'phone', 'address', 'email', 'password', 'confirmPassword'];
        const missingFields = [];
        
        requiredFields.forEach(field => {
            const value = formData.get(field);
            if (!value || value.trim() === '') {
                missingFields.push(field);
            }
        });
        
        if (missingFields.length > 0) {
            console.error('Campi mancanti:', missingFields);
            this.showFeedback(`Campi mancanti: ${missingFields.join(', ')}`, 'error');
            return;
        }
        
        if (!this.validateForm()) {
            this.showFeedback('Per favore, correggi gli errori nel form.', 'error');
            return;
        }
        
        this.toggleLoading(true);
        
        // Prepara i dati per l'invio
        const requestData = {
            name: formData.get('name').trim(),
            surname: formData.get('surname').trim(),
            birthdate: formData.get('birthdate'),
            phone: formData.get('phone').trim(),
            address: formData.get('address').trim(),
            email: formData.get('email').trim(),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword'),
            csrfToken: formData.get('csrfToken')
        };
        
        console.log('Dati da inviare:', requestData);
        
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });
            
            const data = await response.json();
            console.log('Risposta del server:', data);
            
            if (response.ok) {
                this.showFeedback('Registrazione completata con successo! Controlla la tua email per la verifica.', 'success');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                this.showFeedback(data.error || 'Errore durante la registrazione.', 'error');
            }
        } catch (error) {
            console.error('Errore durante la registrazione:', error);
            this.showFeedback('Errore di connessione. Riprova più tardi.', 'error');
        } finally {
            this.toggleLoading(false);
        }
    }

    showFeedback(message, type) {
        const feedbackElement = document.getElementById('formFeedback');
        feedbackElement.textContent = message;
        feedbackElement.className = `form-feedback ${type}`;
        feedbackElement.style.display = 'block';
        
        // Nascondi il messaggio dopo 5 secondi
        setTimeout(() => {
            feedbackElement.style.display = 'none';
        }, 5000);
    }

    toggleLoading(isLoading) {
        const submitBtn = document.getElementById('registerButton');
        const form = document.getElementById('registerForm');
        const inputs = form.querySelectorAll('input, select, button');
        
        if (isLoading) {
            submitBtn.classList.add('loading');
            inputs.forEach(input => input.disabled = true);
        } else {
            submitBtn.classList.remove('loading');
            inputs.forEach(input => input.disabled = false);
        }
    }
}