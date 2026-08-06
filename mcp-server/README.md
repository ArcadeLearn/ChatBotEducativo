# MCP Server — FastAPI

Tools educativas que leen JSONs de `data/` (cursos, alumnos, rutas, planteles, etc.).

**Puerto:** 8002  
**Fase:** 2 ✅ Completada

## Arranque local

```powershell
Set-Location "d:\Proyectos\ProyectosDemos\ChatBotEducativo\mcp-server"
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8002
```

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Estado del servicio |
| GET | `/api/tools` | Lista de tools |
| GET | `/api/tools/descriptions` | Descripciones para el LLM |
| POST | `/api/tools/{tool_name}` | Invocar tool |

## Tools disponibles

- `get_student_profile`, `get_enrolled_courses`, `get_course_detail`
- `search_course_catalog`, `get_learning_paths`, `get_student_stats`
- `get_certificates`, `get_announcements`, `get_planteles`, `get_invoices`

Swagger: http://localhost:8002/docs
