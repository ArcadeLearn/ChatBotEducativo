# Datos JSON educativos

Fuente de verdad simulada para las tools del MCP Server. Derivados de los mocks de [campusdemo](../../campusdemo/src/data/).

## Archivos

| Archivo | Registros | Descripción |
|---------|-----------|-------------|
| `students.json` | 3 | Perfiles estudiante, instructor, admin |
| `enrolled_courses.json` | 1 alumno, 4 cursos | Cursos inscritos con módulos y lecciones |
| `course_catalog.json` | 31 | Catálogo de tienda |
| `learning_paths.json` | 11 rutas | Rutas de aprendizaje con nodos |
| `student_stats.json` | 25 cursos + RPG | Progreso del alumno `user-01` |
| `certificates.json` | 25 | Constancias acreditadas |
| `announcements.json` | 10 | Avisos, eventos, promociones |
| `planteles.json` | 18 | Sedes IECA |
| `invoices.json` | 2 | Facturas del alumno `user-01` |

## Regenerar desde campusdemo

```powershell
Set-Location "d:\Proyectos\ProyectosDemos\ChatBotEducativo"
npx tsx --tsconfig scripts/tsconfig.json scripts/export-campus-data.ts
```

## Alumno de prueba principal

- **ID:** `user-01`
- **Nombre:** Carlos Eduardo Ramírez
- **Matrícula:** IECA-2026-8842
- **Email:** carlos.ramirez@ieca.edu.mx
