const http = require('http');

// Script per creare una ordine di test con informazioni personali
async function createTestOrder() {
    console.log('🛒 Creazione ordine di test con informazioni personali...\n');
    
    // Login con l'utente di test
    const loginData = JSON.stringify({
        email: 'test_verify_1755469080358@example.com',
        password: 'test123'
    });
    
    const loginOptions = {
        hostname: 'localhost',
        port: 3022,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(loginData)
        }
    };
    
    const loginReq = http.request(loginOptions, (loginRes) => {
        let loginResponseData = '';
        
        loginRes.on('data', (chunk) => {
            loginResponseData += chunk;
        });
        
        loginRes.on('end', () => {
            try {
                const loginData = JSON.parse(loginResponseData);
                
                if (loginRes.statusCode === 200 && loginData.token) {
                    console.log('✅ Login riuscito');
                    
                    // Crea l'ordine di test
                    createOrder(loginData.token);
                    
                } else {
                    console.log('❌ Login fallito:', loginData);
                }
            } catch (error) {
                console.log('❌ Errore parsing login:', error.message);
            }
        });
    });
    
    loginReq.on('error', (error) => {
        console.error('❌ Errore login:', error.message);
    });
    
    loginReq.write(loginData);
    loginReq.end();
}

function createOrder(token) {
    console.log('\n📦 Creazione ordine di test...');
    
    // Dati dell'ordine con informazioni personali
    const orderData = JSON.stringify({
        total_amount: 50.00,
        shipping_cost: 5.00,
        shipping_method: 'standard',
        shipping_first_name: 'Mario',
        shipping_last_name: 'Rossi',
        shipping_address: 'Via Roma 123',
        shipping_postal_code: '00100',
        shipping_city: 'Roma',
        shipping_country: 'Italia',
        shipping_phone: '+39 123456789',
        billing_first_name: 'Mario',
        billing_last_name: 'Rossi',
        billing_address: 'Via Roma 123',
        billing_postal_code: '00100',
        billing_city: 'Roma',
        billing_country: 'Italia',
        payment_method: 'card',
        items: [
            {
                product_id: 1,
                quantity: 1,
                price: 50.00
            }
        ]
    });
    
    const options = {
        hostname: 'localhost',
        port: 3022,
        path: '/api/orders/create',
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(orderData)
        }
    };
    
    const req = http.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            if (res.statusCode === 201) {
                try {
                    const orderResponse = JSON.parse(data);
                    console.log('✅ Ordine creato con successo');
                    console.log('📋 ID Ordine:', orderResponse.order.id);
                    console.log('👤 Informazioni personali salvate:');
                    console.log('   - Nome:', orderResponse.order.shipping_first_name);
                    console.log('   - Cognome:', orderResponse.order.shipping_last_name);
                    
                    // Test del profilo per verificare il fallback
                    console.log('\n🔍 Test del profilo per verificare il fallback...');
                    testProfileAfterOrder(token);
                    
                } catch (error) {
                    console.log('❌ Errore parsing risposta ordine:', error.message);
                }
            } else {
                console.log('❌ Errore creazione ordine:', data);
            }
        });
    });
    
    req.on('error', (error) => {
        console.error('❌ Errore connessione ordine:', error.message);
    });
    
    req.write(orderData);
    req.end();
}

function testProfileAfterOrder(token) {
    const options = {
        hostname: 'localhost',
        port: 3022,
        path: '/api/user/profile',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
    
    const req = http.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            if (res.statusCode === 200) {
                try {
                    const jsonData = JSON.parse(data);
                    const user = jsonData.user;
                    
                    console.log('✅ Profilo recuperato dopo ordine');
                    console.log('📋 Dati utente:', {
                        first_name: user.first_name,
                        last_name: user.last_name,
                        email: user.email
                    });
                    
                    // Verifica se il fallback ha funzionato
                    if (user.first_name === 'Mario' && user.last_name === 'Rossi') {
                        console.log('🎯 SUCCESSO: Nome copiato dalle informazioni personali!');
                        console.log('✅ Il fallback funziona correttamente');
                    } else if (user.first_name && user.last_name) {
                        console.log('ℹ️ Nome presente ma non dalle informazioni personali');
                    } else {
                        console.log('❌ Nome ancora mancante');
                    }
                    
                } catch (error) {
                    console.log('❌ Errore parsing profilo:', error.message);
                }
            } else {
                console.log('❌ Errore profilo:', data);
            }
        });
    });
    
    req.on('error', (error) => {
        console.error('❌ Errore connessione profilo:', error.message);
    });
    
    req.end();
}

// Esegui lo script
createTestOrder();
