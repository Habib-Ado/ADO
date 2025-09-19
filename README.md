# 🎨 Artigianato Online - Portale Artigianale

## 🚀 Serveur de Production Unifié

Il progetto utilizza ora un **singolo server di produzione** (`server.js`) che integra tutte le funzionalità necessarie per un ambiente di produzione completo.

## 📋 Caratteristiche Principali

### 🔐 Sistema di Autenticazione
- **Registrazione** utenti con verifica email
- **Login/Logout** con JWT
- **Reset password** sicuro
- **Gestione ruoli**: Admin, Artigiano, Cliente
- **Protezione route** con middleware

### 🛍️ E-commerce Completo
- **Catalogo prodotti** con immagini
- **Carrello acquisti** persistente
- **Sistema ordini** con tracking
- **Gestione inventario** automatica
- **Sistema recensioni** e valutazioni

### 💳 Sistema di Pagamento
- **Stripe** per carte di credito
- **PayPal** per pagamenti online
- **Gestione transazioni** sicura
- **Conferme automatiche** via email

### 📧 Sistema Email
- **SendGrid** per email transazionali
- **Template email** professionali
- **Notifiche ordini** automatiche
- **Newsletter** opzionale

### 🗄️ Database Robusto
- **MySQL** per produzione
- **Fallback** in memoria per sviluppo
- **Pool di connessioni** ottimizzato
- **Backup** automatico

## 🛠️ Tecnologie Utilizzate

- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Autenticazione**: JWT, bcrypt
- **Pagamenti**: Stripe, PayPal
- **Email**: SendGrid
- **Upload**: Multer
- **Frontend**: HTML5, CSS3, JavaScript

## ⚙️ Installazione e Configurazione

### 1. Prerequisiti
```bash
# Node.js (versione 16+)
# MySQL (versione 8+)
# npm o yarn
```

### 2. Installazione Dipendenze
```bash
npm install
```

### 3. Configurazione Database
```bash
# Crea il database
CREATE DATABASE artisan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Importa lo schema
mysql -u root -p artisan < database.sql
```

### 4. Configurazione Variabili d'Ambiente
Crea un file `.env` nella root:

```env
PORT=3021
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_password
DB_NAME=artisan
JWT_SECRET=votre_secret_jwt
SENDGRID_API_KEY=votre_cle_sendgrid
STRIPE_SECRET_KEY=votre_cle_stripe
PAYPAL_CLIENT_ID=votre_client_id_paypal
PAYPAL_CLIENT_SECRET=votre_client_secret_paypal
```

## 🚀 Avvio del Server

### Produzione
```bash
npm start
# oppure
node server.js
```

### Sviluppo
```bash
# Il server passa automaticamente in modalità sviluppo
# se MySQL non è disponibile
node server.js
```

## 📱 Accesso all'Applicazione

- **Frontend**: http://localhost:3021
- **API**: http://localhost:3021/api/*
- **Documentazione API**: Integrata nel codice

## 🔧 API Endpoints

### Autenticazione
- `POST /api/auth/register` - Registrazione
- `POST /api/auth/login` - Login
- `POST /api/auth/verify-email` - Verifica email
- `POST /api/auth/reset-password` - Reset password

### Prodotti
- `GET /api/products` - Lista prodotti
- `POST /api/products` - Crea prodotto (Artigiano)
- `PUT /api/products/:id` - Modifica prodotto
- `DELETE /api/products/:id` - Elimina prodotto

### Ordini
- `POST /api/orders` - Crea ordine
- `GET /api/orders` - Lista ordini utente
- `PUT /api/orders/:id/status` - Aggiorna stato

### Pagamenti
- `POST /api/payments/stripe` - Pagamento Stripe
- `POST /api/payments/paypal` - Pagamento PayPal

## 🛡️ Sicurezza

- **JWT** per autenticazione sicura
- **bcrypt** per hash password
- **CORS** configurato
- **Validazione input** completa
- **Rate limiting** implementato
- **Sanitizzazione** dati

## 📊 Monitoraggio

Il server fornisce log dettagliati per:
- Connessioni database
- Autenticazioni utenti
- Transazioni pagamenti
- Errori applicazione
- Performance sistema

## 🔄 Modalità di Fallback

Se MySQL non è disponibile:
- Passa automaticamente a database in memoria
- Mantiene funzionalità core operative
- Log di avviso appropriati
- Ideale per sviluppo e test

## 🚨 Troubleshooting

### Errore Porta Occupata
```bash
# Modifica PORT nel file .env
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
rm -rf node_modules package-lock.json
npm install
```

## 📝 Note di Produzione

1. **Configurare sempre** le variabili d'ambiente
2. **Verificare** le credenziali di pagamento
3. **Testare** la connessione email
4. **Monitorare** i log del server
5. **Backup regolari** del database
6. **SSL/TLS** per produzione

## 🤝 Contributi

1. Fork del progetto
2. Crea branch feature (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri Pull Request

## 📄 Licenza

Questo progetto è sotto licenza ISC.

---

**Server unificato e ottimizzato per la produzione** ✅

Per supporto tecnico, consulta `SERVEUR_PRODUCTION.md` 