-- =============================================================================
-- ChatBotEducativo — Endurecimiento opcional del usuario edu_chatbot_user
-- =============================================================================
-- Restringe la conexion del usuario SOLO a edu_chatbot_db (recomendado en prod).
-- Ejecutar como superusuario DESPUES de 01-create-edu-chatbot-db.sql.
--
-- REVISAR: descomenta solo las bases que existan en tu servidor.
-- Si una base no existe, comenta su linea REVOKE para evitar error.
-- =============================================================================

\c postgres

\echo 'Revocando CONNECT en otras bases (ajusta la lista segun tu servidor)...'

-- Bases tipicas en el mismo n8n-postgres
REVOKE CONNECT ON DATABASE postgres FROM edu_chatbot_user;
REVOKE CONNECT ON DATABASE n8n FROM edu_chatbot_user;

-- ChatBotInteligente — NO dar acceso cruzado
REVOKE CONNECT ON DATABASE chatbot_db FROM edu_chatbot_user;

-- Permitir unicamente edu_chatbot_db
GRANT CONNECT ON DATABASE edu_chatbot_db TO edu_chatbot_user;

\echo 'Usuario edu_chatbot_user restringido a edu_chatbot_db.'
