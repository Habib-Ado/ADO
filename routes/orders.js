const express = require('express');
const { requireActiveSession } = require('../middleware/auth');
const router = express.Router();

// Tutte le route degli ordini richiedono una sessione attiva
router.use(requireActiveSession);

// Route per creare un nuovo ordine
router.post('/create', async (req, res) => {
    try {
        const {
            items,
            shipping,
            billing,
            payment,
            shipping_method,
            shipping_cost,
            total
        } = req.body;

        // Validazione dei dati
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Carrello vuoto' });
        }

        if (!shipping || !billing || !payment) {
            return res.status(400).json({ error: 'Dati di spedizione, fatturazione e pagamento richiesti' });
        }

        // Validazione del metodo di pagamento
        const validPaymentMethods = ['card', 'paypal', 'googlepay'];
        if (!validPaymentMethods.includes(payment.method)) {
            return res.status(400).json({ error: 'Metodo di pagamento non valido' });
        }

        // Validazione specifica per carta bancaria
        if (payment.method === 'card') {
            if (!payment.cardNumber || !payment.expiry || !payment.cvv || !payment.holder) {
                return res.status(400).json({ error: 'Dati carta bancaria incompleti' });
            }
            
            // Validazione formato numero carta
            const cardNumber = payment.cardNumber.replace(/\s/g, '');
            if (cardNumber.length < 13 || cardNumber.length > 19) {
                return res.status(400).json({ error: 'Numero carta non valido' });
            }
            
            // Validazione formato data scadenza
            if (!/^\d{2}\/\d{2}$/.test(payment.expiry)) {
                return res.status(400).json({ error: 'Formato data scadenza non valido' });
            }
            
            // Validazione CVV
            if (payment.cvv.length < 3 || payment.cvv.length > 4) {
                return res.status(400).json({ error: 'CVV non valido' });
            }
        }

        // Verifica che tutti i prodotti esistano e siano disponibili
        for (const item of items) {
            const [products] = await req.db.execute(
                'SELECT id, name, price, stock_quantity, is_active FROM products WHERE id = ?',
                [item.product_id]
            );

            if (products.length === 0) {
                return res.status(400).json({ error: `Prodotto ${item.product_id} non trovato` });
            }

            const product = products[0];
            if (!product.is_active) {
                return res.status(400).json({ error: `Prodotto ${product.name} non più disponibile` });
            }

            if (product.stock_quantity < item.quantity) {
                return res.status(400).json({ 
                    error: `Stock insufficiente per ${product.name}. Disponibile: ${product.stock_quantity}` 
                });
            }
        }

        // Inizia la transazione
        const connection = await req.db.getConnection();
        await connection.beginTransaction();

        try {
            // Crea l'ordine principale
            const [orderResult] = await connection.execute(`
                INSERT INTO orders (
                    user_id, 
                    total_amount, 
                    shipping_cost, 
                    shipping_method,
                    status,
                    shipping_first_name,
                    shipping_last_name,
                    shipping_address,
                    shipping_postal_code,
                    shipping_city,
                    shipping_country,
                    shipping_phone,
                    billing_first_name,
                    billing_last_name,
                    billing_address,
                    billing_postal_code,
                    billing_city,
                    billing_country,
                    payment_method
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                req.user.userId,
                total,
                shipping_cost,
                shipping_method,
                'pending',
                shipping.firstname,
                shipping.lastname,
                shipping.address,
                shipping.postal,
                shipping.city,
                shipping.country,
                shipping.phone,
                billing.firstname,
                billing.lastname,
                billing.address,
                billing.postal,
                billing.city,
                billing.country,
                payment.method
            ]);
        
        const orderId = orderResult.insertId;
        
            // Crea gli elementi dell'ordine
            for (const item of items) {
                await connection.execute(`
                    INSERT INTO order_items (
                        order_id, 
                        product_id, 
                        quantity, 
                        unit_price
                    ) VALUES (?, ?, ?, ?)
                `, [orderId, item.product_id, item.quantity, item.price]);

                // Aggiorna lo stock
                await connection.execute(`
                    UPDATE products 
                    SET stock_quantity = stock_quantity - ? 
                    WHERE id = ?
            `, [item.quantity, item.product_id]);
        }
        
            // Commit della transazione
            await connection.commit();

            // Genera il numero ordine
            const orderNumber = `ORD-${orderId.toString().padStart(6, '0')}`;
        
        res.status(201).json({
            message: 'Ordine creato con successo',
                order_id: orderNumber,
                order_details: {
                id: orderId,
                    total: total,
                    items_count: items.length
                }
            });

        } catch (error) {
            // Rollback in caso di errore
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Errore nella creazione dell\'ordine:', error);
        res.status(500).json({ error: 'Errore interno del serveur' });
    }
});

// Route per ottenere gli ordini dell'utente
router.get('/user', async (req, res) => {
    try {
        const [orders] = await req.db.execute(`
            SELECT 
                o.*,
                COUNT(oi.id) as items_count
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE o.user_id = ?
            GROUP BY o.id
            ORDER BY o.created_at DESC
        `, [req.user.userId]);

        res.json({ orders });
    } catch (error) {
        console.error('Errore nel recupero degli ordini:', error);
        res.status(500).json({ error: 'Errore interno del serveur' });
    }
});

// Route per ottenere i dettagli di un ordine specifico
router.get('/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        
        // Verifica che l'ordine appartenga all'utente
        const [orders] = await req.db.execute(`
            SELECT * FROM orders WHERE id = ? AND user_id = ?
        `, [orderId, req.user.userId]);
        
        if (orders.length === 0) {
            return res.status(404).json({ error: 'Ordine non trovato' });
        }
        
        const order = orders[0];
        
        // Ottieni gli elementi dell'ordine
        const [orderItems] = await req.db.execute(`
            SELECT 
                oi.*,
                p.name,
                p.main_image,
                p.description
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        `, [orderId]);

        res.json({
            order: {
                ...order,
                items: orderItems
            }
        });
        
    } catch (error) {
        console.error('Errore nel recupero dell\'ordine:', error);
        res.status(500).json({ error: 'Errore interno del serveur' });
    }
});

// Route per annullare un ordine (solo se in stato 'pending')
router.put('/:orderId/cancel', async (req, res) => {
    try {
        const { orderId } = req.params;
        
        // Verifica che l'ordine appartenga all'utente e sia in stato 'pending'
        const [orders] = await req.db.execute(`
            SELECT * FROM orders WHERE id = ? AND user_id = ? AND status = 'pending'
        `, [orderId, req.user.userId]);
        
        if (orders.length === 0) {
            return res.status(404).json({ error: 'Ordine non trovato o non cancellabile' });
        }

        const connection = await req.db.getConnection();
        await connection.beginTransaction();

        try {
            // Aggiorna lo stato dell'ordine
            await connection.execute(`
            UPDATE orders SET status = 'cancelled' WHERE id = ?
            `, [orderId]);
        
            // Ripristina lo stock dei prodotti
            const [orderItems] = await connection.execute(`
            SELECT product_id, quantity FROM order_items WHERE order_id = ?
            `, [orderId]);
        
        for (const item of orderItems) {
                await connection.execute(`
                    UPDATE products 
                    SET stock_quantity = stock_quantity + ? 
                    WHERE id = ?
            `, [item.quantity, item.product_id]);
        }
        
            await connection.commit();

            res.json({ message: 'Ordine cancellato con successo' });

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
        
    } catch (error) {
        console.error('Erreur lors de l\'annulation de la commande:', error);
        res.status(500).json({ error: 'Errore interno del serveur' });
    }
});

// Route per ottenere le statistiche degli ordini (per il dashboard)
router.get('/stats/summary', async (req, res) => {
    try {
        const [stats] = await req.db.execute(`
            SELECT 
                COUNT(*) as total_orders,
                SUM(total_amount) as total_spent,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
                COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders
            FROM orders 
            WHERE user_id = ?
        `, [req.user.userId]);

        res.json({ stats: stats[0] });
    } catch (error) {
        console.error('Errore nel recupero delle statistiche:', error);
        res.status(500).json({ error: 'Errore interno del serveur' });
    }
});

// Route per ottenere gli ordini recenti (ultimi 5)
router.get('/recent/list', async (req, res) => {
    try {
        const [orders] = await req.db.execute(`
            SELECT 
                o.*,
                COUNT(oi.id) as items_count
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE o.user_id = ?
            GROUP BY o.id
            ORDER BY o.created_at DESC
            LIMIT 5
        `, [req.user.userId]);

        res.json({ orders });
    } catch (error) {
        console.error('Errore nel recupero degli ordini recenti:', error);
        res.status(500).json({ error: 'Errore interno del serveur' });
    }
});

module.exports = router; 