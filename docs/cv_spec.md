# Especificación Funcional v0.1
## CV Builder App — "ResumeFlow" (nombre provisional)

---

## 1. Visión del producto

Aplicación web que permite a los usuarios crear, gestionar y exportar su currículum vitae de forma simple y rápida. El usuario carga su información una sola vez, elige una plantilla y un idioma, y descarga su CV en PDF en segundos. Modelo de negocio freemium: plantillas básicas gratuitas, plantillas premium con micropago único o suscripción.

---

## 2. Usuarios objetivo

- Profesionales en búsqueda activa de empleo
- Recién graduados armando su primer CV
- Profesionales que necesitan CV en múltiples idiomas (mercado LATAM → global)

---

## 3. Módulos funcionales

### 3.1 Autenticación
- Registro con email + contraseña
- Login con Google y LinkedIn (OAuth)
- Recuperación de contraseña por email
- Sesión persistente (JWT manejado por Supabase Auth)

### 3.2 Perfil del usuario (datos del CV)
El perfil se estructura en secciones:

| Sección | Campos |
|---|---|
| Datos personales | Nombre, apellido, título profesional, email, teléfono, ciudad, país, LinkedIn, GitHub/Portfolio |
| Resumen profesional | Texto libre (máx. 400 caracteres) |
| Experiencia laboral | Empresa, cargo, fecha inicio/fin, descripción (repetible) |
| Educación | Institución, título, año inicio/fin (repetible) |
| Habilidades | Lista de skills con nivel opcional (básico/intermedio/avanzado) |
| Idiomas | Idioma + nivel (A1–C2) |
| Certificaciones | Nombre, emisor, año (repetible) |
| Proyectos | Nombre, descripción, URL (repetible, opcional) |

- El usuario puede guardar cambios parciales en cualquier momento
- Los datos se persisten en base de datos; no se pierden entre sesiones
- Posibilidad de subir foto de perfil (almacenada en Supabase Storage)

### 3.3 Selector de plantilla
- Vista en cuadrícula con preview visual de cada plantilla
- Cada plantilla tiene etiqueta: **Gratis** o **Premium**
- Las plantillas premium muestran un candado y precio
- El usuario puede hacer hover/clic para previsualizar con sus propios datos antes de pagar
- Filtros: Moderno / Clásico / Creativo / Minimalista

### 3.4 Selector de idioma de exportación
- Tres opciones: Español, English, Português
- La selección afecta dos capas:
  - **Etiquetas fijas de la plantilla:** traducidas mediante i18n (`next-intl`). Ej: "Experiencia" → "Experience" → "Experiência"
  - **Contenido del usuario:** traducido automáticamente mediante Claude API antes de renderizar el PDF
- Flujo de traducción automática:
  1. Usuario selecciona idioma destino distinto al idioma en que cargó su perfil
  2. Se llama a Claude API con los campos de texto del perfil (resumen, descripción de experiencias, proyectos)
  3. Claude devuelve el contenido traducido
  4. Se renderiza la plantilla con el contenido traducido + etiquetas i18n
  5. Se genera el PDF
- El contenido original del perfil no se modifica; la traducción es efímera, solo para la exportación
- Se cachea la traducción por (user_id + idioma) para no repetir llamadas innecesarias

### 3.5 Motor de exportación PDF
- Al hacer clic en "Exportar CV":
  1. Se verifica si la plantilla seleccionada es accesible (gratuita o ya pagada)
  2. Se renderiza la plantilla en el servidor con los datos del usuario y el idioma elegido
  3. Puppeteer genera el PDF
  4. El PDF se devuelve como descarga directa (o se almacena en Supabase Storage con link temporal)
- Nombre del archivo: `CV_NombreApellido_[idioma].pdf`

### 3.6 Pagos y acceso premium

**Fase 1 — Pago único por plantilla (MVP)**
- Integración con Stripe (tarjeta internacional) y MercadoPago (LATAM)
- Precio sugerido: USD 2–5 por plantilla
- El acceso queda vinculado permanentemente a la cuenta del usuario
- Webhook de Stripe/MercadoPago actualiza tabla `user_template_access` en la BD
- No requiere guardar datos de tarjeta; cada compra es una transacción independiente

