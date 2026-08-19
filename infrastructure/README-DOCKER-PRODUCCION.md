# ChatBotEducativo en produccion interna (sin DNS publico)

Este despliegue crea un unico contenedor `edu-app` (frontend + backend + ai-service + mcp-server)
conectado a Postgres existente (`n8n-postgres`) usando una base de datos nueva (`edu_chatbot_db`).

## 1) Prerrequisitos en VPS

- Red Docker existente: `n8n_default` (la misma de Traefik/n8n).
- Repositorio clonado en: `/docker/ChatBotEducativo`.
- Archivo `infrastructure/.env.prod` creado desde `infrastructure/.env.prod.example`.

## 2) Preparar base de datos (una sola vez)

Scripts SQL en [`sql/`](./sql/README.md). Mismo servidor `n8n-postgres` que ChatBotInteligente; base y usuario **nuevos**.

1. Edita `sql/01-create-edu-chatbot-db.sql` y reemplaza `TU_PASSWORD_SEGURO`.
2. Ejecuta desde el VPS:

```bash
cd /docker/ChatBotEducativo/infrastructure/sql
docker exec -i n8n-postgres psql -U postgres -d postgres < 01-create-edu-chatbot-db.sql
docker exec -i n8n-postgres psql -U postgres -d postgres < 03-verify-edu-chatbot-db.sql
```

3. (Opcional) Restringir acceso solo a `edu_chatbot_db`:

```bash
docker exec -i n8n-postgres psql -U postgres -d postgres < 04-harden-edu-chatbot-user.sql
```

4. Actualiza en `.env.prod` (misma password del script):

```env
DATABASE_URL=postgresql://edu_chatbot_user:TU_PASSWORD_SEGURO@n8n-postgres:5432/edu_chatbot_db
```

## 3) Levantar contenedor interno

**Primer arranque (crear tablas):** en `.env.prod` usa temporalmente `NODE_ENV=development` para que TypeORM cree `users`, `sessions` y `messages` y el backend inserte usuarios seed. Luego vuelve a `NODE_ENV=production` y recrea el contenedor.

```bash
cd /docker/ChatBotEducativo/infrastructure
docker compose --env-file .env.prod -f docker-compose.prod-internal.yml up -d --build
docker compose -f docker-compose.prod-internal.yml ps
```

Si el login falla con `permission denied for table users`:

```bash
docker exec -i n8n-postgres psql -U postgres -d edu_chatbot_db < sql/02-grant-edu-chatbot-db.sql
```

## 4) Verificaciones rapidas

Desde el VPS:

```bash
docker exec edu-app curl -fsS http://127.0.0.1:4001/health
docker exec edu-app curl -fsS http://127.0.0.1:8001/health
docker exec edu-app curl -fsS http://127.0.0.1:8002/health
```

Esperado: respuestas `200` en los tres endpoints.

## 5) Integracion con campusdemo

- `campusdemo` publica `https://iecacampus.arcadevs.cloud`.
- Rewrites en campusdemo:
  - `/edu-chat/:path*` -> `http://edu-app:3001/:path*`
  - `/api/edu-chat-proxy/:path*` -> `http://edu-app:4001/:path*`
- CORS backend debe incluir: `https://iecacampus.arcadevs.cloud`.

## 6) Checklist final

- [ ] `edu-app` en estado `Up (healthy)`.
- [ ] `/api/edu-chat/health` en campusdemo devuelve disponible.
- [ ] `/edu-chat/embed` carga dentro del iframe.
- [ ] Login desde campusdemo genera JWT y abre burbuja correctamente.
