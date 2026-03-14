import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, XCircle, ChartBar, Clock, Buildings, UsersThree, HourglassMedium, Prohibit } from '@phosphor-icons/react';
import { getMetrics } from '../store/reservations';
import './Dashboard.css';

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function Dashboard({ user }) {
  const metrics = useMemo(() => getMetrics(user?.isAdmin ? null : null), []);

  const peakHourEntries = Object.entries(metrics.peakHours);
  const maxPeak = Math.max(...peakHourEntries.map(([,v]) => v), 1);
  const teamEntries = Object.entries(metrics.byTeam).sort((a,b) => b[1] - a[1]);
  const maxTeam = teamEntries.length > 0 ? teamEntries[0][1] : 1;

  return (
    <div className="dashboard-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Metricas en tiempo real del sistema de reservas</p>
        </div>
        <div className="header-badge">
          <ChartBar size={20} weight="fill" />
          <span>En vivo</span>
        </div>
      </header>

      <motion.div className="stats-grid" variants={stagger} initial="hidden" animate="show">
        <motion.div className="stat-card" variants={fadeUp}>
          <div className="stat-icon" style={{ background: 'var(--amber-glow)', color: 'var(--amber)' }}>
            <CalendarCheck size={24} weight="fill" />
          </div>
          <div className="stat-value">{metrics.active}</div>
          <div className="stat-label">Reservas activas</div>
        </motion.div>

        <motion.div className="stat-card" variants={fadeUp}>
          <div className="stat-icon" style={{ background: 'var(--green-dim)', color: 'var(--green)' }}>
            <Clock size={24} weight="fill" />
          </div>
          <div className="stat-value">{metrics.todayReservations}</div>
          <div className="stat-label">Hoy</div>
        </motion.div>

        <motion.div className="stat-card" variants={fadeUp}>
          <div className="stat-icon" style={{ background: 'var(--blue-dim)', color: 'var(--blue)' }}>
            <Buildings size={24} weight="fill" />
          </div>
          <div className="stat-value">{metrics.weekReservations}</div>
          <div className="stat-label">Esta semana</div>
        </motion.div>

        <motion.div className="stat-card" variants={fadeUp}>
          <div className="stat-icon" style={{ background: 'var(--amber-glow)', color: 'var(--eafit-yellow)' }}>
            <HourglassMedium size={24} weight="fill" />
          </div>
          <div className="stat-value">{metrics.pending}</div>
          <div className="stat-label">Pendientes</div>
        </motion.div>

        <motion.div className="stat-card" variants={fadeUp}>
          <div className="stat-icon" style={{ background: 'var(--red-dim)', color: 'var(--red)' }}>
            <Prohibit size={24} weight="fill" />
          </div>
          <div className="stat-value">{metrics.rejected}</div>
          <div className="stat-label">Rechazadas</div>
        </motion.div>
      </motion.div>

      <div className="charts-grid">
        {/* Occupancy by room */}
        <motion.div className="chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h3 className="chart-title">
            <Buildings size={16} />
            Ocupacion por sala
          </h3>
          <div className="room-bars">
            {metrics.byRoom.map(room => (
              <div key={room.id} className="room-bar-row">
                <span className="room-bar-label">{room.name}</span>
                <div className="room-bar-track">
                  <motion.div
                    className="room-bar-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(room.count > 0 ? 8 : 0, room.occupancy)}%` }}
                    transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
                  />
                </div>
                <span className="room-bar-count">{room.count}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Peak hours */}
        <motion.div className="chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h3 className="chart-title">
            <Clock size={16} />
            Horas pico
          </h3>
          <div className="peak-chart">
            {peakHourEntries.map(([hour, count]) => (
              <div key={hour} className="peak-bar-col">
                <div className="peak-bar-track">
                  <motion.div
                    className="peak-bar-fill"
                    initial={{ height: 0 }}
                    animate={{ height: `${(count / maxPeak) * 100}%` }}
                    transition={{ duration: 0.6, delay: 0.5 + parseInt(hour) * 0.03, ease: 'easeOut' }}
                    style={{
                      background: count === maxPeak && count > 0
                        ? 'var(--amber)'
                        : count > 0
                          ? 'rgba(212,160,23,0.4)'
                          : 'var(--border)',
                    }}
                  />
                </div>
                <span className="peak-bar-label">{hour}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* By team */}
        <motion.div className="chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <h3 className="chart-title">
            <UsersThree size={16} />
            Reservas por equipo
          </h3>
          {teamEntries.length === 0 ? (
            <p className="empty-text">Sin datos aun</p>
          ) : (
            <div className="team-bars">
              {teamEntries.map(([team, count]) => (
                <div key={team} className="team-bar-row">
                  <span className="team-bar-label">{team}</span>
                  <div className="team-bar-track">
                    <motion.div
                      className="team-bar-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / maxTeam) * 100}%` }}
                      transition={{ duration: 0.6, delay: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                  <span className="team-bar-count">{count}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
