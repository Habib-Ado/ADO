# 🚀 Serveur de Production - Artigianato Online

## Configuration Unificata

Il progetto ora utilizza un **singolo server di produzione** (`server.js`) che sostituisce tutti i server di test precedenti.

## 🗂️ Struttura del Server

```
server.js                    # Serveur principal de production
├── Configurazione MySQL     # Connessione database
├── Sistema di autenticazione # JWT, bcrypt
├── Gestione prodotti        # CRUD prodotti
├── Sistema ordini           # Gestione ordini
├── Sistema pagamenti        # Stripe + PayPal
├── Sistema email            # SendGrid
└── Upload immagini          # Multer
```

## ⚙️ Configurazione

### 1. Variabili d'Ambiente (.env)

Crea un file `.env` nella root del progetto:

```env
# Configuration du serveur
PORT=3021

# Configuration de la base de données MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_password
DB_NAME=artisan

# Configuration JWT
JWT_SECRET=votre_secret_jwt_tres_securise

# Configuration Email (SendGrid)
SENDGRID_API_KEY=votre_cle_api_sendgrid
EMAIL_FROM=noreply@artisan.com

# Configuration Stripe (Paiements)
STRIPE_SECRET_KEY=votre_cle_secrete_stripe
STRIPE_PUBLISHABLE_KEY=votre_cle_publique_stripe

# Configuration PayPal (Paiements)
PAYPAL_CLIENT_ID=votre_client_id_paypal
PAYPAL_CLIENT_SECRET=votre_client_secret_paypal

# Configuration de sécurité
NODE_ENV=production
```

### 2. Base de Données MySQL

Assicurati che MySQL sia installato e configurato:

```sql
CREATE DATABASE artisan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 🚀 Avvio del Server

### Metodo 1: NPM
```bash
npm start
```

### Metodo 2: Node diretto
```bash
node server.js
```

### Metodo 3: Script bash
```bash
./server.sh
```

## 📱 Accesso all'Applicazione

- **Frontend**: http://localhost:3022
- **API**: http://localhost:3021/api/*
- **Uploads**: http://localhost:3021/uploads/

## 🔧 Funzionalità Principali

### ✅ Autenticazione
- Registrazione utenti
- Login/Logout
- Verifica email
- Reset password
- Gestione ruoli (Admin, Artigiano, Cliente)

### ✅ Gestione Prodotti
- CRUD prodotti per artigiani
- Upload immagini
- Gestione categorie
- Sistema di recensioni

### ✅ Sistema Ordini
- Carrello acquisti
- Creazione ordini
- Tracking stato ordini
- Storico ordini

### ✅ Sistema Pagamenti
- Stripe (carte di credito)
- PayPal
- Gestione transazioni
- Conferme automatiche

### ✅ Sistema Email
- Conferme registrazione
- Reset password
- Notifiche ordini
- Newsletter

## 🛡️ Sicurezza

- **JWT** per autenticazione
- **bcrypt** per hash password
- **CORS** configurato
- **Rate limiting** implementato
- **Validazione input** completa
- **Sanitizzazione** dati

## 📊 Monitoraggio

Il server fornisce log dettagliati per:
- Connessioni database
- Autenticazioni
- Transazioni pagamenti
- Errori applicazione
- Performance

## 🔄 Modalità di Fallback

Se MySQL non è disponibile, il server passa automaticamente a:
- Database in memoria per sviluppo
- Funzionalità limitate ma operative
- Log di avviso appropriati

## 🚨 Troubleshooting

### Errore Porta Occupata
```bash
# Cambia porta nel file .env
PORT=3022
```

### Errore Database
```bash
# Verifica connessione MySQL
node test_mysql_connection.js
```

### Errore Dipendenze
```bash
npm install
```

## 📝 Note di Produzione

1. **Sempre** configurare le variabili d'ambiente
2. **Verificare** le credenziali di pagamento
3. **Testare** la connessione email
4. **Monitorare** i log del server
5. **Backup** regolari del database

---

**Server unificato e ottimizzato per la produzione** ✅
