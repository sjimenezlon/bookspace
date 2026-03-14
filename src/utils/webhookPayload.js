import { getRoomById } from '../store/reservations';

const N8N_WEBHOOK_URL = 'https://lasg5.app.n8n.cloud/webhook/bookspace-reserva';

/**
 * Generates a webhook-compatible JSON payload for n8n/Make/Zapier integration.
 */
export function buildWebhookPayload(reservation) {
  const room = getRoomById(reservation.roomId);
  const isConfirmed = reservation.status === 'confirmada';
  const isPending = reservation.status === 'pendiente';

  return {
    evento: isPending ? 'reserva_pendiente' : isConfirmed ? 'reserva_confirmada' : 'reserva_rechazada',
    timestamp: reservation.createdAt,
    reserva_id: reservation.id,
    estado: reservation.status,
    titulo: reservation.title,
    organizador: reservation.organizer,
    email_organizador: reservation.email || `${reservation.organizer.toLowerCase().replace(/\s+/g, '.')}@eafit.edu.co`,
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
}

/**
 * Sends the webhook payload to n8n.
 */
export async function sendWebhook(reservation) {
  const payload = buildWebhookPayload(reservation);

  console.log('[Bookspace → n8n] Enviando:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log('[Bookspace → n8n] Enviado exitosamente');
    } else {
      console.warn('[Bookspace → n8n] Respuesta:', response.status);
    }

    return { ok: response.ok, payload };
  } catch (err) {
    console.warn('[Bookspace → n8n] Error de conexión:', err.message);
    // No bloquear la reserva si el webhook falla
    return { ok: false, payload, error: err.message };
  }
}
