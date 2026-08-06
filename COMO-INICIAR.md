# Cómo iniciar ChatBotEducativo

Guía de arranque **por fase**. Solo levanta los servicios que correspondan a la fase actual.

---

## Variables de entorno (.env)

Cada servicio tiene un **`.env.example`** (se sube a git) y un **`.env`** local (no se sube).

| Carpeta | Plantilla | Copiar a | Secretos a completar |
|---------|-----------|----------|----------------------|
| `infrastructure/` | `.env.example` | `.env` | `DATABASE_PASSWORD`, `JWT_SECRET`, `GOOGLE_GEMINI_API_KEY` |
| `backend/` | `.env.example` | `.env` | `JWT_SECRET` |
| `ai-service/` | `.env.example` | `.env` | `GOOGLE_GEMINI_API_KEY` |
| `mcp-server/` | `.env.example` | `.env` | (ninguno en v1) |
| `frontend/` | `.env.example` | `.env.local` | (ninguno; URLs públicas) |

```powershell
# Ejemplo rápido por servicio
copy infrastructure\.env.example infrastructure\.env
copy backend\.env.example backend\.env
copy ai-service\.env.example ai-service\.env
copy mcp-server\.env.example mcp-server\.env
copy frontend\.env.example frontend\.env.local
# Editar los .env y pegar GOOGLE_GEMINI_API_KEY, JWT_SECRET, etc.
```

---

## Fase 0 — Scaffold (actual)

No hay servicios que levantar. Validación:

```powershell
Get-ChildItem "d:\Proyectos\ProyectosDemos\ChatBotEducativo"
Get-Content "d:\Proyectos\ProyectosDemos\ChatBotEducativo\infrastructure\.env.example"
```

---

## Fase 1 — Datos JSON

No requiere servicios. Validar JSONs:

```powershell
Get-Content "mcp-server\data\students.json" | ConvertFrom-Json
```

---

## Fase 2 — MCP Server

**Terminal 1:**

```powershell
Set-Location "d:\Proyectos\ProyectosDemos\ChatBotEducativo\mcp-server"
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8002
```

Probar: http://localhost:8002/docs

```powershell
curl -X POST http://localhost:8002/api/tools/get_student_profile `
  -H "Content-Type: application/json" `
  -d '{"student_id": "user-01"}'
```

---

## Fase 3 — AI Service

**Requisito:** MCP Server corriendo en :8002

**Terminal 2:**

```powershell
Set-Location "d:\Proyectos\ProyectosDemos\ChatBotEducativo\ai-service"
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

Probar:

```powershell
curl -X POST http://localhost:8001/chat `
  -H "Content-Type: application/json" `
  -d '{"message": "¿Cuántos cursos tengo inscritos?", "student_id": "user-01"}'
```

---

## Fase 4 — Backend NestJS

**Requisitos:** PostgreSQL, MCP (:8002), AI Service (:8001)

**Terminal 3 — PostgreSQL (Docker o local):**

```powershell
Set-Location "d:\Proyectos\ProyectosDemos\ChatBotEducativo\infrastructure"
docker compose up postgres -d
```

**Terminal 4 — Backend:**

```powershell
Set-Location "d:\Proyectos\ProyectosDemos\ChatBotEducativo\backend"
npm run start:dev
```

Probar: http://localhost:4001/health

---

## Fase 5 — Frontend

**Requisitos:** Backend (:4001) y stack AI/MCP

**Terminal 5:**

```powershell
Set-Location "d:\Proyectos\ProyectosDemos\ChatBotEducativo\frontend"
npm run dev -- -p 3001
```

Abrir: http://localhost:3001/login

---

## Fase 6 — Docker unificado

Detener procesos locales y levantar todo el stack:

```powershell
Set-Location "d:\Proyectos\ProyectosDemos\ChatBotEducativo\infrastructure"
copy .env.example .env
# Editar .env: GOOGLE_GEMINI_API_KEY, JWT_SECRET
docker compose --env-file .env up -d --build
docker compose ps
```

| URL | Servicio |
|-----|----------|
| http://localhost:3001 | Frontend |
| http://localhost:4001/health | Backend |
| http://localhost:8001/health | AI Service |
| http://localhost:8002/docs | MCP Server |

---

## Fase 7 — Integración campusdemo

**Requisitos:** Stack educativo en Docker + campusdemo local

```powershell
# Terminal A — ChatBotEducativo (Docker)
Set-Location "d:\Proyectos\ProyectosDemos\ChatBotEducativo\infrastructure"
docker compose up -d

# Terminal B — campusdemo
Set-Location "d:\Proyectos\ProyectosDemos\campusdemo"
npm run dev -- -p 3005
```

Abrir: http://localhost:3005/dashboard — debe aparecer la burbuja de chat.

---

## Orden de arranque (resumen)

```
postgres → mcp-server → ai-service → backend → frontend
```

Para preguntas que requieran datos del alumno, **MCP Server debe estar activo** antes del AI Service.
