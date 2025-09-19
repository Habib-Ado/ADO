const http = require('http');

// Simulazione del comportamento del browser
async function simulateBrowser() {
    console.log('🌐 Simulazione comportamento browser...\n');
    
    // Login per ottenere token
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
                    console.log('✅ Login riuscito, token ottenuto');
                    
                    // Simula il caricamento della pagina profilo
                    simulateProfilePage(loginData.token);
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

function simulateProfilePage(token) {
    console.log('\n📄 Simulazione caricamento pagina profilo...');
    
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
                
                // Simula la chiamata API che il JavaScript farebbe
                simulateJavaScriptAPI(token);
                
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

function simulateJavaScriptAPI(token) {
    console.log('\n🔧 Simulazione chiamata API JavaScript...');
    
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
                    
                    console.log('✅ API chiamata con successo');
                    console.log('📋 Dati utente ricevuti:', {
                        id: user.id,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        email: user.email
                    });
                    
                    // Simula la logica JavaScript per calcolare il nome
                    let displayName = '';
                    if (user.first_name && user.last_name) {
                        displayName = `${user.first_name} ${user.last_name}`;
                        console.log('✅ Nome completo calcolato:', displayName);
                    } else if (user.first_name) {
                        displayName = user.first_name;
                        console.log('✅ Solo nome calcolato:', displayName);
                    } else if (user.last_name) {
                        displayName = user.last_name;
                        console.log('✅ Solo cognome calcolato:', displayName);
                    } else if (user.email) {
                        const emailName = user.email.split('@')[0];
                        displayName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
                        console.log('✅ Nome dall\'email calcolato:', displayName);
                    } else {
                        displayName = 'Utente';
                        console.log('⚠️ Nome di fallback:', displayName);
                    }
                    
                    console.log('\n🎯 RISULTATO FINALE:');
                    console.log('- Nome da visualizzare:', displayName);
                    console.log('- Email da visualizzare:', user.email);
                    console.log('- Elemento user-name dovrebbe contenere:', displayName);
                    console.log('- Elemento user-email dovrebbe contenere:', user.email);
                    
                    console.log('\n💡 ISTRUZIONI PER L\'UTENTE:');
                    console.log('1. Apri il browser e vai su http://localhost:3022');
                    console.log('2. Fai login con test_verify_1755469080358@example.com / test123');
                    console.log('3. Vai alla pagina profilo');
                    console.log('4. Apri gli strumenti di sviluppo (F12)');
                    console.log('5. Controlla la console per i log di debug');
                    console.log('6. Verifica che "Caricamento..." sia stato sostituito con:', displayName);
                    
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

// Esegui la simulazione
simulateBrowser();
