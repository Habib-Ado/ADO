const express = require('express');
const router = express.Router();

// Route per ottenere tutte le filiali attive
router.get('/', async (req, res) => {
    try {
        const [branches] = await req.db.execute(`
            SELECT 
                id, 
                name, 
                address, 
                city, 
                postal_code, 
                phone, 
                email, 
                opening_hours
            FROM branches 
            WHERE is_active = true 
            ORDER BY city, name
        `);
        
        res.json({ branches });
    } catch (error) {
        console.error('Errore nel recupero delle filiali:', error);
        res.status(500).json({ error: 'Errore interno del serveur' });
    }
});

// Route per ottenere una filiale specifica
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [branches] = await req.db.execute(`
            SELECT * FROM branches WHERE id = ? AND is_active = true
        `, [id]);
        
        if (branches.length === 0) {
            return res.status(404).json({ error: 'Filiale non trovata' });
        }
        
        res.json({ branch: branches[0] });
    } catch (error) {
        console.error('Errore nel recupero della filiale:', error);
        res.status(500).json({ error: 'Errore interno del serveur' });
    }
});

// Route per cercare filiali per città
router.get('/search/city/:city', async (req, res) => {
    try {
        const { city } = req.params;
        
        const [branches] = await req.db.execute(`
            SELECT 
                id, 
                name, 
                address, 
                city, 
                postal_code, 
                phone, 
                email, 
                opening_hours
            FROM branches 
            WHERE is_active = true AND city LIKE ?
            ORDER BY name
        `, [`%${city}%`]);
        
        res.json({ branches });
    } catch (error) {
        console.error('Errore nella ricerca filiali:', error);
        res.status(500).json({ error: 'Errore interno del serveur' });
    }
});

module.exports = router; 