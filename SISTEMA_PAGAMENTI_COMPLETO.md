# Sistema di Pagamenti Completo - Artisanat en Ligne

## 🎯 Panoramica

Sistema di pagamento completo con **4 metodi di pagamento** supportati:
1. **Carta Bancaria** (Stripe)
2. **PayPal**
3. **Google Pay**
4. **Pagamento in Contanti** presso filiali

## 🏦 Metodi di Pagamento Implementati

### 1. **Carta Bancaria** 💳
- **Gateway**: Stripe
- **Carte supportate**: Visa, Mastercard, American Express
- **Sicurezza**: Crittografia SSL, PCI DSS compliant
- **Funzionalità**: 
  - Validazione in tempo reale
  - Gestione errori dettagliata
  - Supporto 3D Secure

### 2. **PayPal** 🅿️
- **Gateway**: PayPal Checkout Server SDK
- **Funzionalità**:
  - Pagamento diretto con account PayPal
  - Gestione automatica delle valute
  - Rimborsi automatici
  - Sicurezza PayPal

### 3. **Google Pay** 📱
- **Gateway**: Google Pay API
- **Funzionalità**:
  - Pagamento con smartphone
  - Tokenizzazione sicura
  - Supporto NFC
  - Integrazione con Google Wallet

### 4. **Pagamento in Contanti** 💰
- **Modalità**: Presso filiali
- **Funzionalità**:
  - Selezione filiale
  - Istruzioni di pagamento
  - Validazione 24 ore
  - Conferma manuale

## 🏗️ Architettura del Sistema

### Database Schema

#### Tabella `branches` (Filiali)
```sql
CREATE TABLE branches (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    opening_hours TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabella `payment_transactions` (Transazioni)
```sql
CREATE TABLE payment_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    payment_method ENUM('card', 'paypal', 'google_pay', 'cash') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    transaction_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    payment_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Aggiornamento `orders`
```sql
ALTER TABLE orders MODIFY COLUMN payment_method ENUM('card', 'paypal', 'google_pay', 'cash');
ALTER TABLE orders ADD COLUMN branch_id INT NULL;
```

## 🔧 API Endpoints

### Pagamenti
- `GET /api/payments/methods` - Metodi disponibili
- `POST /api/payments/process` - Processa pagamento
- `GET /api/payments/status/:transactionId` - Stato transazione
- `GET /api/payments/history` - Cronologia pagamenti

### Filiali
- `GET /api/branches` - Lista filiali
- `GET /api/branches/:id` - Dettagli filiale
- `GET /api/branches/search/city/:city` - Cerca per città

## 💳 Configurazione Gateway

### Stripe (Carte Bancarie)
```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Processamento pagamento
const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: 'eur',
    payment_method: paymentData.paymentMethodId,
    confirm: true
});
```

### PayPal
```javascript
const paypal = require('@paypal/checkout-server-sdk');
const paypalClient = new paypal.core.PayPalHttpClient(paypalEnvironment);

// Creazione ordine PayPal
const request = new paypal.orders.OrdersCreateRequest();
request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
        amount: { currency_code: 'EUR', value: amount.toString() }
    }]
});
```

### Google Pay
```javascript
// Configurazione Google Pay
const googlePayConfig = {
    merchantId: process.env.GOOGLE_PAY_MERCHANT_ID,
    merchantName: 'Artisanat en Ligne',
    environment: process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'TEST'
};
```

## 🎨 Interfaccia Utente

### Selezione Metodo di Pagamento
```html
<div class="row g-3">
    <div class="col-md-6">
        <div class="form-check">
            <input type="radio" name="payment-method" value="card" checked>
            <label><i class="fas fa-credit-card"></i> Carte bancarie</label>
        </div>
    </div>
    <div class="col-md-6">
        <div class="form-check">
            <input type="radio" name="payment-method" value="paypal">
            <label><i class="fab fa-paypal"></i> PayPal</label>
        </div>
    </div>
    <div class="col-md-6">
        <div class="form-check">
            <input type="radio" name="payment-method" value="google_pay">
            <label><i class="fab fa-google-pay"></i> Google Pay</label>
        </div>
    </div>
    <div class="col-md-6">
        <div class="form-check">
            <input type="radio" name="payment-method" value="cash">
            <label><i class="fas fa-money-bill-wave"></i> Pagamento in Contanti</label>
        </div>
    </div>
</div>
```

### Dettagli Specifici per Metodo

#### Carta Bancaria
- Numero carta con formattazione automatica
- Data scadenza (MM/AA)
- CVV
- Nome titolare

#### PayPal
- Pulsante PayPal ufficiale
- Reindirizzamento automatico
- Gestione callback

