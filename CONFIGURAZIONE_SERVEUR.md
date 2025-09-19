# 🚀 Configuration Serveur de Production

## Serveur Unique

Il n'y a maintenant qu'un seul serveur : `server.js`

## Configuration Requise

### 1. Variables d'Environnement (.env)

Créez un fichier `.env` à la racine du projet avec :

```env
# Configuration Server
PORT=3021

# Configuration Database MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=1234
DB_NAME=artisan

# Configuration JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Configuration Stripe (Pagamenti)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# Configuration PayPal (Pagamenti)
PAYPAL_CLIENT_ID=your_paypal_client_id_here
PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here

# Configuration SendGrid (Email)
SENDGRID_API_KEY=SG.your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Configuration Email (Alternativa a SendGrid)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here
```

### 2. Base de Données MySQL

1. **Installez MySQL** se non già fatto
2. **Créez un utilisateur** o usa root
3. **Testez la connessione** avec `node test_mysql_connection.js`
4. **Aggiorna le credenziali** nel file `.env`

### 3. Services Externes

#### Stripe (Pagamenti)
- Registrati su [stripe.com](https://stripe.com)
- Ottieni le chiavi API dal dashboard
- Usa le chiavi di test per sviluppo

#### PayPal (Pagamenti)
- Registrati su [developer.paypal.com](https://developer.paypal.com)
- Crea un'app per ottenere Client ID e Secret
- Usa l'ambiente sandbox per sviluppo

#### SendGrid (Email)
- Registrati su [sendgrid.com](https://sendgrid.com)
- Ottieni l'API key dal dashboard
- Verifica il dominio email

## Avvio del Server

```bash
# Installazione dipendenze
npm install

# Avvio server
npm start

# Oppure direttamente
node server.js
```

## Caratteristiche del Server

✅ **Database MySQL Reale** - Dati persistenti  
✅ **Pagamenti Reali** - Stripe + PayPal  
✅ **Email Reali** - SendGrid  
✅ **Gestione Immagini** - Upload e salvataggio  
✅ **Sicurezza JWT** - Autenticazione completa  
✅ **CORS** - Configurato per frontend  
✅ **Middleware** - Autenticazione e autorizzazione  
✅ **API Complete** - Tutte le funzionalità  

## Endpoints Principali

- `GET /` - Frontend principale
- `POST /api/auth/register` - Registrazione
- `POST /api/auth/login` - Login
- `GET /api/products` - Lista prodotti
- `POST /api/orders` - Creazione ordini
- `POST /api/payments/stripe` - Pagamento Stripe
- `POST /api/payments/paypal` - Pagamento PayPal

## Modalità di Sviluppo vs Produzione

Il server si adatta automaticamente:
- **Sviluppo**: Usa credenziali di test
- **Produzione**: Usa credenziali reali

## Troubleshooting

### Errore Database
```bash
node test_mysql_connection.js
```

### Errore Porta
Cambia `PORT` nel file `.env`

### Errore Dipendenze
```bash
npm install
```
