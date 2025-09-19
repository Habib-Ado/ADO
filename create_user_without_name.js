const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

// Script per creare un utente senza nome e testare il fallback
async function createUserWithoutName() {
    console.log('👤 Creazione utente senza nome per testare il fallback...\n');
    
    // Configurazione database
    const dbConfig = {
        host: 'localhost',
        user: 'root',
        port: 330,
        password: '1234',
        database: 'artisan'
    };
    
    try {
        // Connessione al database
        const connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connessione al database riuscita');
        
        // Email unica per il test
        const testEmail = `test_fallback_${Date.now()}@example.com`;
        const hashedPassword = bcrypt.hashSync('test123', 10);
        
        // Crea l'utente senza nome e cognome
        const [userResult] = await connection.execute(`
            INSERT INTO users (
                username,
                email,
                password_hash,
                first_name,
                last_name,
                role,
                email_verified,
                status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            `user_${Date.now()}`,
            testEmail,
            hashedPassword,
            '', // first_name vuoto
            '', // last_name vuoto
            'cliente',
            true,
            'active'
        ]);
        
        const userId = userResult.insertId;
        console.log('✅ Utente creato con ID:', userId);
        console.log('📧 Email:', testEmail);
        console.log('🔑 Password: test123');
        console.log('📋 Nome e cognome: VUOTI');
        
        // Crea un'ordine con informazioni personali
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
                payment_method,
                payment_status,
                created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
            userId,
            75.00,
            8.00,
            'express',
            'pending',
            'Giuseppe',
            'Bianchi',
            'Via Milano 456',
            '20100',
            'Milano',
            'Italia',
            '+39 987654321',
            'Giuseppe',
            'Bianchi',
            'Via Milano 456',
            '20100',
            'Milano',
            'Italia',
            'paypal',
            'pending'
        ]);
        
        console.log('✅ Ordine creato con ID:', orderResult.insertId);
        console.log('📋 Informazioni personali nell\'ordine:');
        console.log('   - Nome: Giuseppe');
        console.log('   - Cognome: Bianchi');
        
        // Test del fallback
        console.log('\n🔍 Test del fallback...');
        
        const [users] = await connection.execute(
            'SELECT id, email, first_name, last_name FROM users WHERE id = ?',
            [userId]
        );
        
        if (users.length > 0) {
            const user = users[0];
            console.log('📊 Dati utente dal database:', {
                first_name: user.first_name || '(vuoto)',
                last_name: user.last_name || '(vuoto)',
                email: user.email
            });
            
            // Simula la logica di fallback
            let finalFirstName = user.first_name;
            let finalLastName = user.last_name;
            
            if (!finalFirstName || !finalLastName) {
                console.log('🔍 Ricerca informazioni personali nelle ordini...');
                
                const [orders] = await connection.execute(
                    'SELECT shipping_first_name, shipping_last_name FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
                    [userId]
                );
                
                if (orders.length > 0) {
                    const order = orders[0];
                    console.log('📋 Informazioni trovate nelle ordini:', {
                        shipping_first_name: order.shipping_first_name,
                        shipping_last_name: order.shipping_last_name
                    });
                    
                    if (!finalFirstName && order.shipping_first_name) {
                        finalFirstName = order.shipping_first_name;
                        console.log('✅ Nome copiato dalle informazioni personali:', finalFirstName);
                    }
                    
                    if (!finalLastName && order.shipping_last_name) {
                        finalLastName = order.shipping_last_name;
                        console.log('✅ Cognome copiato dalle informazioni personali:', finalLastName);
                    }
                }
            }
            
            console.log('\n🎯 RISULTATO FINALE:');
            console.log('- Nome finale:', finalFirstName || '(ancora vuoto)');
            console.log('- Cognome finale:', finalLastName || '(ancora vuoto)');
            console.log('- Nome completo:', `${finalFirstName || ''} ${finalLastName || ''}`.trim() || '(nessun nome)');
            
            if (finalFirstName === 'Giuseppe' && finalLastName === 'Bianchi') {
                console.log('✅ SUCCESSO: Il fallback funziona correttamente!');
            } else {
                console.log('❌ Il fallback non ha funzionato come previsto');
            }
        }
        
        await connection.end();
        
        console.log('\n💡 INFORMAZIONI PER IL TEST:');
        console.log('- Email:', testEmail);
        console.log('- Password: test123');
        console.log('- Il nome dovrebbe essere "Giuseppe Bianchi" (dal fallback)');
        console.log('- Prova a fare login e andare al profilo');
        
    } catch (error) {
        console.error('❌ Errore:', error.message);
    }
}

// Esegui lo script
createUserWithoutName();