#### Google Pay
- Pulsante Google Pay nativo
- Validazione disponibilità
- Gestione token

#### Pagamento in Contanti
- Selezione filiale
- Istruzioni di pagamento
- Orari di apertura

## 🔒 Sicurezza

### Autenticazione
- **JWT Token** obbligatorio per tutti i pagamenti
- **Verifica email** richiesta per gli acquisti
- **Session timeout** di 30 minuti

### Validazione
- **Controllo stock** prima del pagamento
- **Validazione dati** di input
- **Transazioni atomiche** nel database
- **Rollback automatico** in caso di errore

### Crittografia
- **SSL/TLS** per tutte le comunicazioni
- **Tokenizzazione** dei dati sensibili
- **PCI DSS** compliance per le carte

## 📱 Flusso Utente

### 1. Selezione Metodo
```javascript
// Utente seleziona metodo di pagamento
const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
```

### 2. Caricamento Dettagli
```javascript
// Mostra dettagli specifici per il metodo
this.togglePaymentDetails(paymentMethod);
```

### 3. Validazione
```javascript
// Valida i dati prima del pagamento
if (!this.validatePaymentData(paymentMethod)) {
    return false;
}
```

### 4. Processamento
```javascript
// Invia al backend per processamento
const response = await fetch('/api/payments/process', {
    method: 'POST',
    body: JSON.stringify({
        method: paymentMethod,
        amount: total,
        orderId: orderId,
        paymentData: paymentData
    })
});
```

### 5. Conferma
```javascript
// Mostra conferma o errore
if (result.success) {
    this.showPaymentSuccess(result);
} else {
    this.showError(result.error);
}
```

## 🏪 Gestione Filiali

### Filiali Disponibili
1. **Filiale Centrale - Paris** (123 Rue de Rivoli)
2. **Filiale Lyon** (456 Rue de la République)
3. **Filiale Marseille** (789 La Canebière)
4. **Filiale Bordeaux** (321 Cours de l'Intendance)

### Orari di Apertura
- **Lunedì-Venerdì**: 9h-18h
- **Sabato**: 9h-17h
- **Domenica**: Chiuso

### Processo Pagamento in Contanti
1. **Selezione filiale** durante l'ordine
2. **Conferma ordine** con istruzioni
3. **Pagamento presso filiale** entro 24 ore
4. **Conferma manuale** da parte del personale
5. **Aggiornamento stato** ordine

## 📊 Monitoraggio e Analytics

### Metriche Pagamenti
- **Tasso di conversione** per metodo
- **Tempo medio** di processamento
- **Errori** e fallimenti
- **Preferenze** utenti

### Logging
```javascript
console.log('Pagamento processato:', {
    method: paymentMethod,
    amount: amount,
    transactionId: result.transactionId,
    status: result.status
});
```

## 🚀 Installazione e Configurazione

### 1. Dipendenze
```bash
npm install stripe @paypal/checkout-server-sdk
```

### 2. Variabili Ambiente
```env
# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key

# PayPal
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret

# Google Pay
GOOGLE_PAY_MERCHANT_ID=your_google_pay_merchant_id

# Ambiente
NODE_ENV=development
```

### 3. Database
```bash
mysql -u root -p < database.sql
```

### 4. Avvio
```bash
npm start
```

## 🧪 Test del Sistema

### Test Carta Bancaria
```javascript
// Carta di test Stripe
const testCard = {
    number: '4242424242424242',
    exp_month: 12,
    exp_year: 2024,
    cvc: '123'
};
```

### Test PayPal
- Usa account PayPal Sandbox
- Testa pagamenti e rimborsi

### Test Google Pay
- Simula dispositivo con Google Pay
- Testa tokenizzazione

### Test Pagamento Contanti
- Crea ordine con pagamento contanti
- Verifica creazione record
- Simula conferma filiale

## 🔮 Prossimi Sviluppi

- [ ] **Apple Pay** integration
- [ ] **Crypto payments** (Bitcoin, Ethereum)
- [ ] **Buy Now Pay Later** (Klarna, Afterpay)
- [ ] **Loyalty points** system
- [ ] **Recurring payments** per abbonamenti
- [ ] **Multi-currency** support
- [ ] **Payment analytics** dashboard

## 📞 Supporto

### Documentazione
- [Stripe Documentation](https://stripe.com/docs)
- [PayPal Developer](https://developer.paypal.com)
- [Google Pay API](https://developers.google.com/pay/api)

### Contatti
- **Sviluppo**: dev@artisanat.fr
- **Supporto**: support@artisanat.fr
- **Pagamenti**: payments@artisanat.fr

---

**Sistema di pagamento completo e professionale pronto per la produzione! 🎉** 