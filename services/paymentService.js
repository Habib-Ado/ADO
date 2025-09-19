const paymentConfig = require('../config/payment');

class PaymentService {
    constructor() {
        this.config = paymentConfig;
    }

    // Processa pagamento con carta bancaria (Stripe)
    async processCardPayment(paymentData, amount) {
        try {
            // In un'implementazione reale, qui integreresti Stripe
            const stripe = require('stripe')(this.config.stripe.secretKey);
            
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100), // Stripe usa centesimi
                currency: this.config.stripe.currency,
                payment_method_data: {
                    type: 'card',
                    card: {
                        token: paymentData.token // Token dalla validazione lato client
                    }
                },
                confirm: true,
                return_url: `${process.env.FRONTEND_URL}/payment/success`
            });

            return {
                success: true,
                paymentId: paymentIntent.id,
                status: paymentIntent.status,
                method: 'card'
            };
        } catch (error) {
            console.error('Errore pagamento carta:', error);
            return {
                success: false,
                error: error.message,
                method: 'card'
            };
        }
    }

    // Processa pagamento PayPal
    async processPayPalPayment(paymentData, amount) {
        try {
            // In un'implementazione reale, qui integreresti PayPal SDK
            const paypal = require('@paypal/checkout-server-sdk');
            
            const environment = this.config.paypal.mode === 'live' 
                ? new paypal.core.LiveEnvironment(this.config.paypal.clientId, this.config.paypal.clientSecret)
                : new paypal.core.SandboxEnvironment(this.config.paypal.clientId, this.config.paypal.clientSecret);
            
            const client = new paypal.core.PayPalHttpClient(environment);

            const request = new paypal.orders.OrdersCreateRequest();
            request.prefer("return=representation");
            request.requestBody({
                intent: 'CAPTURE',
                purchase_units: [{
                    amount: {
                        currency_code: this.config.paypal.currency,
                        value: amount.toString()
                    }
                }]
            });

            const order = await client.execute(request);

            return {
                success: true,
                paymentId: order.result.id,
                status: order.result.status,
                method: 'paypal',
                approvalUrl: order.result.links.find(link => link.rel === 'approve').href
            };
        } catch (error) {
            console.error('Errore pagamento PayPal:', error);
            return {
                success: false,
                error: error.message,
                method: 'paypal'
            };
        }
    }

    // Processa pagamento Google Pay
    async processGooglePayPayment(paymentData, amount) {
        try {
            // In un'implementazione reale, qui integreresti Google Pay API
            // Google Pay restituisce un token di pagamento che deve essere processato dal gateway
            
            const paymentToken = paymentData.paymentMethodData.tokenizationData.token;
            
            // Simula la processazione del token con un gateway di pagamento
            const gatewayResponse = await this.processPaymentToken(paymentToken, amount);
            
            return {
                success: true,
                paymentId: gatewayResponse.transactionId,
                status: 'completed',
                method: 'googlepay'
            };
        } catch (error) {
            console.error('Errore pagamento Google Pay:', error);
            return {
                success: false,
                error: error.message,
                method: 'googlepay'
            };
        }
    }

    // Processa il token di pagamento con il gateway
    async processPaymentToken(token, amount) {
        // Simula la processazione con un gateway di pagamento
        // In produzione, qui integreresti il tuo gateway preferito
        
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    transactionId: `GP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    status: 'success',
                    amount: amount
                });
            }, 1000);
        });
    }

    // Valida i dati di pagamento
    validatePaymentData(paymentData) {
        const { method } = paymentData;

        switch (method) {
            case 'card':
                return this.validateCardData(paymentData);
            case 'paypal':
                return this.validatePayPalData(paymentData);
            case 'googlepay':
                return this.validateGooglePayData(paymentData);
            default:
                return { valid: false, error: 'Metodo di pagamento non supportato' };
        }
    }

    // Valida dati carta bancaria
    validateCardData(paymentData) {
        const { cardNumber, expiry, cvv, holder } = paymentData;

        if (!cardNumber || !expiry || !cvv || !holder) {
            return { valid: false, error: 'Dati carta incompleti' };
        }

        const cleanCardNumber = cardNumber.replace(/\s/g, '');
        if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
            return { valid: false, error: 'Numero carta non valido' };
        }

        if (!/^\d{2}\/\d{2}$/.test(expiry)) {
            return { valid: false, error: 'Formato data scadenza non valido' };
        }

        if (cvv.length < 3 || cvv.length > 4) {
            return { valid: false, error: 'CVV non valido' };
        }

        if (holder.trim().length < 2) {
            return { valid: false, error: 'Nome titolare non valido' };
        }

        return { valid: true };
    }

    // Valida dati PayPal
    validatePayPalData(paymentData) {
        // PayPal non richiede validazione specifica lato server
        // La validazione avviene durante il processo di checkout
        return { valid: true };
    }

    // Valida dati Google Pay
    validateGooglePayData(paymentData) {
        const { paymentMethodData } = paymentData;

        if (!paymentMethodData || !paymentMethodData.tokenizationData) {
            return { valid: false, error: 'Dati Google Pay non validi' };
        }

        return { valid: true };
    }

    // Ottieni configurazione per il frontend
    getFrontendConfig() {
        return {
            stripe: {
                publishableKey: this.config.stripe.publishableKey
            },
            paypal: {
                clientId: this.config.paypal.clientId,
                currency: this.config.paypal.currency
            },
            googlePay: {
                merchantId: this.config.googlePay.merchantId,
                merchantName: this.config.googlePay.merchantName,
                environment: this.config.googlePay.environment,
                supportedNetworks: this.config.googlePay.supportedNetworks,
                supportedAuthMethods: this.config.googlePay.supportedAuthMethods
            }
        };
    }
}

module.exports = new PaymentService(); 