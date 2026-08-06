# Frontend — Next.js 16

Interfaz de chat standalone y widget `<ChatBubble />` para campusdemo.

**Puerto:** 3001  
**Stack:** Next.js 16, React 19, Tailwind, TanStack Query, Vercel AI SDK

## Rutas

| Ruta | Descripción |
|------|-------------|
| `/login` | Login con usuarios seed |
| `/chat` | Chat completo + burbuja flotante |
| `/widget` | Demo del widget embebible |
| `/api/chat` | Proxy streaming → backend `POST /chat` |

## Desarrollo local

Requisitos: backend (:4001), AI (:8001) y MCP (:8002) corriendo.

```powershell
cd frontend
copy .env.example .env.local
npm install
npm run dev
```

Abrir: http://localhost:3001/login

Usuarios seed (password `1234`):
- `carlos.ramirez@ieca.edu.mx`
- `alejandro.morales@ieca.edu.mx`
- `elena.gutierrez@ieca.gob.mx`

## Validación

```powershell
python ../scripts/validate-fase5-frontend.py
```

## Componente exportable

`src/components/widget/ChatBubble.tsx` — botón flotante + ventana de chat. Se integrará en campusdemo (Fase 7).
