# Secrets de GitHub Actions — deploy VPS

## Cómo debe funcionar

Ambos repos (`campusdemo` y `ChatBotEducativo`) usan el **mismo patrón**:

1. `appleboy/scp-action` copia archivos al VPS
2. `appleboy/ssh-action` ejecuta `docker compose up -d --build`

Secrets compartidos:

| Secret | Ejemplo |
|--------|---------|
| `VPS_HOST` | `191.101.232.219` |
| `VPS_USER` | `root` |
| `VPS_PORT` | `22` |
| `VPS_SSH_KEY` | Llave privada para CI |

Secrets solo del repo:

| Repo | Secret | Valor |
|------|--------|-------|
| campusdemo | `VPS_DEPLOY_PATH_CAMPUS` | `/docker/campusdemo` |
| ChatBotEducativo | `VPS_DEPLOY_PATH_EDU` | `/docker/ChatBotEducativo` |

**No hay `VPS_SSH_PASSPHRASE`** — la llave en `VPS_SSH_KEY` debe ser **sin contraseña**.

---

## Problema actual

Si CI falla con:

```text
ssh: this private key is passphrase protected
```

la llave pegada en GitHub **tiene passphrase**. Eso rompe CI en **ambos** repos aunque el valor “sea el mismo”.

El sitio en producción puede seguir funcionando si el deploy fue **manual** por SSH; eso no significa que CI funcione.

---

## Solución (una sola vez)

### 1. Crear llave solo para CI, sin passphrase

En PowerShell:

```powershell
ssh-keygen -t ed25519 -f "$env:USERPROFILE\.ssh\deploy_ci_arcadelearn" -N '""'
```

### 2. Autorizarla en el VPS

```powershell
type "$env:USERPROFILE\.ssh\deploy_ci_arcadelearn.pub" | ssh root@191.101.232.219 "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
```

(Usa tu llave actual para entrar al VPS en ese comando.)

### 3. Probar que entra sin pedir contraseña

```powershell
ssh -i "$env:USERPROFILE\.ssh\deploy_ci_arcadelearn" -p 22 root@191.101.232.219 "echo OK"
```

Debe imprimir `OK` **sin** pedir passphrase.

### 4. Copiar la privada al portapapeles

```powershell
Get-Content -Raw "$env:USERPROFILE\.ssh\deploy_ci_arcadelearn" | Set-Clipboard
```

### 5. Actualizar GitHub Secrets

En **campusdemo** y **ChatBotEducativo** (o en Organization secrets de ArcadeLearn):

- **Update** `VPS_SSH_KEY` → pegar la nueva privada
- Mantener `VPS_HOST`, `VPS_USER`, `VPS_PORT` iguales
- Cada repo conserva su path de deploy

Recomendado: **Organization secrets** en ArcadeLearn para `VPS_HOST`, `VPS_USER`, `VPS_PORT`, `VPS_SSH_KEY` y borrar duplicados a nivel repo.

---

## Alternativa: quitar passphrase a la llave actual

Solo si recuerdas la contraseña:

```powershell
ssh-keygen -p -f "C:\ruta\a\tu_llave_actual" -N '""'
```

Luego vuelve a pegar esa llave en `VPS_SSH_KEY` de ambos repos.
