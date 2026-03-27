-- ============================================
-- SCHEMA DATABASE - Gestione Credenziali
-- ============================================
-- Esegui questo script nella SQL Editor di Supabase

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
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Admin possono vedere tutti i profili
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
CREATE POLICY "Authenticated users can view credentials"
  ON public.credentials
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Solo admin possono inserire credenziali
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
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- CONFIGURAZIONE CORS (se necessario)
-- ============================================
-- In Supabase: Settings > API > Configurazione CORS
-- Aggiungi il dominio di produzione Vercel

-- ============================================
-- NOTE SULLA SICUREZZA
-- ============================================
-- 1. Le password sono salvate in chiaro nel database
--    Questo è voluto per uso interno aziendale.
--    In futuro considerare cifratura lato client con chiave master.
--
-- 2. RLS è abilitato su tutte le tabelle
--    Viewer: solo lettura
--    Admin: lettura, scrittura, modifica, eliminazione
--
-- 3. Il primo utente registrato diventa automaticamente admin
--    Gli utenti successivi sono viewer di default
