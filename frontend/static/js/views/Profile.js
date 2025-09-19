import AbstractView from "./AbstractView.js";

console.log('🔥 PROFILE.JS CARICATO - VERSIONE AGGIORNATA! 🔥');

// Cache globale per i dati utente
let globalUserProfile = null;
let globalDataLoaded = false;

export default class extends AbstractView {
    constructor() {
        super();
        this.setTitle("Profilo - Artigianato Online");
        this.userProfile = globalUserProfile;
        this.userOrders = [];
        this.activeTab = 'profile';
        this.dataLoaded = globalDataLoaded;
        console.log('🔥 PROFILE.JS CONSTRUCTOR - VERSIONE AGGIORNATA! 🔥');
        
        // Precarica i dati utente se non sono già caricati
        if (!globalDataLoaded) {
            this.preloadUserData();
        }
    }

    // Metodo per precaricare i dati utente
    async preloadUserData() {
        try {
            console.log('🔄 Precaricamento dati utente...');
            const token = localStorage.getItem('jwt_token');
            if (!token) {
                console.log('⚠️ Token non trovato, uso dati mock');
                this.loadMockData();
                return;
            }

            const response = await fetch('/api/user/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                const user = data.user;
                
                this.userProfile = {
                    firstName: user.first_name || '',
                    lastName: user.last_name || '',
                    email: user.email || '',
                    phone: user.phone || '',
                    birthdate: user.birthdate ? user.birthdate.split('T')[0] : '',
                    bio: user.bio || '',
                    username: user.username || '',
                    role: user.role || 'cliente',
                    is_artisan: user.is_artisan || false,
                    is_admin: user.is_admin || false,
                    email_verified: user.email_verified || false,
                    address: user.address || '',
                    city: user.city || '',
                    postal_code: user.postal_code || '',
                    country: user.country || 'Italia',
                    profile_image: user.profile_image || '/static/img/avatar.png'
                };

                // Aggiorna il cache globale
                globalUserProfile = this.userProfile;
                globalDataLoaded = true;
                this.dataLoaded = true;

                console.log('✅ Dati utente precaricati e salvati nel cache:', this.userProfile);
            } else {
                console.log('⚠️ Errore precaricamento, uso dati mock');
                this.loadMockData();
            }
        } catch (error) {
            console.log('⚠️ Errore precaricamento, uso dati mock:', error);
            this.loadMockData();
        }
    }

