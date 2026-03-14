export const ROOMS = [
  { id: 'APM5A1',  name: 'Sala 5 - A1',       capacity: 5,  type: 'sala',      floor: 'Piso 1' },
  { id: 'APM5A2',  name: 'Sala 5 - A2',       capacity: 5,  type: 'sala',      floor: 'Piso 1' },
  { id: 'APM5A3',  name: 'Sala 5 - A3',       capacity: 5,  type: 'sala',      floor: 'Piso 1' },
  { id: 'APM10B1', name: 'Sala 10 - B1',      capacity: 10, type: 'sala',      floor: 'Piso 2' },
  { id: 'APM10B2', name: 'Sala 10 - B2',      capacity: 10, type: 'sala',      floor: 'Piso 2' },
  { id: 'APM10B3', name: 'Sala 10 - B3',      capacity: 10, type: 'sala',      floor: 'Piso 2' },
  { id: 'APM10B4', name: 'Sala 10 - B4',      capacity: 10, type: 'sala',      floor: 'Piso 2' },
  { id: 'APM10B5', name: 'Sala 10 - B5',      capacity: 10, type: 'sala',      floor: 'Piso 2' },
  { id: 'APM25C1', name: 'Sala 25 - C1',      capacity: 25, type: 'sala',      floor: 'Piso 3' },
  { id: 'APM50D1', name: 'Auditorio 50 - D1', capacity: 50, type: 'auditorio', floor: 'Piso 3' },
];

export const TEAMS = [
  'Contabilidad',
  'Auditoría',
  'Consultoría',
  'Recursos Humanos',
  'Tecnología',
  'Gerencia',
  'Legal',
  'Comercial',
  'Operaciones',
];

export function getRoomById(id) {
  return ROOMS.find(r => r.id === id);
}

export function getRoomsByCapacity(minCapacity) {
  return ROOMS.filter(r => r.capacity >= minCapacity).sort((a, b) => a.capacity - b.capacity);
}
