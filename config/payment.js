require('dotenv').config();

// Configurazione Stripe per carte bancarie (PRODUZIONE)
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Configurazione PayPal (PRODUZIONE)
const paypal = require('@paypal/checkout-server-sdk');
const paypalEnvironment = process.env.NODE_ENV === 'production' 
    ? new paypal.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET)
    : new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);
const paypalClient = new paypal.core.PayPalHttpClient(paypalEnvironment);

// Configurazione Google Pay tramite Stripe (PRODUZIONE)
const googlePayConfig = {
    merchantName: 'Artigianato on Ligne',
    environment: process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'TEST',
    supportedNetworks: ['VISA', 'MASTERCARD', 'AMEX'],
    supportedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS']
};

// Metodi di pagamento supportati
const paymentMethods = {
    card: {
        name: 'Carte Bancaria',
        icon: 'fas fa-credit-card',
        description: 'Visa, Mastercard, American Express',
        enabled: true,
        gateway: 'stripe'
    },
    paypal: {
        name: 'PayPal',
        icon: 'fab fa-paypal',
        description: 'Paga con il tuo account PayPal',
        enabled: true,
        gateway: 'paypal'
    },
    google_pay: {
        name: 'Google Pay',
        icon: 'fab fa-google-pay',
        description: 'Paga con Google Pay',
        enabled: true,
        gateway: 'google_pay'
    },
    cash: {
        name: 'Pagamento in Contanti',
        icon: 'fas fa-money-bill-wave',
        description: 'Paga presso una delle nostre filiali',
        enabled: true,
        gateway: 'cash'
    }
};

