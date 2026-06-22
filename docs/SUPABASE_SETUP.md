# Guía de configuración de Supabase

Guía pensada para hacerse **solo por interfaces web** (copiar, pegar y clics).
No requiere terminal ni programar.

---

## 1. Tus 3 claves (Supabase → Settings → API)

| Clave en Supabase | Variable de entorno | ¿Pública? |
|---|---|---|
| **Project URL** | `NEXT_PUBLIC_SUPABASE_URL` | Sí |
| **anon / public key** | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sí |
| **service_role key** | `SUPABASE_SERVICE_ROLE_KEY` | **No — secreta, solo servidor** |

> El prefijo `NEXT_PUBLIC_` hace que la variable sea visible en el navegador.
> Por eso la `service_role` (que da acceso total a la base de datos) **nunca**
> lleva ese prefijo.

---

## 2. Configurar las claves en local (`.env.local`)

Ya existe el archivo **`.env.local`** en la raíz del proyecto con los nombres
correctos. Solo hay que pegar los valores después del `=`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
```

✅ `.env.local` está en `.gitignore`, por lo que **nunca se sube a GitHub**.

---

## 3. Configurar las claves en Vercel (Environment Variables)

Aquí es donde realmente importan para el sitio publicado.

1. Entra a [vercel.com](https://vercel.com) → abre tu proyecto **REPOSTERIA**.
2. Ve a la pestaña **Settings** → menú lateral **Environment Variables**.
3. Añade **una por una** estas tres variables. Para cada una:
   - **Key (nombre):** el nombre exacto de la tabla de abajo.
   - **Value (valor):** pega el valor desde Supabase → Settings → API.
   - **Environments:** marca **Production**, **Preview** y **Development**.

   | Key | Value | Marcar "Sensitive" |
   |---|---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL | No |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon / public key | No |
   | `SUPABASE_SERVICE_ROLE_KEY` | service_role key | **Sí ✅** |

4. Para `SUPABASE_SERVICE_ROLE_KEY`, activa la opción **"Sensitive"** antes de
   guardar. Esto hace que Vercel oculte el valor para siempre (ni siquiera se
   puede volver a leer desde el panel).
5. Pulsa **Save** en cada una.
6. Si el proyecto ya estaba desplegado, ve a **Deployments** → en el último
   despliegue, menú **⋯** → **Redeploy**, para que tome las variables nuevas.

> ℹ️ Las variables `NEXT_PUBLIC_*` se incrustan en el build, así que tras
> cambiarlas hay que **volver a desplegar** para que surtan efecto.

---

## 4. Migraciones (crear / cambiar tablas) — método PAT temporal

Para crear o modificar tablas **sin terminal ni connection string**, usamos un
**Personal Access Token (PAT)** temporal y la **Management API** de Supabase.

### Pasos

1. En Supabase, ve a **Account** (tu avatar arriba a la derecha) →
   **Access Tokens** → **Generate new token**.
   - Ponle un nombre, p. ej. `migracion-temporal`.
   - Copia el token (empieza por `sbp_...`). **Solo se muestra una vez.**
2. Pégamelo aquí en el chat **junto con el Project Ref** (lo encuentras en
   Supabase → Settings → General → "Reference ID", o es la parte `xxxxxxxx` de
   tu Project URL `https://xxxxxxxx.supabase.co`).
3. Yo aplico la migración usando la Management API (endpoint
   `POST /v1/projects/{ref}/database/query`).
4. Cuando termine, **te aviso explícitamente** para que **borres el token** en
   el mismo sitio (Account → Access Tokens → icono de papelera).

> 🔒 El PAT da control administrativo de tu cuenta. Por eso es **temporal**:
> se usa una vez y se borra. Nunca se guarda en el repositorio ni en `.env`.

### ¿Por qué este método?

- No necesitas instalar nada ni usar la terminal.
- No expone la contraseña de la base de datos ni el connection string.
- El acceso es revocable al instante borrando el token.
