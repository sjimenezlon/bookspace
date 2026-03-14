import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchRooms } from './store/reservations';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import ReservationForm from './components/ReservationForm';
import Dashboard from './components/Dashboard';
import ReservationLog from './components/ReservationLog';
import EmailPreview from './components/EmailPreview';
import FloorMap from './components/FloorMap';
import AdminPanel from './components/AdminPanel';
import SupportChat from './components/SupportChat';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [activeView, setActiveView] = useState('reserve');
  const [emailData, setEmailData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [roomsLoaded, setRoomsLoaded] = useState(false);

  // Load rooms from Supabase on mount
  useEffect(() => {
    fetchRooms().then(() => setRoomsLoaded(true));
  }, []);

  const handleLogin = useCallback((userData) => {
    setUser(userData);
    setActiveView(userData.isAdmin ? 'admin' : 'reserve');
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    setActiveView('reserve');
  }, []);

  const handleReservationResult = useCallback((result) => {
    if (result.type !== 'pending') {
      setEmailData(result);
    }
    setRefreshKey(k => k + 1);
  }, []);

  const closeEmail = useCallback(() => setEmailData(null), []);
  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  if (!roomsLoaded) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: 14 }}>
        Conectando con base de datos...
      </div>
    );
  }

  const views = {
    reserve: <ReservationForm onResult={handleReservationResult} user={user} />,
    dashboard: <Dashboard key={refreshKey} user={user} />,
    log: <ReservationLog key={refreshKey} onRefresh={refresh} user={user} />,
    map: <FloorMap key={refreshKey} />,
    admin: <AdminPanel key={refreshKey} user={user} onRefresh={refresh} />,
  };

  return (
    <div className="app-layout">
      <Sidebar active={activeView} onChange={setActiveView} user={user} onLogout={handleLogout} />
      <main className="main-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="view-container"
          >
            {views[activeView]}
          </motion.div>
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {emailData && <EmailPreview data={emailData} onClose={closeEmail} />}
      </AnimatePresence>

      <SupportChat user={user} />
    </div>
  );
}

export default App;
