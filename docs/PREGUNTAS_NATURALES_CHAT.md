# Preguntas naturales — ChatBot Educativo Campus IECA

Guía de **formulaciones en lenguaje natural** para probar cada capacidad del chat.  
El alumno puede preguntar de muchas formas; el agente debe elegir la tool o el endpoint correcto.

**Usuario de prueba:** `carlos.ramirez@ieca.edu.mx` / `1234` (student_id: `user-01`)

---

## Backend NestJS (`:4001`)

### `GET /health`

| # | Pregunta / acción |
|---|-------------------|
| 1 | *(No es pregunta de chat)* — Verificar que el servicio responde |
| 2 | `curl http://localhost:4001/health` |

---

### `POST /auth/login`

| # | Formulación (UI login, no chat) |
|---|----------------------------------|
| 1 | Iniciar sesión con correo y contraseña |
| 2 | Usuario seed: carlos.ramirez@ieca.edu.mx / 1234 |

---

### `POST /sessions` · `GET /sessions` · `GET /sessions/:id/messages`

El chat crea sesión automáticamente. Estas rutas se usan al **recargar historial** o listar conversaciones.

| # | Equivalente en producto |
|---|-------------------------|
| 1 | Recargar `/chat` — debe restaurar la última sesión |
| 2 | Botón **Nueva sesión** — inicia conversación vacía |

---

### `POST /chat`

Endpoint principal del chat. Ejemplos abajo por tool MCP invocada.

---

## MCP Server — Tools educativas (`:8002`)

Cada pregunta del chat puede disparar una o más tools. Variantes agrupadas por tool.

---

### `get_student_profile` — Perfil del alumno

**Datos:** nombre, matrícula, horas, certificados, especialidad.

| Versión | Pregunta natural |
|---------|------------------|
| A | ¿Cuál es mi perfil? |
| B | ¿Quién soy en el campus? |
| C | Muéstrame mis datos de alumno |
| D | ¿Cuál es mi matrícula? |
| E | ¿Cuántas horas llevo estudiando? |
| F | ¿Cuál es mi especialidad? |
| G | Dame un resumen de mi cuenta estudiantil |

---

### `get_enrolled_courses` — Cursos inscritos (lista general)

**Datos:** todos los cursos con progreso %. Usar cuando preguntan por **varios** cursos o totales.

| Versión | Pregunta natural |
|---------|------------------|
| A | ¿Cuántos cursos tengo inscritos? |
| B | ¿Qué cursos estoy tomando? |
| C | Lista de mis cursos activos |
| D | ¿En qué cursos estoy inscrito actualmente? |
| E | Muéstrame mi carga académica |
| F | ¿Cuál es mi promedio de avance en todos mis cursos? |
| G | ¿Cómo voy en general con mis estudios? |

---

### `get_course_detail` — Detalle de **un** curso (módulos y lecciones)

**Datos:** módulos, lecciones, actividades completadas. Usar cuando nombran **un curso concreto**.

| Versión | Pregunta natural |
|---------|------------------|
| A | ¿Cuál es mi progreso en el curso de Yaskawa? |
| B | ¿Cómo voy en Programación de Células de Robótica Yaskawa? |
| C | ¿Qué módulos me faltan del curso de Yaskawa? |
| D | ¿En qué lección voy del curso de inglés técnico? |
| E | Detalle de mi avance en Metrología 3D FARO |
| F | ¿Qué actividades tengo pendientes en el curso de Prompt Engineering? |
| G | Explícame módulo por módulo cómo voy en Yaskawa |
| H | ¿Ya terminé el módulo 1 del curso de robots KUKA? |

---

### `search_course_catalog` — Catálogo / tienda de cursos

**Datos:** cursos disponibles para inscribirse (precio, nivel, categoría).

| Versión | Pregunta natural |
|---------|------------------|
| A | ¿Qué cursos de automatización están disponibles? |
| B | Busca cursos de inteligencia artificial |
| C | ¿Hay cursos de robótica nivel avanzado? |
| D | Quiero ver la tienda de cursos |
| E | ¿Qué puedo estudiar sobre PLC y control industrial? |
| F | Recomiéndame cursos de programación |
| G | ¿Cuánto cuesta un curso de Lean Six Sigma? |
| H | Cursos de categoría TI disponibles para inscribirme |

---

### `get_learning_paths` — Rutas de aprendizaje

**Datos:** rutas con nodos, prerequisitos, progreso.

| Versión | Pregunta natural |
|---------|------------------|
| A | ¿Qué rutas de aprendizaje hay? |
| B | Muéstrame las rutas disponibles en el campus |
| C | ¿Hay alguna ruta de Mecatrónica? |
| D | ¿Cuál es mi ruta de especialización? |
| E | Rutas de aprendizaje para automatización industrial |
| F | ¿En qué ruta debo continuar mis estudios? |

