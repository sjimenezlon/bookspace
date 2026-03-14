import { getRoomById } from '../data/rooms';

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-');
  const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  return `${parseInt(d)} de ${months[parseInt(m)-1]} de ${y}`;
}

function formatTime(t) {
  const [h, m] = t.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'p.m.' : 'a.m.';
  const h12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${h12}:${m} ${ampm}`;
}

export function generateConfirmationEmail(reservation) {
  const room = getRoomById(reservation.roomId);
  const roomName = room?.name || reservation.roomName;
  const roomCap = room?.capacity || reservation.roomCapacity;

  return {
    subject: `Reserva Confirmada: ${reservation.title} - ${roomName}`,
    html: `
<div style="max-width:600px;margin:0 auto;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#0c1018;color:#e8e6e3;border-radius:12px;overflow:hidden;border:1px solid #1a2035;">
  <div style="background:linear-gradient(135deg,#1a1f2e 0%,#0c1018 100%);padding:32px 32px 24px;border-bottom:2px solid #d4a017;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td><span style="font-family:Georgia,serif;font-size:28px;font-weight:700;color:#d4a017;letter-spacing:-0.5px;">ROOM</span><span style="font-family:Georgia,serif;font-size:28px;font-weight:300;color:#e8e6e3;letter-spacing:-0.5px;">CONTROL</span></td>
      <td align="right"><span style="background:#22c55e;color:#0c1018;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Confirmada</span></td>
    </tr></table>
  </div>
  <div style="padding:32px;">
    <p style="color:#7a8199;margin:0 0 4px;font-size:13px;text-transform:uppercase;letter-spacing:2px;">Reserva de sala</p>
    <h1 style="margin:0 0 24px;font-family:Georgia,serif;font-size:24px;color:#e8e6e3;font-weight:400;">${reservation.title}</h1>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding:12px 16px;background:#111520;border-radius:8px 8px 0 0;border-bottom:1px solid #1a2035;" width="40%">
          <span style="color:#7a8199;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Sala</span><br>
          <span style="color:#d4a017;font-size:16px;font-weight:500;">${roomName}</span>
          <span style="color:#7a8199;font-size:13px;"> (${roomCap} pers.)</span>
        </td>
        <td style="padding:12px 16px;background:#111520;border-radius:8px 8px 0 0;border-bottom:1px solid #1a2035;">
          <span style="color:#7a8199;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Fecha</span><br>
          <span style="color:#e8e6e3;font-size:16px;">${formatDate(reservation.date)}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 16px;background:#111520;border-bottom:1px solid #1a2035;">
          <span style="color:#7a8199;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Horario</span><br>
          <span style="color:#e8e6e3;font-size:16px;">${formatTime(reservation.startTime)} - ${formatTime(reservation.endTime)}</span>
        </td>
        <td style="padding:12px 16px;background:#111520;border-bottom:1px solid #1a2035;">
          <span style="color:#7a8199;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Asistentes</span><br>
          <span style="color:#e8e6e3;font-size:16px;">${reservation.attendees} personas</span>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 16px;background:#111520;border-radius:0 0 0 8px;">
          <span style="color:#7a8199;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Organizador</span><br>
          <span style="color:#e8e6e3;font-size:16px;">${reservation.organizer}</span>
        </td>
        <td style="padding:12px 16px;background:#111520;border-radius:0 0 8px 0;">
          <span style="color:#7a8199;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Equipo</span><br>
          <span style="color:#e8e6e3;font-size:16px;">${reservation.team}</span>
        </td>
      </tr>
    </table>
    <div style="background:#111520;border-left:3px solid #d4a017;padding:16px;border-radius:0 8px 8px 0;margin-bottom:24px;">
      <p style="margin:0;color:#d4a017;font-size:13px;font-weight:600;">Recomendaciones</p>
      <ul style="margin:8px 0 0;padding-left:18px;color:#7a8199;font-size:14px;line-height:1.6;">
        <li>Llegue 5 minutos antes para configurar el equipo de la sala.</li>
        <li>Verifique que los asistentes tengan el enlace virtual si aplica.</li>
        <li>Al finalizar, deje la sala en orden para el siguiente usuario.</li>
      </ul>
    </div>
    <p style="color:#4a5168;font-size:12px;margin:0;text-align:center;">
      ID de reserva: <span style="color:#7a8199;font-family:monospace;">${reservation.id?.slice(0,8).toUpperCase()}</span>
      &nbsp;&bull;&nbsp; Generado por IA &nbsp;&bull;&nbsp; Automation Pro Max
    </p>
  </div>
</div>`,
  };
}

export function generateRejectionEmail(reservation) {
  const room = getRoomById(reservation.roomId);
  const roomName = room?.name || 'N/A';
  const alternatives = reservation.alternatives || [];

  let reasonText = '';
  switch (reservation.rejectionType) {
    case 'conflict':
      reasonText = 'La sala seleccionada ya tiene una reserva en el horario solicitado.';
      break;
    case 'capacity':
      reasonText = `La sala "${roomName}" no tiene capacidad suficiente para ${reservation.attendees} asistentes.`;
      break;
    case 'invalid_time':
      reasonText = 'El horario ingresado no es valido (la hora de fin debe ser posterior a la hora de inicio).';
      break;
    default:
      reasonText = reservation.reason || 'No se pudo completar la reserva.';
  }

  const altHtml = alternatives.length > 0
    ? `<div style="margin-top:16px;">
        <p style="color:#d4a017;font-size:13px;font-weight:600;margin:0 0 8px;">Alternativas disponibles:</p>
        ${alternatives.map(a => `
          <div style="background:#111520;padding:10px 14px;border-radius:6px;margin-bottom:6px;display:flex;justify-content:space-between;">
            <span style="color:#e8e6e3;">${a.name}</span>
            <span style="color:#7a8199;">Capacidad: ${a.capacity}</span>
          </div>
        `).join('')}
      </div>`
    : '';

  return {
    subject: `Reserva No Disponible: ${reservation.title || 'Sin titulo'}`,
    html: `
<div style="max-width:600px;margin:0 auto;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#0c1018;color:#e8e6e3;border-radius:12px;overflow:hidden;border:1px solid #1a2035;">
  <div style="background:linear-gradient(135deg,#1a1f2e 0%,#0c1018 100%);padding:32px 32px 24px;border-bottom:2px solid #ef4444;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td><span style="font-family:Georgia,serif;font-size:28px;font-weight:700;color:#d4a017;letter-spacing:-0.5px;">ROOM</span><span style="font-family:Georgia,serif;font-size:28px;font-weight:300;color:#e8e6e3;letter-spacing:-0.5px;">CONTROL</span></td>
      <td align="right"><span style="background:#ef4444;color:white;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Rechazada</span></td>
    </tr></table>
  </div>
  <div style="padding:32px;">
    <p style="color:#7a8199;margin:0 0 4px;font-size:13px;text-transform:uppercase;letter-spacing:2px;">Solicitud de reserva</p>
    <h1 style="margin:0 0 24px;font-family:Georgia,serif;font-size:24px;color:#e8e6e3;font-weight:400;">${reservation.title || 'Sin titulo'}</h1>
    <div style="background:rgba(239,68,68,0.1);border-left:3px solid #ef4444;padding:16px;border-radius:0 8px 8px 0;margin-bottom:20px;">
      <p style="margin:0;color:#ef4444;font-size:14px;font-weight:500;">${reasonText}</p>
    </div>
    ${altHtml}
    <p style="color:#7a8199;font-size:14px;margin-top:24px;">
      Le invitamos a intentar nuevamente seleccionando una sala alternativa o un horario diferente.
    </p>
    <p style="color:#4a5168;font-size:12px;margin:24px 0 0;text-align:center;">
      ID: <span style="color:#7a8199;font-family:monospace;">${reservation.id?.slice(0,8).toUpperCase()}</span>
      &nbsp;&bull;&nbsp; Generado por IA &nbsp;&bull;&nbsp; Automation Pro Max
    </p>
  </div>
</div>`,
  };
}
