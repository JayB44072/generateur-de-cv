-- =======================================================================
-- 1. NETTOYAGE COMPLET DES ANCIENS ÉLÉMENTS
-- =======================================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.cv_data CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TYPE IF EXISTS subscription_tier CASCADE;

-- =======================================================================
-- 2. CRÉATION DES TABLES (AVEC SÉCURITÉ ET COHÉRENCE)
-- =======================================================================

-- Table Profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Remplacement de l'enum par un texte classique + contrainte de sécurité
  subscription_tier text NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'ai')),
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des Données de CV
CREATE TABLE public.cv_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id integer NOT NULL DEFAULT 1,
  cv_title text NOT NULL DEFAULT 'Mon CV',
  cv_content jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS cv_data_user_id_idx ON public.cv_data(user_id);

-- =======================================================================
-- 3. FONCTION DE SIGN-UP (PARFAITE POUR EMAIL & GOOGLE OAUTH)
-- =======================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, subscription_tier)
  VALUES (
    NEW.id,
    -- Extraction intelligente du nom de l'utilisateur
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',     -- 1. Nom fourni par Google OAuth
      NEW.raw_user_meta_data->>'fullName',      -- 2. Alternative frontend
      split_part(NEW.email, '@', 1),            -- 3. Début de l'adresse email
      'Utilisateur'                             -- 4. Sécurité si tout échoue
    ),
    -- Extraction de la photo de profil (Google)
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL),
    'free'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Déclencheur système lié à l'inscription
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =======================================================================
-- 4. SÉCURITÉ ET POLITIQUES (RLS)
-- =======================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_data ENABLE ROW LEVEL SECURITY;

-- Politiques pour PROFILES
CREATE POLICY "Utilisateurs peuvent voir leur propre profil" ON public.profiles 
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Le système peut créer le profil initial au signup" ON public.profiles 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Utilisateurs peuvent modifier leur propre profil" ON public.profiles 
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Politiques pour CV_DATA
CREATE POLICY "Utilisateurs peuvent voir leurs CV" ON public.cv_data 
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent créer leurs CV" ON public.cv_data 
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent modifier leurs CV" ON public.cv_data 
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent supprimer leurs CV" ON public.cv_data 
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =======================================================================
-- 5. AUTOMATISATION DES DATES DE MODIFICATION
-- =======================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER cv_data_updated_at BEFORE UPDATE ON public.cv_data FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();