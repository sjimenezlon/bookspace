import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import ReservationForm from './components/ReservationForm';
import Dashboard from './components/Dashboard';
import ReservationLog from './components/ReservationLog';
import EmailPreview from './components/EmailPreview';
import FloorMap from './components/FloorMap';
import './App.css';

function App() {
  const [activeView, setActiveView] = useState('reserve');
  const [emailData, setEmailData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleReservationResult = useCallback((result) => {
    setEmailData(result);
    setRefreshKey(k => k + 1);
  }, []);

  const closeEmail = useCallback(() => setEmailData(null), []);

  const views = {
    reserve: <ReservationForm onResult={handleReservationResult} />,
    dashboard: <Dashboard key={refreshKey} />,
    log: <ReservationLog key={refreshKey} onRefresh={() => setRefreshKey(k => k + 1)} />,
    map: <FloorMap key={refreshKey} />,
  };

  return (
    <div className="app-layout">
      <Sidebar active={activeView} onChange={setActiveView} />
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
        {emailData && (
          <EmailPreview data={emailData} onClose={closeEmail} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
