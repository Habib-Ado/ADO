const express = require('express');
const { requireVerifiedUser } = require('../middleware/auth');
const router = express.Router();

// Tutte le route del panier necessitano un'autenticazione e una verifica email
router.use(requireVerifiedUser);

// Route per recuperare il contenuto del panier
router.get('/', async (req, res) => {
    try {
        const [cartItems] = await req.db.execute(`
            SELECT ci.*, p.name, p.price, p.main_image, p.stock_quantity, p.is_active
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.user_id = ? AND p.is_active = true
            ORDER BY ci.created_at DESC
        `, [req.user.userId]);
        
        // Calculer le total
        let total = 0;
        const items = cartItems.map(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            return {
                ...item,
                item_total: itemTotal
            };
        });
        
        res.json({
            items,
            total: parseFloat(total.toFixed(2)),
            item_count: items.length
        });
        
    } catch (error) {
        console.error('Errore durante la ricerca del panier:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

// Route per aggiungere un prodotto al paniere
router.post('/add', async (req, res) => {
    try {
        const { product_id, quantity = 1 } = req.body;
        
        if (!product_id) {
            return res.status(400).json({ error: 'ID del prodotto richiesto' });
        }
        
        if (quantity < 1) {
            return res.status(400).json({ error: 'La quantità deve essere superiore a 0' });
        }
        
        // Verificare che il prodotto esista e sia attivo
        const [products] = await req.db.execute(
            'SELECT id, price, stock_quantity FROM products WHERE id = ? AND is_active = true',
            [product_id]
        );
        
        if (products.length === 0) {
            return res.status(404).json({ error: 'Prodotto non trovato' });
        }
        
        const product = products[0];
        
        // Verificare il stock
        if (product.stock_quantity < quantity) {
            return res.status(400).json({ error: 'Stock insufficiente per questo prodotto' });
        }
        
        // Verificare se il prodotto è già nel paniere
        const [existingItems] = await req.db.execute(
            'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?',
            [req.user.userId, product_id]
        );
        
        if (existingItems.length > 0) {
            // Aggiornare la quantità
            const newQuantity = existingItems[0].quantity + quantity;
            
            if (newQuantity > product.stock_quantity) {
                return res.status(400).json({ error: 'Stock insufficiente per questa quantità' });
            }
            
            await req.db.execute(
                'UPDATE cart_items SET quantity = ? WHERE id = ?',
                [newQuantity, existingItems[0].id]
            );
            
            res.json({ 
                message: 'Quantità aggiornata nel paniere',
                quantity: newQuantity
            });
        } else {
            // Ajouter le produit au panier
            await req.db.execute(
                'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
                [req.user.userId, product_id, quantity]
            );
            
            res.status(201).json({ 
                message: 'Prodotto aggiunto al carrello',
                quantity: quantity
            });
        }
        
    } catch (error) {
        console.error('Errore durante l\'aggiunta al carrello:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

// Route per aggiornare la quantità di un prodotto nel carrello
router.put('/update/:product_id', async (req, res) => {
    try {
        const { product_id } = req.params;
        const { quantity } = req.body;
        
        if (!quantity || quantity < 1) {
            return res.status(400).json({ error: 'Quantità valida richiesta' });
        }
        
        // Verificare che il prodotto esista e sia attivo
        const [products] = await req.db.execute(
            'SELECT stock_quantity FROM products WHERE id = ? AND is_active = true',
            [product_id]
        );
        
        if (products.length === 0) {
            return res.status(404).json({ error: 'Prodotto non trovato' });
        }
        
        // Verificare il stock
        if (products[0].stock_quantity < quantity) {
            return res.status(400).json({ error: 'Stock insufficiente per questa quantità' });
        }
        
        // Verificare che il prodotto sia nel carrello dell'utente
        const [cartItems] = await req.db.execute(
            'SELECT id FROM cart_items WHERE user_id = ? AND product_id = ?',
            [req.user.userId, product_id]
        );
        
        if (cartItems.length === 0) {
            return res.status(404).json({ error: 'Prodotto non trovato nel carrello' });
        }
        
        // Mettre à jour la quantité
        await req.db.execute(
            'UPDATE cart_items SET quantity = ? WHERE id = ?',
            [quantity, cartItems[0].id]
        );
        
        res.json({ 
            message: 'Quantità aggiornata',
            quantity: quantity
        });
        
    } catch (error) {
        console.error('Errore durante l\'aggiornamento della quantità:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

// Route per eliminare un prodotto dal carrello
router.delete('/remove/:product_id', async (req, res) => {
    try {
        const { product_id } = req.params;
        
        // Eliminare il prodotto dal carrello
        const [result] = await req.db.execute(
            'DELETE FROM cart_items WHERE user_id = ? AND product_id = ?',
            [req.user.userId, product_id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Prodotto non trovato nel carrello' });
        }
        
        res.json({ message: 'Prodotto eliminato dal carrello' });
        
    } catch (error) {
        console.error('Errore durante l\'eliminazione del carrello:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

// Route per svuotare il carrello
router.delete('/clear', async (req, res) => {
    try {
        await req.db.execute(
            'DELETE FROM cart_items WHERE user_id = ?',
            [req.user.userId]
        );
        
        res.json({ message: 'Carrello svuotato con successo' });
        
    } catch (error) {
        console.error('Errore durante l\'eliminazione del carrello:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

// Route per recuperare il numero di articoli nel carrello
router.get('/count', async (req, res) => {
    try {
        const [result] = await req.db.execute(
            'SELECT COUNT(*) as count FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.user_id = ? AND p.is_active = true',
            [req.user.userId]
        );
        
        res.json({ count: result[0].count });
        
    } catch (error) {
        console.error('Errore durante il conteggio del carrello:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

// Route per verificare la disponibilità dei prodotti nel carrello
router.get('/check-availability', async (req, res) => {
    try {
        const [cartItems] = await req.db.execute(`
            SELECT ci.product_id, ci.quantity, p.name, p.stock_quantity, p.is_active
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.user_id = ?
        `, [req.user.userId]);
        
        const availability = cartItems.map(item => ({
            product_id: item.product_id,
            name: item.name,
            requested_quantity: item.quantity,
            available_quantity: item.stock_quantity,
            is_available: item.is_active && item.stock_quantity >= item.quantity,
            status: item.is_active && item.stock_quantity >= item.quantity ? 'available' : 
                   !item.is_active ? 'unavailable' : 'insufficient_stock'
        }));
        
        const allAvailable = availability.every(item => item.is_available);
        
        res.json({
            availability,
            all_available: allAvailable
        });
        
    } catch (error) {
        console.error('Errore durante la verifica della disponibilità:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

module.exports = router; 