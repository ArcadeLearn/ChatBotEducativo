# Secrets de GitHub Actions — deploy VPS

## Problema habitual

`campusdemo` despliega bien pero `ChatBotEducativo` falla con:

```text
ssh.ParsePrivateKey: ssh: this private key is passphrase protected
```

Eso **no es un bug del workflow**. Significa que el secret **`VPS_SSH_KEY` del repo ChatBotEducativo** no es la misma llave sin passphrase que usa `campusdemo`.

Los secrets son **por repositorio**. Aunque se llamen igual, pueden tener valores distintos.

---

## Secrets requeridos

### Compartidos (mismo valor en ambos repos u organización)

| Secret     | Ejemplo              |
|------------|----------------------|
| `VPS_HOST` | `191.101.232.219`    |
| `VPS_USER` | `root`               |
| `VPS_PORT` | `22`                 |
| `VPS_SSH_KEY` | Llave privada **sin passphrase** |

### Solo por repo (ruta de deploy)

| Repo              | Secret                    | Valor                      |
|-------------------|---------------------------|----------------------------|
| campusdemo        | `VPS_DEPLOY_PATH_CAMPUS`  | `/docker/campusdemo`       |
| ChatBotEducativo  | `VPS_DEPLOY_PATH_EDU`     | `/docker/ChatBotEducativo` |

**No se usa** `VPS_SSH_PASSPHRASE`.

---

## Solución recomendada: Organization secrets (ArcadeLearn)

1. **ArcadeLearn → Settings → Secrets and variables → Actions → New organization secret**
2. Crear: `VPS_HOST`, `VPS_USER`, `VPS_PORT`, `VPS_SSH_KEY`
3. En **Repository access**, habilitar `campusdemo` y `ChatBotEducativo`
4. En **ChatBotEducativo → Settings → Secrets**, **eliminar** los secrets duplicados (`VPS_HOST`, `VPS_USER`, `VPS_PORT`, `VPS_SSH_KEY`) para que aplique la organización
5. Dejar solo en cada repo su path: `VPS_DEPLOY_PATH_CAMPUS` / `VPS_DEPLOY_PATH_EDU`

> Si existe un secret a nivel repo con el mismo nombre, **gana el del repo** y puede seguir siendo el incorrecto.

---

## Comprobar la llave en tu PC (PowerShell)

Usa el archivo privado que funciona con campusdemo:

```powershell
# Debe conectar SIN pedir passphrase
ssh -i "C:\ruta\a\tu_llave_deploy" -p 22 root@191.101.232.219 "echo OK"

# Debe mostrar la clave pública sin pedir contraseña
ssh-keygen -y -f "C:\ruta\a\tu_llave_deploy"
```

Copiar al secret (contenido completo, con saltos de línea):

```powershell
Get-Content -Raw "C:\ruta\a\tu_llave_deploy" | Set-Clipboard
```

Pegar en GitHub → **Update** en `VPS_SSH_KEY`.

---

## Flujo CI (idéntico en SSH)

1. `appleboy/scp-action` — copia archivos al VPS
2. `appleboy/ssh-action` — `docker compose up -d --build`

Única diferencia: carpetas y archivos copiados según cada proyecto.