---

### `get_student_stats` — Estadísticas RPG / XP / dimensiones

**Datos:** XP, racha, dimensiones de habilidad, cursos acreditados.

| Versión | Pregunta natural |
|---------|------------------|
| A | ¿Cuántos XP tengo? |
| B | Muéstrame mis estadísticas de alumno |
| C | ¿Cómo está mi perfil RPG? |
| D | ¿Cuál es mi racha de días estudiando? |
| E | ¿En qué dimensiones soy más fuerte? |
| F | Resumen de mi historial académico y logros |
| G | ¿Cuántas horas he completado en total? |

---

### `get_certificates` — Certificados y constancias

**Datos:** lista de certificados con calificación y fecha.

| Versión | Pregunta natural |
|---------|------------------|
| A | Mis certificados |
| B | ¿Qué constancias tengo? |
| C | ¿Cuántos certificados he obtenido? |
| D | Muéstrame mis diplomas y certificaciones |
| E | ¿Cuál fue mi calificación en el Master de IA? |
| F | Lista de mis acreditaciones más recientes |
| G | ¿Tengo certificado de Lean Six Sigma? |
| H | Historial de certificados del campus |

---

### `get_announcements` — Avisos, eventos y promociones

**Datos:** avisos con imagen, fecha, tipo (evento/noticia/promoción).

| Versión | Pregunta natural |
|---------|------------------|
| A | ¿Cuándo es el próximo evento? |
| B | ¿Hay avisos nuevos en el campus? |
| C | ¿Qué promociones hay disponibles? |
| D | Muéstrame las noticias del IECA |
| E | ¿Hay algún evento esta semana? |
| F | Avisos y convocatorias actuales |
| G | ¿Qué actividades hay en el campus este mes? |

---

### `get_planteles` — Sedes y ubicaciones

**Datos:** planteles con ciudad, horarios, especialidades.

| Versión | Pregunta natural |
|---------|------------------|
| A | ¿Dónde están las sedes del IECA? |
| B | ¿Hay plantel en León? |
| C | Muéstrame los planteles disponibles |
| D | ¿Qué campus hay cerca de Guanajuato? |
| E | Sedes con especialidad en robótica |
| F | ¿Cuál es la dirección del plantel de Irapuato? |

---

### `get_invoices` — Facturas y pagos

**Datos:** historial CFDI, montos, estatus de pago.

| Versión | Pregunta natural |
|---------|------------------|
| A | ¿Cuáles son mis facturas? |
| B | Historial de pagos |
| C | ¿Tengo facturas pendientes? |
| D | Muéstrame mis recibos del campus |
| E | ¿Cuánto he pagado en total? |
| F | Estado de mis comprobantes fiscales |

---

## AI Service (`:8001`)

### `POST /chat` · `POST /chat/stream`

Recibe la pregunta del backend y ejecuta el agente LangGraph.  
Las preguntas de la tabla anterior son las mismas; la diferencia es solo técnica (HTTP directo vs proxy NestJS).

**Prueba rápida (AI directo):**

```powershell
curl -X POST http://localhost:8001/chat `
  -H "Content-Type: application/json" `
  -d '{"message":"¿Cuántos cursos tengo inscritos?","student_id":"user-01"}'
```

---

## Matriz rápida — ¿Qué pregunta usar?

| Intención del alumno | Tool esperada |
|----------------------|---------------|
| Perfil / matrícula | `get_student_profile` |
| Todos mis cursos / cuántos llevo | `get_enrolled_courses` |
| Un curso nombrado (Yaskawa, inglés…) | `get_course_detail` o filtro sobre enrolled |
| Buscar curso para inscribirse | `search_course_catalog` |
| Rutas de carrera | `get_learning_paths` |
| XP, racha, dimensiones | `get_student_stats` |
| Certificados / constancias | `get_certificates` |
| Eventos / avisos / promos | `get_announcements` |
| Sedes / planteles | `get_planteles` |
| Facturas / pagos | `get_invoices` |

---

## Batería mínima recomendada (smoke test)

1. ¿Cuántos cursos tengo inscritos?
2. ¿Cuál es mi progreso en el curso de Yaskawa?
3. Mis certificados
4. ¿Qué cursos de automatización están disponibles?
5. ¿Cuándo es el próximo evento?

Script E2E: `scripts/validate-fase4-e2e.py`  
Script Rich UI: `scripts/validate-rich-ui.py`

---

*Documento generado para pruebas manuales y validación del agente educativo. Actualizar cuando se agreguen nuevas tools.*
