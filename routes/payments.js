const express = require('express');
const { requireActiveSession } = require('../middleware/auth');
const { paymentHandlers, paymentMethods } = require('../config/payment');
const OrderStatusService = require('../services/orderStatusService');
const router = express.Router();

// Tutte le route di pagamento richiedono una sessione attiva
router.use(requireActiveSession);

// Inizializza il servizio di gestione stati
let orderStatusService;
router.use((req, res, next) => {
    if (!orderStatusService) {
        orderStatusService = new OrderStatusService(req.db);
    }
    req.orderStatusService = orderStatusService;
    next();
});

// Route per ottenere i metodi di pagamento disponibili
router.get('/methods', async (req, res) => {
    try {
        res.json({ 
            methods: paymentMethods,
            message: 'Metodi di pagamento disponibili'
        });
    } catch (error) {
        console.error('Errore nel recupero dei metodi di pagamento:', error);
        res.status(500).json({ error: 'Errore interno del serveur' });
    }
});

// Route per processare un pagamento
router.post('/process', async (req, res) => {
    try {
        const { 
            method, 
            amount, 
            orderId, 
            paymentData 
        } = req.body;

        // Validazione
        if (!method || !amount || !orderId) {
            return res.status(400).json({ 
                error: 'Metodo di pagamento, importo e ID ordine richiesti' 
            });
        }

        if (!paymentMethods[method] || !paymentMethods[method].enabled) {
            return res.status(400).json({ 
                error: 'Metodo di pagamento non supportato' 
            });
        }

        // Verifica che l'ordine esista e sia in attesa di pagamento
        const [order] = await req.db.execute(
            'SELECT * FROM orders WHERE id = ? AND user_id = ? AND payment_status = "pending"',
            [orderId, req.user.userId]
        );

        if (order.length === 0) {
            return res.status(404).json({ 
                error: 'Ordine non trovato o già pagato' 
            });
        }

        // Aggiorna stato a "payment_pending"
        await req.orderStatusService.updateOrderStatus(
            orderId, 
            'payment_pending', 
            'processing',
            `Inizio processamento pagamento ${method}`,
            req.user.userId
        );

        let paymentResult;

        // Processa il pagamento in base al metodo
        switch (method) {
            case 'card':
                paymentResult = await paymentHandlers.processCardPayment(paymentData, amount);
                break;
            case 'paypal':
                paymentResult = await paymentHandlers.processPayPalPayment(paymentData, amount);
                break;
            case 'google_pay':
                paymentResult = await paymentHandlers.processGooglePayPayment(paymentData, amount);
                break;
            case 'cash':
                paymentResult = await paymentHandlers.processCashPayment(paymentData, amount);
                break;
            default:
                return res.status(400).json({ 
                    error: 'Metodo di pagamento non riconosciuto' 
                });
        }

        if (paymentResult.success) {
            // Aggiorna lo stato dell'ordine
            const connection = await req.db.getConnection();
            await connection.beginTransaction();

            try {
                // Aggiorna l'ordine con i dettagli del pagamento
                await connection.execute(`
                    UPDATE orders 
                    SET 
                        payment_status = ?,
                        branch_id = ?,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ? AND user_id = ?
                `, [
                    paymentResult.status === 'PENDING' ? 'pending' : 'completed',
                    paymentData.branchId || null,
                    orderId,
                    req.user.userId
                ]);

                // Crea un record della transazione
                await connection.execute(`
                    INSERT INTO payment_transactions (
                        order_id,
                        payment_method,
                        amount,
                        transaction_id,
                        status,
                        payment_data
                    ) VALUES (?, ?, ?, ?, ?, ?)
                `, [
                    orderId,
                    method,
                    amount,
                    paymentResult.transactionId,
                    paymentResult.status,
                    JSON.stringify(paymentData)
                ]);

                await connection.commit();

                // Aggiorna lo stato dell'ordine in base al risultato del pagamento
                if (paymentResult.status === 'PENDING') {
                    // Per pagamenti in contanti o altri metodi che richiedono conferma
                    await req.orderStatusService.updateOrderStatus(
                        orderId,
                        'pending',
                        'pending',
                        `Pagamento ${method} in attesa di conferma`,
                        req.user.userId
                    );
                } else {
                    // Pagamento completato
                    await req.orderStatusService.updateOrderStatus(
                        orderId,
                        'payment_completed',
                        'completed',
                        `Pagamento ${method} completato - Transaction ID: ${paymentResult.transactionId}`,
                        req.user.userId
                    );
                }

                res.json({
                    success: true,
                    message: 'Pagamento processato con successo',
                    transactionId: paymentResult.transactionId,
                    status: paymentResult.status,
                    instructions: paymentResult.instructions || null,
                    orderStatus: paymentResult.status === 'PENDING' ? 'pending' : 'payment_completed'
                });

            } catch (error) {
                await connection.rollback();
                throw error;
            } finally {
                connection.release();
            }

        } else {
            // Pagamento fallito
            await req.orderStatusService.updateOrderStatus(
                orderId,
                'pending',
                'failed',
                `Pagamento ${method} fallito: ${paymentResult.error || 'Errore sconosciuto'}`,
                req.user.userId
            );

            res.status(400).json({
                success: false,
                error: 'Pagamento fallito',
                details: paymentResult.error || 'Errore sconosciuto'
            });
        }

    } catch (error) {
        console.error('Errore nel processamento del pagamento:', error);
        res.status(500).json({ 
            error: 'Errore interno del serveur',
            details: error.message 
        });
    }
});

