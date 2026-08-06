# Backend — NestJS

API de negocio: auth JWT, sesiones, mensajes y proxy al AI Service.

**Puerto:** 4001  
**Fase:** 4 ✅ Completada

## Arranque local

**Requisitos:** PostgreSQL, MCP (:8002), AI Service (:8001)

```powershell
# PostgreSQL
Set-Location "d:\Proyectos\ProyectosDemos\ChatBotEducativo\infrastructure"
docker compose up postgres -d

# Backend
Set-Location "d:\Proyectos\ProyectosDemos\ChatBotEducativo\backend"
copy .env.example .env
npm install
npm run start:dev
```

## Endpoints

| Método | Ruta | Auth |
|--------|------|------|
| GET | `/health` | No |
| POST | `/auth/login` | No |
| POST | `/sessions` | JWT |
| GET | `/sessions` | JWT |
| GET | `/sessions/:id/messages` | JWT |
| POST | `/chat` | JWT |

## Usuarios seed (password: `1234`)

- `carlos.ramirez@ieca.edu.mx` → user-01 (estudiante)
- `alejandro.morales@ieca.edu.mx` → user-02 (instructor)
- `elena.gutierrez@ieca.gob.mx` → user-03 (admin)

Swagger: http://localhost:4001/api/docs
