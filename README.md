# 🐷 Marrana Keepalive

Sistema automatizado para mantener vivos los proyectos Supabase de Naty.

## 🎯 Qué hace

Supabase pausa los proyectos del plan Free después de **7 días sin actividad**. Este repo ejecuta un script cada 5 días que pinguea todos los proyectos para mantenerlos activos.

## 📦 Proyectos monitoreados

| # | Proyecto | Cuenta |
|---|----------|--------|
| 1 | salud-marrana | directivasaintlouis |
| 2 | paes-lab | directivasaintlouis |
| 3 | naty-bienestar | nhernandezcifuentes |
| 4 | racuna-lgtms | nhernandezcifuentes |
| 5 | hackea-calculadora | natalia@hackea.pro |
| 6 | disc-hackea | natalia@hackea.pro |

## ⏰ Frecuencia

- **Automático**: cada 5 días, a las 07:00 hora Chile
- **Manual**: desde la pestaña "Actions" → "Marrana Keepalive" → "Run workflow"

## 🚨 Si algo falla

Cuando un ping falla, el workflow queda **rojo en GitHub** y se puede ver el detalle en Actions. Posibles causas:

- El proyecto fue eliminado o pausado (revisar dashboard de Supabase)
- La anon key cambió o caducó (actualizar `ping.js`)
- Supabase tuvo un problema temporal (esperar al próximo ciclo)

## 🔧 Mantenimiento

### Agregar un proyecto nuevo
Editar `ping.js` y añadir un objeto en el array `PROYECTOS` con:
- `nombre`
- `cuenta`
- `url`
- `anonKey`

### Eliminar un proyecto
Quitar el objeto correspondiente del array.

### Cambiar la frecuencia
Editar el `cron` en `.github/workflows/keepalive.yml`. Por ejemplo:
- `'0 10 */3 * *'` → cada 3 días
- `'0 10 * * 1'` → todos los lunes

## 🔒 Seguridad

Las **anon keys** de Supabase son públicas por diseño y están protegidas por **Row Level Security (RLS)** del lado de Supabase. No comprometen los datos de los proyectos.

## 📝 Cómo funciona técnicamente

1. GitHub Actions ejecuta `ping.js` cada 5 días
2. Para cada proyecto, hace un `GET` al endpoint `/rest/v1/{tabla}?limit=1`
3. Esa consulta cuenta como "actividad" para Supabase, reseteando el contador de 7 días
4. Si todos los pings fueron exitosos, el workflow queda verde ✅
5. Si alguno falló, queda rojo ❌ y GitHub puede notificarte por email
