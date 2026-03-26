-- ============================================================
-- CV BUILDER — Esquema completo (PostgreSQL / Supabase)
-- ============================================================
-- NOTA: la tabla "auth.users" la gestiona Supabase Auth.
-- Todas las demás tablas viven en el schema "public".
-- RLS (Row Level Security) activado en todas las tablas.
-- ============================================================


-- ------------------------------------------------------------
-- 1. PERFIL PRINCIPAL
-- Una fila por usuario. Se crea al confirmar el registro.
-- ------------------------------------------------------------
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name    TEXT,
  last_name     TEXT,
  headline      TEXT,                      -- "Full Stack Developer"
  email         TEXT,                      -- puede diferir del auth email
  phone         TEXT,
  city          TEXT,
  country       TEXT,
  linkedin_url  TEXT,
  portfolio_url TEXT,
  photo_url     TEXT,                      -- ruta en Supabase Storage
  summary       TEXT,                      -- resumen profesional (máx 400 chars)
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);


-- ------------------------------------------------------------
-- 2. EXPERIENCIA LABORAL
-- Múltiples filas por usuario, ordenadas por order_index.
-- ------------------------------------------------------------
CREATE TABLE experiences (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company     TEXT NOT NULL,
  role        TEXT NOT NULL,
  start_date  DATE NOT NULL,
  end_date    DATE,                        -- NULL si es trabajo actual
  is_current  BOOLEAN DEFAULT false,
  description TEXT,
  order_index SMALLINT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);


-- ------------------------------------------------------------
-- 3. EDUCACIÓN
-- ------------------------------------------------------------
CREATE TABLE educations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  institution  TEXT NOT NULL,
  degree       TEXT NOT NULL,
  field        TEXT,                       -- "Ingeniería en Sistemas"
  start_year   SMALLINT,
  end_year     SMALLINT,
  is_current   BOOLEAN DEFAULT false,
  order_index  SMALLINT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT now()
);


-- ------------------------------------------------------------
-- 4. HABILIDADES
-- ------------------------------------------------------------
CREATE TABLE skills (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  level       TEXT CHECK (level IN ('basic', 'intermediate', 'advanced')),
  order_index SMALLINT DEFAULT 0
);


-- ------------------------------------------------------------
-- 5. IDIOMAS DEL USUARIO
-- (distintos al idioma de exportación del CV)
-- ------------------------------------------------------------
CREATE TABLE user_languages (
  id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name    TEXT NOT NULL,           -- "Inglés", "Portugués"
  level   TEXT CHECK (level IN ('A1','A2','B1','B2','C1','C2','Native'))
);


-- ------------------------------------------------------------
-- 6. CERTIFICACIONES
-- ------------------------------------------------------------
CREATE TABLE certifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  issuer      TEXT,
  issue_year  SMALLINT,
  url         TEXT,
  order_index SMALLINT DEFAULT 0
);


-- ------------------------------------------------------------
-- 7. PROYECTOS
-- ------------------------------------------------------------
CREATE TABLE projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  url         TEXT,
  order_index SMALLINT DEFAULT 0
);


-- ------------------------------------------------------------
-- 8. PLANTILLAS
-- Administradas por el equipo, no por el usuario.
-- ------------------------------------------------------------
CREATE TABLE templates (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  slug         TEXT UNIQUE NOT NULL,       -- "modern-blue"
  thumbnail_url TEXT,
  category     TEXT CHECK (category IN ('modern','classic','creative','minimal')),
  is_premium   BOOLEAN DEFAULT false,
  price_usd    NUMERIC(5,2) DEFAULT 0,
  is_active    BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Datos iniciales
INSERT INTO templates (name, slug, category, is_premium, price_usd) VALUES
  ('Clean Basic',    'clean-basic',    'minimal',  false, 0),
  ('Simple Classic', 'simple-classic', 'classic',  false, 0),
  ('Modern Blue',    'modern-blue',    'modern',   true,  3.00),
  ('Executive Dark', 'executive-dark', 'modern',   true,  3.00);


-- ------------------------------------------------------------
-- 9. ACCESO A PLANTILLAS (compra única)
-- Un registro = acceso permanente a esa plantilla.
-- ------------------------------------------------------------
CREATE TABLE user_template_access (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  template_id      UUID NOT NULL REFERENCES templates(id),
  purchased_at     TIMESTAMPTZ DEFAULT now(),
  payment_provider TEXT CHECK (payment_provider IN ('stripe','mercadopago')),
  payment_id       TEXT,                  -- ID de la transacción externa
  amount_paid      NUMERIC(5,2),
  UNIQUE(user_id, template_id)
);


-- ------------------------------------------------------------
-- 10. SUSCRIPCIONES (fase 2)
-- Un usuario puede tener una suscripción activa a la vez.
-- ------------------------------------------------------------
CREATE TABLE subscriptions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  status               TEXT CHECK (status IN (
                         'trialing','active','past_due',
                         'canceled','unpaid','incomplete'
                       )),
  plan                 TEXT CHECK (plan IN ('monthly','annual')),
  current_period_start TIMESTAMPTZ,
  current_period_end   TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ DEFAULT now()
);


-- ------------------------------------------------------------
-- 11. CACHÉ DE TRADUCCIONES
-- Evita llamar a Claude API dos veces para la misma combinación.
-- TTL sugerido: invalidar si updated_at del perfil > translated_at
-- ------------------------------------------------------------
CREATE TABLE translation_cache (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_lang    TEXT CHECK (target_lang IN ('en','es','pt')),
  translated_data JSONB NOT NULL,          -- snapshot traducido del perfil
  profile_hash   TEXT,                    -- hash del perfil original para invalidar
  translated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, target_lang)
);


-- ------------------------------------------------------------
-- 12. HISTORIAL DE EXPORTACIONES (opcional pero útil)
-- Para analytics y para ofrecer "descargar último CV" rápido.
-- ------------------------------------------------------------
CREATE TABLE export_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  template_id UUID REFERENCES templates(id),
  language    TEXT CHECK (language IN ('en','es','pt')),
  pdf_url     TEXT,                        -- URL temporal en Supabase Storage
  exported_at TIMESTAMPTZ DEFAULT now()
);


-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX idx_experiences_user    ON experiences(user_id);
CREATE INDEX idx_educations_user     ON educations(user_id);
CREATE INDEX idx_skills_user         ON skills(user_id);
CREATE INDEX idx_user_languages_user ON user_languages(user_id);
CREATE INDEX idx_certifications_user ON certifications(user_id);
CREATE INDEX idx_projects_user       ON projects(user_id);
CREATE INDEX idx_uta_user            ON user_template_access(user_id);
CREATE INDEX idx_subscriptions_user  ON subscriptions(user_id);
CREATE INDEX idx_translation_cache_user ON translation_cache(user_id);


-- ============================================================
-- ROW LEVEL SECURITY — ejemplo para profiles
-- Aplicar patrón similar en todas las tablas
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuario ve solo su perfil"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuario edita solo su perfil"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Las tablas de contenido (experiences, skills, etc.) siguen
-- el mismo patrón: USING (auth.uid() = user_id)
