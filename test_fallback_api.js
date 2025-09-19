const http = require('http');

// Test per verificare che l'API usa il fallback delle informazioni personali
async function testFallbackAPI() {
    console.log('🔍 Test API con fallback informazioni personali...\n');
    
    // Login con l'utente senza nome
    const loginData = JSON.stringify({
        email: 'test_fallback_1755472480642@example.com',
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
                    if (user.first_name === 'Giuseppe' && user.last_name === 'Bianchi') {
                        console.log('🎯 SUCCESSO: Il fallback ha funzionato!');
                        console.log('✅ Nome copiato dalle informazioni personali delle ordini');
                        console.log('📊 Fonte: Informazioni personali (shipping_first_name/shipping_last_name)');
                        
                        console.log('\n💡 RISULTATO:');
                        console.log('- L\'utente non aveva nome/cognome nel database');
                        console.log('- L\'API ha cercato nelle ordini più recenti');
                        console.log('- Ha trovato "Giuseppe Bianchi" nelle informazioni personali');
                        console.log('- Ha usato questi dati come fallback');
                        console.log('- Ora il nome viene visualizzato correttamente!');
                        
                    } else if (user.first_name && user.last_name) {
                        console.log('ℹ️ Nome presente ma non dal fallback atteso');
                        console.log('📊 Nome attuale:', `${user.first_name} ${user.last_name}`);
                        
                    } else {
                        console.log('❌ Nome ancora mancante');
                        console.log('⚠️ Il fallback non ha funzionato');
                    }
                    
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
testFallbackAPI();
