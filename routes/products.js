const express = require('express');
const router = express.Router();

// Route per recuperare tutti i prodotti
router.get('/', async (req, res) => {
    try {
        const { category, search, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;
        
        let query = `
            SELECT p.*, c.name as category_name, u.first_name, u.last_name, u.username as artisan_username,
                   (SELECT AVG(rating) FROM reviews WHERE product_id = p.id) as average_rating,
                   (SELECT COUNT(*) FROM reviews WHERE product_id = p.id) as review_count
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN users u ON p.artisan_id = u.id
            WHERE p.is_active = true
        `;
        
        const params = [];
        
        // Filtro per categoria
        if (category) {
            query += ' AND c.id = ?';
            params.push(category);
        }
        
        // Ricerca per nome o descrizione
        if (search) {
            query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }
        
        // Filtro per prezzo
        if (minPrice) {
            query += ' AND p.price >= ?';
            params.push(minPrice);
        }
        
        if (maxPrice) {
            query += ' AND p.price <= ?';
            params.push(maxPrice);
        }
        
        // Ordinamento
        switch (sort) {
            case 'price_asc':
                query += ' ORDER BY p.price ASC';
                break;
            case 'price_desc':
                query += ' ORDER BY p.price DESC';
                break;
            case 'rating':
                query += ' ORDER BY average_rating DESC';
                break;
            case 'newest':
                query += ' ORDER BY p.created_at DESC';
                break;
            default:
                query += ' ORDER BY p.created_at DESC';
        }
        
        // Paginazione
        const offset = (page - 1) * limit;
        query += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);
        
        const [products] = await req.db.execute(query, params);
        
        // Calcolare il totale per la paginazione
        let countQuery = `
            SELECT COUNT(*) as total
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.is_active = true
        `;
        
        const countParams = [];
        
        if (category) {
            countQuery += ' AND c.id = ?';
            countParams.push(category);
        }
        
        if (search) {
            countQuery += ' AND (p.name LIKE ? OR p.description LIKE ?)';
            countParams.push(`%${search}%`, `%${search}%`);
        }
        
        if (minPrice) {
            countQuery += ' AND p.price >= ?';
            countParams.push(minPrice);
        }
        
        if (maxPrice) {
            countQuery += ' AND p.price <= ?';
            countParams.push(maxPrice);
        }
        
        const [countResult] = await req.db.execute(countQuery, countParams);
        const total = countResult[0].total;
        
        res.json({
            products,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
        
    } catch (error) {
        console.error('Errore durante la ricerca dei prodotti:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

// Route per recuperare un prodotto per ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [products] = await req.db.execute(`
            SELECT p.*, c.name as category_name, u.first_name, u.last_name, u.username as artisan_username, u.bio as artisan_bio
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN users u ON p.artisan_id = u.id
            WHERE p.id = ? AND p.is_active = true
        `, [id]);
        
        if (products.length === 0) {
            return res.status(404).json({ error: 'Prodotto non trovato' });
        }
        
        const product = products[0];
        
        // Recuperare i commenti del prodotto
        const [reviews] = await req.db.execute(`
            SELECT r.*, u.first_name, u.last_name, u.username
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.product_id = ?
            ORDER BY r.created_at DESC
        `, [id]);
        
        // Recuperare i prodotti simili
        const [similarProducts] = await req.db.execute(`
            SELECT p.*, c.name as category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.category_id = ? AND p.id != ? AND p.is_active = true
            LIMIT 4
        `, [product.category_id, id]);
        
        product.reviews = reviews;
        product.similar_products = similarProducts;
        
        res.json({ product });
        
    } catch (error) {
        console.error('Errore durante la ricerca del prodotto:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

// Route per recuperare i prodotti in evidenza
router.get('/featured/list', async (req, res) => {
    try {
        const [products] = await req.db.execute(`
            SELECT p.*, c.name as category_name, u.first_name, u.last_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN users u ON p.artisan_id = u.id
            WHERE p.is_featured = true AND p.is_active = true
            ORDER BY p.created_at DESC
            LIMIT 8
        `);
        
        res.json({ products });
        
    } catch (error) {
        console.error('Errore durante la ricerca dei prodotti in evidenza:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

// Route per recuperare le categorie
router.get('/categories/list', async (req, res) => {
    try {
        const [categories] = await req.db.execute(`
            SELECT c.*, COUNT(p.id) as product_count
            FROM categories c
            LEFT JOIN products p ON c.id = p.category_id AND p.is_active = true
            GROUP BY c.id
            ORDER BY c.name
        `);
        
        res.json({ categories });
        
    } catch (error) {
        console.error('Errore durante la ricerca delle categorie:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

// Route per creare un prodotto (artigiano solo)
router.post('/', async (req, res) => {
    try {
        // Verifica del token JWT
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'Token di autenticazione richiesto' });
        }
        
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Verifica che l'utente sia un artigiano
        if (!decoded.is_artisan) {
            return res.status(403).json({ error: 'Solo gli artigiani possono creare prodotti' });
        }
        
        const { name, description, price, stock_quantity, category_id, images, dimensions, weight, materials, techniques } = req.body;
        
        // Verifica dei campi richiesti
        if (!name || !description || !price || !category_id) {
            return res.status(400).json({ error: 'Nome, descrizione, prezzo e categoria sono richiesti' });
        }
        
        // Inserimento del prodotto
        const [result] = await req.db.execute(`
            INSERT INTO products (name, description, price, stock_quantity, category_id, artisan_id, images, dimensions, weight, materials, techniques)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [name, description, price, stock_quantity || 0, category_id, decoded.userId, JSON.stringify(images || []), dimensions, weight, materials, techniques]);
        
        res.status(201).json({
            message: 'Prodotto creato con successo',
            product_id: result.insertId
        });
        
    } catch (error) {
        console.error('Errore durante la creazione del prodotto:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Token invalide' });
        }
        
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

// Route per aggiornare un prodotto (artigiano proprietario solo)
router.put('/:id', async (req, res) => {
    try {
        // Verifica del token JWT
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'Token di autenticazione richiesto' });
        }
        
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        const { id } = req.params;
        const { name, description, price, stock_quantity, category_id, images, dimensions, weight, materials, techniques, is_active } = req.body;
        
        // Verifica che l'utente sia il proprietario del prodotto
        const [products] = await req.db.execute(
            'SELECT artisan_id FROM products WHERE id = ?',
            [id]
        );
        
        if (products.length === 0) {
            return res.status(404).json({ error: 'Prodotto non trovato' });
        }
        
        if (products[0].artisan_id !== decoded.userId && !decoded.is_admin) {
            return res.status(403).json({ error: 'Non sei autorizzato a modificare questo prodotto' });
        }
        
        // Aggiornamento del prodotto
        await req.db.execute(`
            UPDATE products 
            SET name = ?, description = ?, price = ?, stock_quantity = ?, category_id = ?, 
                images = ?, dimensions = ?, weight = ?, materials = ?, techniques = ?, is_active = ?
            WHERE id = ?
        `, [name, description, price, stock_quantity, category_id, JSON.stringify(images || []), dimensions, weight, materials, techniques, is_active, id]);
        
        res.json({ message: 'Prodotto aggiornato con successo' });
        
    } catch (error) {
        console.error('Errore durante l\'aggiornamento del prodotto:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

// Route per eliminare un prodotto (artigiano proprietario solo)
router.delete('/:id', async (req, res) => {
    try {
        // Verifica del token JWT
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'Token di autenticazione richiesto' });
        }
        
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        const { id } = req.params;
        
        // Verifica che l'utente sia il proprietario del prodotto
        const [products] = await req.db.execute(
            'SELECT artisan_id FROM products WHERE id = ?',
            [id]
        );
        
        if (products.length === 0) {
            return res.status(404).json({ error: 'Prodotto non trovato' });
        }
        
        if (products[0].artisan_id !== decoded.userId && !decoded.is_admin) {
            return res.status(403).json({ error: 'Non sei autorizzato a eliminare questo prodotto' });
        }
        
        // Eliminazione logica (disattivazione)
        await req.db.execute(
            'UPDATE products SET is_active = false WHERE id = ?',
            [id]
        );
        
        res.json({ message: 'Prodotto eliminato con successo' });
        
    } catch (error) {
        console.error('Errore durante l\'eliminazione del prodotto:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

// Route per ottenere la lista degli artisans
router.get('/artisans', async (req, res) => {
    try {
        const [artisans] = await req.db.execute(`
            SELECT 
                id, 
                username, 
                first_name, 
                last_name, 
                email, 
                profile_image, 
                bio,
                is_artisan
            FROM users 
            WHERE is_artisan = true 
            ORDER BY first_name, last_name
        `);
        
        res.json({ artisans });
    } catch (error) {
        console.error('Errore nel recupero degli artisans:', error);
        res.status(500).json({ error: 'Errore interno del serveur' });
    }
});

module.exports = router; 