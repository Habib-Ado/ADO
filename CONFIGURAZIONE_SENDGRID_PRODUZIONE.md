# 🔧 Configurazione SendGrid per Produzione

## 📋 Prerequisiti

1. **Account SendGrid** (gratuito fino a 100 email/giorno)
2. **Dominio verificato** o email verificata
3. **Chiave API** con permessi "Mail Send"

## 🚀 Setup SendGrid

### **1. Creare Account SendGrid**
```bash
# Vai su https://app.sendgrid.com/
# Crea un account gratuito
# Verifica la tua email
```

### **2. Verificare Email Sender**
```bash
# In SendGrid Dashboard:
# Settings > Sender Authentication
# Verifica Single Sender o Domain Authentication
# Per test: usa la tua email personale
```

### **3. Creare API Key**
```bash
# In SendGrid Dashboard:
# Settings > API Keys
# Create API Key
# Nome: "Artigianato Online Production"
# Permissions: "Mail Send" (Full Access)
# Copia la chiave (inizia con SG.)
```

### **4. Configurare Variabili d'Ambiente**

Crea un file `.env` nella root del progetto:

```env
# Configuration du serveur
PORT=3022

# Configuration de la base de données MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_password
DB_NAME=artisan

# Configuration JWT
JWT_SECRET=votre_secret_jwt_tres_securise

# Configuration Email (SendGrid) - PRODUZIONE
SENDGRID_API_KEY=SG.votre_cle_api_reale_qui
EMAIL_FROM=votre_email_verificata@example.com

# Configuration Stripe (Paiements)
STRIPE_SECRET_KEY=votre_cle_secrete_stripe
STRIPE_PUBLISHABLE_KEY=votre_cle_publique_stripe

# Configuration PayPal (Paiements)
PAYPAL_CLIENT_ID=votre_client_id_paypal
PAYPAL_CLIENT_SECRET=votre_client_secret_paypal

# Configuration de sécurité
NODE_ENV=production
```

## 🔍 Test della Configurazione

### **1. Test Locale**
```bash
# Avvia il server
npm start

# Prova a registrare un nuovo utente
# Verifica che l'email arrivi
```

### **2. Verifica Logs**
```bash
# Log di successo:
✅ Email di verifica inviata con successo a: test@example.com

# Log di errore:
❌ Errore invio email SendGrid: [messaggio errore]
```

## 🛠️ Troubleshooting

### **Errore 403 Forbidden**
```bash
# Possibili cause:
1. API Key non valida
2. API Key senza permessi "Mail Send"
3. Email FROM non verificata
4. Account SendGrid sospeso
```

### **Errore 401 Unauthorized**
```bash
# Possibili cause:
1. API Key scaduta
2. API Key revocata
3. Account SendGrid non attivo
```

### **Email non Arrivano**
```bash
# Controlla:
1. Spam/Junk folder
2. Email FROM verificata
3. Rate limits (100 email/giorno gratis)
4. Logs SendGrid per dettagli
```

## 📊 Monitoraggio Produzione

### **1. SendGrid Dashboard**
```bash
# Monitora:
- Email inviate/fallite
- Rate di consegna
- Bounce rate
- Spam reports
```

### **2. Logs Applicazione**
```bash
# Controlla:
- Errori invio email
- Rate di successo
- Tempo di invio
```

## 🔒 Sicurezza

### **1. Protezione API Key**
```bash
# Mai committare .env in Git
# Usa variabili d'ambiente del server
# Rotazione periodica delle chiavi
```

### **2. Verifica Email**
```bash
# Verifica sempre l'email FROM
# Usa domini verificati in produzione
# Implementa SPF/DKIM
```

## 📈 Scalabilità

### **1. Piano SendGrid**
```bash
# Gratuito: 100 email/giorno
# Essentials: $14.95/mese, 50k email
# Pro: $89.95/mese, 100k email
# Premier: Personalizzato
```

### **2. Template Email**
```bash
# Usa template HTML professionali
# Implementa tracking email
# A/B testing per conversioni
```

---

**✅ Configurazione completata per produzione!**
**📧 Email reali attive!**

