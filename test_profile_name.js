const http = require('http');

// Test specifico per il nome utente nella navigazione laterale
async function testUserName() {
    console.log('🚀 Test specifico per il nome utente...\n');
    
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
                    
                    // Test del profilo API
                    testProfileAPI(loginData.token);
                } else {
                    console.log('❌ Login fallito:', loginData);
                }
            } catch (error) {
                console.log('❌ Errore parsing risposta login:', error.message);
            }
        });
    });
    
    loginReq.on('error', (error) => {
        console.error('❌ Errore connessione login:', error.message);
    });
    
    loginReq.write(loginData);
    loginReq.end();
}

function testProfileAPI(token) {
    console.log('\n👤 Test API profilo...');
    
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
                    console.log('📋 Dati utente dall\'API:', {
                        id: user.id,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        email: user.email
                    });
                    
                    // Verifica che il nome sia presente
                    if (user.first_name || user.last_name) {
                        console.log('✅ Nome utente presente nell\'API');
                        
                        let expectedName = '';
                        if (user.first_name && user.last_name) {
                            expectedName = `${user.first_name} ${user.last_name}`;
                        } else if (user.first_name) {
                            expectedName = user.first_name;
                        } else if (user.last_name) {
                            expectedName = user.last_name;
                        }
                        
                        console.log('🔍 Nome atteso nella UI:', expectedName);
                        
                        // Test della pagina HTML
                        testProfilePage(token, expectedName);
                    } else {
                        console.log('⚠️ Nome utente mancante nell\'API');
                    }
                    
                } catch (error) {
                    console.log('⚠️ Risposta non JSON valida');
                }
            } else {
                console.log('❌ Errore API profilo:', data);
            }
        });
    });
    
    req.on('error', (error) => {
        console.error('❌ Errore connessione API:', error.message);
    });
    
    req.end();
}

function testProfilePage(token, expectedName) {
    console.log('\n🌐 Test pagina HTML profilo...');
    
    const options = {
        hostname: 'localhost',
        port: 3022,
        path: '/profile',
        method: 'GET',
        headers: {
            'Cookie': `jwt_token=${token}`,
            'Content-Type': 'text/html'
        }
    };
    
    const req = http.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            if (res.statusCode === 200) {
                console.log('✅ Pagina profilo caricata');
                
                const html = data;
                
                // Verifica se il nome atteso è presente nel HTML
                if (html.includes(expectedName)) {
                    console.log('✅ Nome utente trovato nel HTML:', expectedName);
                } else {
                    console.log('❌ Nome utente NON trovato nel HTML');
                    console.log('🔍 Cercato:', expectedName);
                    
                    // Cerca altri possibili nomi
                    if (html.includes('Test')) {
                        console.log('✅ Trovato "Test" nel HTML');
                    }
                    if (html.includes('Verify')) {
                        console.log('✅ Trovato "Verify" nel HTML');
                    }
                    if (html.includes('Test Verify')) {
                        console.log('✅ Trovato "Test Verify" nel HTML');
                    }
                }
                
                // Verifica se "Caricamento..." è ancora presente
                if (html.includes('Caricamento...')) {
                    console.log('⚠️ "Caricamento..." ancora presente nel HTML');
                } else {
                    console.log('✅ "Caricamento..." non trovato nel HTML');
                }
                
                // Verifica elementi specifici
                if (html.includes('id="user-name"')) {
                    console.log('✅ Elemento user-name presente nel HTML');
                } else {
                    console.log('❌ Elemento user-name mancante nel HTML');
                }
                
                if (html.includes('id="user-email"')) {
                    console.log('✅ Elemento user-email presente nel HTML');
                } else {
                    console.log('❌ Elemento user-email mancante nel HTML');
                }
                
            } else {
                console.log('❌ Errore caricamento pagina:', data);
            }
        });
    });
    
    req.on('error', (error) => {
        console.error('❌ Errore connessione pagina:', error.message);
    });
    
    req.end();
}

// Esegui il test
testUserName();
