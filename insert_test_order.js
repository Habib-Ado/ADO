const mysql = require('mysql2/promise');

// Script per inserire direttamente un'ordine di test nel database
async function insertTestOrder() {
    console.log('🗄️ Inserimento ordine di test direttamente nel database...\n');
    
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
        
        // Trova l'utente di test
        const [users] = await connection.execute(
            'SELECT id, email, first_name, last_name FROM users WHERE email = ?',
            ['test_verify_1755469080358@example.com']
        );
        
        if (users.length === 0) {
            console.log('❌ Utente di test non trovato');
            return;
        }
        
        const user = users[0];
        console.log('👤 Utente trovato:', {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name
        });
        
        // Inserisci l'ordine di test con informazioni personali
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
            user.id,
            50.00,
            5.00,
            'standard',
            'pending',
            'Mario',
            'Rossi',
            'Via Roma 123',
            '00100',
            'Roma',
            'Italia',
            '+39 123456789',
            'Mario',
            'Rossi',
            'Via Roma 123',
            '00100',
            'Roma',
            'Italia',
            'card',
            'pending'
        ]);
        
        console.log('✅ Ordine di test inserito con ID:', orderResult.insertId);
        console.log('📋 Informazioni personali salvate:');
        console.log('   - Nome: Mario');
        console.log('   - Cognome: Rossi');
        
        // Test del profilo per verificare il fallback
        console.log('\n🔍 Test del profilo per verificare il fallback...');
        
        const [profileUsers] = await connection.execute(
            'SELECT id, email, first_name, last_name FROM users WHERE id = ?',
            [user.id]
        );
        
        if (profileUsers.length > 0) {
            const profileUser = profileUsers[0];
            console.log('📊 Dati utente dal database:', {
                first_name: profileUser.first_name,
                last_name: profileUser.last_name,
                email: profileUser.email
            });
            
            // Simula la logica di fallback
            let finalFirstName = profileUser.first_name;
            let finalLastName = profileUser.last_name;
            
            if (!finalFirstName || !finalLastName) {
                console.log('🔍 Ricerca informazioni personali nelle ordini...');
                
                const [orders] = await connection.execute(
                    'SELECT shipping_first_name, shipping_last_name FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
                    [user.id]
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
            console.log('- Nome finale:', finalFirstName);
            console.log('- Cognome finale:', finalLastName);
            console.log('- Nome completo:', `${finalFirstName} ${finalLastName}`);
            
            if (finalFirstName === 'Mario' && finalLastName === 'Rossi') {
                console.log('✅ SUCCESSO: Il fallback funziona correttamente!');
            } else {
                console.log('ℹ️ Nome presente ma non dalle informazioni personali');
            }
        }
        
        await connection.end();
        console.log('\n✅ Test completato');
        
    } catch (error) {
        console.error('❌ Errore:', error.message);
    }
}

// Esegui lo script
insertTestOrder();
