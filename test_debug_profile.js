const http = require('http');

// Test di debug per il profilo
async function debugProfile() {
    console.log('🔍 Debug del profilo utente...\n');
    
    // Login
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
                    console.log('🔑 Token ottenuto:', loginData.token.substring(0, 20) + '...');
                    
                    // Test API profilo
                    testProfileAPI(loginData.token);
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

function testProfileAPI(token) {
    console.log('\n👤 Test API profilo con token valido...');
    
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
            console.log('📊 Status API:', res.statusCode);
            console.log('📋 Risposta completa:', data);
            
            if (res.statusCode === 200) {
                try {
                    const jsonData = JSON.parse(data);
                    console.log('✅ JSON valido');
                    console.log('👤 Dati utente completi:', JSON.stringify(jsonData, null, 2));
                    
                    const user = jsonData.user;
                    if (user) {
                        console.log('\n🔍 Analisi dati utente:');
                        console.log('- ID:', user.id);
                        console.log('- Username:', user.username);
                        console.log('- Email:', user.email);
                        console.log('- First Name:', user.first_name);
                        console.log('- Last Name:', user.last_name);
                        console.log('- Phone:', user.phone);
                        console.log('- Role:', user.role);
                        
                        // Verifica se i dati sono presenti
                        if (user.first_name) {
                            console.log('✅ First name presente:', user.first_name);
                        } else {
                            console.log('❌ First name mancante');
                        }
                        
                        if (user.last_name) {
                            console.log('✅ Last name presente:', user.last_name);
                        } else {
                            console.log('❌ Last name mancante');
                        }
                        
                        if (user.email) {
                            console.log('✅ Email presente:', user.email);
                        } else {
                            console.log('❌ Email mancante');
                        }
                        
                        // Calcola il nome di visualizzazione
                        let displayName = '';
                        if (user.first_name && user.last_name) {
                            displayName = `${user.first_name} ${user.last_name}`;
                        } else if (user.first_name) {
                            displayName = user.first_name;
                        } else if (user.last_name) {
                            displayName = user.last_name;
                        } else {
                            displayName = 'Utente';
                        }
                        
                        console.log('🎯 Nome di visualizzazione calcolato:', displayName);
                        
                    } else {
                        console.log('❌ Oggetto user mancante nella risposta');
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

// Esegui il debug
debugProfile();
