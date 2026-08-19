# Scripts SQL — ChatBotEducativo en n8n-postgres

Base de datos dedicada en el **mismo Postgres** que ChatBotInteligente (`n8n-postgres`), sin tocar `chatbot_db`.

| Script | Cuando ejecutarlo |
|--------|-------------------|
| `01-create-edu-chatbot-db.sql` | **Una vez** — crea BD, usuario y permisos base |
| `02-grant-edu-chatbot-db.sql` | Si hay `permission denied for table ...` |
| `03-verify-edu-chatbot-db.sql` | Despues de crear BD y/o tras primer arranque de `edu-app` |
| `04-harden-edu-chatbot-user.sql` | Opcional — limita conexion solo a `edu_chatbot_db` |

## Orden recomendado

1. Editar `01-create-edu-chatbot-db.sql` → reemplazar `TU_PASSWORD_SEGURO`.
2. Ejecutar script 01.
3. Configurar `infrastructure/.env.prod` con la misma password en `DATABASE_URL`.
4. Levantar `edu-app` (primer arranque con sync — ver README-DOCKER-PRODUCCION.md).
5. Ejecutar script 03 para verificar tablas y seed.
6. (Opcional) Ejecutar script 04 para endurecer acceso.

## Ejecucion desde el VPS

Copia la carpeta `sql/` al VPS o clona el repo en `/docker/ChatBotEducativo`.

```bash
cd /docker/ChatBotEducativo/infrastructure/sql

# 1) Crear BD y usuario
docker exec -i n8n-postgres psql -U postgres -d postgres < 01-create-edu-chatbot-db.sql

# 2) Verificar
docker exec -i n8n-postgres psql -U postgres -d postgres < 03-verify-edu-chatbot-db.sql

# 3) (Opcional) Endurecer
docker exec -i n8n-postgres psql -U postgres -d postgres < 04-harden-edu-chatbot-user.sql
```

## Probar conexion como edu_chatbot_user

```bash
docker exec -it n8n-postgres psql -U edu_chatbot_user -d edu_chatbot_db -c "SELECT current_user, current_database();"
```

## DATABASE_URL en `.env.prod`

```env
DATABASE_URL=postgresql://edu_chatbot_user:TU_PASSWORD_SEGURO@n8n-postgres:5432/edu_chatbot_db
```

El hostname `n8n-postgres` funciona **desde el contenedor `edu-app`** en la red `n8n_default`.
