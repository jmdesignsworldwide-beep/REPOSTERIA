# REPOSTERIA

Proyecto con integración de Supabase.

## Configuración de Supabase

Las claves de Supabase se gestionan mediante variables de entorno. Consulta la
guía completa paso a paso en **[`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md)**:

- Cómo configurar las variables en local (`.env.local`).
- Cómo añadirlas en **Vercel → Environment Variables**.
- Cómo ejecutar **migraciones** (crear/cambiar tablas) sin terminal, usando un
  Personal Access Token (PAT) temporal y la Management API de Supabase.

### Variables de entorno

| Variable | Visibilidad | Origen (Supabase → Settings → API) |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Pública | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Pública | anon / public key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secreta** (solo servidor) | service_role key |

> ⚠️ La `service_role key` da acceso total a la base de datos saltándose las
> reglas de seguridad (RLS). **Nunca** debe llevar el prefijo `NEXT_PUBLIC_` ni
> exponerse en el navegador, y **nunca** se sube a GitHub.
