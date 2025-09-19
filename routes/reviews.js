const express = require('express');
const router = express.Router();

// Middleware per verificare l'autenticazione
const authenticateUser = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'Token di autenticazione richiesto' });
        }
        
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        req.user = decoded;
        next();
        
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Token invalide' });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expiré' });
        }
        
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
};

// Route per recuperare i commenti di un prodotto
router.get('/product/:product_id', async (req, res) => {
    try {
        const { product_id } = req.params;
        const { page = 1, limit = 10, sort = 'newest' } = req.query;
        
        let query = `
            SELECT r.*, u.first_name, u.last_name, u.username, u.profile_image
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.product_id = ?
        `;
        
        const params = [product_id];
        
        // Ordinamento
        switch (sort) {
            case 'rating_desc':
                query += ' ORDER BY r.rating DESC, r.created_at DESC';
                break;
            case 'rating_asc':
                query += ' ORDER BY r.rating ASC, r.created_at DESC';
                break;
            case 'oldest':
                query += ' ORDER BY r.created_at ASC';
                break;
            default:
                query += ' ORDER BY r.created_at DESC';
        }
        
        // Paginazione
        const offset = (page - 1) * limit;
        query += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);
        
        const [reviews] = await req.db.execute(query, params);
        
        // Calcolare il totale per la paginazione
        const [countResult] = await req.db.execute(
            'SELECT COUNT(*) as total FROM reviews WHERE product_id = ?',
            [product_id]
        );
        
        const total = countResult[0].total;
        
        // Calcolare le statistiche dei commenti
        const [statsResult] = await req.db.execute(`
            SELECT 
                AVG(rating) as average_rating,
                COUNT(*) as total_reviews,
                SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
                SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
                SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
                SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
                SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
            FROM reviews 
            WHERE product_id = ?
        `, [product_id]);
        
        const stats = statsResult[0];
        
        res.json({
            reviews,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            },
            stats: {
                average_rating: parseFloat(stats.average_rating || 0).toFixed(1),
                total_reviews: stats.total_reviews,
                rating_distribution: {
                    five_star: stats.five_star,
                    four_star: stats.four_star,
                    three_star: stats.three_star,
                    two_star: stats.two_star,
                    one_star: stats.one_star
                }
            }
        });
        
    } catch (error) {
        console.error('Erreur lors de la récupération des avis:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// Route per creare un commento
router.post('/', authenticateUser, async (req, res) => {
    try {
        const { product_id, rating, comment } = req.body;
        
        // Verifica dei campi richiesti
        if (!product_id || !rating) {
            return res.status(400).json({ error: 'ID del prodotto e valutazione sono richiesti' });
        }
        
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'La valutazione deve essere compresa tra 1 e 5' });
        }
        
        // Verificare che il prodotto esista
        const [products] = await req.db.execute(
            'SELECT id FROM products WHERE id = ? AND is_active = true',
            [product_id]
        );
        
        if (products.length === 0) {
            return res.status(404).json({ error: 'Prodotto non trovato' });
        }
        
        // Verificare che l'utente non abbia già lasciato un commento per questo prodotto
        const [existingReviews] = await req.db.execute(
            'SELECT id FROM reviews WHERE user_id = ? AND product_id = ?',
            [req.user.userId, product_id]
        );
        
        if (existingReviews.length > 0) {
            return res.status(400).json({ error: 'Hai già lasciato un commento per questo prodotto' });
        }
        
        // Verificare che l'utente abbia acquistato e ricevuto questo prodotto
        const [orders] = await req.db.execute(`
            SELECT o.id FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            WHERE o.user_id = ? AND oi.product_id = ? AND o.status = 'delivered'
        `, [req.user.userId, product_id]);
        
        if (orders.length === 0) {
            return res.status(403).json({ error: 'Devi aver acquistato e ricevuto questo prodotto per lasciare un commento' });
        }
        
        // Creare il commento
        const [result] = await req.db.execute(`
            INSERT INTO reviews (product_id, user_id, rating, comment)
            VALUES (?, ?, ?, ?)
        `, [product_id, req.user.userId, rating, comment || null]);
        
        res.status(201).json({
            message: 'Commento creato con successo',
            review_id: result.insertId
        });
        
    } catch (error) {
        console.error('Erreur lors della creazione del commento:', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// Route per aggiornare un commento
router.put('/:id', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;
        
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Valutazione valida richiesta (1-5)' });
        }
        
        // Verificare che il commento esista e appartenga all'utente
        const [reviews] = await req.db.execute(
            'SELECT id FROM reviews WHERE id = ? AND user_id = ?',
            [id, req.user.userId]
        );
        
        if (reviews.length === 0) {
            return res.status(404).json({ error: 'Commento non trovato' });
        }
        
        // Aggiornare il commento
        await req.db.execute(`
            UPDATE reviews SET rating = ?, comment = ? WHERE id = ?
        `, [rating, comment || null, id]);
        
        res.json({ message: 'Commento aggiornato con successo' });
        
    } catch (error) {
        console.error('Erreur lors de l\'actualisation du commentaire:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

// Route per eliminare un commento
router.delete('/:id', authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Verificare che il commento esista e appartenga all'utente
        const [reviews] = await req.db.execute(
            'SELECT id FROM reviews WHERE id = ? AND user_id = ?',
            [id, req.user.userId]
        );
        
        if (reviews.length === 0) {
            return res.status(404).json({ error: 'Commento non trovato' });
        }
        
        // Eliminare il commento
        await req.db.execute('DELETE FROM reviews WHERE id = ?', [id]);
        
        res.json({ message: 'Commento eliminato con successo' });
        
    } catch (error) {
        console.error('Errore durante l\'eliminazione del commento:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

// Route per recuperare i commenti di un utente
router.get('/user/:user_id', async (req, res) => {
    try {
        const { user_id } = req.params;
        const { page = 1, limit = 10 } = req.query;
        
        let query = `
            SELECT r.*, p.name as product_name, p.main_image, p.id as product_id
            FROM reviews r
            JOIN products p ON r.product_id = p.id
            WHERE r.user_id = ?
            ORDER BY r.created_at DESC
        `;
        
        const params = [user_id];
        
        // Paginazione
        const offset = (page - 1) * limit;
        query += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);
        
        const [reviews] = await req.db.execute(query, params);
        
        // Calcolare il totale per la paginazione
        const [countResult] = await req.db.execute(
            'SELECT COUNT(*) as total FROM reviews WHERE user_id = ?',
            [user_id]
        );
        
        const total = countResult[0].total;
        
        res.json({
            reviews,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
        
    } catch (error) {
        console.error('Erreur lors de la récupération des commenti utilisateur:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

// Route per recuperare i commenti recenti (tutti i prodotti)
router.get('/recent/list', async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        
        const [reviews] = await req.db.execute(`
            SELECT r.*, p.name as product_name, p.main_image, p.id as product_id,
                   u.first_name, u.last_name, u.username
            FROM reviews r
            JOIN products p ON r.product_id = p.id
            JOIN users u ON r.user_id = u.id
            WHERE p.is_active = true
            ORDER BY r.created_at DESC
            LIMIT ?
        `, [parseInt(limit)]);
        
        res.json({ reviews });
        
    } catch (error) {
        console.error('Errore durante la ricerca dei commenti recenti:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

// Route per recuperare i commenti con filtri avanzati (admin solo)
router.get('/admin/filtered', authenticateUser, async (req, res) => {
    try {
        // Verificare che l'utente sia admin
        if (!req.user.is_admin) {
            return res.status(403).json({ error: 'Accesso non autorizzato' });
        }
        
        const { rating, product_id, user_id, page = 1, limit = 20 } = req.query;
        
        let query = `
            SELECT r.*, p.name as product_name, u.first_name, u.last_name, u.username
            FROM reviews r
            JOIN products p ON r.product_id = p.id
            JOIN users u ON r.user_id = u.id
            WHERE 1=1
        `;
        
        const params = [];
        
        if (rating) {
            query += ' AND r.rating = ?';
            params.push(rating);
        }
        
        if (product_id) {
            query += ' AND r.product_id = ?';
            params.push(product_id);
        }
        
        if (user_id) {
            query += ' AND r.user_id = ?';
            params.push(user_id);
        }
        
        query += ' ORDER BY r.created_at DESC';
        
        // Paginazione
        const offset = (page - 1) * limit;
        query += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);
        
        const [reviews] = await req.db.execute(query, params);
        
        // Calcolare il totale per la paginazione
        let countQuery = `
            SELECT COUNT(*) as total
            FROM reviews r
            JOIN products p ON r.product_id = p.id
            JOIN users u ON r.user_id = u.id
            WHERE 1=1
        `;
        
        const countParams = [];
        
        if (rating) {
            countQuery += ' AND r.rating = ?';
            countParams.push(rating);
        }
        
        if (product_id) {
            countQuery += ' AND r.product_id = ?';
            countParams.push(product_id);
        }
        
        if (user_id) {
            countQuery += ' AND r.user_id = ?';
            countParams.push(user_id);
        }
        
        const [countResult] = await req.db.execute(countQuery, countParams);
        const total = countResult[0].total;
        
        res.json({
            reviews,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
        
    } catch (error) {
        console.error('Errore durante la ricerca dei commenti filtrati:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

module.exports = router; 