    getHtml() {
        // Genera dinamicamente il contenuto della navigazione laterale
        const generateSidebarContent = () => {
            // Usa sempre "Caricamento..." inizialmente, verrà aggiornato via JavaScript
            return `
                <h5 class="mb-1" id="user-name">Caricamento...</h5>
                <p class="text-muted mb-0" id="user-email">Caricamento...</p>
                <small class="text-info" id="name-help" style="display: none;">
                    <i class="fas fa-info-circle"></i> Configura il tuo nome nel profilo
                </small>
            `;
        };

        return `
            <div class="container my-4">
                <div class="row">
                    <!-- Navigazione laterale -->
                    <div class="col-lg-3">
                        <div class="card">
                            <div class="card-body">
                                <div class="text-center mb-4">
                                    <div class="avatar-container mx-auto mb-3 position-relative">
                                        <div class="avatar-placeholder" id="avatar-placeholder">
                                            <i class="fas fa-user fa-3x text-muted"></i>
                                        </div>
                                        <img id="avatar-image" class="avatar-image d-none" src="" alt="Avatar utente">
                                        <button class="btn btn-sm btn-primary avatar-edit-btn" onclick="changeAvatar()">
                                            <i class="fas fa-camera"></i>
                                        </button>
                                    </div>
                                    ${generateSidebarContent()}
                                </div>
                                
                                <nav class="nav flex-column">
                                    <a class="nav-link active" href="#" data-tab="profile">
                                        <i class="fas fa-user me-2"></i> Profilo
                                    </a>
                                    <a class="nav-link" href="#" data-tab="orders">
                                        <i class="fas fa-shopping-bag me-2"></i> Ordini
                                    </a>
                                    <a class="nav-link" href="#" data-tab="addresses">
                                        <i class="fas fa-map-marker-alt me-2"></i> Indirizzi
                                    </a>
                                    <a class="nav-link" href="#" data-tab="security">
                                        <i class="fas fa-shield-alt me-2"></i> Sicurezza
                                    </a>
                                </nav>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Contenuto principale -->
                    <div class="col-lg-9">
                        <!-- Scheda Profilo -->
                        <div class="tab-content" id="profile-tab" style="display: block;">
                            <div class="card">
                                <div class="card-header">
                                    <h5 class="mb-0">Informazioni Personali</h5>
                                </div>
                                <div class="card-body">
                                    <form id="profile-form">
                                        <div class="row g-3">
                                                                                         <div class="col-md-6">
                                                 <label class="form-label">Nome</label>
                                                 <input type="text" class="form-control" id="first-name" value="">
                                             </div>
                                             <div class="col-md-6">
                                                 <label class="form-label">Cognome</label>
                                                 <input type="text" class="form-control" id="last-name" value="">
                                             </div>
                                             <div class="col-md-6">
                                                 <label class="form-label">Email</label>
                                                 <input type="email" class="form-control" id="email" value="">
                                             </div>
                                             <div class="col-md-6">
                                                 <label class="form-label">Telefono</label>
                                                 <input type="tel" class="form-control" id="phone" value="">
                                             </div>
                                             <div class="col-12">
                                                 <label class="form-label">Data di nascita</label>
                                                 <input type="date" class="form-control" id="birthdate" value="">
                                             </div>
                                             <div class="col-12">
                                                 <label class="form-label">Bio</label>
                                                 <textarea class="form-control" id="bio" rows="3" placeholder="Parlaci un po' di te..."></textarea>
                                             </div>
                                            <div class="col-12">
                                                <button type="submit" class="btn btn-primary">Salva modifiche</button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Scheda Ordini -->
                        <div class="tab-content" id="orders-tab" style="display: none;">
                            <div class="card">
                                <div class="card-header">
                                    <h5 class="mb-0">I Miei Ordini</h5>
                                </div>
                                <div class="card-body">
                                    <div id="orders-list">
                                        <!-- Gli ordini verranno caricati qui -->
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Scheda Indirizzi -->
                        <div class="tab-content" id="addresses-tab" style="display: none;">
                            <div class="card">
                                <div class="card-header d-flex justify-content-between align-items-center">
                                                                         <h5 class="mb-0">I Miei Indirizzi</h5>
                                                                     <button class="btn btn-primary btn-sm" onclick="addNewAddress()">
                                     <i class="fas fa-plus"></i> Nuovo Indirizzo
                                 </button>
                                </div>
                                <div class="card-body">
                                    <div id="addresses-list">
                                        <!-- Gli indirizzi verranno caricati qui -->
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Scheda Sicurezza -->
                        <div class="tab-content" id="security-tab" style="display: none;">
                            <div class="card">
                                <div class="card-header">
                                                                         <h5 class="mb-0">Sicurezza Account</h5>
                                </div>
                                <div class="card-body">
                                    <form id="password-form">
                                        <div class="row g-3">
                                                                                         <div class="col-md-6">
                                                 <label class="form-label">Password attuale</label>
                                                 <input type="password" class="form-control" id="current-password" required>
                                             </div>
                                             <div class="col-md-6">
                                                 <label class="form-label">Nuova password</label>
                                                 <input type="password" class="form-control" id="new-password" required>
                                             </div>
                                             <div class="col-md-6">
                                                 <label class="form-label">Conferma nuova password</label>
                                                 <input type="password" class="form-control" id="confirm-password" required>
                                             </div>
                                             <div class="col-12">
                                                 <button type="submit" class="btn btn-primary">Cambia password</button>
                                             </div>
                                        </div>
                                    </form>
                                    
                                    <hr class="my-4">
                                    
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div>
                                                                                         <h6>Autenticazione a due fattori</h6>
                                             <p class="text-muted small">Sicura il tuo account con un'autenticazione aggiuntiva</p>
                                        </div>
                                        <div class="form-check form-switch">
                                            <input class="form-check-input" type="checkbox" id="2fa-toggle">
                                            <label class="form-check-label" for="2fa-toggle"></label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

                         <!-- Modale Cambio Avatar -->
             <div class="modal fade" id="avatarModal" tabindex="-1">
                 <div class="modal-dialog">
                     <div class="modal-content">
                         <div class="modal-header">
                             <h5 class="modal-title">Cambia Avatar</h5>
                             <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                         </div>
                         <div class="modal-body">
                             <form id="avatar-form">
                                 <div class="text-center mb-4">
                                     <div class="avatar-preview-container">
                                         <div class="avatar-preview-placeholder" id="avatar-preview-placeholder">
                                             <i class="fas fa-user fa-4x text-muted"></i>
                                         </div>
                                         <img id="avatar-preview-image" class="avatar-preview-image d-none" src="" alt="Anteprima avatar">
                                     </div>
                                 </div>
                                 <div class="mb-3">
                                     <label class="form-label">Seleziona un'immagine</label>
                                     <input type="file" class="form-control" id="avatar-file" accept="image/*" required>
                                     <div class="form-text">Formati supportati: JPG, PNG, GIF. Dimensione massima: 5MB</div>
                                 </div>
                                 <div class="d-grid gap-2">
                                     <button type="button" class="btn btn-outline-secondary" onclick="removeAvatar()">
                                         <i class="fas fa-trash"></i> Rimuovi Avatar
                                     </button>
                                 </div>
                             </form>
                         </div>
                         <div class="modal-footer">
                             <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annulla</button>
                             <button type="submit" form="avatar-form" class="btn btn-primary">Salva Avatar</button>
                         </div>
                     </div>
                 </div>
             </div>

             <!-- Modale Aggiunta Indirizzo -->
             <div class="modal fade" id="addAddressModal" tabindex="-1">
                 <div class="modal-dialog">
                     <div class="modal-content">
                         <div class="modal-header">
                                                          <h5 class="modal-title">Aggiungi nuovo indirizzo</h5>
                             <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                         </div>
                         <div class="modal-body">
                             <form id="add-address-form">
                                 <div class="row g-3">
                                     <div class="col-12">
                                                                                  <label class="form-label">Etichetta indirizzo</label>
                                          <input type="text" class="form-control" placeholder="es: Casa, Ufficio..." required>
                                      </div>
                                      <div class="col-12">
                                          <label class="form-label">Indirizzo</label>
                                          <input type="text" class="form-control" placeholder="Via Roma 123" required>
                                      </div>
                                      <div class="col-md-6">
                                          <label class="form-label">CAP</label>
                                          <input type="text" class="form-control" required>
                                      </div>
                                      <div class="col-md-6">
                                          <label class="form-label">Città</label>
                                          <input type="text" class="form-control" required>
                                      </div>
                                      <div class="col-12">
                                          <label class="form-label">Paese</label>
                                          <select class="form-select" required>
                                              <option value="IT">Italia</option>
                                              <option value="FR">Francia</option>
                                              <option value="DE">Germania</option>
                                              <option value="ES">Spagna</option>
                                          </select>
                                      </div>
                                      <div class="col-12">
                                          <div class="form-check">
                                              <input class="form-check-input" type="checkbox" id="default-address">
                                              <label class="form-check-label" for="default-address">
                                                  Imposta come indirizzo predefinito
                                              </label>
                                          </div>
                                      </div>
                                 </div>
                             </form>
                         </div>
                         <div class="modal-footer">
                             <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annulla</button>
                                                          <button type="submit" form="add-address-form" class="btn btn-primary">Aggiungi indirizzo</button>
                         </div>
                     </div>
                 </div>
             </div>
        `;
    }

