import { ROOMS, getRoomById, getRoomsByCapacity } from '../data/rooms';

const STORAGE_KEY = 'apm_reservations';

// Rooms that require admin approval (capacity >= 25)
const APPROVAL_THRESHOLD = 25;

function loadReservations() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveReservations(reservations) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
}

export function getReservations() {
  return loadReservations();
}

export function getActiveReservations() {
  return loadReservations().filter(r => r.status === 'confirmada' || r.status === 'pendiente');
}

export function getPendingReservations() {
  return loadReservations().filter(r => r.status === 'pendiente');
}

function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function overlaps(startA, endA, startB, endB) {
  const a0 = timeToMinutes(startA), a1 = timeToMinutes(endA);
  const b0 = timeToMinutes(startB), b1 = timeToMinutes(endB);
  return a0 < b1 && b0 < a1;
}

export function validateReservation(data) {
  const errors = [];

  if (!data.title?.trim()) errors.push('El título de la reunión es obligatorio.');
  if (!data.organizer?.trim()) errors.push('El organizador es obligatorio.');
  if (!data.team?.trim()) errors.push('El área o equipo es obligatorio.');
  if (!data.date) errors.push('La fecha es obligatoria.');
  if (!data.startTime) errors.push('La hora de inicio es obligatoria.');
  if (!data.endTime) errors.push('La hora de fin es obligatoria.');
  if (!data.attendees || data.attendees < 1) errors.push('El número de asistentes debe ser al menos 1.');
  if (!data.roomId) errors.push('Debe seleccionar una sala.');

  if (errors.length > 0) return { valid: false, errors, type: 'incomplete' };

  if (timeToMinutes(data.endTime) <= timeToMinutes(data.startTime)) {
    errors.push('La hora de fin debe ser posterior a la hora de inicio.');
    return { valid: false, errors, type: 'invalid_time' };
  }

  const room = getRoomById(data.roomId);
  if (!room) {
    errors.push('Sala no encontrada.');
    return { valid: false, errors, type: 'invalid_room' };
  }

  if (data.attendees > room.capacity) {
    const alternatives = getRoomsByCapacity(data.attendees);
    errors.push(`La sala "${room.name}" tiene capacidad para ${room.capacity} personas, pero se solicitan ${data.attendees} asistentes.`);
    return {
      valid: false,
      errors,
      type: 'capacity',
      alternatives: alternatives.slice(0, 3),
    };
  }

  const existing = getActiveReservations();
  const conflicting = existing.filter(
    r => r.roomId === data.roomId && r.date === data.date && overlaps(data.startTime, data.endTime, r.startTime, r.endTime)
  );

  if (conflicting.length > 0) {
    const busyRoomIds = new Set(
      existing
        .filter(r => r.date === data.date && overlaps(data.startTime, data.endTime, r.startTime, r.endTime))
        .map(r => r.roomId)
    );
    const availableAlternatives = ROOMS
      .filter(r => !busyRoomIds.has(r.id) && r.capacity >= data.attendees)
      .sort((a, b) => a.capacity - b.capacity)
      .slice(0, 3);

    errors.push(`La sala "${room.name}" ya tiene una reserva que se solapa en la fecha ${data.date} entre ${conflicting[0].startTime} y ${conflicting[0].endTime}.`);
    return {
      valid: false,
      errors,
      type: 'conflict',
      conflicting: conflicting[0],
      alternatives: availableAlternatives,
    };
  }

  return { valid: true };
}

export function getAvailableRooms(date, startTime, endTime) {
  if (!date || !startTime || !endTime) return ROOMS.map(r => r.id);
  const existing = getActiveReservations();
  const busyIds = new Set(
    existing
      .filter(r => r.date === date && overlaps(startTime, endTime, r.startTime, r.endTime))
      .map(r => r.roomId)
  );
  return ROOMS.filter(r => !busyIds.has(r.id)).map(r => r.id);
}

