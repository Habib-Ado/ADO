const http = require('http');
const fs = require('fs');
const FormData = require('form-data');

async function testAvatar() {
    console.log('🧪 Test Funzionalità Avatar');
    console.log('============================\n');
    
    // Test login per ottenere un token
    const loginData = JSON.stringify({
        email: 'test_verify_1755449723492@example.com',
        password: 'test123'
    });
    
    const loginOptions = {
        hostname: 'localhost',
        port: 3022,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': loginData.length
        }
    };
    
    console.log('📤 1. Login per ottenere token...');
    
    const loginResult = await new Promise((resolve, reject) => {
        const req = http.request(loginOptions, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    resolve({ status: res.statusCode, data: result });
                } catch (e) {
                    reject(e);
                }
            });
        });
        req.on('error', reject);
        req.write(loginData);
        req.end();
    });
    
    console.log(`   Status: ${loginResult.status}`);
    
    if (loginResult.status === 200) {
        console.log('✅ Login riuscito!');
        const token = loginResult.data.token;
        
        // Test caricamento profilo per vedere se c'è già un avatar
        console.log('\n📤 2. Test caricamento profilo...');
        
        const profileOptions = {
            hostname: 'localhost',
            port: 3022,
            path: '/api/user/profile',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };
        
        const profileResult = await new Promise((resolve, reject) => {
            const req = http.request(profileOptions, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    try {
                        const result = JSON.parse(data);
                        resolve({ status: res.statusCode, data: result });
                    } catch (e) {
                        reject(e);
                    }
                });
            });
            req.on('error', reject);
            req.end();
        });
        
        console.log(`   Status: ${profileResult.status}`);
        
        if (profileResult.status === 200) {
            const user = profileResult.data.user;
            console.log('✅ Profilo caricato!');
            console.log(`   Avatar attuale: ${user.profile_image || 'Nessun avatar'}`);
            
            // Test upload avatar (se abbiamo un file di test)
            console.log('\n📤 3. Test upload avatar...');
            console.log('   ⚠️  Per testare l\'upload, crea un file di test e modifica questo script');
            console.log('   📝 Esempio: const testImagePath = "./test_image.jpg";');
            
            // TODO: Implementare test upload con file reale
            console.log('   🔄 Test upload avatar - da implementare con file reale');
            
        } else {
            console.log('❌ Errore caricamento profilo');
            console.log('   Response:', JSON.stringify(profileResult.data, null, 2));
        }
        
    } else {
        console.log('❌ Login fallito');
        console.log('   Response:', JSON.stringify(loginResult.data, null, 2));
    }
}

testAvatar().catch(error => {
    console.error('❌ Errore:', error.message);
});

