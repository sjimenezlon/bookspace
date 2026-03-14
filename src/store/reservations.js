import { supabase } from '../lib/supabase';

const APPROVAL_THRESHOLD = 25;

// ── Rooms (from Supabase) ──

let _roomsCache = null;

export async function fetchRooms() {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('active', true)
    .order('capacity');
  if (error) { console.error('fetchRooms:', error); return _roomsCache || []; }
  _roomsCache = data.map(r => ({
    id: r.id, name: r.name, capacity: r.capacity,
    type: r.type, floor: r.floor,
  }));
  return _roomsCache;
}

export function getCachedRooms() {
  return _roomsCache || [];
}

export function getRoomById(id) {
  return (_roomsCache || []).find(r => r.id === id);
}

export function getRoomsByCapacity(min) {
  return (_roomsCache || []).filter(r => r.capacity >= min).sort((a, b) => a.capacity - b.capacity);
}

// ── Reservations ──

function rowToReservation(r) {
  return {
    id: r.id,
    title: r.title,
    organizer: r.organizer,
    email: r.email,
    team: r.team,
    date: r.date,
    startTime: r.start_time?.slice(0, 5),
    endTime: r.end_time?.slice(0, 5),
    attendees: r.attendees,
    roomId: r.room_id,
    roomName: r.room_name,
    roomCapacity: r.room_capacity,
    status: r.status,
    needsApproval: r.needs_approval,
    reason: r.reason,
    rejectionType: r.rejection_type,
    alternatives: r.alternatives,
    approvedBy: r.approved_by,
    approvedAt: r.approved_at,
    rejectedBy: r.rejected_by,
    rejectedAt: r.rejected_at,
    cancelledAt: r.cancelled_at,
    createdAt: r.created_at,
  };
}

export async function getReservations() {
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error('getReservations:', error); return []; }
  return data.map(rowToReservation);
}

export async function getActiveReservations() {
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .in('status', ['confirmada', 'pendiente']);
  if (error) { console.error('getActiveReservations:', error); return []; }
  return data.map(rowToReservation);
}

export async function getPendingReservations() {
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .eq('status', 'pendiente')
    .order('created_at', { ascending: false });
  if (error) { console.error('getPendingReservations:', error); return []; }
  return data.map(rowToReservation);
}

// ── Validation ──

function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function overlaps(s1, e1, s2, e2) {
  return timeToMinutes(s1) < timeToMinutes(e2) && timeToMinutes(s2) < timeToMinutes(e1);
}

export async function validateReservation(data) {
  const errors = [];
  if (!data.title?.trim()) errors.push('El título de la reunión es obligatorio.');
  if (!data.organizer?.trim()) errors.push('El organizador es obligatorio.');
  if (!data.team?.trim()) errors.push('El área o equipo es obligatorio.');
  if (!data.date) errors.push('La fecha es obligatoria.');
  if (!data.startTime) errors.push('La hora de inicio es obligatoria.');
  if (!data.endTime) errors.push('La hora de fin es obligatoria.');
  if (!data.attendees || data.attendees < 1) errors.push('El número de asistentes debe ser al menos 1.');
  if (!data.roomId) errors.push('Debe seleccionar una sala.');
  if (errors.length) return { valid: false, errors, type: 'incomplete' };

  if (timeToMinutes(data.endTime) <= timeToMinutes(data.startTime)) {
    return { valid: false, errors: ['La hora de fin debe ser posterior a la hora de inicio.'], type: 'invalid_time' };
  }

  const room = getRoomById(data.roomId);
  if (!room) return { valid: false, errors: ['Sala no encontrada.'], type: 'invalid_room' };

  if (data.attendees > room.capacity) {
    const alts = getRoomsByCapacity(data.attendees).slice(0, 3);
    return {
      valid: false,
      errors: [`La sala "${room.name}" tiene capacidad para ${room.capacity} personas, pero se solicitan ${data.attendees} asistentes.`],
      type: 'capacity',
      alternatives: alts,
    };
  }

  // Check conflicts in Supabase
  const active = await getActiveReservations();
  const conflicting = active.filter(
    r => r.roomId === data.roomId && r.date === data.date &&
      overlaps(data.startTime, data.endTime, r.startTime, r.endTime)
  );

  if (conflicting.length > 0) {
    const busyIds = new Set(
      active
        .filter(r => r.date === data.date && overlaps(data.startTime, data.endTime, r.startTime, r.endTime))
        .map(r => r.roomId)
    );
    const rooms = getCachedRooms();
    const alts = rooms
      .filter(r => !busyIds.has(r.id) && r.capacity >= data.attendees)
      .sort((a, b) => a.capacity - b.capacity)
      .slice(0, 3);

    return {
      valid: false,
      errors: [`La sala "${room.name}" ya tiene una reserva que se solapa en la fecha ${data.date} entre ${conflicting[0].startTime} y ${conflicting[0].endTime}.`],
      type: 'conflict',
      conflicting: conflicting[0],
      alternatives: alts,
    };
  }

  return { valid: true };
}