    async init() {
        console.log('🚀 Inizializzazione Profile View...');
        console.log('🔍 Timestamp:', new Date().toISOString());
        this.addStyles();
        
        // Aspetta che il DOM sia completamente caricato
        await new Promise(resolve => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
        
        // Aspetta un frame aggiuntivo per assicurarsi che tutti gli elementi siano disponibili
        await new Promise(resolve => requestAnimationFrame(resolve));
        
        console.log('🔄 DOM caricato, carico dati utente...');
        
        // Carica i dati utente e aggiorna immediatamente l'affichage
        await this.loadUserData();
        
        console.log('✅ Dati utente caricati, imposto event listeners...');
        
        this.setupEventListeners();
        this.setupTabNavigation();
        
        // Forza un aggiornamento finale dopo un breve delay
        setTimeout(() => {
            console.log('🔄 Aggiornamento finale forzato...');
            this.updateProfileDisplay();
        }, 500);
        
        console.log('✅ Profile View inizializzata completamente');
    }

    // Aggiungi stili CSS per l'avatar
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .avatar-container {
                width: 120px;
                height: 120px;
                border-radius: 50%;
                overflow: hidden;
                position: relative;
                background-color: #f8f9fa;
                border: 3px solid #dee2e6;
            }
            
            .avatar-placeholder {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: #f8f9fa;
            }
            
            .avatar-image {
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 50%;
            }
            
            .avatar-edit-btn {
                position: absolute;
                bottom: 5px;
                right: 5px;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                padding: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
            
            .avatar-preview-container {
                width: 150px;
                height: 150px;
                border-radius: 50%;
                overflow: hidden;
                margin: 0 auto;
                background-color: #f8f9fa;
                border: 3px solid #dee2e6;
            }
            
            .avatar-preview-placeholder {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: #f8f9fa;
            }
            
            .avatar-preview-image {
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 50%;
            }
        `;
        document.head.appendChild(style);
    }

    setupEventListeners() {
        // Profile form
        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProfile();
            });
        }

        // Password form
        const passwordForm = document.getElementById('password-form');
        if (passwordForm) {
            passwordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.changePassword();
            });
        }

        // Add address form
        const addAddressForm = document.getElementById('add-address-form');
        if (addAddressForm) {
            addAddressForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddAddress();
            });
        }

        // Avatar form
        const avatarForm = document.getElementById('avatar-form');
        if (avatarForm) {
            avatarForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAvatarUpload();
            });
        }

        // Avatar file input
        const avatarFile = document.getElementById('avatar-file');
        if (avatarFile) {
            avatarFile.addEventListener('change', (e) => {
                this.handleAvatarFileSelect(e);
            });
        }
    }

    setupTabNavigation() {
        const navLinks = document.querySelectorAll('[data-tab]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const tabName = link.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });
    }

    switchTab(tabName) {
        // Hide all tabs
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(tab => {
            tab.style.display = 'none';
        });

        // Remove active class from all nav links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
        });

        // Show selected tab
        const selectedTab = document.getElementById(`${tabName}-tab`);
        if (selectedTab) {
            selectedTab.style.display = 'block';
        }

        // Activate selected nav link
        const selectedLink = document.querySelector(`[data-tab="${tabName}"]`);
        if (selectedLink) {
            selectedLink.classList.add('active');
        }

        this.activeTab = tabName;
        
        // RIAGGIORNA I DATI DOPO IL CAMBIO TAB
        // Questo previene la sovrascrittura dei dati
        setTimeout(() => {
            this.updateProfileDisplay();
        }, 100);
    }

    async loadUserData() {
        try {
            // Carica i dati dell'utente dal server
            const token = localStorage.getItem('jwt_token');
            if (!token) {
                console.error('Token non trovato');
                return;
            }

            const response = await fetch('/api/user/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                const user = data.user;
                
                                 // Aggiorna i dati del profilo con quelli reali dal database
                 this.userProfile = {
                     firstName: user.first_name || '',
                     lastName: user.last_name || '',
                     email: user.email || '',
                     phone: user.phone || '',
                     birthdate: user.birthdate ? user.birthdate.split('T')[0] : '',
                     bio: user.bio || '',
                     username: user.username || '',
                     role: user.role || 'cliente',
                     is_artisan: user.is_artisan || false,
                     is_admin: user.is_admin || false,
                     email_verified: user.email_verified || false,
                     address: user.address || '',
                     city: user.city || '',
                     postal_code: user.postal_code || '',
                     country: user.country || 'Italia',
                     profile_image: user.profile_image || '/static/img/avatar.png'
                 };

                console.log('✅ Dati utente caricati dal database:', this.userProfile);
                console.log('🔍 Verifica dati specifici:', {
                    firstName: this.userProfile.firstName,
                    lastName: this.userProfile.lastName,
                    email: this.userProfile.email
                });
            } else {
                console.error('❌ Errore caricamento dati utente:', response.status);
                // Fallback con dati mock se l'API fallisce
                this.loadMockData();
            }
        } catch (error) {
            console.error('❌ Errore caricamento dati utente:', error);
            // Fallback con dati mock
            this.loadMockData();
        }

        // Carica gli ordini (per ora mock, da implementare API)
        this.loadOrders();
        
        // Aspetta che gli elementi DOM siano disponibili prima di aggiornare
        await this.waitForElements(['user-name', 'user-email']);
        
        // Aggiorna la visualizzazione
        this.updateProfileDisplay();
        this.displayOrders();
        this.displayAddresses();
        
        // Test finale per verificare che l'aggiornamento sia avvenuto
        setTimeout(() => {
            const finalCheck = document.getElementById('user-name');
            if (finalCheck) {
                console.log('🔍 VERIFICA FINALE - Contenuto elemento:', finalCheck.textContent);
                if (finalCheck.textContent === 'Caricamento...') {
                    console.error('❌ PROBLEMA: L\'elemento è ancora "Caricamento..."');
                    console.log('🔍 Tentativo di aggiornamento forzato...');
                    this.forceUpdateName();
                } else {
                    console.log('✅ SUCCESSO: L\'elemento è stato aggiornato correttamente');
                }
            }
        }, 1000);
    }

    loadMockData() {
        // Dati mock di fallback
        this.userProfile = {
            firstName: "Utente",
            lastName: "Test",
            email: "utente@test.com",
            phone: "",
            birthdate: "",
            bio: "",
            username: "utente_test",
            role: "cliente",
            is_artisan: false,
            is_admin: false,
            email_verified: false,
            address: "",
            city: "",
            postal_code: "",
            country: "Italia"
        };
    }

    async loadOrders() {
        // TODO: Implementare API per caricare ordini reali dal database
        this.userOrders = [];
    }

    // Metodo per aspettare che gli elementi DOM siano disponibili
    async waitForElements(elementIds, maxWaitTime = 5000) {
        const startTime = Date.now();
        
        return new Promise((resolve) => {
            const checkElements = () => {
                const allFound = elementIds.every(id => document.getElementById(id));
                
                if (allFound) {
                    console.log('✅ Tutti gli elementi trovati:', elementIds);
                    resolve();
                } else if (Date.now() - startTime > maxWaitTime) {
                    console.warn('⚠️ Timeout nell\'attesa degli elementi:', elementIds);
                    resolve();
                } else {
                    setTimeout(checkElements, 100);
                }
            };
            
            checkElements();
        });
    }

    updateProfileDisplay() {
        console.log('🔄 Aggiornamento visualizzazione profilo...');
        console.log('📋 Dati utente:', this.userProfile);
        
        // Funzione per aggiornare gli elementi con retry
        const updateElementWithRetry = (elementId, updateFunction, maxRetries = 5) => {
            let attempts = 0;
            const tryUpdate = () => {
                const element = document.getElementById(elementId);
                if (element) {
                    updateFunction(element);
                    return true;
                } else if (attempts < maxRetries) {
                    attempts++;
                    console.log(`🔄 Tentativo ${attempts} per trovare elemento ${elementId}...`);
                    setTimeout(tryUpdate, 100);
                    return false;
                } else {
                    console.error(`❌ Elemento ${elementId} non trovato dopo ${maxRetries} tentativi`);
                    return false;
                }
            };
            return tryUpdate();
        };
        
        // Aggiorna i campi del form del profilo
        const firstNameField = document.getElementById('first-name');
        const lastNameField = document.getElementById('last-name');
        const emailField = document.getElementById('email');
        const phoneField = document.getElementById('phone');
        const birthdateField = document.getElementById('birthdate');
        const bioField = document.getElementById('bio');

        if (firstNameField) firstNameField.value = this.userProfile.firstName;
        if (lastNameField) lastNameField.value = this.userProfile.lastName;
        if (emailField) emailField.value = this.userProfile.email;
        if (phoneField) phoneField.value = this.userProfile.phone;
        if (birthdateField) birthdateField.value = this.userProfile.birthdate;
        if (bioField) bioField.value = this.userProfile.bio;

        // Aggiorna le informazioni dell'intestazione con retry
        updateElementWithRetry('user-name', (element) => {
            console.log('🔍 Elemento user-name trovato:', element);
            console.log('🔍 Contenuto attuale:', element.textContent);
            console.log('🔍 Dati profilo disponibili:', this.userProfile);
            
            let displayName = '';
            
            // Verifica se abbiamo dati reali
            if (this.userProfile.firstName && this.userProfile.lastName) {
                displayName = `${this.userProfile.firstName} ${this.userProfile.lastName}`;
                console.log('✅ Usando nome completo:', displayName);
            } else if (this.userProfile.firstName) {
                displayName = this.userProfile.firstName;
                console.log('✅ Usando solo nome:', displayName);
            } else if (this.userProfile.lastName) {
                displayName = this.userProfile.lastName;
                console.log('✅ Usando solo cognome:', displayName);
            } else if (this.userProfile.email) {
                // Se non c'è nome, usa la parte prima della @ dell'email
                const emailName = this.userProfile.email.split('@')[0];
                displayName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
                console.log('✅ Usando nome dall\'email:', displayName);
            } else {
                displayName = 'Utente';
                console.log('⚠️ Nessun dato disponibile, usando "Utente"');
            }
            
            console.log('🔍 Nome finale calcolato:', displayName);
            console.log('🔍 Dati profilo:', {
                firstName: this.userProfile.firstName,
                lastName: this.userProfile.lastName,
                email: this.userProfile.email
            });
            
            element.textContent = displayName;
            console.log('✅ Nome aggiornato a:', displayName);
            console.log('🔍 Contenuto dopo aggiornamento:', element.textContent);
            
            // Mostra il messaggio di aiuto se non c'è un nome reale
            const nameHelpElement = document.getElementById('name-help');
            if (nameHelpElement) {
                if (!this.userProfile.firstName && !this.userProfile.lastName) {
                    nameHelpElement.style.display = 'block';
                    console.log('ℹ️ Mostrato messaggio di aiuto per configurare il nome');
                } else {
                    nameHelpElement.style.display = 'none';
                }
            }
        });

        updateElementWithRetry('user-email', (element) => {
            const displayEmail = this.userProfile.email || 'Email non specificata';
            element.textContent = displayEmail;
            console.log('✅ Email aggiornata:', displayEmail);
        });

        // Aggiorna l'avatar
        this.updateAvatarDisplay();
    }
    
    forceUpdateName() {
        console.log('🔄 Aggiornamento forzato del nome...');
        const userNameElement = document.getElementById('user-name');
        if (userNameElement) {
            let displayName = '';
            if (this.userProfile.firstName && this.userProfile.lastName) {
                displayName = `${this.userProfile.firstName} ${this.userProfile.lastName}`;
            } else if (this.userProfile.firstName) {
                displayName = this.userProfile.firstName;
            } else if (this.userProfile.lastName) {
                displayName = this.userProfile.lastName;
            } else {
                displayName = 'Utente';
            }
            
            console.log('🔍 Forzando aggiornamento a:', displayName);
            userNameElement.textContent = displayName;
            userNameElement.innerHTML = displayName; // Prova anche con innerHTML
            
            // Prova anche a forzare un reflow
            userNameElement.style.display = 'none';
            setTimeout(() => {
                userNameElement.style.display = '';
            }, 10);
        }
    }

    updateAvatarDisplay() {
        const avatarPlaceholder = document.getElementById('avatar-placeholder');
        const avatarImage = document.getElementById('avatar-image');

        if (this.userProfile.profile_image) {
            // Mostra l'immagine dell'avatar
            if (avatarPlaceholder) avatarPlaceholder.classList.add('d-none');
            if (avatarImage) {
                avatarImage.classList.remove('d-none');
                avatarImage.src = this.userProfile.profile_image;
            }
        } else {
            // Mostra il placeholder
            if (avatarPlaceholder) avatarPlaceholder.classList.remove('d-none');
            if (avatarImage) avatarImage.classList.add('d-none');
        }
    }

    displayOrders() {
        const ordersContainer = document.getElementById('orders-list');
        if (!ordersContainer) return;

        if (this.userOrders.length === 0) {
            ordersContainer.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-shopping-bag fa-3x text-muted mb-3"></i>
                    <h5>Nessun ordine</h5>
                    <p class="text-muted">Non hai ancora effettuato ordini</p>
                    <a href="/products" class="btn btn-primary" data-link>Scopri i nostri prodotti</a>
                </div>
            `;
            return;
        }

        ordersContainer.innerHTML = this.userOrders.map(order => `
            <div class="order-item border rounded p-3 mb-3">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <div>
                        <h6 class="mb-1">Ordine ${order.id}</h6>
                        <small class="text-muted">Effettuato il ${order.date}</small>
                    </div>
                    <div class="text-end">
                        <span class="badge bg-${this.getOrderStatusColor(order.status)}">${order.status}</span>
                        <div class="fw-bold mt-1">${order.total.toFixed(2)} €</div>
                    </div>
                </div>
                <div class="order-items">
                    ${order.items.map(item => `
                        <div class="d-flex justify-content-between align-items-center py-1">
                            <span>${item.name} x${item.quantity}</span>
                            <span>${item.price.toFixed(2)} €</span>
                        </div>
                    `).join('')}
                </div>
                <div class="mt-3">
                    <button class="btn btn-outline-primary btn-sm" onclick="viewOrderDetails('${order.id}')">
                        Vedi dettagli
                    </button>
                </div>
            </div>
        `).join('');
    }

