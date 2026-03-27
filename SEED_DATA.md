# Setup Database Supabase

## Metodo Rapido (Consigliato)

1. Vai su https://supabase.com/dashboard
2. Seleziona il tuo progetto
3. Vai su **SQL Editor** → **New query**
4. Copia tutto il contenuto di `supabase_schema.sql`
5. Clicca **Run**

✅ Fatto! Le tabelle sono pronte.

---

## Metodo con Script Node.js

### 1. Installa le dipendenze

```bash
npm install dotenv
```

### 2. Crea file `.env` nella root

```env
NEXT_PUBLIC_SUPABASE_URL=https://tuo-progetto.supabase.co
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ ATTENZIONE:** Serve la **Service Role Key**, non l'anon key!

La trovi su: Supabase Dashboard → Settings → API → Project API keys → `service_role`

### 3. Esegui lo script

```bash
node setup-supabase.js
```

---

## Verifica Setup

Dopo aver creato le tabelle, verifica che tutto funzioni:

1. **Crea un utente** su Supabase Dashboard → Authentication → Add user
2. **Controlla la tabella profiles** su Table Editor → profiles
3. L'utente dovrebbe avere `role = admin` (se è il primo)

---

## Struttura Database

### Tabella `profiles`
| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id | UUID | PK, FK auth.users |
| email | TEXT | Email utente |
| role | TEXT | admin / viewer |
| created_at | TIMESTAMP | Data creazione |

### Tabella `credentials`
| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id | UUID | PK, auto-generato |
| service_name | TEXT | Nome servizio |
| username_email | TEXT | Username o email |
| password_value | TEXT | Password (in chiaro) |
| url | TEXT | URL servizio (opzionale) |
| notes | TEXT | Note (opzionali) |
| category | TEXT | Categoria |
| created_at | TIMESTAMP | Data creazione |
| updated_at | TIMESTAMP | Ultima modifica |
| created_by | UUID | FK utente creatore |
| updated_by | UUID | FK utente modificatore |

---

## Sicurezza RLS

| Ruolo | Lettura | Scrittura | Modifica | Eliminazione |
|-------|---------|-----------|----------|--------------|
| **viewer** | ✅ Proprie + tutte credenziali | ❌ | ❌ | ❌ |
| **admin** | ✅ Tutto | ✅ | ✅ | ✅ |

---

## Troubleshooting

### "exec_sql function does not exist"
Lo script usa una funzione RPC. Se non esiste, esegui manualmente lo script SQL dalla dashboard.

### Primo utente non è admin
Controlla che il trigger `on_auth_user_created` esista:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

Se manca, riesegui lo script SQL completo.

### Errore permessi
Assicurati di usare la **Service Role Key**, non l'anon key, per lo script.
