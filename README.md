# Gestione Credenziali Aziendali

Dashboard interna per la gestione centralizzata delle password e credenziali operative aziendali.

## 🎯 Panoramica

Sistema web interno per:
- Gestione credenziali di accesso a servizi aziendali
- Ricerca e filtraggio rapido
- Export Excel per backup/report
- Gestione ruoli (admin/viewer)
- Storage centralizzato su Supabase

## 🚀 Stack Tecnologico

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Auth + Database)
- **Export**: SheetJS (xlsx)
- **Deploy**: Vercel

## 📋 Prerequisiti

- Node.js 18+
- Account Supabase
- Account Vercel (per deploy)

## 🛠️ Setup Locale

### 1. Clona e installa

```bash
# Installa dipendenze
npm install
```

### 2. Configura Supabase

1. Crea un nuovo progetto su [Supabase](https://supabase.com)
2. Vai in **SQL Editor** → **New query**
3. Copia e incolla il contenuto di `supabase_schema.sql`
4. Esegui lo script

### 3. Configura Environment Variables

```bash
# Copia il file di esempio
cp .env.local.example .env.local

# Modifica .env.local con i tuoi valori da Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tuo-progetto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=la-tua-anon-key
```

**Dove trovare i valori:**
- Vai su Supabase Dashboard → Settings → API
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `Project API keys` → `anon` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. Crea il primo utente admin

1. Vai su Supabase Dashboard → Authentication → Add user
2. Inserisci email e password
3. Il primo utente creato diventa automaticamente **admin**
4. Gli utenti successivi saranno **viewer** di default

### 5. Avvia in locale

```bash
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000)

## 🌐 Deploy su Vercel

### Metodo 1: Deploy da CLI

```bash
# Installa Vercel CLI
npm i -g vercel

# Login e deploy
vercel login
vercel
```

### Metodo 2: Deploy da GitHub

1. Pusha il codice su GitHub
2. Connetti il repo su [Vercel Dashboard](https://vercel.com/dashboard)
3. Configura le Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

### Configurazione CORS su Supabase

Dopo il deploy, aggiungi il dominio Vercel ai CORS allowed origins:

1. Supabase Dashboard → Settings → API
2. CORS Origins → Add origin
3. Inserisci: `https://tuo-progetto.vercel.app`

## 📁 Struttura Progetto

```
src/
├── app/                    # Pagine Next.js
│   ├── auth/
│   │   ├── login/         # Pagina login
│   │   └── callback/      # OAuth callback
│   ├── dashboard/         # Dashboard principale
│   ├── globals.css        # Stili globali
│   ├── layout.tsx         # Root layout
│   ├── middleware.ts      # Auth middleware
│   └── page.tsx           # Redirect
├── components/
│   ├── ui/                # Componenti base (Button, Input, Modal)
│   ├── auth/              # Componenti autenticazione
│   └── credentials/       # Componenti credenziali
├── hooks/
│   ├── useAuth.ts         # Hook autenticazione
│   └── useCredentials.ts  # Hook CRUD credenziali
├── lib/
│   ├── supabase/          # Client Supabase
│   │   ├── client.ts      # Browser client
│   │   ├── server.ts      # Server client
│   │   └── middleware.ts  # Session middleware
│   └── utils/             # Helper functions
└── types/                 # TypeScript types
    ├── index.ts           # Tipi applicazione
    └── database.ts        # Tipi Supabase
```

## 🔐 Sicurezza

### Ruoli Utente

| Ruolo | Permessi |
|-------|----------|
| **admin** | CRUD completo + export |
| **viewer** | Solo lettura e copia password |

### RLS (Row Level Security)

- ✅ Abilitato su tutte le tabelle
- ✅ Viewer non possono modificare dati
- ✅ Solo admin possono creare/modificare/eliminare
- ✅ Ogni utente vede solo il proprio profilo

### Sicurezza Password

⚠️ **Nota importante**: Le password sono salvate in chiaro nel database.

Questa è una scelta consapevole per un tool interno aziendale dove:
- L'accesso è ristretto e tracciato
- La facilità di recupero è prioritaria
- Il database è protetto da RLS

**Per produzione avanzata**, considerare:
- Cifratura lato client con chiave master
- Vault dedicato (es. HashiCorp Vault)
- Integration con password manager enterprise

## 💡 Funzionalità

### Dashboard
- 🔍 Ricerca testuale in tempo reale
- 🏷️ Filtro per categoria
- 📋 Tabella ordinabile
- 👁️ Password mascherate (toggle visibilità)
- 📋 Copia password con un click
- 🔗 Link diretto ai servizi

### Gestione Credenziali
- ➕ Creazione nuova credenziale
- ✏️ Modifica esistente
- 🗑️ Eliminazione con conferma
- 📊 Export Excel (tutti o filtrati)
- 📅 Timestamp creazione/modifica

### Categorie Predefinite
- Sviluppo
- Produzione
- Marketing
- Amministrazione
- HR
- Altro

## 📤 Export Excel

Il file Excel esportato include:
- Servizio
- Categoria
- Username/Email
- Password
- URL
- Note
- Data creazione
- Ultima modifica

## 🐛 Troubleshooting

### Errore: "Invalid login credentials"
- Verifica email e password
- Controlla che l'utente esista in Supabase Auth

### Errore: "Error loading data"
- Verifica che le RLS siano configurate correttamente
- Controlla la connessione a Supabase
- Verifica le environment variables

### Utente non diventa admin
- Il primo utente nel database diventa admin automaticamente
- Verifica che la funzione `handle_new_user` esista
- Controlla il trigger `on_auth_user_created`

### Problemi CORS in produzione
- Aggiungi il dominio Vercel ai CORS allowed origins in Supabase
- Verifica che le environment variables siano corrette

## 🔧 Manutenzione

### Aggiungere nuove categorie

Modifica `src/types/index.ts`:

```typescript
export const CREDENTIAL_CATEGORIES: CredentialCategory[] = [
  'Sviluppo',
  'Produzione',
  // Aggiungi qui
];
```

### Cambiare ruolo utente

Esegui in Supabase SQL Editor:

```sql
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'utente@azienda.com';
```

### Backup database

Usa la funzionalità di backup automatico di Supabase o export Excel dalla dashboard.

## 📈 Roadmap Futura

- [ ] Cifratura password lato client
- [ ] Audit log completo (chi ha visto/copiato cosa)
- [ ] Notifiche scadenze password
- [ ] Integrazione 2FA
- [ ] API per integrazioni esterne

## 📝 Licenza

Progetto interno aziendale - Uso riservato.

---

**Supporto**: Per problemi o domande, contatta il team IT.
