const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const stripe = require('stripe');
const paypal = require('@paypal/checkout-server-sdk');
const sgMail = require('@sendgrid/mail');
const mysql = require('mysql2/promise');
const multer = require('multer');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3022;

// Configurazione MySQL
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    port: process.env.DB_PORT || 330,
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'artisan',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Pool di connessioni MySQL
let dbPool;
let useInMemoryDB = false;

// Database in memoria per modalità di sviluppo
let inMemoryUsers = [];
let inMemoryProducts = [];
let inMemoryOrders = [];
let inMemoryCart = [];

// Configurazione Stripe
const stripeClient = stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy');

// Configurazione PayPal
let paypalClient;
if (process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET) {
    const paypalEnvironment = new paypal.core.LiveEnvironment(
        process.env.PAYPAL_CLIENT_ID, 
        process.env.PAYPAL_CLIENT_SECRET
    );
    paypalClient = new paypal.core.PayPalHttpClient(paypalEnvironment);
}

// Configurazione Email
if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY.startsWith('SG.')) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    console.log('✅ SendGrid configurato correttamente');
}

// Configurazione Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/products/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Solo immagini sono permesse!'), false);
        }
    }
});

// Configurazione upload avatar
const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/avatars/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const avatarUpload = multer({ 
    storage: avatarStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Solo immagini sono permesse!'), false);
        }
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connessione al database
async function connectDatabase() {
    try {
        dbPool = mysql.createPool(dbConfig);
        const connection = await dbPool.getConnection();
        console.log('✅ Database MySQL connesso correttamente');
        connection.release();
        await createTables();
        return true;
    } catch (error) {
        console.error('❌ Errore connessione database:', error.message);
        console.log('🔄 Passaggio a modalità di sviluppo con database in memoria...');
        return false;
    }
}

// Crea tabelle MySQL
async function createTables() {
    try {
        const connection = await dbPool.getConnection();
        const sqlContent = fs.readFileSync('database.sql', 'utf8');
        const statements = sqlContent.split(';').filter(stmt => stmt.trim());
        
        for (let statement of statements) {
            if (statement.trim()) {
                try {
                    await connection.execute(statement);
                } catch (err) {
                    if (!err.message.includes('already exists')) {
                        console.log('⚠️  Errore SQL:', err.message);
                    }
                }
            }
        }
        
        connection.release();
        console.log('✅ Tabelle database create/verificate');
    } catch (error) {
        console.error('❌ Errore creazione tabelle:', error.message);
    }
}

// Crea dati di test per modalità in memoria
function createInMemoryData() {
    inMemoryUsers = [
        {
            id: 1,
            email: 'admin@test.com',
            password: bcrypt.hashSync('admin123', 10),
            first_name: 'Admin',
            last_name: 'User',
            role: 'admin',
            email_verified: true,
            status: 'active',
            created_at: new Date()
        },
        {
            id: 2,
            email: 'artisan@test.com',
            password: bcrypt.hashSync('artisan123', 10),
            first_name: 'Artigiano',
            last_name: 'Test',
                            role: 'artigiano',
            email_verified: true,
            status: 'active',
            created_at: new Date()
        }
    ];
    
    inMemoryProducts = [
        {
            id: 1,
            name: 'Vaso in Ceramica',
            description: 'Vaso artigianale in ceramica dipinta a mano',
            price: 45.00,
            category: 'Ceramica',
            artisan_id: 2,
            stock_quantity: 10,
            image_url: '/uploads/products/placeholder.jpg',
            created_at: new Date()
        },
        {
            id: 2,
            name: 'Braccialetto in Legno',
            description: 'Braccialetto intagliato a mano in legno naturale',
            price: 25.00,
            category: 'Gioielli',
            artisan_id: 2,
            stock_quantity: 15,
            image_url: '/uploads/products/placeholder.jpg',
            created_at: new Date()
        }
    ];
}

// Middleware autenticazione
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token di autenticazione mancante' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token non valido o scaduto' });
        }
        req.user = user;
        next();
    });
};

