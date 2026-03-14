import { getRoomById } from '../data/rooms';

/**
 * Generates a webhook-compatible JSON payload for n8n/Make/Zapier integration.
 * This payload is what gets sent to the automation tool when a reservation is created.
 */
export function buildWebhookPayload(reservation) {
  const room = getRoomById(reservation.roomId);
  const isConfirmed = reservation.status === 'confirmada';
  const isPending = reservation.status === 'pendiente';

  const base = {
    evento: isPending ? 'reserva_pendiente' : isConfirmed ? 'reserva_confirmada' : 'reserva_rechazada',
    timestamp: reservation.createdAt,
    reserva_id: reservation.id,
    estado: reservation.status,
    titulo: reservation.title,
    organizador: reservation.organizer,
    email_organizador: `${reservation.organizer.toLowerCase().replace(/\s+/g, '.')}@eafit.edu.co`,
    area: reservation.team,
    sala_id: reservation.roomId,
    sala_nombre: room?.name || reservation.roomName,
    sala_capacidad: room?.capacity || reservation.roomCapacity,
    fecha: reservation.date,
    hora_inicio: reservation.startTime,
    hora_fin: reservation.endTime,
    num_asistentes: reservation.attendees,
    requiere_aprobacion: reservation.needsApproval || false,
    motivo_rechazo: reservation.reason || null,
    alternativa_sugerida: reservation.alternatives?.length > 0
      ? `${reservation.alternatives[0].name} disponible en ese horario`
      : null,
  };

  return base;
}

/**
 * Simulates sending the webhook payload.
 * In production, this would POST to the n8n webhook URL.
 */
export function simulateWebhookSend(reservation, webhookUrl) {
  const payload = buildWebhookPayload(reservation);

  console.log('[Bookspace Webhook] Payload enviado:', JSON.stringify(payload, null, 2));

  // In production:
  // return fetch(webhookUrl, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(payload),
  // });

  return Promise.resolve({ ok: true, payload });
}
