const express = require('express');
const { authenticateToken, requireVerifiedEmail } = require('../middleware/auth');
const router = express.Router();

// Middleware per verificare l'autenticazione e la verifica email
router.use(authenticateToken, requireVerifiedEmail);

// Route per inviare un messaggio
router.post('/send', async (req, res) => {
    try {
        const { recipient_id, subject, message } = req.body;
        
        if (!recipient_id || !message) {
            return res.status(400).json({ error: 'Destinatario e messaggio richiesti' });
        }
        
        if (message.trim().length === 0) {
            return res.status(400).json({ error: 'Il messaggio non può essere vuoto' });
        }
        
        // Verificare che il destinatario esista
        const [recipients] = await req.db.execute(
            'SELECT id, username, is_artisan FROM users WHERE id = ?',
            [recipient_id]
        );
        
        if (recipients.length === 0) {
            return res.status(404).json({ error: 'Destinatario non trovato' });
        }
        
        const recipient = recipients[0];
        
        // Verificare che il destinatario sia un artigiano
        if (!recipient.is_artisan) {
            return res.status(400).json({ error: 'Puoi inviare messaggi solo agli artigiani' });
        }
        
        // Verificare che l'utente non si invii un messaggio a se stesso
        if (req.user.userId === recipient_id) {
            return res.status(400).json({ error: 'Non puoi inviarti un messaggio a te stesso' });
        }
        
        // Inserire il messaggio
        const [result] = await req.db.execute(
            'INSERT INTO messages (sender_id, recipient_id, subject, message) VALUES (?, ?, ?, ?)',
            [req.user.userId, recipient_id, subject || null, message]
        );
        
        res.status(201).json({
            message: 'Messaggio inviato con successo',
            message_id: result.insertId
        });
        
    } catch (error) {
        console.error('Errore durante l\'invio del messaggio:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

// Route per recuperare le conversazioni dell'utente
router.get('/conversations', async (req, res) => {
    try {
        // Recuperare tutte le conversazioni (messaggi inviati e ricevuti)
        const [conversations] = await req.db.execute(`
            SELECT DISTINCT 
                CASE 
                    WHEN m.sender_id = ? THEN m.recipient_id
                    ELSE m.sender_id
                END as other_user_id,
                u.username as other_username,
                u.first_name,
                u.last_name,
                u.is_artisan,
                u.profile_image,
                MAX(m.created_at) as last_message_time,
                COUNT(CASE WHEN m.recipient_id = ? AND m.is_read = FALSE THEN 1 END) as unread_count
            FROM messages m
            JOIN users u ON (
                CASE 
                    WHEN m.sender_id = ? THEN m.recipient_id
                    ELSE m.sender_id
                END = u.id
            )
            WHERE m.sender_id = ? OR m.recipient_id = ?
            GROUP BY other_user_id, u.username, u.first_name, u.last_name, u.is_artisan, u.profile_image
            ORDER BY last_message_time DESC
        `, [req.user.userId, req.user.userId, req.user.userId, req.user.userId, req.user.userId]);
        
        res.json({ conversations });
        
    } catch (error) {
        console.error('Errore durante la ricerca delle conversazioni:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

// Route per recuperare i messaggi di una conversazione specifica
router.get('/conversation/:other_user_id', async (req, res) => {
    try {
        const { other_user_id } = req.params;
        
        // Vérifier que l'autre utilisateur existe
        const [users] = await req.db.execute(
            'SELECT id, username, is_artisan FROM users WHERE id = ?',
            [other_user_id]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ error: 'Utente non trovato' });
        }
        
        // Recuperare tutti i messaggi tra i due utenti
        const [messages] = await req.db.execute(`
            SELECT 
                m.*,
                s.username as sender_username,
                s.first_name as sender_first_name,
                s.last_name as sender_last_name,
                r.username as recipient_username,
                r.first_name as recipient_first_name,
                r.last_name as recipient_last_name
            FROM messages m
            JOIN users s ON m.sender_id = s.id
            JOIN users r ON m.recipient_id = r.id
            WHERE (m.sender_id = ? AND m.recipient_id = ?) 
               OR (m.sender_id = ? AND m.recipient_id = ?)
            ORDER BY m.created_at ASC
        `, [req.user.userId, other_user_id, other_user_id, req.user.userId]);
        
        // Marcare i messaggi ricevuti come letti
        if (messages.length > 0) {
            await req.db.execute(
                'UPDATE messages SET is_read = TRUE WHERE recipient_id = ? AND sender_id = ? AND is_read = FALSE',
                [req.user.userId, other_user_id]
            );
        }
        
        res.json({ 
            messages,
            other_user: {
                id: users[0].id,
                username: users[0].username,
                is_artisan: users[0].is_artisan
            }
        });
        
    } catch (error) {
        console.error('Errore durante la ricerca della conversazione:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

// Route per recuperare i messaggi ricevuti (per gli artigiani)
router.get('/received', async (req, res) => {
    try {
        // Verificare che l'utente sia un artigiano
        if (!req.user.is_artisan) {
            return res.status(403).json({ error: 'Accesso riservato agli artigiani' });
        }
        
        const [messages] = await req.db.execute(`
            SELECT 
                m.*,
                u.username as sender_username,
                u.first_name as sender_first_name,
                u.last_name as sender_last_name,
                u.email as sender_email
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE m.recipient_id = ?
            ORDER BY m.created_at DESC
        `, [req.user.userId]);
        
        res.json({ messages });
        
    } catch (error) {
        console.error('Errore durante la ricerca dei messaggi ricevuti:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

// Route per recuperare i messaggi inviati
router.get('/sent', async (req, res) => {
    try {
        const [messages] = await req.db.execute(`
            SELECT 
                m.*,
                u.username as recipient_username,
                u.first_name as recipient_first_name,
                u.last_name as recipient_last_name,
                u.is_artisan
            FROM messages m
            JOIN users u ON m.recipient_id = u.id
            WHERE m.sender_id = ?
            ORDER BY m.created_at DESC
        `, [req.user.userId]);
        
        res.json({ messages });
        
    } catch (error) {
        console.error('Errore durante la ricerca dei messaggi inviati:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

// Route per marcare un messaggio come letto
router.put('/read/:message_id', async (req, res) => {
    try {
        const { message_id } = req.params;
        
        // Verificare che il messaggio esista e appartenga all'utente
        const [messages] = await req.db.execute(
            'SELECT id FROM messages WHERE id = ? AND recipient_id = ?',
            [message_id, req.user.userId]
        );
        
        if (messages.length === 0) {
            return res.status(404).json({ error: 'Messaggio non trovato' });
        }
        
        // Marcare come letto
        await req.db.execute(
            'UPDATE messages SET is_read = TRUE WHERE id = ?',
            [message_id]
        );
        
        res.json({ message: 'Messaggio marcato come letto' });
        
    } catch (error) {
        console.error('Errore durante la marcatura del messaggio:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

// Route per eliminare un messaggio (solo per l'utente che l'ha inviato)
router.delete('/delete/:message_id', async (req, res) => {
    try {
        const { message_id } = req.params;
        
        // Verificare che il messaggio esista e appartenga all'utente
        const [messages] = await req.db.execute(
            'SELECT id FROM messages WHERE id = ? AND sender_id = ?',
            [message_id, req.user.userId]
        );
        
        if (messages.length === 0) {
            return res.status(404).json({ error: 'Messaggio non trovato o non autorizzato' });
        }
        
        // Eliminare il messaggio
        await req.db.execute(
            'DELETE FROM messages WHERE id = ?',
            [message_id]
        );
        
        res.json({ message: 'Messaggio eliminato con successo' });
        
    } catch (error) {
        console.error('Errore durante l\'eliminazione del messaggio:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

// Route pour obtenir le nombre de messages non lus
router.get('/unread-count', async (req, res) => {
    try {
        const [result] = await req.db.execute(
            'SELECT COUNT(*) as count FROM messages WHERE recipient_id = ? AND is_read = FALSE',
            [req.user.userId]
        );
        
        res.json({ unread_count: result[0].count });
        
    } catch (error) {
        console.error('Errore durante il conteggio dei messaggi non letti:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

module.exports = router; 