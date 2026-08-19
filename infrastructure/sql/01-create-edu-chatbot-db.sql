-- =============================================================================
-- ChatBotEducativo — Creacion de base de datos en Postgres existente (n8n-postgres)
-- =============================================================================
-- Ejecutar UNA SOLA VEZ como superusuario (postgres).
--
-- Desde el VPS:
--   docker exec -i n8n-postgres psql -U postgres -d postgres -f - < 01-create-edu-chatbot-db.sql
--
-- O dentro del contenedor:
--   docker exec -it n8n-postgres psql -U postgres -d postgres
--   \i /ruta/al/script/01-create-edu-chatbot-db.sql
--
-- IMPORTANTE:
--   1. Reemplaza TU_PASSWORD_SEGURO antes de ejecutar.
--   2. No modifica chatbot_db ni chatbot_user de ChatBotInteligente.
--   3. Tras ejecutar, copia la misma password en infrastructure/.env.prod (DATABASE_URL).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1) Crear base de datos dedicada
-- ---------------------------------------------------------------------------
SELECT 'CREATE DATABASE edu_chatbot_db WITH ENCODING = ''UTF8'''
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'edu_chatbot_db')\gexec

-- ---------------------------------------------------------------------------
-- 2) Crear usuario dedicado (idempotente: solo si no existe)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'edu_chatbot_user') THEN
    CREATE USER edu_chatbot_user WITH PASSWORD 'TU_PASSWORD_SEGURO';
    RAISE NOTICE 'Usuario edu_chatbot_user creado.';
  ELSE
    RAISE NOTICE 'Usuario edu_chatbot_user ya existe. Si necesitas cambiar password: ALTER USER edu_chatbot_user WITH PASSWORD ''...'';';
  END IF;
END
$$;

-- ---------------------------------------------------------------------------
-- 3) Propietario de la base (permite CREATE TABLE en PG 15+)
-- ---------------------------------------------------------------------------
ALTER DATABASE edu_chatbot_db OWNER TO edu_chatbot_user;

-- Permiso de conexion explicito
GRANT CONNECT ON DATABASE edu_chatbot_db TO edu_chatbot_user;

-- ---------------------------------------------------------------------------
-- 4) Permisos sobre schema public dentro de edu_chatbot_db
-- ---------------------------------------------------------------------------
\c edu_chatbot_db

ALTER SCHEMA public OWNER TO edu_chatbot_user;
GRANT USAGE, CREATE ON SCHEMA public TO edu_chatbot_user;
GRANT ALL ON SCHEMA public TO edu_chatbot_user;

-- Permisos sobre objetos existentes (util si el script se re-ejecuta)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO edu_chatbot_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO edu_chatbot_user;

-- Permisos por defecto para tablas/secuencias futuras (TypeORM al primer arranque)
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO edu_chatbot_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO edu_chatbot_user;

-- Extension util para UUID (TypeORM usa uuid nativo de PG 13+, pero no estorba)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------------
-- 5) Resumen
-- ---------------------------------------------------------------------------
\echo ''
\echo '=== ChatBotEducativo: base lista ==='
\echo 'Base:     edu_chatbot_db'
\echo 'Usuario:  edu_chatbot_user'
\echo 'Host Docker (desde edu-app): n8n-postgres:5432'
\echo ''
\echo 'DATABASE_URL sugerida en .env.prod:'
\echo 'postgresql://edu_chatbot_user:TU_PASSWORD_SEGURO@n8n-postgres:5432/edu_chatbot_db'
\echo ''
\echo 'Siguiente paso: levantar edu-app y crear tablas (ver README-DOCKER-PRODUCCION.md).'
\echo ''