**Fase 2 — Suscripción mensual/anual (al escalar)**
- Plan mensual (~USD 4–6/mes) y plan anual con descuento (~USD 35–40/año)
- La suscripción activa desbloquea todas las plantillas premium presentes y futuras
- Gestión del ciclo de suscripción vía Stripe Billing (renovación, cancelación, gracia)
- Al cancelar: el usuario pierde acceso a premium pero conserva los PDFs ya generados
- Tabla `subscriptions` registra estado: `active`, `canceled`, `past_due`, `trialing`
- Posibilidad de ofrecer período de prueba gratuito de 7 días

**Lógica de acceso unificada**
Un usuario puede acceder a una plantilla premium si:
- Tiene una suscripción activa, O
- Tiene un registro en `user_template_access` para esa plantilla (compra única pasada)

---

## 4. Flujo principal del usuario

```
Registro/Login
     ↓
Completar perfil (secciones del CV)
     ↓
Ir a "Exportar CV"
     ↓
Elegir plantilla → Elegir idioma
     ↓
[Si es premium] → Pagar → Acceso desbloqueado
     ↓
Generar PDF → Descargar
```

---

## 5. Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 14+ (App Router), TypeScript, Tailwind CSS |
| Autenticación | Supabase Auth (email + OAuth) |
| Base de datos | Supabase (PostgreSQL) |
| Almacenamiento | Supabase Storage (fotos, PDFs) |
| Generación PDF | Puppeteer en API Route de Next.js |
| Traducción etiquetas | next-intl (i18n nativo) |
| Traducción contenido (automática) | Claude API |
| Pagos | Stripe + MercadoPago |
| Despliegue | Vercel (frontend) + Supabase Cloud (backend) |

---

## 6. Modelo de datos (borrador)

### `users` (gestionado por Supabase Auth)
- id, email, created_at

### `profiles`
- user_id (FK), first_name, last_name, headline, email, phone, city, country, linkedin_url, portfolio_url, photo_url, summary

### `experiences`
- id, user_id (FK), company, role, start_date, end_date, is_current, description, order_index

### `educations`
- id, user_id (FK), institution, degree, start_year, end_year, order_index

### `skills`
- id, user_id (FK), name, level, order_index

### `languages`
- id, user_id (FK), language, level

### `certifications`
- id, user_id (FK), name, issuer, year

### `projects`
- id, user_id (FK), name, description, url

### `templates`
- id, name, thumbnail_url, category, is_premium, price_usd, is_active

### `user_template_access`
- user_id (FK), template_id (FK), purchased_at, payment_provider, payment_id

---

## 7. Plantillas — plan inicial

| # | Nombre | Tipo | Precio |
|---|---|---|---|
| 1 | Clean Basic | Gratis | $0 |
| 2 | Simple Classic | Gratis | $0 |
| 3 | Modern Blue | Premium | $3 |
| 4 | Executive Dark | Premium | $3 |

---

## 8. Funcionalidades futuras (backlog)

- Traducción automática del contenido del usuario con IA (Claude API)
- Exportación en formato Word (.docx)
- Sección de carta de presentación vinculada al perfil
- Generación de resumen profesional con IA basado en la experiencia del usuario
- Análisis de compatibilidad del CV con una oferta laboral (ATS scoring)
- Compartir CV online con URL pública y personalizable
- Múltiples versiones de CV por usuario (ej. CV técnico vs CV ejecutivo)
- Dashboard de analytics: cuántas veces fue visto el CV compartido

---

## 9. Criterios de lanzamiento (MVP)

- [ ] Autenticación funcional (email + Google)
- [ ] CRUD completo del perfil de usuario
- [ ] Al menos 2 plantillas gratuitas funcionando con exportación PDF
- [ ] Selector de idioma operativo para ES/EN/PT en plantillas
- [ ] Al menos 1 plantilla premium con cobro real vía Stripe
- [ ] Deploy en Vercel con dominio propio

---

*Versión 0.1 — sujeto a revisión*
