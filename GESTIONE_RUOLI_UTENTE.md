# Gestione Ruoli Utente - Artigianato on Ligne

## Panoramica

Il sistema di gestione ruoli utente è stato implementato secondo la richiesta: **ogni nuovo utente è un cliente di default, e può richiedere di diventare artigiano tramite approvazione dell'amministratore**.

## Funzionalità Implementate

### 1. Registrazione Utenti
- **Ruolo di default**: Tutti i nuovi utenti sono registrati come "cliente"
- **Rimozione del selettore di ruolo**: Il form di registrazione non include più la selezione del ruolo
- **Informazioni chiare**: Messaggio informativo che spiega il processo di promozione

### 2. Richiesta Promozione Artigiano
- **Pagina dedicata**: `/artisan-request` per richiedere la promozione
- **Controlli di sicurezza**: Verifica che l'utente non sia già artigiano
- **Prevenzione duplicati**: Non è possibile inviare più richieste in attesa
- **Feedback in tempo reale**: Stato della richiesta visibile all'utente

### 3. Gestione Amministrativa
- **Dashboard admin**: `/admin/artisan-requests` per gestire le richieste
- **Approvazione/Rifiuto**: L'admin può approvare o rifiutare le richieste
- **Note amministrative**: Possibilità di aggiungere note al rifiuto
- **Promozione automatica**: L'utente viene promosso automaticamente se approvato

### 4. Interfaccia Utente Dinamica
- **Menu adattivo**: I link del menu cambiano secondo il ruolo
- **Gestione automatica**: L'interfaccia si aggiorna automaticamente dopo login/logout
- **Controllo accessi**: Solo gli utenti autorizzati vedono i link pertinenti

## Struttura Database

### Tabella `users` (aggiornata)
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'cliente',  -- Cambiato da 'user' a 'cliente'
    email_verified BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Nuova tabella `artisan_requests`
```sql
CREATE TABLE artisan_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'pending',  -- 'pending', 'approved', 'rejected'
    admin_notes TEXT,
    processed_date TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## API Endpoints

### Richieste Artigiano
- `POST /api/artisan/request-promotion` - Invia richiesta di promozione
- `GET /api/artisan/request-status/:userId` - Controlla stato richiesta

### Gestione Admin
- `GET /api/admin/artisan-requests` - Lista tutte le richieste
- `POST /api/admin/process-artisan-request` - Approva/rifiuta richiesta

## Flusso Utente

### 1. Registrazione Cliente
```
1. Utente si registra → Ruolo: "cliente"
2. Verifica email → Account attivo
3. Menu mostra: "Diventa Artigiano"
```

### 2. Richiesta Promozione
```
1. Cliente clicca "Diventa Artigiano"
2. Sistema verifica: non già artigiano, nessuna richiesta pendente
3. Richiesta inviata → Stato: "pending"
4. Admin riceve notifica
```

### 3. Processamento Admin
```
1. Admin accede a "Gestione Richieste Artigiani"
2. Visualizza lista richieste in attesa
3. Approva/Rifiuta con eventuali note
4. Sistema aggiorna ruolo utente se approvato
```

### 4. Risultato
```
Se APPROVATO:
- Ruolo utente → "artigiano"
- Menu aggiornato: rimuove "Diventa Artigiano"
- Aggiunge funzionalità artigiano

Se RIFIUTATO:
- Ruolo rimane "cliente"
- Utente può fare nuova richiesta
- Note admin visibili all'utente
```

## File Modificati/Creati

### Backend (test_server.js)
- ✅ Modificata tabella `users` (role default: 'cliente')
- ✅ Aggiunta tabella `artisan_requests`
- ✅ Implementate API per richieste e gestione admin

### Frontend
- ✅ `frontend/static/js/views/ArtisanRequest.js` - Pagina richiesta artigiano
- ✅ `frontend/static/js/views/AdminArtisanRequests.js` - Dashboard admin
- ✅ `frontend/static/js/userInterface.js` - Gestione interfaccia dinamica
- ✅ `frontend/static/css/artisan-admin.css` - Stili per nuove pagine

### Modifiche Esistenti
- ✅ `frontend/static/js/views/Register.js` - Rimosso selettore ruolo
- ✅ `frontend/static/js/views/Login.js` - Integrazione gestore interfaccia
- ✅ `frontend/static/js/index.js` - Nuove route
- ✅ `frontend/index.html` - Nuovi link menu e CSS

## Sicurezza

### Controlli Implementati
- ✅ Verifica autenticazione per richieste
- ✅ Prevenzione richieste duplicate
- ✅ Controllo ruoli per accesso admin
- ✅ Validazione dati input

### Autorizzazioni
- **Clienti**: Possono richiedere promozione
- **Artigiani**: Non possono richiedere (già promossi)
- **Admin**: Possono gestire tutte le richieste

## Test della Funzionalità

### Scenario 1: Nuovo Cliente
1. Registra nuovo account
2. Verifica che il ruolo sia "cliente"
3. Controlla che appaia "Diventa Artigiano" nel menu
4. Invia richiesta di promozione
5. Verifica stato "pending"

### Scenario 2: Gestione Admin
1. Accedi come admin
2. Vai a "Gestione Richieste Artigiani"
3. Visualizza richieste in attesa
4. Approva una richiesta
5. Verifica che l'utente sia promosso

### Scenario 3: Interfaccia Dinamica
1. Login come cliente → Menu cliente
2. Login come artigiano → Menu artigiano
3. Login come admin → Menu admin
4. Logout → Menu guest

## Prossimi Sviluppi

### Possibili Miglioramenti
- [ ] Notifiche email per richieste e decisioni
- [ ] Dashboard statistiche richieste
- [ ] Sistema di documentazione per artigiani
- [ ] Processo di verifica più dettagliato
- [ ] Storico completo delle richieste

### Integrazioni Future
- [ ] Sistema di recensioni per artigiani
- [ ] Verifica documenti/portfolio
- [ ] Sistema di commissioni
- [ ] Badge e certificazioni

## Note Tecniche

### Compatibilità
- ✅ Funziona con il server di test SQLite
- ✅ Compatibile con MySQL per produzione
- ✅ Interfaccia responsive
- ✅ Supporto SPA (Single Page Application)

### Performance
- ✅ Query ottimizzate per database
- ✅ Interfaccia aggiornata dinamicamente
- ✅ Gestione efficiente dello stato utente

---

**Implementazione completata e pronta per il testing!** 🎉 