// Route di registrazione
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, surname, first_name, last_name, email, password, phone, birthdate, address, city, postal_code, country } = req.body;
        
        // Supporta entrambi i formati: name/surname e first_name/last_name
        const firstName = first_name || name;
        const lastName = last_name || surname;
        
        console.log('🔍 Debug registration:', { firstName, lastName, email, password: password ? 'presente' : 'mancante' });
        
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ error: 'Nome, cognome, email e password sono obbligatori' });
        }

        // Verifica se l'utente esiste già
        let existingUser = null;
        
        if (useInMemoryDB) {
            existingUser = inMemoryUsers.find(u => u.email === email);
        } else {
            const connection = await dbPool.getConnection();
            const [users] = await connection.execute(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );
            connection.release();
            existingUser = users[0];
        }

        if (existingUser) {
            return res.status(400).json({ error: 'Email già registrata' });
        }

        // Hash della password
        const hashedPassword = bcrypt.hashSync(password, 10);
        
        // Token di verifica email
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 ore

        // Genera username unico
        const username = email.split('@')[0] + '_' + Math.random().toString(36).substring(2, 8);

        let newUser = null;
        
        if (useInMemoryDB) {
            newUser = {
                id: inMemoryUsers.length + 1,
                username,
                email,
                password: hashedPassword,
                first_name: firstName,
                last_name: lastName,
                phone: phone || null,
                birthdate: birthdate || null,
                role: 'cliente',
                status: 'active',
                address: address || null,
                city: city || null,
                postal_code: postal_code || null,
                country: country || 'Italia',
                is_artisan: false,
                is_admin: false,
                email_verified: false,
                verification_token: verificationToken,
                verification_expires: verificationExpires,
                created_at: new Date(),
                updated_at: new Date()
            };
            inMemoryUsers.push(newUser);
        } else {
            const connection = await dbPool.getConnection();
            const [result] = await connection.execute(
                `INSERT INTO users (username, email, password_hash, first_name, last_name, phone, birthdate, 
                role, status, address, city, postal_code, country, email_verified, verification_token, verification_expires) 
                VALUES (?, ?, ?, ?, ?, ?, ?, 'cliente', 'active', ?, ?, ?, ?, false, ?, ?)`,
                [username, email, hashedPassword, firstName, lastName, phone || null, birthdate || null, 
                address || null, city || null, postal_code || null, country || 'Italia', verificationToken, verificationExpires]
            );
            connection.release();
            
            newUser = {
                id: result.insertId,
                username,
                email,
                first_name: firstName,
                last_name: lastName,
                role: 'cliente',
                email_verified: false
            };
        }

        // Invia email di verifica - PRODUZIONE
        try {
            const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3022'}/verify-email?token=${verificationToken}`;
            
            // Verifica che SendGrid sia configurato correttamente
            if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_API_KEY.startsWith('SG.')) {
                throw new Error('SENDGRID_API_KEY non configurata correttamente');
            }
            
            await sgMail.send({
                to: email,
                from: {
                    email: process.env.EMAIL_FROM || 'noreply@artisan.com',
                    name: 'Artigianato Online'
                },
                subject: 'Verifica il tuo account - Artigianato Online',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
                            <h2 style="color: #333; margin-bottom: 20px;">Benvenuto su Artigianato Online!</h2>
                            <p style="color: #666; margin-bottom: 30px; font-size: 16px;">
                                Grazie per esserti registrato. Per completare la registrazione e attivare il tuo account, 
                                clicca sul pulsante qui sotto:
                            </p>
                            
                            <div style="margin: 40px 0;">
                                <a href="${verificationUrl}" 
                                   style="background-color: #007bff; color: white; padding: 15px 30px; 
                                          text-decoration: none; border-radius: 8px; display: inline-block; 
                                          font-size: 16px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                    ✅ Verifica il Mio Account
                                </a>
                            </div>
                            
                            <p style="color: #dc3545; font-size: 14px; margin-top: 20px;">
                                <strong>⚠️ Importante:</strong> Questo link scade tra 24 ore.
                            </p>
                            
                            <p style="color: #666; font-size: 14px; margin-top: 20px;">
                                Se non hai creato tu questo account, ignora questa email.
                            </p>
                            
                            <div style="margin-top: 30px; padding: 15px; background-color: #e9ecef; border-radius: 5px;">
                                <p style="color: #495057; font-size: 12px; margin: 0;">
                                    <strong>🔗 Link alternativo:</strong> Se il pulsante non funziona, 
                                    copia e incolla questo link nel tuo browser:<br>
                                    <a href="${verificationUrl}" style="color: #007bff; word-break: break-all;">
                                        ${verificationUrl}
                                    </a>
                                </p>
                            </div>
                        </div>
                        
                        <div style="margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 5px;">
                            <p style="color: #666; font-size: 12px; margin: 0; text-align: center;">
                                <strong>Artigianato Online</strong><br>
                                La tua piattaforma per l'artigianato di qualità<br>
                                Non rispondere a questa email
                            </p>
                        </div>
                    </div>
                `
            });
            console.log('✅ Email di verifica inviata con successo a:', email);
        } catch (emailError) {
            console.error('❌ Errore invio email SendGrid:', emailError.message);
            console.error('🔧 Per risolvere:');
            console.error('   1. Verifica che SENDGRID_API_KEY sia configurata nel file .env');
            console.error('   2. Assicurati che la chiave API abbia permessi "Mail Send"');
            console.error('   3. Verifica che l\'email FROM sia verificata in SendGrid');
            
            // In produzione, non dovremmo continuare senza email
            return res.status(500).json({ 
                error: 'Errore nell\'invio dell\'email di verifica. Contatta il supporto tecnico.' 
            });
        }

        res.status(201).json({
            message: 'Registrazione completata con successo. Controlla la tua email per verificare l\'account.',
            user: {
                id: newUser.id,
                email: newUser.email,
                first_name: newUser.first_name,
                last_name: newUser.last_name,
                role: newUser.role,
                email_verified: newUser.email_verified
            }
        });

    } catch (error) {
        console.error('❌ Errore registrazione:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

// Route di autenticazione
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email e password sono obbligatori' });
        }

        let user = null;
        
        if (useInMemoryDB) {
            user = inMemoryUsers.find(u => u.email === email);
            if (!user || !bcrypt.compareSync(password, user.password)) {
                return res.status(401).json({ error: 'Credenziali non valide' });
            }
        } else {
            const connection = await dbPool.getConnection();
            const [users] = await connection.execute(
                'SELECT * FROM users WHERE email = ? AND status = "active"',
                [email]
            );
            connection.release();
            
            if (users.length === 0) {
                return res.status(401).json({ error: 'Credenziali non valide' });
            }
            
            user = users[0];
            if (!bcrypt.compareSync(password, user.password_hash)) {
                return res.status(401).json({ error: 'Credenziali non valide' });
            }
        }

        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email, 
                role: user.role,
                email_verified: user.email_verified 
            },
            process.env.JWT_SECRET || 'fallback-secret',
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role,
                email_verified: user.email_verified
            }
        });

    } catch (error) {
        console.error('❌ Errore login:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

// Route verifica email
app.post('/api/auth/verify-email', async (req, res) => {
    try {
        const { token } = req.body;
        
        if (!token) {
            return res.status(400).json({ error: 'Token di verifica richiesto' });
        }

        let user = null;
        
        if (useInMemoryDB) {
            user = inMemoryUsers.find(u => u.verification_token === token);
        } else {
            const connection = await dbPool.getConnection();
            const [users] = await connection.execute(
                'SELECT * FROM users WHERE verification_token = ? AND verification_expires > NOW()',
                [token]
            );
            connection.release();
            user = users[0];
        }

        if (!user) {
            return res.status(400).json({ error: 'Token di verifica non valido o scaduto' });
        }

        // Aggiorna lo stato di verifica
        if (useInMemoryDB) {
            user.email_verified = true;
            user.verification_token = null;
            user.verification_expires = null;
        } else {
            const connection = await dbPool.getConnection();
            await connection.execute(
                'UPDATE users SET email_verified = true, verification_token = NULL, verification_expires = NULL WHERE id = ?',
                [user.id]
            );
            connection.release();
        }

        console.log('✅ Email verificata per:', user.email);
        res.json({ 
            message: 'Email verificata con successo! Ora puoi accedere al tuo account.',
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                email_verified: true
            }
        });

    } catch (error) {
        console.error('❌ Errore verifica email:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

// Route validazione token
app.post('/api/auth/validate-token', authenticateToken, (req, res) => {
    try {
        // Se arriviamo qui, il token è valido
        res.json({ 
            valid: true, 
            user: {
                id: req.user.id,
                email: req.user.email,
                role: req.user.role,
                email_verified: req.user.email_verified
            }
        });
    } catch (error) {
        console.error('❌ Errore validazione token:', error);
        res.status(401).json({ valid: false, error: 'Token non valido' });
    }
});

// Route per ottenere i dati completi dell'utente
app.get('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        let user = null;
        
        if (useInMemoryDB) {
            user = inMemoryUsers.find(u => u.id === req.user.id);
        } else {
            const connection = await dbPool.getConnection();
            
            // Prima recupera i dati utente
            const [users] = await connection.execute(
                'SELECT id, username, email, first_name, last_name, phone, birthdate, address, city, postal_code, country, role, status, is_artisan, is_admin, profile_image, bio, email_verified, created_at FROM users WHERE id = ?',
                [req.user.id]
            );
            user = users[0];
            
            // Se first_name o last_name sono vuoti, cerca nelle informazioni personali delle ordini
            if (((!user.first_name || user.first_name === '') || (!user.last_name || user.last_name === '')) && user) {
                console.log('🔍 Ricerca informazioni personali nelle ordini per utente:', req.user.id);
                
                const [orders] = await connection.execute(
                    'SELECT shipping_first_name, shipping_last_name FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
                    [req.user.id]
                );
                
                if (orders.length > 0) {
                    const order = orders[0];
                    console.log('📋 Informazioni trovate nelle ordini:', {
                        shipping_first_name: order.shipping_first_name,
                        shipping_last_name: order.shipping_last_name
                    });
                    
                    // Usa le informazioni delle ordini come fallback
                    if ((!user.first_name || user.first_name === '') && order.shipping_first_name) {
                        user.first_name = order.shipping_first_name;
                        console.log('✅ Nome copiato dalle informazioni personali:', user.first_name);
                    }
                    
                    if ((!user.last_name || user.last_name === '') && order.shipping_last_name) {
                        user.last_name = order.shipping_last_name;
                        console.log('✅ Cognome copiato dalle informazioni personali:', user.last_name);
                    }
                } else {
                    console.log('ℹ️ Nessuna ordine trovata per questo utente');
                }
            }
            
            connection.release();
        }

        if (!user) {
            return res.status(404).json({ error: 'Utente non trovato' });
        }

        res.json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                phone: user.phone,
                birthdate: user.birthdate,
                address: user.address,
                city: user.city,
                postal_code: user.postal_code,
                country: user.country,
                role: user.role,
                status: user.status,
                is_artisan: user.is_artisan,
                is_admin: user.is_admin,
                profile_image: user.profile_image,
                bio: user.bio,
                email_verified: user.email_verified,
                created_at: user.created_at
            }
        });

    } catch (error) {
        console.error('❌ Errore recupero profilo utente:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

// Route upload avatar
app.post('/api/user/avatar', authenticateToken, avatarUpload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Nessun file caricato' });
        }

        const avatarUrl = `/uploads/avatars/${req.file.filename}`;
        
        if (useInMemoryDB) {
            // Aggiorna l'avatar in memoria
            const user = inMemoryUsers.find(u => u.id === req.user.id);
            if (user) {
                user.profile_image = avatarUrl;
            }
        } else {
            // Aggiorna l'avatar nel database
            const connection = await dbPool.getConnection();
            await connection.execute(
                'UPDATE users SET profile_image = ? WHERE id = ?',
                [avatarUrl, req.user.id]
            );
            connection.release();
        }

        console.log('✅ Avatar aggiornato per utente:', req.user.id);
        res.json({ 
            message: 'Avatar aggiornato con successo',
            avatar_url: avatarUrl 
        });

    } catch (error) {
        console.error('❌ Errore upload avatar:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

// Route prodotti
app.get('/api/products', async (req, res) => {
    try {
        if (useInMemoryDB) {
            res.json(inMemoryProducts);
        } else {
            const connection = await dbPool.getConnection();
            const [products] = await connection.execute('SELECT * FROM products ORDER BY created_at DESC');
            connection.release();
            res.json(products);
        }
    } catch (error) {
        console.error('❌ Errore ottenimento prodotti:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

// Route principale
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Route per le pagine frontend
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.get('/products', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.get('/cart', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.get('/orders', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.get('/verify-email', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.get('/test-verify', (req, res) => {
    res.sendFile(path.join(__dirname, 'test_verify_page.html'));
});

app.get('/reset-password', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Route catch-all per SPA (Single Page Application)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Avvio server
async function startServer() {
    const mysqlConnected = await connectDatabase();
    
    if (!mysqlConnected) {
        useInMemoryDB = true;
        createInMemoryData();
        console.log('✅ Dati di test creati per database in memoria');
    }
    
    app.listen(PORT, () => {
        console.log(`
🚀 SERVER UNICO AVVIATO!
==================================================
📱 Frontend: http://localhost:${PORT}
🔧 API: http://localhost:${PORT}/api/*
🗄️  Database: ${useInMemoryDB ? 'In Memoria (MySQL non disponibile)' : 'MySQL REALE'}
💳 Pagamenti: ${useInMemoryDB ? 'Simulati' : 'Stripe + PayPal REALI'}
📧 Email: ${useInMemoryDB ? 'Simulate' : 'SendGrid REALE'}
🖼️  Immagini: Salvate in uploads/products/
🔐 JWT: Sicurezza REALE
⚠️  MODALITÀ: ${useInMemoryDB ? 'SVILUPPO (dati in memoria)' : 'PRODUZIONE (MySQL)'}
📝 TEST ACCOUNTS (se in memoria):
   - Admin: admin@test.com / admin123
   - Artigiano: artisan@test.com / artisan123
🛑 Per fermare: Ctrl+C
==================================================
        `);
    });
}

startServer().catch(console.error);
