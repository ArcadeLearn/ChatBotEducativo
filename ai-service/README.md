# AI Service — FastAPI + LangGraph

Agente educativo que procesa preguntas en lenguaje natural y delega al MCP Server.

**Puerto:** 8001  
**Fase:** 3 ✅ Completada  
**Modelo default:** `gemini-3.5-flash` (reemplazo de 2.5-flash, retiro ~oct 2026)

## Arranque local

**Requisito:** MCP Server corriendo en :8002

```powershell
Set-Location "d:\Proyectos\ProyectosDemos\ChatBotEducativo\ai-service"
copy .env.example .env
# Editar .env: GOOGLE_GEMINI_API_KEY, LLM_MODEL=gemini-3.5-flash
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Estado + modelo + MCP disponible |
| POST | `/chat` | Pregunta → respuesta JSON |
| POST | `/chat/stream` | Respuesta SSE |

## Ejemplo

```powershell
python -c "import httpx; r=httpx.post('http://127.0.0.1:8001/chat', json={'message':'Cuantos cursos tengo inscritos?','student_id':'user-01'}, timeout=120); print(r.json()['tools_used'], r.json()['model'])"
```

Swagger: http://localhost:8001/docs
