# Bookspace - Sistema Inteligente de Reserva de Salas

> MVP funcional para el reto de seleccion de mentores - **BECA IA SER ANDI**, Etapa 3
>
> **Empresa simulada:** Automation Pro Max
>
> **Operador:** Universidad EAFIT - Nodo
>
> **Created by:** InsignIA - Innovacion que transforma

**Demo en vivo:** https://bookspace-omega.vercel.app

---

## Arquitectura

```
┌──────────────┐    ┌───────────────┐    ┌──────────────┐    ┌────────────────┐
│  Formulario  │───▶│  Validacion   │───▶│  Supabase    │───▶│  Email (IA)    │
│  de Reserva  │    │  en tiempo    │    │  PostgreSQL  │    │  Generativo    │
│  (React)     │    │  real         │    │  (BD real)   │    │  HTML          │
└──────────────┘    └───────────────┘    └──────┬───────┘    └────────────────┘
                                                │
                                                ▼
                                         ┌──────────────┐
                                         │  Webhook n8n │
                                         │  (correo     │
                                         │   real)      │
                                         └──────────────┘
```

**Entrada** - El usuario ingresa con su correo electronico real y completa un formulario con: titulo, organizador, area, fecha, hora inicio/fin, numero de asistentes, y selecciona una sala disponible.

**Validacion** - El sistema valida en tiempo real contra la base de datos:
- Datos completos (campos obligatorios)
- Horario valido (fin > inicio)
- Capacidad de la sala vs asistentes
- Disponibilidad (no solapamiento con reservas existentes en Supabase)

**Almacenamiento** - Cada reserva se guarda en **Supabase (PostgreSQL)** con informacion completa de auditoria: quien reservo, que reservo, cuando, para cuando, estado (confirmada / pendiente / rechazada / cancelada), motivo de rechazo, quien aprobo/rechazo, y timestamps.

**Email** - Se genera un correo HTML profesional usando IA generativa. Incluye detalles de la reserva, recomendaciones, y alternativas en caso de rechazo.

**Webhook** - Cada reserva envia un POST automatico al webhook de n8n (`https://lasg5.app.n8n.cloud/webhook/bookspace-reserva`) con el payload completo para que el flujo de automatizacion envie el correo real al organizador.

## Funcionalidades

| Funcionalidad | Descripcion |
|---------------|-------------|
| Reserva en tiempo real | Formulario con validacion instantanea contra Supabase |
| Prevencion de doble reserva | Detecta solapamientos y sugiere hasta 3 alternativas |
| Validacion de capacidad | Bloquea salas insuficientes, sugiere las adecuadas |
| Sala optima automatica | Marca la mejor sala segun numero de asistentes |
| Filtro de disponibilidad | Toggle para mostrar solo salas disponibles en el horario |
| Email HTML con IA | Correo profesional de confirmacion o rechazo generado automaticamente |
| Human-in-the-Loop | Salas de 25+ personas requieren aprobacion de un administrador |
| Dashboard de metricas | 5 metricas en tiempo real (activas, hoy, semana, pendientes, rechazadas) |
| Graficos | Ocupacion por sala, horas pico, reservas por equipo |
| Mapa de salas | Vista por bloques con estado actual (disponible/en uso) |
| Historial auditable | Registro completo con filtros por estado |
| Cancelacion de reservas | Con trazabilidad completa |
| Panel de administracion | Cola de aprobaciones, actividad reciente, estadisticas |
| Exportar Excel/CSV | Descarga de datos para auditoria desde el panel admin |
| Chat de soporte | Bot automatizado + escalado a agente humano |
| Webhook n8n | Integracion en vivo para envio de correos reales |
| Roles | Usuario y Super Administrador con vistas diferenciadas |
| Base de datos real | Supabase PostgreSQL compartida entre todos los usuarios |

## Reglas de negocio

| Regla | Comportamiento |
|-------|----------------|
| Doble reserva | Si existe solapamiento horario en la misma sala, se rechaza y sugiere hasta 3 salas alternativas disponibles |
| Capacidad | Si los asistentes superan la capacidad de la sala, se rechaza y sugiere salas con capacidad suficiente |
| Horario | La hora de fin debe ser posterior a la hora de inicio |
| Human-in-the-Loop | Salas con capacidad >= 25 personas requieren aprobacion manual de un administrador |

## IA Generativa

La generacion de emails usa templates inteligentes con variables dinamicas:

**Variables:** `{titulo}`, `{organizador}`, `{equipo}`, `{sala_nombre}`, `{sala_capacidad}`, `{fecha}`, `{hora_inicio}`, `{hora_fin}`, `{num_asistentes}`, `{motivo_rechazo}`, `{alternativas[]}`

**Prompt implicito:** "Genera un correo profesional de confirmacion/rechazo de reserva de sala que incluya todos los detalles relevantes, recomendaciones practicas, y en caso de rechazo, alternativas disponibles con sus capacidades."

**Tipos de email generados:**
- **Confirmacion** - Incluye sala asignada, fecha/hora, organizador, asistentes, y 3 recomendaciones practicas
- **Rechazo** - Incluye motivo (conflicto/capacidad/datos invalidos), alternativas disponibles, e invitacion a reintentar