export function createReservation(data) {
  const validation = validateReservation(data);
  if (!validation.valid) {
    const rejection = {
      ...data,
      id: crypto.randomUUID(),
      status: 'rechazada',
      reason: validation.errors.join(' '),
      rejectionType: validation.type,
      alternatives: validation.alternatives || [],
      createdAt: new Date().toISOString(),
    };
    const all = loadReservations();
    all.push(rejection);
    saveReservations(all);
    return { success: false, reservation: rejection, validation };
  }

  const room = getRoomById(data.roomId);
  const needsApproval = room.capacity >= APPROVAL_THRESHOLD;

  const reservation = {
    ...data,
    id: crypto.randomUUID(),
    roomName: room.name,
    roomCapacity: room.capacity,
    status: needsApproval ? 'pendiente' : 'confirmada',
    needsApproval,
    reason: null,
    createdAt: new Date().toISOString(),
  };

  const all = loadReservations();
  all.push(reservation);
  saveReservations(all);

  return { success: true, reservation, needsApproval };
}

export function approveReservation(id, adminName) {
  const all = loadReservations();
  const idx = all.findIndex(r => r.id === id);
  if (idx === -1) return false;
  all[idx].status = 'confirmada';
  all[idx].approvedBy = adminName;
  all[idx].approvedAt = new Date().toISOString();
  saveReservations(all);
  return true;
}

export function rejectReservationAdmin(id, adminName, reason) {
  const all = loadReservations();
  const idx = all.findIndex(r => r.id === id);
  if (idx === -1) return false;
  all[idx].status = 'rechazada';
  all[idx].reason = reason || 'Rechazada por administrador.';
  all[idx].rejectedBy = adminName;
  all[idx].rejectedAt = new Date().toISOString();
  saveReservations(all);
  return true;
}

export function cancelReservation(id) {
  const all = loadReservations();
  const idx = all.findIndex(r => r.id === id);
  if (idx === -1) return false;
  all[idx].status = 'cancelada';
  all[idx].cancelledAt = new Date().toISOString();
  saveReservations(all);
  return true;
}

export function clearAllReservations() {
  saveReservations([]);
}

// Metrics
export function getMetrics(userFilter) {
  const all = loadReservations();
  const filtered = userFilter ? all.filter(r => r.organizer === userFilter) : all;
  const active = filtered.filter(r => r.status === 'confirmada');
  const pending = filtered.filter(r => r.status === 'pendiente');
  const today = new Date().toISOString().split('T')[0];

  const todayReservations = active.filter(r => r.date === today).length;

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const ws = weekStart.toISOString().split('T')[0];
  const we = weekEnd.toISOString().split('T')[0];
  const weekReservations = active.filter(r => r.date >= ws && r.date <= we).length;

  const byRoom = {};
  ROOMS.forEach(room => { byRoom[room.id] = { ...room, count: 0, hours: 0 }; });
  active.forEach(r => {
    if (byRoom[r.roomId]) {
      byRoom[r.roomId].count++;
      byRoom[r.roomId].hours += (timeToMinutes(r.endTime) - timeToMinutes(r.startTime)) / 60;
    }
  });

  const hourSlots = {};
  for (let h = 7; h <= 20; h++) hourSlots[h] = 0;
  active.forEach(r => {
    const start = Math.floor(timeToMinutes(r.startTime) / 60);
    const end = Math.ceil(timeToMinutes(r.endTime) / 60);
    for (let h = start; h < end; h++) {
      if (hourSlots[h] !== undefined) hourSlots[h]++;
    }
  });

  const byTeam = {};
  active.forEach(r => { byTeam[r.team] = (byTeam[r.team] || 0) + 1; });

  const totalAvailableHoursPerRoom = 12;
  const occupancyByRoom = Object.values(byRoom).map(r => ({
    ...r,
    occupancy: totalAvailableHoursPerRoom > 0 ? Math.min(100, Math.round((r.hours / totalAvailableHoursPerRoom) * 100)) : 0,
  }));

  return {
    total: filtered.length,
    active: active.length,
    pending: pending.length,
    rejected: filtered.filter(r => r.status === 'rechazada').length,
    cancelled: filtered.filter(r => r.status === 'cancelada').length,
    todayReservations,
    weekReservations,
    byRoom: occupancyByRoom,
    peakHours: hourSlots,
    byTeam,
  };
}
