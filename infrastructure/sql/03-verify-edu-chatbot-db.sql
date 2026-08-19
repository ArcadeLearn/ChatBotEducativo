-- =============================================================================
-- ChatBotEducativo — Verificacion de base, usuario y tablas
-- =============================================================================
-- Ejecutar como postgres o como edu_chatbot_user para probar acceso.
--
-- Desde el VPS:
--   docker exec -i n8n-postgres psql -U postgres -d postgres -f - < 03-verify-edu-chatbot-db.sql
-- =============================================================================

\echo '=== 1) Base de datos edu_chatbot_db ==='
SELECT datname, pg_get_userbyid(datdba) AS owner, encoding, datcollate
FROM pg_database
WHERE datname = 'edu_chatbot_db';

\echo ''
\echo '=== 2) Usuario edu_chatbot_user ==='
SELECT rolname, rolcanlogin, rolsuper
FROM pg_roles
WHERE rolname = 'edu_chatbot_user';

\echo ''
\echo '=== 3) Permiso CONNECT en edu_chatbot_db ==='
SELECT datname, has_database_privilege('edu_chatbot_user', datname, 'CONNECT') AS can_connect
FROM pg_database
WHERE datname = 'edu_chatbot_db';

\c edu_chatbot_db

\echo ''
\echo '=== 4) Owner del schema public ==='
SELECT nspname, pg_get_userbyid(nspowner) AS owner
FROM pg_namespace
WHERE nspname = 'public';

\echo ''
\echo '=== 5) Tablas esperadas (users, sessions, messages) ==='
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

\echo ''
\echo '=== 6) Conteo de usuarios seed (debe ser > 0 tras primer arranque de edu-app) ==='
SELECT CASE
  WHEN EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'users'
  ) THEN (SELECT COUNT(*)::text FROM users)
  ELSE 'tabla users aun no existe — falta primer arranque de edu-app con sync'
END AS users_count;

\echo ''
\echo '=== Fin verificacion ==='
