# Bookspace - Sistema de Reserva de Salas

> MVP funcional para el reto de seleccion de mentores - BECA IA SER ANDI, Etapa 3
> **Empresa simulada:** Automation Pro Max
> **Operador:** Universidad EAFIT - Nodo

## Arquitectura

```
Formulario ──▶ Validacion ──▶ Almacenamiento ──▶ Email (IA) + Webhook
de Reserva     en tiempo       localStorage       Generativo
               real            + Webhook n8n       HTML
```

**Entrada** - El usuario completa un formulario con: titulo, organizador, area, fecha, hora inicio/fin, numero de asistentes, y selecciona una sala.

**Validacion** - El sistema valida en tiempo real:
- Datos completos (campos obligatorios)
- Horario valido (fin > inicio)
- Capacidad de la sala vs asistentes
- Disponibilidad (no solapamiento con reservas existentes)

**Almacenamiento** - Cada reserva se guarda con informacion de auditoria: quien reservo, que reservo, cuando, para cuando, estado (confirmada / pendiente / rechazada / cancelada) y motivo de rechazo.

**Email** - Se genera un correo HTML profesional usando IA generativa. Incluye detalles de la reserva, recomendaciones, y alternativas en caso de rechazo.

## Reglas de conflicto y capacidad

| Regla | Comportamiento |
|-------|----------------|
| Doble reserva | Si existe solapamiento horario en la misma sala, se rechaza y sugiere hasta 3 salas alternativas |
| Capacidad | Si los asistentes superan la capacidad, se rechaza y sugiere salas mas grandes |
| Horario | La hora de fin debe ser posterior a la hora de inicio |
| Human-in-the-Loop | Salas de 25+ personas requieren aprobacion de un administrador |

## IA Generativa

La generacion de emails usa templates inteligentes con variables dinamicas:

**Variables:** `{titulo}`, `{organizador}`, `{equipo}`, `{sala_nombre}`, `{sala_capacidad}`, `{fecha}`, `{hora_inicio}`, `{hora_fin}`, `{num_asistentes}`, `{motivo_rechazo}`, `{alternativas[]}`

**Prompt implicito:** "Genera un correo profesional de confirmacion/rechazo de reserva de sala que incluya todos los detalles relevantes, recomendaciones practicas, y en caso de rechazo, alternativas disponibles."

## Integracion Webhook (n8n / Make / Zapier)

Cada reserva genera un payload JSON:

```json
{
  "evento": "reserva_confirmada",
  "reserva_id": "uuid",
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

## Roles

- **Usuario**: Crear reservas, historial, dashboard, mapa de salas, chat de soporte
- **Super Admin**: Todo + panel de aprobaciones (Human-in-the-Loop), actividad global

## Stack

- React 19 + Vite
- Framer Motion (animaciones)
- Phosphor Icons
- localStorage (simula BD)
- Vercel (deploy)
- Colores EAFIT institucional (Amarillo #FDB913 + Azul #004B85)

## Ejecutar

```bash
npm install
npm run dev
```

**Usuarios demo:**

| Email | Password | Rol |
|-------|----------|-----|
| ana.garcia@eafit.edu.co | eafit2026 | Usuario |
| carlos.mesa@eafit.edu.co | eafit2026 | Usuario |
| admin@eafit.edu.co | eafit2026 | Super Admin |

---

**BECA IA SER ANDI** - Universidad EAFIT - Nodo - Automation Pro Max
