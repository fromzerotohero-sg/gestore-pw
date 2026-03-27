/**
 * Script per creare le tabelle su Supabase
 * Richiede: npm install @supabase/supabase-js dotenv
 * 
 * Uso: node setup-supabase.js
 */

const { createClient } = require('@supabase/supabase-js');

// Leggi variabili da .env.local
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY; // Serve la Service Role Key!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Errore: mancano le variabili d\'ambiente');
  console.error('Crea un file .env con:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL=https://tuo-progetto.supabase.co');
  console.error('  NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const sqlScript = `
-- ============================================
-- SCHEMA DATABASE - Gestione Credenziali
-- ============================================

-- ============================================
-- TABELLA PROFILES
-- Estende auth.users con informazioni aggiuntive
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELLA CREDENTIALS
-- Contiene le credenziali aziendali
-- ============================================
CREATE TABLE IF NOT EXISTS public.credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name TEXT NOT NULL,
  username_email TEXT NOT NULL,
  password_value TEXT NOT NULL,
  url TEXT,
  notes TEXT,
  category TEXT NOT NULL DEFAULT 'Altro',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_credentials_service_name ON public.credentials(service_name);
CREATE INDEX IF NOT EXISTS idx_credentials_category ON public.credentials(category);
CREATE INDEX IF NOT EXISTS idx_credentials_created_by ON public.credentials(created_by);

-- ============================================
-- RLS (Row Level Security) - ABILITAZIONE
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credentials ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES - PROFILES
-- ============================================

-- Policy: Utenti possono vedere solo il proprio profilo
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Admin possono vedere tutti i profili
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- RLS POLICIES - CREDENTIALS
-- ============================================

-- Policy: Tutti gli utenti autenticati possono vedere le credenziali
DROP POLICY IF EXISTS "Authenticated users can view credentials" ON public.credentials;
CREATE POLICY "Authenticated users can view credentials"
  ON public.credentials
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Solo admin possono inserire credenziali
DROP POLICY IF EXISTS "Only admins can insert credentials" ON public.credentials;
CREATE POLICY "Only admins can insert credentials"
  ON public.credentials
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Solo admin possono aggiornare credenziali
DROP POLICY IF EXISTS "Only admins can update credentials" ON public.credentials;
CREATE POLICY "Only admins can update credentials"
  ON public.credentials
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Solo admin possono eliminare credenziali
DROP POLICY IF EXISTS "Only admins can delete credentials" ON public.credentials;
CREATE POLICY "Only admins can delete credentials"
  ON public.credentials
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- FUNCTION: Aggiorna updated_at automaticamente
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger per aggiornare updated_at
DROP TRIGGER IF EXISTS credentials_updated_at ON public.credentials;
CREATE TRIGGER credentials_updated_at
  BEFORE UPDATE ON public.credentials
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- FUNCTION: Crea profilo dopo registrazione
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    -- Primo utente = admin, altri = viewer
    CASE 
      WHEN (SELECT COUNT(*) FROM public.profiles) = 0 THEN 'admin'
      ELSE 'viewer'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger per creare profilo dopo signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
`;

async function setupDatabase() {
  console.log('🚀 Setup database Supabase...\n');

  try {
    // Esegui lo script SQL
    const { error } = await supabase.rpc('exec_sql', { sql: sqlScript });
    
    if (error) {
      console.error('❌ Errore durante l\'esecuzione SQL:', error.message);
      console.log('\n⚠️  Prova a eseguire manualmente lo script da Supabase Dashboard:');
      console.log('   SQL Editor → New query → Incolla supabase_schema.sql');
      process.exit(1);
    }

    console.log('✅ Tabelle create con successo!');
    console.log('\n📋 Riepilogo:');
    console.log('   - Tabella: profiles (con RLS)');
    console.log('   - Tabella: credentials (con RLS)');
    console.log('   - Trigger: handle_new_user (primo utente = admin)');
    console.log('   - Trigger: credentials_updated_at (auto-update timestamp)');
    console.log('\n🎉 Setup completato!');
    
  } catch (err) {
    console.error('❌ Errore:', err.message);
    process.exit(1);
  }
}

setupDatabase();
