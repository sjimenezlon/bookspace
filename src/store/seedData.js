const STORAGE_KEY = 'apm_reservations';
const SEED_FLAG = 'apm_seeded_v3';

function today() {
  return new Date().toISOString().split('T')[0];
}

function addDays(base, days) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export function seedIfNeeded() {
  if (localStorage.getItem(SEED_FLAG)) return;
  // Clear old seed
  localStorage.removeItem('apm_seeded_v2');

  const t = today();
  const tomorrow = addDays(t, 1);
  const pasado = addDays(t, 2);
  const ayer = addDays(t, -1);

  const seed = [
    {
      id: crypto.randomUUID(), title: 'Cierre mensual contable', organizer: 'Ana García',
      team: 'Contabilidad', date: t, startTime: '09:00', endTime: '10:30',
      attendees: 8, roomId: 'APM10B1', roomName: 'Sala 10 - B1', roomCapacity: 10,
      status: 'confirmada', reason: null, createdAt: new Date(t + 'T07:30:00').toISOString(),
    },
    {
      id: crypto.randomUUID(), title: 'Comité de investigación IA', organizer: 'Carlos Mesa',
      team: 'Ingeniería', date: t, startTime: '10:00', endTime: '11:30',
      attendees: 4, roomId: 'APM5A1', roomName: 'Sala 5 - A1', roomCapacity: 5,
      status: 'confirmada', reason: null, createdAt: new Date(t + 'T08:00:00').toISOString(),
    },
    {
      id: crypto.randomUUID(), title: 'Taller Design Thinking', organizer: 'María López',
      team: 'Administración', date: t, startTime: '14:00', endTime: '16:00',
      attendees: 22, roomId: 'APM25C1', roomName: 'Sala 25 - C1', roomCapacity: 25,
      status: 'confirmada', needsApproval: true, approvedBy: 'Administrador',
      approvedAt: new Date(t + 'T09:30:00').toISOString(),
      reason: null, createdAt: new Date(t + 'T09:15:00').toISOString(),
    },
    {
      id: crypto.randomUUID(), title: 'Reunión semillero de automatización', organizer: 'Diego Restrepo',
      team: 'Tecnología', date: t, startTime: '11:00', endTime: '12:00',
      attendees: 9, roomId: 'APM10B3', roomName: 'Sala 10 - B3', roomCapacity: 10,
      status: 'confirmada', reason: null, createdAt: new Date(t + 'T08:45:00').toISOString(),
    },
    {
      id: crypto.randomUUID(), title: 'Sustentación proyecto de grado', organizer: 'Laura Vélez',
      team: 'Derecho', date: t, startTime: '15:00', endTime: '16:30',
      attendees: 5, roomId: 'APM5A2', roomName: 'Sala 5 - A2', roomCapacity: 5,
      status: 'confirmada', reason: null, createdAt: new Date(t + 'T10:20:00').toISOString(),
    },

    // Pending approval (human-in-the-loop)
    {
      id: crypto.randomUUID(), title: 'Conferencia Inteligencia Artificial', organizer: 'Andrés Ospina',
      team: 'Ingeniería', date: tomorrow, startTime: '09:00', endTime: '12:00',
      attendees: 45, roomId: 'APM50D1', roomName: 'Auditorio 50 - D1', roomCapacity: 50,
      status: 'pendiente', needsApproval: true,
      reason: null, createdAt: new Date(t + 'T11:00:00').toISOString(),
    },
    {
      id: crypto.randomUUID(), title: 'Foro economía digital 2026', organizer: 'Juliana Henao',
      team: 'Economía y Finanzas', date: pasado, startTime: '08:00', endTime: '13:00',
      attendees: 40, roomId: 'APM50D1', roomName: 'Auditorio 50 - D1', roomCapacity: 50,
      status: 'pendiente', needsApproval: true,
      reason: null, createdAt: new Date(t + 'T12:00:00').toISOString(),
    },

    // Tomorrow confirmed
    {
      id: crypto.randomUUID(), title: 'Mesa de trabajo economía circular', organizer: 'Juliana Henao',
      team: 'Economía y Finanzas', date: tomorrow, startTime: '10:00', endTime: '11:30',
      attendees: 8, roomId: 'APM10B2', roomName: 'Sala 10 - B2', roomCapacity: 10,
      status: 'confirmada', reason: null, createdAt: new Date(t + 'T12:00:00').toISOString(),
    },
    {
      id: crypto.randomUUID(), title: 'Planeación sprint automatización', organizer: 'Santiago JL',
      team: 'Tecnología', date: tomorrow, startTime: '14:00', endTime: '15:30',
      attendees: 6, roomId: 'APM10B4', roomName: 'Sala 10 - B4', roomCapacity: 10,
      status: 'confirmada', reason: null, createdAt: new Date(t + 'T13:00:00').toISOString(),
    },

    // Pasado mañana
    {
      id: crypto.randomUUID(), title: 'Workshop Power Platform', organizer: 'Felipe Ríos',
      team: 'Tecnología', date: pasado, startTime: '08:00', endTime: '12:00',
      attendees: 20, roomId: 'APM25C1', roomName: 'Sala 25 - C1', roomCapacity: 25,
      status: 'pendiente', needsApproval: true,
      reason: null, createdAt: new Date(t + 'T14:00:00').toISOString(),
    },
    {
      id: crypto.randomUUID(), title: 'Comité curricular Humanidades', organizer: 'Patricia Ángel',
      team: 'Humanidades', date: pasado, startTime: '10:00', endTime: '11:00',
      attendees: 4, roomId: 'APM5A3', roomName: 'Sala 5 - A3', roomCapacity: 5,
      status: 'confirmada', reason: null, createdAt: new Date(t + 'T15:00:00').toISOString(),
    },

    // Yesterday
    {
      id: crypto.randomUUID(), title: 'Revisión presupuesto semestral', organizer: 'Ana García',
      team: 'Contabilidad', date: ayer, startTime: '09:00', endTime: '10:00',
      attendees: 3, roomId: 'APM5A1', roomName: 'Sala 5 - A1', roomCapacity: 5,
      status: 'confirmada', reason: null, createdAt: new Date(ayer + 'T08:00:00').toISOString(),
    },
    {
      id: crypto.randomUUID(), title: 'Entrevista candidato docente', organizer: 'Carlos Mesa',
      team: 'Ingeniería', date: ayer, startTime: '14:00', endTime: '15:00',
      attendees: 4, roomId: 'APM5A2', roomName: 'Sala 5 - A2', roomCapacity: 5,
      status: 'confirmada', reason: null, createdAt: new Date(ayer + 'T10:00:00').toISOString(),
    },

    // Rejected
    {
      id: crypto.randomUUID(), title: 'Reunión equipo auditoría', organizer: 'Claudia Serna',
      team: 'Auditoría', date: t, startTime: '09:00', endTime: '10:00',
      attendees: 8, roomId: 'APM10B1', roomName: 'Sala 10 - B1', roomCapacity: 10,
      status: 'rechazada', reason: 'La sala "Sala 10 - B1" ya tiene una reserva que se solapa en la fecha ' + t + ' entre 09:00 y 10:30.',
      rejectionType: 'conflict',
      alternatives: [
        { id: 'APM10B2', name: 'Sala 10 - B2', capacity: 10 },
        { id: 'APM10B4', name: 'Sala 10 - B4', capacity: 10 },
      ],
      createdAt: new Date(t + 'T08:20:00').toISOString(),
    },
    {
      id: crypto.randomUUID(), title: 'Charla motivacional', organizer: 'Pedro Gómez',
      team: 'Gerencia', date: tomorrow, startTime: '10:00', endTime: '11:00',
      attendees: 8, roomId: 'APM5A1', roomName: 'Sala 5 - A1', roomCapacity: 5,
      status: 'rechazada', reason: 'La sala "Sala 5 - A1" tiene capacidad para 5 personas, pero se solicitan 8 asistentes.',
      rejectionType: 'capacity',
      alternatives: [
        { id: 'APM10B1', name: 'Sala 10 - B1', capacity: 10 },
        { id: 'APM10B2', name: 'Sala 10 - B2', capacity: 10 },
      ],
      createdAt: new Date(t + 'T09:30:00').toISOString(),
    },

    // Cancelled
    {
      id: crypto.randomUUID(), title: 'Clase magistral estadística', organizer: 'Roberto Cifuentes',
      team: 'Ciencias', date: tomorrow, startTime: '16:00', endTime: '18:00',
      attendees: 10, roomId: 'APM10B5', roomName: 'Sala 10 - B5', roomCapacity: 10,
      status: 'cancelada', reason: null,
      createdAt: new Date(t + 'T11:30:00').toISOString(),
      cancelledAt: new Date(t + 'T14:00:00').toISOString(),
    },
  ];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  localStorage.setItem(SEED_FLAG, 'true');
}
