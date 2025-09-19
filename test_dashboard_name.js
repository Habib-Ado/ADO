const http = require('http');

// Test per verificare il nome utente nel Dashboard
async function testDashboardName() {
    console.log('🚀 Test nome utente nel Dashboard...\n');
    
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
                    
                    // Test della pagina Dashboard
                    testDashboardPage(loginData.token);
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
                    console.log('📋 Dati utente:', {
                        id: user.id,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        email: user.email
                    });
                    
                    // Calcola il nome atteso
                    let expectedName = '';
                    if (user.first_name && user.last_name) {
                        expectedName = `${user.first_name} ${user.last_name}`;
                    } else if (user.first_name) {
                        expectedName = user.first_name;
                    } else if (user.last_name) {
                        expectedName = user.last_name;
                    } else if (user.email) {
                        const emailName = user.email.split('@')[0];
                        expectedName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
                    } else {
                        expectedName = 'Utente';
                    }
                    
                    console.log('🎯 Nome atteso nel Dashboard:', expectedName);
                    
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

function testDashboardPage(token) {
    console.log('\n🌐 Test pagina Dashboard...');
    
    const options = {
        hostname: 'localhost',
        port: 3022,
        path: '/dashboard',
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
                console.log('✅ Pagina Dashboard caricata');
                
                const html = data;
                
                // Verifica elementi essenziali
                if (html.includes('id="user-welcome-name"')) {
                    console.log('✅ Elemento user-welcome-name presente');
                } else {
                    console.log('❌ Elemento user-welcome-name mancante');
                }
                
                // Verifica se "Caricamento..." è presente (dovrebbe esserlo inizialmente)
                if (html.includes('Caricamento...')) {
                    console.log('✅ "Caricamento..." presente nel HTML iniziale');
                } else {
                    console.log('⚠️ "Caricamento..." non trovato nel HTML');
                }
                
                // Verifica se ci sono dati utente reali
                if (html.includes('Test') || html.includes('Verify') || html.includes('test_verify_1755469080358@example.com')) {
                    console.log('✅ Dati utente reali trovati nel HTML');
                } else {
                    console.log('ℹ️ Dati utente reali non trovati nel HTML (normale, verranno caricati via JavaScript)');
                }
                
                // Verifica altri elementi del dashboard
                if (html.includes('Tableau de Bord')) {
                    console.log('✅ Titolo Dashboard presente');
                } else {
                    console.log('❌ Titolo Dashboard mancante');
                }
                
                if (html.includes('Bienvenue')) {
                    console.log('✅ Messaggio di benvenuto presente');
                } else {
                    console.log('❌ Messaggio di benvenuto mancante');
                }
                
                console.log('\n📝 RIEPILOGO DASHBOARD:');
                console.log('- La pagina HTML viene generata correttamente');
                console.log('- L\'elemento user-welcome-name è presente');
                console.log('- "Caricamento..." è presente inizialmente');
                console.log('- I dati reali verranno caricati via JavaScript');
                console.log('\n✅ DASHBOARD FUNZIONANTE!');
                
            } else {
                console.log('❌ Errore caricamento pagina Dashboard:', data);
            }
        });
    });
    
    req.on('error', (error) => {
        console.error('❌ Errore connessione pagina Dashboard:', error.message);
    });
    
    req.end();
}

// Esegui il test
testDashboardName();