// Route per confermare pagamento in contanti (usata dal personale filiale)
router.post('/cash/confirm', async (req, res) => {
    try {
        const { orderId, branchId } = req.body;

        if (!orderId || !branchId) {
            return res.status(400).json({ 
                error: 'ID ordine e ID filiale richiesti' 
            });
        }

        // Verifica che l'utente sia admin o personale filiale
        if (!req.user.is_admin) {
            return res.status(403).json({ 
                error: 'Accesso non autorizzato' 
            });
        }

        const result = await req.orderStatusService.processCashPayment(
            orderId, 
            branchId, 
            req.user.userId
        );

        res.json(result);

    } catch (error) {
        console.error('Errore nella conferma pagamento contanti:', error);
        res.status(500).json({ 
            error: 'Errore interno del serveur',
            details: error.message 
        });
    }
});

// Route per aggiornare stato ordine (admin/artisan)
router.put('/order/:orderId/status', async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status, paymentStatus, notes } = req.body;

        if (!status) {
            return res.status(400).json({ 
                error: 'Nuovo stato richiesto' 
            });
        }

        // Verifica autorizzazioni
        if (!req.user.is_admin && !req.user.is_artisan) {
            return res.status(403).json({ 
                error: 'Accesso non autorizzato' 
            });
        }

        const result = await req.orderStatusService.updateOrderStatus(
            orderId,
            status,
            paymentStatus,
            notes,
            req.user.userId
        );

        res.json(result);

    } catch (error) {
        console.error('Errore nell\'aggiornamento stato ordine:', error);
        res.status(500).json({ 
            error: 'Errore interno del serveur',
            details: error.message 
        });
    }
});

// Route per aggiornare tracking number
router.put('/order/:orderId/tracking', async (req, res) => {
    try {
        const { orderId } = req.params;
        const { trackingNumber, estimatedDelivery } = req.body;

        if (!trackingNumber) {
            return res.status(400).json({ 
                error: 'Numero di tracking richiesto' 
            });
        }

        // Verifica autorizzazioni
        if (!req.user.is_admin && !req.user.is_artisan) {
            return res.status(403).json({ 
                error: 'Accesso non autorizzato' 
            });
        }

        await req.orderStatusService.updateTrackingNumber(
            orderId,
            trackingNumber,
            estimatedDelivery
        );

        res.json({
            success: true,
            message: 'Tracking number aggiornato con successo'
        });

    } catch (error) {
        console.error('Errore nell\'aggiornamento tracking:', error);
        res.status(500).json({ 
            error: 'Errore interno del serveur',
            details: error.message 
        });
    }
});