// Funzioni per la gestione dei pagamenti (PRODUZIONE)
const paymentHandlers = {
    // Carta bancaria con Stripe (REALE)
    async processCardPayment(paymentData, amount) {
        try {
            // Crea PaymentMethod con i dati della carta
            const paymentMethod = await stripe.paymentMethods.create({
                type: 'card',
                card: {
                    number: paymentData.cardNumber,
                    exp_month: parseInt(paymentData.expiry.split('/')[0]),
                    exp_year: parseInt('20' + paymentData.expiry.split('/')[1]),
                    cvc: paymentData.cvv,
                },
                billing_details: {
                    name: paymentData.holder,
                },
            });

            // Crea PaymentIntent
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100), // Stripe usa centesimi
                currency: 'eur',
                payment_method: paymentMethod.id,
                confirm: true,
                return_url: `${process.env.FRONTEND_URL}/payment/success`,
                metadata: {
                    order_id: paymentData.orderId,
                    customer_email: paymentData.customerEmail
                }
            });

            return {
                success: paymentIntent.status === 'succeeded',
                transactionId: paymentIntent.id,
                status: paymentIntent.status,
                paymentMethodId: paymentMethod.id
            };
        } catch (error) {
            console.error('Errore pagamento carta:', error);
            throw new Error(error.message);
        }
    },

    // PayPal (REALE)
    async processPayPalPayment(paymentData, amount) {
        try {
            const request = new paypal.orders.OrdersCreateRequest();
            request.prefer("return=representation");
            request.requestBody({
                intent: 'CAPTURE',
                purchase_units: [{
                    amount: {
                        currency_code: 'EUR',
                        value: amount.toString()
                    },
                    description: 'Ordine Artisanat en Ligne',
                    custom_id: paymentData.orderId,
                    invoice_id: `INV-${Date.now()}`
                }],
                application_context: {
                    return_url: `${process.env.FRONTEND_URL}/payment/success`,
                    cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`
                }
            });

            const order = await paypalClient.execute(request);
            
            // Se l'ordine è approvato, procedi con la cattura
            if (order.result.status === 'APPROVED') {
                const captureRequest = new paypal.orders.OrdersCaptureRequest(order.result.id);
                const capture = await paypalClient.execute(captureRequest);
                
                return {
                    success: capture.result.status === 'COMPLETED',
                    transactionId: capture.result.id,
                    status: capture.result.status,
                    payerId: capture.result.payer.payer_id
                };
            }
            
            return {
                success: true,
                transactionId: order.result.id,
                status: order.result.status
            };
        } catch (error) {
            console.error('Errore pagamento PayPal:', error);
            throw new Error('Errore durante il pagamento PayPal');
        }
    },

    // Google Pay tramite Stripe (REALE)
    async processGooglePayPayment(paymentData, amount) {
        try {
            // Google Pay invia i dati della carta criptati
            // Stripe può processare direttamente questi dati
            const paymentMethod = await stripe.paymentMethods.create({
                type: 'card',
                card: {
                    token: paymentData.paymentToken // Token criptato da Google Pay
                },
                billing_details: {
                    name: paymentData.holder || 'Cliente',
                },
            });

            // Crea PaymentIntent
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100),
                currency: 'eur',
                payment_method: paymentMethod.id,
                confirm: true,
                return_url: `${process.env.FRONTEND_URL}/payment/success`,
                metadata: {
                    order_id: paymentData.orderId,
                    customer_email: paymentData.customerEmail,
                    payment_method: 'google_pay'
                }
            });

            return {
                success: paymentIntent.status === 'succeeded',
                transactionId: paymentIntent.id,
                status: paymentIntent.status,
                paymentMethodId: paymentMethod.id
            };
        } catch (error) {
            console.error('Errore pagamento Google Pay:', error);
            throw new Error('Errore durante il pagamento Google Pay');
        }
    },

    // Pagamento in contanti (REALE)
    async processCashPayment(paymentData, amount) {
        try {
            // Per il pagamento in contanti, creiamo solo un record
            // Il pagamento effettivo avverrà in filiale
            const branchId = paymentData.branchId;
            
            if (!branchId) {
                throw new Error('ID filiale richiesto per pagamento in contanti');
            }

            // Verifica che la filiale esista
            const [branch] = await require('mysql2/promise').createPool({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME
            }).execute('SELECT * FROM branches WHERE id = ? AND is_active = true', [branchId]);

            if (branch.length === 0) {
                throw new Error('Filiale non trovata o non attiva');
            }

            return {
                success: true,
                transactionId: `cash_${Date.now()}_${branchId}`,
                status: 'PENDING',
                branchId: branchId,
                instructions: `Paga presso ${branch[0].name} entro 24 ore. Porta con te il numero dell'ordine.`,
                branchInfo: {
                    name: branch[0].name,
                    address: branch[0].address,
                    city: branch[0].city,
                    phone: branch[0].phone,
                    opening_hours: branch[0].opening_hours
                }
            };
        } catch (error) {
            console.error('Errore pagamento contanti:', error);
            throw new Error('Errore durante la creazione del pagamento in contanti');
        }
    },

    // Rimborso pagamento
    async processRefund(transactionId, amount, reason = 'Customer request') {
        try {
            // Determina il tipo di transazione
            const [transaction] = await require('mysql2/promise').createPool({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME
            }).execute('SELECT payment_method FROM payment_transactions WHERE transaction_id = ?', [transactionId]);

            if (transaction.length === 0) {
                throw new Error('Transazione non trovata');
            }

            const paymentMethod = transaction[0].payment_method;

            switch (paymentMethod) {
                case 'card':
                    return await this.refundStripePayment(transactionId, amount, reason);
                case 'paypal':
                    return await this.refundPayPalPayment(transactionId, amount, reason);
                case 'google_pay':
                    return await this.refundGooglePayPayment(transactionId, amount, reason);
                case 'cash':
                    return await this.refundCashPayment(transactionId, amount, reason);
                default:
                    throw new Error('Metodo di pagamento non supportato per rimborso');
            }
        } catch (error) {
            console.error('Errore nel processamento del rimborso:', error);
            throw error;
        }
    },

    // Rimborso Stripe
    async refundStripePayment(transactionId, amount, reason) {
        try {
            const refund = await stripe.refunds.create({
                payment_intent: transactionId,
                amount: Math.round(amount * 100),
                reason: reason === 'Customer request' ? 'requested_by_customer' : 'duplicate'
            });

            return {
                success: refund.status === 'succeeded',
                refundId: refund.id,
                status: refund.status
            };
        } catch (error) {
            throw new Error(`Errore rimborso Stripe: ${error.message}`);
        }
    },

    // Rimborso PayPal
    async refundPayPalPayment(transactionId, amount, reason) {
        try {
            const request = new paypal.payments.CapturesRefundRequest(transactionId);
            request.requestBody({
                amount: {
                    value: amount.toString(),
                    currency_code: 'EUR'
                },
                note_to_payer: reason
            });

            const refund = await paypalClient.execute(request);

            return {
                success: refund.result.status === 'COMPLETED',
                refundId: refund.result.id,
                status: refund.result.status
            };
        } catch (error) {
            throw new Error(`Errore rimborso PayPal: ${error.message}`);
        }
    },

    // Rimborso Google Pay
    async refundGooglePayPayment(transactionId, amount, reason) {
        // Google Pay usa Stripe come gateway, quindi usa il rimborso Stripe
        return await this.refundStripePayment(transactionId, amount, reason);
    },

    // Rimborso pagamento contanti
    async refundCashPayment(transactionId, amount, reason) {
        try {
            // Per i pagamenti in contanti, il rimborso viene gestito manualmente
            // Registra la richiesta di rimborso
            await require('mysql2/promise').createPool({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME
            }).execute(
                'INSERT INTO refund_requests (transaction_id, amount, reason, status) VALUES (?, ?, ?, "pending")',
                [transactionId, amount, reason]
            );

            return {
                success: true,
                refundId: `cash_refund_${Date.now()}`,
                status: 'PENDING',
                message: 'Richiesta di rimborso registrata. Verrà processata manualmente.'
            };
        } catch (error) {
            throw new Error(`Errore rimborso contanti: ${error.message}`);
        }
    }
};

module.exports = {
    stripe,
    paypalClient,
    googlePayConfig,
    paymentMethods,
    paymentHandlers
}; 