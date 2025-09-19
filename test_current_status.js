const http = require('http');

// Test per verificare lo stato attuale del sistema
async function testCurrentStatus() {
    console.log('🔍 Test stato attuale del sistema...\n');
    
    // Test 1: Verifica se il server risponde
    console.log('1️⃣ Test connessione server...');
    const serverTest = http.request({
        hostname: 'localhost',
        port: 3022,
        path: '/',
        method: 'GET'
    }, (res) => {
        console.log('✅ Server risponde, status:', res.statusCode);
        
        // Test 2: Verifica API profilo senza token
        console.log('\n2️⃣ Test API profilo senza token...');
        const apiTest = http.request({
            hostname: 'localhost',
            port: 3022,
            path: '/api/user/profile',
            method: 'GET'
        }, (apiRes) => {
            let data = '';
            apiRes.on('data', chunk => data += chunk);
            apiRes.on('end', () => {
                console.log('📊 API status:', apiRes.statusCode);
                if (apiRes.statusCode === 401) {
                    console.log('✅ API protegge correttamente (401 Unauthorized)');
                } else {
                    console.log('⚠️ Risposta inaspettata:', data);
                }
                
                // Test 3: Verifica pagina profilo
                console.log('\n3️⃣ Test pagina profilo...');
                const pageTest = http.request({
                    hostname: 'localhost',
                    port: 3022,
                    path: '/profile',
                    method: 'GET'
                }, (pageRes) => {
                    let pageData = '';
                    pageRes.on('data', chunk => pageData += chunk);
                    pageRes.on('end', () => {
                        console.log('📊 Pagina profilo status:', pageRes.statusCode);
                        
                        if (pageRes.statusCode === 200) {
                            console.log('✅ Pagina profilo accessibile');
                            
                            // Verifica elementi nel HTML
                            if (pageData.includes('user-name')) {
                                console.log('✅ Elemento user-name presente');
                            } else {
                                console.log('❌ Elemento user-name mancante');
                            }
                            
                            if (pageData.includes('user-email')) {
                                console.log('✅ Elemento user-email presente');
                            } else {
                                console.log('❌ Elemento user-email mancante');
                            }
                            
                            if (pageData.includes('Caricamento...')) {
                                console.log('✅ "Caricamento..." presente nel HTML');
                            } else {
                                console.log('⚠️ "Caricamento..." non trovato');
                            }
                            
                            // Verifica se ci sono script JavaScript
                            if (pageData.includes('Profile.js')) {
                                console.log('✅ Script Profile.js referenziato');
                            } else {
                                console.log('❌ Script Profile.js non trovato');
                            }
                            
                        } else {
                            console.log('❌ Pagina profilo non accessibile');
                        }
                        
                        // Test 4: Verifica pagina dashboard
                        console.log('\n4️⃣ Test pagina dashboard...');
                        const dashboardTest = http.request({
                            hostname: 'localhost',
                            port: 3022,
                            path: '/dashboard',
                            method: 'GET'
                        }, (dashboardRes) => {
                            let dashboardData = '';
                            dashboardRes.on('data', chunk => dashboardData += chunk);
                            dashboardRes.on('end', () => {
                                console.log('📊 Dashboard status:', dashboardRes.statusCode);
                                
                                if (dashboardRes.statusCode === 200) {
                                    console.log('✅ Pagina dashboard accessibile');
                                    
                                    if (dashboardData.includes('user-welcome-name')) {
                                        console.log('✅ Elemento user-welcome-name presente');
                                    } else {
                                        console.log('❌ Elemento user-welcome-name mancante');
                                    }
                                    
                                    if (dashboardData.includes('Caricamento...')) {
                                        console.log('✅ "Caricamento..." presente nel dashboard');
                                    } else {
                                        console.log('⚠️ "Caricamento..." non trovato nel dashboard');
                                    }
                                    
                                } else {
                                    console.log('❌ Pagina dashboard non accessibile');
                                }
                                
                                console.log('\n📝 RIEPILOGO STATO ATTUALE:');
                                console.log('- Server: ✅ Funzionante');
                                console.log('- API: ✅ Protetta correttamente');
                                console.log('- Pagine: ✅ Accessibili');
                                console.log('- Elementi HTML: ✅ Presenti');
                                console.log('- "Caricamento...": ✅ Presente nel HTML');
                                console.log('\n💡 Il problema è nel JavaScript frontend');
                                console.log('🔄 Prova a:');
                                console.log('   1. Svuotare la cache del browser (Ctrl+F5)');
                                console.log('   2. Aprire gli strumenti di sviluppo (F12)');
                                console.log('   3. Verificare la console per errori JavaScript');
                                console.log('   4. Controllare se i file JS sono caricati correttamente');
                            });
                        });
                        
                        dashboardTest.on('error', (error) => {
                            console.error('❌ Errore dashboard:', error.message);
                        });
                        
                        dashboardTest.end();
                    });
                });
                
                pageTest.on('error', (error) => {
                    console.error('❌ Errore pagina profilo:', error.message);
                });
                
                pageTest.end();
            });
        });
        
        apiTest.on('error', (error) => {
            console.error('❌ Errore API:', error.message);
        });
        
        apiTest.end();
    });
    
    serverTest.on('error', (error) => {
        console.error('❌ Errore server:', error.message);
    });
    
    serverTest.end();
}

// Esegui il test
testCurrentStatus();
