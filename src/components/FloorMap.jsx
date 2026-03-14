import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Buildings, Users, CheckCircle, XCircle } from '@phosphor-icons/react';
import { ROOMS } from '../data/rooms';
import { getActiveReservations } from '../store/reservations';
import './FloorMap.css';

export default function FloorMap() {
  const today = new Date().toISOString().split('T')[0];
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();

  const roomStatus = useMemo(() => {
    const active = getActiveReservations();
    const status = {};

    ROOMS.forEach(room => {
      const todayRes = active.filter(r => r.roomId === room.id && r.date === today);
      const currentlyBusy = todayRes.find(r => {
        const [sh, sm] = r.startTime.split(':').map(Number);
        const [eh, em] = r.endTime.split(':').map(Number);
        return nowMinutes >= sh * 60 + sm && nowMinutes < eh * 60 + em;
      });

      const nextRes = todayRes
        .filter(r => {
          const [sh, sm] = r.startTime.split(':').map(Number);
          return sh * 60 + sm > nowMinutes;
        })
        .sort((a, b) => a.startTime.localeCompare(b.startTime))[0];

      status[room.id] = {
        ...room,
        busy: !!currentlyBusy,
        current: currentlyBusy || null,
        next: nextRes || null,
        todayCount: todayRes.length,
      };
    });

    return status;
  }, [today, nowMinutes]);

  const floors = [
    { name: 'Bloque 18', subtitle: 'Salas compactas (5 pers.)', rooms: ROOMS.filter(r => r.floor === 'Bloque 18') },
    { name: 'Bloque 19', subtitle: 'Salas medianas (10 pers.)', rooms: ROOMS.filter(r => r.floor === 'Bloque 19') },
    { name: 'Bloque 26', subtitle: 'Sala grande + Auditorio', rooms: ROOMS.filter(r => r.floor === 'Bloque 26') },
  ];

  return (
    <div className="map-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Mapa de Salas</h1>
          <p className="page-subtitle">Estado actual de los 10 espacios de Automation Pro Max</p>
        </div>
        <div className="map-legend">
          <span className="legend-item"><span className="legend-dot available" /> Disponible</span>
          <span className="legend-item"><span className="legend-dot busy" /> En uso</span>
        </div>
      </header>

      {floors.map((floor, fi) => (
        <motion.div
          key={floor.name}
          className="floor-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: fi * 0.15 }}
        >
          <div className="floor-header">
            <h2 className="floor-name">{floor.name}</h2>
            <span className="floor-subtitle">{floor.subtitle}</span>
          </div>

          <div className="floor-rooms">
            {floor.rooms.map((room, ri) => {
              const st = roomStatus[room.id];
              return (
                <motion.div
                  key={room.id}
                  className={`map-room-card ${st.busy ? 'busy' : 'available'}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: fi * 0.15 + ri * 0.05 }}
                >
                  <div className="map-room-top">
                    <div className={`map-status-indicator ${st.busy ? 'busy' : 'free'}`} />
                    <span className="map-room-id">{room.id}</span>
                  </div>

                  <h3 className="map-room-name">{room.name}</h3>

                  <div className="map-room-capacity">
                    <Users size={14} />
                    <span>{room.capacity} personas</span>
                  </div>

                  {st.busy && st.current && (
                    <div className="map-room-current">
                      <span className="current-label">En uso:</span>
                      <span className="current-title">{st.current.title}</span>
                      <span className="current-time">hasta {st.current.endTime}</span>
                    </div>
                  )}

                  {!st.busy && st.next && (
                    <div className="map-room-next">
                      <span className="next-label">Prox:</span>
                      <span className="next-time">{st.next.startTime}</span>
                    </div>
                  )}

                  <div className="map-room-today">
                    {st.todayCount} reserva{st.todayCount !== 1 ? 's' : ''} hoy
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
