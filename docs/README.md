# ChatBotEducativo

Monorepo del chatbot educativo para **Campus IECA**. Permite a los alumnos hacer preguntas en lenguaje natural sobre sus cursos, avance, certificados, rutas de aprendizaje, planteles y más.

## Arquitectura

```
Usuario / campusdemo (:3005)
        │
        ▼
Frontend (:3001) ──► Backend NestJS (:4001) ──► AI Service (:8001)
                                                      │
                                                      ▼
                                              MCP Server (:8002)
                                                      │
                                                      ▼
                                              JSON data (mcp-server/data/)
```

| Servicio | Puerto | Responsabilidad |
|----------|--------|-----------------|
| `frontend` | 3001 | UI de chat + widget `<ChatBubble />` |
| `backend` | 4001 | Auth JWT, sesiones, mensajes, proxy al AI |
| `ai-service` | 8001 | Agente LangGraph + Gemini |
| `mcp-server` | 8002 | Tools educativas que leen JSON |
| `postgres` | 5432 | Sesiones y mensajes |

## Estructura del monorepo

```
ChatBotEducativo/
├── ai-service/       # FastAPI + LangGraph
├── backend/          # NestJS
├── frontend/         # Next.js
├── mcp-server/       # FastAPI + tools + data/
├── infrastructure/   # docker-compose.yml + .env
├── docs/             # documentación y plan
└── COMO-INICIAR.md   # guía de arranque por fase
```

## Plan de desarrollo

El plan maestro está en [chatboteducativo_plan_c48a3699.plan.md](./chatboteducativo_plan_c48a3699.plan.md).

| Fase | Contenido | Estado |
|------|-----------|--------|
| 0 | Scaffold monorepo | Completada |
| 1 | JSONs de datos educativos | Completada |
| 2 | MCP Server (10 tools) | Completada |
| 3 | AI Service (agente LangGraph) | Completada |
| 4 | Backend NestJS | Completada |
| 5 | Frontend chat standalone | Pendiente |
| 6 | Docker unificado | Pendiente |
| 7 | Widget en campusdemo | Pendiente |

## Arranque rápido

Ver [COMO-INICIAR.md](../COMO-INICIAR.md) en la raíz del proyecto.

### Variables de entorno

Cada servicio incluye `.env.example` (plantilla sin secretos, **sí va a git**). Copia a `.env` y completa claves antes de arrancar. Ver tabla en `COMO-INICIAR.md`.

### Docker (Fase 6+)

```powershell
cd infrastructure
copy .env.example .env
# Editar .env con GOOGLE_GEMINI_API_KEY
docker compose --env-file .env up -d --build
```

### Local por servicio (desarrollo)

Orden recomendado: **MCP → AI Service → Backend → Frontend**

## Estándar de tamaño de archivos

| Umbral | Líneas | Acción |
|--------|--------|--------|
| Normal | ≤ 400 | Sin acción |
| Revisar | 401–600 | Evaluar extracción |
| Advertencia | 601–800 | Refactorizar antes de continuar |
| Límite | 801–1000 | Solo fixtures JSON |
| Prohibido | > 1000 | Dividir obligatoriamente |

## Integración con campusdemo

En la Fase 7 se embebe el componente `<ChatBubble />` en [campusdemo](https://github.com/...) para que el alumno pueda chatear desde cualquier vista del campus.