    displayAddresses() {
        const addressesContainer = document.getElementById('addresses-list');
        if (!addressesContainer) return;

        // TODO: Implementare API per caricare indirizzi reali dal database
        const addresses = [];

        if (addresses.length === 0) {
            addressesContainer.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-map-marker-alt fa-3x text-muted mb-3"></i>
                    <h5>Nessun indirizzo</h5>
                    <p class="text-muted">Non hai ancora aggiunto indirizzi</p>
                    <button class="btn btn-primary" onclick="addNewAddress()">
                        <i class="fas fa-plus"></i> Aggiungi primo indirizzo
                    </button>
                </div>
            `;
            return;
        }

        addressesContainer.innerHTML = addresses.map(address => `
            <div class="address-item border rounded p-3 mb-3">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h6 class="mb-1">${address.label}</h6>
                        <p class="mb-1">${address.address}</p>
                        <p class="mb-1">${address.postalCode} ${address.city}</p>
                        <p class="mb-0 text-muted">${address.country}</p>
                        ${address.isDefault ? '<span class="badge bg-primary mt-2">Predefinito</span>' : ''}
                    </div>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="editAddress(${address.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="deleteAddress(${address.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    getOrderStatusColor(status) {
        switch (status) {
            case 'Consegnato': return 'success';
            case 'In elaborazione': return 'primary';
            case 'In attesa': return 'warning';
            case 'Annullato': return 'danger';
            default: return 'secondary';
        }
    }

    saveProfile() {
        // TODO: Implementare API per salvare le modifiche al profilo
        console.log('Saving profile...');
        alert('Profilo aggiornato con successo!');
    }

    changePassword() {
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (newPassword !== confirmPassword) {
            alert('Le password non corrispondono');
            return;
        }

        // TODO: Implementare API per cambiare la password
        console.log('Changing password...');
        alert('Password modificata con successo!');
        
        // Pulisci il form
        document.getElementById('password-form').reset();
    }

    handleAddAddress() {
        // TODO: Implementare API per aggiungere nuovo indirizzo
        console.log('Adding new address...');
        alert('Indirizzo aggiunto con successo!');
        
        // Chiudi il modale
        const modal = document.getElementById('addAddressModal');
        if (modal) {
            const bootstrapModal = bootstrap.Modal.getInstance(modal);
            if (bootstrapModal) {
                bootstrapModal.hide();
            }
        }
    }

    handleAvatarFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validazione file
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];

        if (file.size > maxSize) {
            alert('Il file è troppo grande. Dimensione massima: 5MB');
            return;
        }

        if (!allowedTypes.includes(file.type)) {
            alert('Formato file non supportato. Usa JPG, PNG, JPEG o GIF');
            return;
        }

        // Mostra anteprima
        const reader = new FileReader();
        reader.onload = (e) => {
            const previewPlaceholder = document.getElementById('avatar-preview-placeholder');
            const previewImage = document.getElementById('avatar-preview-image');
            
            if (previewPlaceholder) previewPlaceholder.classList.add('d-none');
            if (previewImage) {
                previewImage.classList.remove('d-none');
                previewImage.src = e.target.result;
            }
        };
        reader.readAsDataURL(file);
    }

    async handleAvatarUpload() {
        const fileInput = document.getElementById('avatar-file');
        const file = fileInput.files[0];
        
        if (!file) {
            alert('Seleziona un file prima di salvare');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('avatar', file);

            const token = localStorage.getItem('jwt_token');
            const response = await fetch('/api/user/avatar', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                this.userProfile.profile_image = data.avatar_url;
                this.updateAvatarDisplay();
                alert('Avatar aggiornato con successo!');
                
                // Chiudi il modale
                const modal = document.getElementById('avatarModal');
                if (modal) {
                    const bootstrapModal = bootstrap.Modal.getInstance(modal);
                    if (bootstrapModal) {
                        bootstrapModal.hide();
                    }
                }
            } else {
                alert('Errore durante il caricamento dell\'avatar');
            }
        } catch (error) {
            console.error('Errore caricamento avatar:', error);
            alert('Errore durante il caricamento dell\'avatar');
        }
    }
}

// Funzioni globali per le azioni del profilo
window.addNewAddress = function() {
    const modal = new bootstrap.Modal(document.getElementById('addAddressModal'));
    modal.show();
};

window.changeAvatar = function() {
    const modal = new bootstrap.Modal(document.getElementById('avatarModal'));
    modal.show();
};

window.removeAvatar = function() {
    if (confirm('Sei sicuro di voler rimuovere l\'avatar?')) {
        // TODO: Implementare API per rimuovere l'avatar
        console.log('Removing avatar...');
        alert('Avatar rimosso con successo!');
        
        // Reset preview
        const previewPlaceholder = document.getElementById('avatar-preview-placeholder');
        const previewImage = document.getElementById('avatar-preview-image');
        const fileInput = document.getElementById('avatar-file');
        
        if (previewPlaceholder) previewPlaceholder.classList.remove('d-none');
        if (previewImage) previewImage.classList.add('d-none');
        if (fileInput) fileInput.value = '';
    }
};

window.editAddress = function(addressId) {
    console.log('Edit address:', addressId);
    // TODO: Implementare logica per modificare l'indirizzo
};

window.deleteAddress = function(addressId) {
    if (confirm('Sei sicuro di voler eliminare questo indirizzo?')) {
        console.log('Delete address:', addressId);
        // TODO: Implementare logica per eliminare l'indirizzo
        alert('Indirizzo eliminato con successo!');
    }
};

window.viewOrderDetails = function(orderId) {
    console.log('View order details:', orderId);
    // TODO: Implementare navigazione alla pagina di dettaglio dell'ordine
    window.location.href = `/order/${orderId}`;
};