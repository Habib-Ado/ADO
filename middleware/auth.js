const jwt = require('jsonwebtoken');

// Middleware pour vérifier l'authentification
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token d\'authentification requis' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'Token expiré' });
            }
            return res.status(403).json({ error: 'Token invalide' });
        }

        req.user = user;
        next();
    });
};

// Middleware per verificare se la sessione è ancora attiva (30 minuti)
const requireActiveSession = (req, res, next) => {
    if (!req.user || !req.user.iat) {
        return res.status(401).json({ error: 'Sessione non valida' });
    }

    const tokenAge = Math.floor(Date.now() / 1000) - req.user.iat;
    const maxAge = 30 * 60; // 30 minuti in secondi

    if (tokenAge > maxAge) {
        return res.status(401).json({ 
            error: 'Sessione scaduta per inattività. Effettua nuovamente l\'accesso.',
            sessionExpired: true
        });
    }

    next();
};

// Middleware pour vérifier que l'email est vérifié
const requireVerifiedEmail = (req, res, next) => {
    if (!req.user.email_verified) {
        return res.status(403).json({ 
            error: 'Votre compte doit être vérifié pour effectuer cette action',
            requiresVerification: true
        });
    }
    next();
};

// Middleware pour vérifier les permissions d'artisan
const requireArtisan = (req, res, next) => {
    if (!req.user.is_artisan) {
        return res.status(403).json({ error: 'Accès réservé aux artisans' });
    }
    next();
};

// Middleware pour vérifier les permissions d'administrateur
const requireAdmin = (req, res, next) => {
    if (!req.user.is_admin) {
        return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
    }
    next();
};

// Middleware combiné pour les achats (authentifié + email vérifié)
const requireVerifiedUser = [authenticateToken, requireVerifiedEmail];

module.exports = {
    authenticateToken,
    requireActiveSession,
    requireVerifiedEmail,
    requireArtisan,
    requireAdmin,
    requireVerifiedUser
}; 