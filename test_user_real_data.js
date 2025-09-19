const http = require('http');

// Test per verificare i dati utente reali
async function testRealUserData() {
    console.log('🔍 Test dati utente reali...\n');
    
    // Login con l'utente reale
    const loginData = JSON.stringify({
        email: 'adobinesse@gmail.com',
        password: 'password123' // Assumiamo questa password
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
                    console.log('✅ Login riuscito per adobinesse@gmail.com');
                    
                    // Test del profilo API
                    testProfileAPI(loginData.token);
                } else {
                    console.log('❌ Login fallito:', loginData);
                    console.log('💡 Prova con una password diversa o verifica che l\'utente esista');
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
    console.log('\n👤 Test API profilo per adobinesse@gmail.com...');
    
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
            
            if (res.statusCode === 200) {
                try {
                    const jsonData = JSON.parse(data);
                    const user = jsonData.user;
                    
                    console.log('✅ API profilo funzionante');
                    console.log('📋 Dati utente completi:', JSON.stringify(user, null, 2));
                    
                    console.log('\n🔍 Analisi dati specifici:');
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
                    
                    // Se il nome è mancante, suggerisci di aggiornarlo
                    if (!user.first_name && !user.last_name) {
                        console.log('\n⚠️ PROBLEMA IDENTIFICATO:');
                        console.log('L\'utente non ha un nome o cognome impostato nel database');
                        console.log('💡 Soluzione: Aggiorna il profilo utente con nome e cognome');
                        
                        // Test di aggiornamento profilo
                        testUpdateProfile(token, user.id);
                    } else {
                        console.log('\n✅ Dati utente completi, il problema è nel frontend');
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

function testUpdateProfile(token, userId) {
    console.log('\n🔄 Test aggiornamento profilo...');
    
    const updateData = JSON.stringify({
        first_name: 'Adobinesse',
        last_name: 'User',
        phone: '+39 123 456 7890'
    });
    
    const options = {
        hostname: 'localhost',
        port: 3022,
        path: '/api/user/profile',
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(updateData)
        }
    };
    
    const req = http.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log('📊 Status aggiornamento:', res.statusCode);
            
            if (res.statusCode === 200) {
                console.log('✅ Profilo aggiornato con successo');
                console.log('📋 Risposta:', data);
                
                console.log('\n🎯 Ora il nome dovrebbe apparire come: Adobinesse User');
                console.log('💡 Ricarica la pagina del profilo per vedere i cambiamenti');
            } else {
                console.log('❌ Errore aggiornamento:', data);
            }
        });
    });
    
    req.on('error', (error) => {
        console.error('❌ Errore connessione aggiornamento:', error.message);
    });
    
    req.write(updateData);
    req.end();
}

// Esegui il test
testRealUserData();