// ── Create ──

export async function createReservation(data) {
  const validation = await validateReservation(data);

  if (!validation.valid) {
    // Insert rejected record
    const room = getRoomById(data.roomId);
    const { data: row, error } = await supabase.from('reservations').insert({
      title: data.title, organizer: data.organizer, email: data.email,
      team: data.team, date: data.date,
      start_time: data.startTime, end_time: data.endTime,
      attendees: data.attendees, room_id: data.roomId,
      room_name: room?.name, room_capacity: room?.capacity,
      status: 'rechazada', reason: validation.errors.join(' '),
      rejection_type: validation.type,
      alternatives: validation.alternatives || [],
    }).select().single();

    const reservation = row ? rowToReservation(row) : { ...data, id: crypto.randomUUID(), status: 'rechazada', reason: validation.errors.join(' '), rejectionType: validation.type, alternatives: validation.alternatives || [], createdAt: new Date().toISOString() };
    return { success: false, reservation, validation };
  }

  const room = getRoomById(data.roomId);
  const needsApproval = room.capacity >= APPROVAL_THRESHOLD;

  const { data: row, error } = await supabase.from('reservations').insert({
    title: data.title, organizer: data.organizer, email: data.email,
    team: data.team, date: data.date,
    start_time: data.startTime, end_time: data.endTime,
    attendees: data.attendees, room_id: data.roomId,
    room_name: room.name, room_capacity: room.capacity,
    status: needsApproval ? 'pendiente' : 'confirmada',
    needs_approval: needsApproval,
  }).select().single();

  if (error) {
    console.error('createReservation:', error);
    return { success: false, reservation: data, validation: { valid: false, errors: ['Error al guardar en base de datos.'], type: 'db_error' } };
  }

  const reservation = rowToReservation(row);
  return { success: true, reservation, needsApproval };
}

// ── Admin actions ──

export async function approveReservation(id, adminName) {
  const { error } = await supabase.from('reservations').update({
    status: 'confirmada',
    approved_by: adminName,
    approved_at: new Date().toISOString(),
  }).eq('id', id);
  return !error;
}

export async function rejectReservationAdmin(id, adminName, reason) {
  const { error } = await supabase.from('reservations').update({
    status: 'rechazada',
    reason: reason || 'Rechazada por administrador.',
    rejected_by: adminName,
    rejected_at: new Date().toISOString(),
  }).eq('id', id);
  return !error;
}

export async function cancelReservation(id) {
  const { error } = await supabase.from('reservations').update({
    status: 'cancelada',
    cancelled_at: new Date().toISOString(),
  }).eq('id', id);
  return !error;
}

// ── Availability ──

export async function getAvailableRooms(date, startTime, endTime) {
  const rooms = getCachedRooms();
  if (!date || !startTime || !endTime) return rooms.map(r => r.id);
  const active = await getActiveReservations();
  const busyIds = new Set(
    active
      .filter(r => r.date === date && overlaps(startTime, endTime, r.startTime, r.endTime))
      .map(r => r.roomId)
  );
  return rooms.filter(r => !busyIds.has(r.id)).map(r => r.id);
}

// ── Metrics ──

export async function getMetrics() {
  const all = await getReservations();
  const active = all.filter(r => r.status === 'confirmada');
  const pending = all.filter(r => r.status === 'pendiente');
  const today = new Date().toISOString().split('T')[0];

  const todayReservations = active.filter(r => r.date === today).length;

  const now = new Date();
  const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay());
  const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 6);
  const ws = weekStart.toISOString().split('T')[0];
  const we = weekEnd.toISOString().split('T')[0];
  const weekReservations = active.filter(r => r.date >= ws && r.date <= we).length;

  const rooms = getCachedRooms();
  const byRoom = {};
  rooms.forEach(room => { byRoom[room.id] = { ...room, count: 0, hours: 0 }; });
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
    for (let h = start; h < end; h++) { if (hourSlots[h] !== undefined) hourSlots[h]++; }
  });

  const byTeam = {};
  active.forEach(r => { byTeam[r.team] = (byTeam[r.team] || 0) + 1; });

  const occupancyByRoom = Object.values(byRoom).map(r => ({
    ...r,
    occupancy: Math.min(100, Math.round((r.hours / 12) * 100)),
  }));

  return {
    total: all.length, active: active.length, pending: pending.length,
    rejected: all.filter(r => r.status === 'rechazada').length,
    cancelled: all.filter(r => r.status === 'cancelada').length,
    todayReservations, weekReservations,
    byRoom: occupancyByRoom, peakHours: hourSlots, byTeam,
  };
}