## Integracion Webhook (n8n)

Conectado en vivo a: `https://lasg5.app.n8n.cloud/webhook/bookspace-reserva`

Cada reserva envia automaticamente un POST con este payload:

```json
{
  "evento": "reserva_confirmada",
  "timestamp": "2026-03-14T14:11:36.001Z",
  "reserva_id": "e16fd9f1-0032-4f89-bcc5-727e7ea51bf8",
  "estado": "confirmada",
  "titulo": "Cierre mensual",
  "organizador": "Ana Garcia",
  "email_organizador": "ana.garcia@eafit.edu.co",
  "area": "Contabilidad",
  "sala_id": "APM10B1",
  "sala_nombre": "Sala 10 - B1",
  "sala_capacidad": 10,
  "fecha": "2026-03-20",
  "hora_inicio": "10:00",
  "hora_fin": "11:00",
  "num_asistentes": 8,
  "requiere_aprobacion": false,
  "motivo_rechazo": null,
  "alternativa_sugerida": null
}
```

**Eventos soportados:** `reserva_confirmada`, `reserva_pendiente`, `reserva_rechazada`

El webhook se dispara al:
- Crear una reserva (confirmada, pendiente, o rechazada)
- Aprobar una reserva desde el panel admin
- Rechazar una reserva desde el panel admin

## Base de datos (Supabase)

**Tablas:**

### `rooms` - Salas disponibles
| ID | Nombre | Capacidad | Tipo | Bloque |
|----|--------|-----------|------|--------|
| APM5A1 | Sala 5 - A1 | 5 | sala | Bloque 18 |
| APM5A2 | Sala 5 - A2 | 5 | sala | Bloque 18 |
| APM5A3 | Sala 5 - A3 | 5 | sala | Bloque 18 |
| APM10B1 | Sala 10 - B1 | 10 | sala | Bloque 19 |
| APM10B2 | Sala 10 - B2 | 10 | sala | Bloque 19 |
| APM10B3 | Sala 10 - B3 | 10 | sala | Bloque 19 |
| APM10B4 | Sala 10 - B4 | 10 | sala | Bloque 19 |
| APM10B5 | Sala 10 - B5 | 10 | sala | Bloque 19 |
| APM25C1 | Sala 25 - C1 | 25 | sala | Bloque 26 |
| APM50D1 | Auditorio 50 - D1 | 50 | auditorio | Bloque 26 |

### `reservations` - Registro de reservas
Columnas: id (UUID), title, organizer, email, team, date, start_time, end_time, attendees, room_id, room_name, room_capacity, status, needs_approval, reason, rejection_type, alternatives, approved_by, approved_at, rejected_by, rejected_at, cancelled_at, created_at

Row Level Security habilitado con politicas publicas para lectura, creacion y actualizacion.

## Roles

| Rol | Acceso |
|-----|--------|
| **Usuario** | Nueva reserva, dashboard, historial personal, mapa de salas, chat de soporte |
| **Super Admin** | Todo lo anterior + panel de aprobaciones (Human-in-the-Loop), actividad global, exportar Excel/CSV |

## Stack tecnico

| Tecnologia | Uso |
|------------|-----|
| React 19 | Frontend SPA |
| Vite | Build tool |
| Supabase | Base de datos PostgreSQL + API REST |
| Framer Motion | Animaciones y transiciones |
| Phosphor Icons | Iconografia |
| SheetJS (xlsx) | Exportacion Excel/CSV |
| n8n | Automatizacion de correos via webhook |
| Vercel | Deploy y hosting |
| Google Fonts | Cormorant Garamond + Outfit + DM Mono |
| Colores EAFIT | Amarillo #FDB913 + Azul #004B85 |

## Ejecutar localmente

```bash
git clone https://github.com/sjimenezlon/bookspace.git
cd bookspace
npm install
npm run dev
```

Abrir http://localhost:5173

## Acceso

No se requiere contrasena. Solo ingresa tu correo electronico.

- Activa el toggle "Acceder como administrador" para ver el panel admin.
- Las confirmaciones de reserva se envian al correo ingresado via n8n.

## Metricas en tiempo real

1. Total de reservas activas
2. Reservas del dia
3. Reservas de la semana
4. Reservas pendientes de aprobacion
5. Reservas rechazadas
6. Ocupacion por sala (horas reservadas vs disponibles)
7. Horas pico (franjas con mas reservas)
8. Reservas por area/equipo

## Mejoras futuras

- Autenticacion con OAuth (Google/Microsoft)
- Notificaciones push y por Teams/Slack
- Calendario visual tipo Google Calendar
- API REST para integracion con otros sistemas
- App movil (React Native)
- Deteccion de "no shows"
- Reportes automaticos semanales
- Integracion con sistemas de acceso fisico
- Panel de gestion de salas desde admin (crear/editar/desactivar)

---

**BECA IA SER ANDI** - Universidad EAFIT - Nodo - Automation Pro Max

**Created by** InsignIA - Innovacion que transforma