// Route per confermare consegna
router.put('/order/:orderId/deliver', async (req, res) => {
    try {
        const { orderId } = req.params;

        // Verifica autorizzazioni
        if (!req.user.is_admin && !req.user.is_artisan) {
            return res.status(403).json({ 
                error: 'Accesso non autorizzato' 
            });
        }

        await req.orderStatusService.confirmDelivery(orderId);

        res.json({
            success: true,
            message: 'Consegna confermata con successo'
        });

    } catch (error) {
        console.error('Errore nella conferma consegna:', error);
        res.status(500).json({ 
            error: 'Errore interno del serveur',
            details: error.message 
        });
    }
});

// Route per ottenere cronologia stati ordine
router.get('/order/:orderId/history', async (req, res) => {
    try {
        const { orderId } = req.params;

        // Verifica che l'utente sia il proprietario dell'ordine o admin
        const [order] = await req.db.execute(
            'SELECT user_id FROM orders WHERE id = ?',
            [orderId]
        );

        if (order.length === 0) {
            return res.status(404).json({ error: 'Ordine non trovato' });
        }

        if (order[0].user_id !== req.user.userId && !req.user.is_admin) {
            return res.status(403).json({ error: 'Accesso non autorizzato' });
        }

        const history = await req.orderStatusService.getOrderStatusHistory(orderId);

        res.json({ 
            history,
            message: 'Cronologia stati recuperata'
        });

    } catch (error) {
        console.error('Errore nel recupero cronologia:', error);
        res.status(500).json({ error: 'Errore interno del serveur' });
    }
});

// Route per ottenere notifiche utente
router.get('/notifications', async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const notifications = await req.orderStatusService.getUserNotifications(
            req.user.userId, 
            parseInt(limit)
        );

        res.json({ 
            notifications,
            message: 'Notifiche recuperate'
        });

    } catch (error) {
        console.error('Errore nel recupero notifiche:', error);
        res.status(500).json({ error: 'Errore interno del serveur' });
    }
});

// Route per marcare notifica come letta
router.put('/notifications/:notificationId/read', async (req, res) => {
    try {
        const { notificationId } = req.params;

        await req.orderStatusService.markNotificationAsRead(
            notificationId, 
            req.user.userId
        );

        res.json({
            success: true,
            message: 'Notifica marcata come letta'
        });

    } catch (error) {
        console.error('Errore nella marcatura notifica:', error);
        res.status(500).json({ error: 'Errore interno del serveur' });
    }
});

// Route per verificare lo stato di un pagamento
router.get('/status/:transactionId', async (req, res) => {
    try {
        const { transactionId } = req.params;

        const [transactions] = await req.db.execute(`
            SELECT 
                pt.*,
                o.status as order_status,
                o.payment_status
            FROM payment_transactions pt
            JOIN orders o ON pt.order_id = o.id
            WHERE pt.transaction_id = ? AND o.user_id = ?
        `, [transactionId, req.user.userId]);

        if (transactions.length === 0) {
            return res.status(404).json({ error: 'Transazione non trovata' });
        }

        res.json({ 
            transaction: transactions[0],
            message: 'Stato transazione recuperato'
        });

    } catch (error) {
        console.error('Errore nel recupero dello stato del pagamento:', error);
        res.status(500).json({ error: 'Errore interno del serveur' });
    }
});

// Route per ottenere la cronologia dei pagamenti dell'utente
router.get('/history', async (req, res) => {
    try {
        const [transactions] = await req.db.execute(`
            SELECT 
                pt.*,
                o.total_amount,
                o.status as order_status
            FROM payment_transactions pt
            JOIN orders o ON pt.order_id = o.id
            WHERE o.user_id = ?
            ORDER BY pt.created_at DESC
            LIMIT 20
        `, [req.user.userId]);

        res.json({ 
            transactions,
            message: 'Cronologia pagamenti recuperata'
        });

    } catch (error) {
        console.error('Errore nel recupero della cronologia pagamenti:', error);
        res.status(500).json({ error: 'Errore interno del serveur' });
    }
});

module.exports = router; 