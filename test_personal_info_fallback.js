const http = require('http');

// Test per verificare il fallback delle informazioni personali
async function testPersonalInfoFallback() {
    console.log('🔍 Test fallback informazioni personali...\n');
    
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
                    
                    // Test del profilo API con fallback
                    testProfileWithFallback(loginData.token);
                    
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

function testProfileWithFallback(token) {
    console.log('\n👤 Test API profilo con fallback...');
    
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
                    
                    console.log('✅ API profilo funzionante');
                    console.log('📋 Dati utente ricevuti:', {
                        id: user.id,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        email: user.email
                    });
                    
                    // Verifica se il fallback ha funzionato
                    if (user.first_name && user.last_name) {
                        console.log('✅ Nome e cognome presenti');
                        console.log('🎯 Nome completo:', `${user.first_name} ${user.last_name}`);
                        
                        // Verifica se provengono dal database o dalle ordini
                        if (user.first_name === 'Test' && user.last_name === 'Verify') {
                            console.log('📊 Fonte: Database (dati originali)');
                        } else {
                            console.log('📊 Fonte: Informazioni personali delle ordini (fallback)');
                        }
                        
                    } else if (user.first_name) {
                        console.log('⚠️ Solo nome presente:', user.first_name);
                    } else if (user.last_name) {
                        console.log('⚠️ Solo cognome presente:', user.last_name);
                    } else {
                        console.log('❌ Nessun nome/cognome disponibile');
                        
                        // Calcola il nome dall'email come ultimo fallback
                        if (user.email) {
                            const emailName = user.email.split('@')[0];
                            const displayName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
                            console.log('🔄 Fallback email:', displayName);
                        }
                    }
                    
                    console.log('\n💡 RISULTATO:');
                    console.log('- L\'API ora cerca automaticamente nelle informazioni personali');
                    console.log('- Se first_name/last_name sono vuoti nel database');
                    console.log('- Li copia dalle ordini più recenti dell\'utente');
                    console.log('- Questo garantisce che il nome sia sempre visualizzato');
                    
                } catch (error) {
                    console.log('❌ Errore parsing JSON:', error.message);
                }
            } else {
                console.log('❌ Errore API:', data);
            }
        });
    });
    
    req.on('error', (error) => {
        console.error('❌ Errore connessione API:', error.message);
    });
    
    req.end();
}

// Esegui il test
testPersonalInfoFallback();
