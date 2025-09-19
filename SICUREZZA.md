# 🔒 GUIDA ALLA SICUREZZA - ARTIGIANATO ONLINE

## ⚠️ **IMPORTANTE: MAI COMMITTARE CREDENZIALI!**

### 🚨 **Cosa NON Fare:**
- ❌ **MAI** inserire password nel codice sorgente
- ❌ **MAI** committare file `.env` con credenziali reali
- ❌ **MAI** condividere chiavi API in chat o email
- ❌ **MAI** usare credenziali di test in produzione

### ✅ **Cosa Fare:**
- ✅ Usa **sempre** variabili d'ambiente
- ✅ Mantieni il file `.env` nel `.gitignore`
- ✅ Usa `config_example.txt` come template
- ✅ Genera chiavi JWT random e sicure
- ✅ Usa password per app Gmail (non password account)

## 🔐 **Gestione Credenziali Sicura:**

### **1. File .env (NON COMMITTARE):**
```bash
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_real_password
DB_NAME=artisan

# JWT (GENERA RANDOM)
JWT_SECRET=4198acbb170cc791188e76c8d127fb1ac663613a9940efe345b48edf309c99390c451a9fbaf913e0fc7e31fe9597c4ebf95818b3424978f821d335ecae9ad7d4

# Email Gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Stripe
STRIPE_SECRET_KEY=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
STRIPE_PUBLISHABLE_KEY=pk_live_51RPalcAMFU6OFCPMldmax68EqzW2MYBuIlpHPlZiZq4oqOlMJxsuhbuAkO4tu5aDWcB0k3uXcmIlof11czsS2ygd00MltxbBRY

# PayPal
PAYPAL_CLIENT_ID=Aaw6H3TC_hkyf8BRYUzCE3hYvuM_3V_lbciC6wPnvkaIwSZeXK-4wQeMoMMv5NT2bqgupJg6jtCOOzYJ
PAYPAL_CLIENT_SECRET=EG_7XJqs1_yhfTOZIdzx_JOVKvdLLlMVNTniZBlUn2FQe7Vn1ktl9PgdwJxRg3XHI2e1W7CCuzQtF3r3
```

### **2. Password per App Gmail:**
1. Vai su: https://myaccount.google.com/security
2. Attiva verifica in due passaggi
3. Genera password per app
4. **NON usare** la password normale dell'account

### **3. Chiave JWT Sicura:**
```bash
# Genera una chiave random di almeno 32 caratteri
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 🛡️ **Best Practices di Sicurezza:**

### **Sviluppo:**
- Usa sempre variabili d'ambiente
- Testa con credenziali di test
- Verifica che `.env` sia nel `.gitignore`

### **Produzione:**
- Usa credenziali LIVE (non test)
- Cambia chiavi JWT regolarmente
- Monitora accessi e log

### **Deployment:**
- Configura variabili d'ambiente sul server
- Non includere file `.env` nei pacchetti
- Usa servizi di gestione segreti (se disponibili)

## 🔍 **Verifica Sicurezza:**

### **Controlla che:**
- ✅ File `.env` sia nel `.gitignore`
- ✅ Nessuna password sia nel codice sorgente
- ✅ Tutte le credenziali usino `process.env.*`
- ✅ Chiave JWT sia abbastanza lunga e random

### **Comandi di Verifica:**
```bash
# Controlla se .env è nel .gitignore
grep -r "\.env" .gitignore

# Cerca password hardcoded nel codice
grep -r "password.*=" . --include="*.js" --exclude-dir=node_modules

# Verifica variabili d'ambiente
grep -r "process\.env\." . --include="*.js" --exclude-dir=node_modules
```

## 📞 **In Caso di Compromissione:**

1. **Cambia IMMEDIATAMENTE** tutte le credenziali
2. **Revoca** chiavi API compromesse
3. **Controlla** log di accesso
4. **Aggiorna** documentazione
5. **Notifica** team di sicurezza

---

**RICORDA: La sicurezza è responsabilità di tutti!** 🛡️
