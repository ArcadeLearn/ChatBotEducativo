-- =============================================================================
-- ChatBotEducativo — Permisos sobre tablas existentes en edu_chatbot_db
-- =============================================================================
-- Ejecutar si edu-app falla con "permission denied for table ...".
-- Util despues de que TypeORM cree users, sessions y messages.
--
-- Desde el VPS:
--   docker exec -i n8n-postgres psql -U postgres -d edu_chatbot_db -f - < 02-grant-edu-chatbot-db.sql
-- =============================================================================

\c edu_chatbot_db

GRANT USAGE, CREATE ON SCHEMA public TO edu_chatbot_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO edu_chatbot_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO edu_chatbot_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO edu_chatbot_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO edu_chatbot_user;

\echo 'Permisos aplicados sobre tablas/secuencias existentes en edu_chatbot_db.'
