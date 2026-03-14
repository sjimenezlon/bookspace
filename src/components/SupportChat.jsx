import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatCircleDots, X, PaperPlaneRight, UserCircle, Robot, Headset } from '@phosphor-icons/react';
import './SupportChat.css';

const BOT_RESPONSES = {
  greeting: '¡Hola! Soy el asistente virtual de Bookspace. ¿En qué puedo ayudarte?',
  options: [
    { text: '¿Cómo reservo una sala?', key: 'how_to' },
    { text: 'Mi reserva fue rechazada', key: 'rejected' },
    { text: '¿Qué salas hay disponibles?', key: 'rooms' },
    { text: 'Necesito cancelar una reserva', key: 'cancel' },
    { text: 'Hablar con un humano', key: 'human' },
  ],
  answers: {
    how_to: 'Para reservar una sala:\n1. Ve a "Nueva Reserva" en el menú lateral\n2. Completa todos los campos (título, organizador, fecha, hora, asistentes)\n3. Selecciona una sala disponible\n4. Haz clic en "Reservar Sala"\n\nNota: Las salas de 25+ personas requieren aprobación de un administrador.',
    rejected: 'Tu reserva pudo ser rechazada por:\n\n• **Conflicto de horario**: Otra persona ya reservó esa sala en ese horario. El sistema te sugiere alternativas.\n• **Capacidad insuficiente**: La sala no tiene espacio para todos los asistentes.\n• **Datos incompletos**: Falta algún campo obligatorio.\n\nRevisa el historial para ver el motivo específico.',
    rooms: 'Tenemos 10 espacios disponibles:\n\n• **Bloque 18**: 3 salas de 5 personas (A1, A2, A3)\n• **Bloque 19**: 5 salas de 10 personas (B1-B5)\n• **Bloque 26**: 1 sala de 25 personas + 1 auditorio de 50\n\nAl hacer una reserva, el sistema te muestra en tiempo real cuáles están disponibles.',
    cancel: 'Para cancelar una reserva:\n1. Ve a "Historial" en el menú lateral\n2. Encuentra tu reserva confirmada\n3. Haz clic en el botón de cancelar (X)\n\nLa cancelación queda registrada en el historial para auditoría.',
    human: 'HUMAN_ESCALATION',
  },
};

export default function SupportChat({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isHumanMode, setIsHumanMode] = useState(false);
  const [showOptions, setShowOptions] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEnd = useRef(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (isOpen && !initialized.current) {
      initialized.current = true;
      setMessages([{ from: 'bot', text: BOT_RESPONSES.greeting, time: new Date() }]);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addBotMessage = (text) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { from: 'bot', text, time: new Date() }]);
    }, 600 + Math.random() * 800);
  };

  const handleOptionClick = (opt) => {
    setMessages(prev => [...prev, { from: 'user', text: opt.text, time: new Date() }]);
    setShowOptions(false);

    if (opt.key === 'human') {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setIsHumanMode(true);
        setMessages(prev => [...prev, {
          from: 'system',
          text: 'Conectando con un agente de soporte...',
          time: new Date(),
        }]);
        setTimeout(() => {
          setMessages(prev => [...prev, {
            from: 'human',
            text: `¡Hola ${user?.name?.split(' ')[0] || 'usuario'}! Soy Camila del equipo de soporte de Bookspace. ¿En qué te puedo ayudar?`,
            time: new Date(),
          }]);
        }, 2000);
      }, 1000);
    } else {
      addBotMessage(BOT_RESPONSES.answers[opt.key]);
      setTimeout(() => setShowOptions(true), 2000);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput('');
    setMessages(prev => [...prev, { from: 'user', text, time: new Date() }]);

    if (isHumanMode) {
      // Simulated human responses
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const responses = [
          'Entiendo tu situación. Déjame verificar eso en el sistema.',
          'Ya revisé y puedo ayudarte con eso. ¿Necesitas algo más?',
          'Listo, he tomado nota de tu solicitud. Un administrador lo revisará pronto.',
          '¿Hay algo más en lo que pueda asistirte?',
        ];
        setMessages(prev => [...prev, {
          from: 'human',
          text: responses[Math.floor(Math.random() * responses.length)],
          time: new Date(),
        }]);
      }, 1500 + Math.random() * 2000);
    } else {
      const lower = text.toLowerCase();
      if (lower.includes('human') || lower.includes('persona') || lower.includes('agente') || lower.includes('soporte')) {
        handleOptionClick({ text, key: 'human' });
      } else if (lower.includes('reserv') || lower.includes('cómo') || lower.includes('como')) {
        addBotMessage(BOT_RESPONSES.answers.how_to);
        setTimeout(() => setShowOptions(true), 2000);
      } else if (lower.includes('sala') || lower.includes('espacio') || lower.includes('disponible')) {
        addBotMessage(BOT_RESPONSES.answers.rooms);
        setTimeout(() => setShowOptions(true), 2000);
      } else if (lower.includes('cancel')) {
        addBotMessage(BOT_RESPONSES.answers.cancel);
        setTimeout(() => setShowOptions(true), 2000);
      } else if (lower.includes('rechaz') || lower.includes('error') || lower.includes('problema')) {
        addBotMessage(BOT_RESPONSES.answers.rejected);
        setTimeout(() => setShowOptions(true), 2000);
      } else {
        addBotMessage('No estoy seguro de entender tu pregunta. ¿Puedes seleccionar una de las opciones o escribir "hablar con un humano" para conectar con soporte?');
        setTimeout(() => setShowOptions(true), 1500);
      }
    }
  };

  const formatTime = (d) => d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

  return (
    <>
      {/* FAB button */}
      <motion.button
        className={`chat-fab ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(o => !o)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? <X size={24} weight="bold" /> : <ChatCircleDots size={26} weight="fill" />}
        {!isOpen && <span className="fab-label">Soporte</span>}
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="chat-window"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 22, stiffness: 260 }}
          >
            <div className="chat-header">
              <div className="chat-header-left">
                {isHumanMode ? (
                  <Headset size={22} weight="fill" className="chat-header-icon human" />
                ) : (
                  <Robot size={22} weight="fill" className="chat-header-icon bot" />
                )}
                <div>
                  <h4>{isHumanMode ? 'Camila - Soporte' : 'Asistente Bookspace'}</h4>
                  <span className="chat-status">{isHumanMode ? 'Agente conectada' : 'Bot automatizado'}</span>
                </div>
              </div>
              <button className="chat-close" onClick={() => setIsOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="chat-messages">
              {messages.map((msg, i) => (
                <div key={i} className={`chat-msg ${msg.from}`}>
                  {msg.from === 'bot' && <Robot size={18} className="msg-avatar bot-av" />}
                  {msg.from === 'human' && <Headset size={18} className="msg-avatar human-av" />}
                  {msg.from === 'system' && null}
                  <div className={`msg-bubble ${msg.from}`}>
                    {msg.from === 'system' ? (
                      <span className="system-msg">{msg.text}</span>
                    ) : (
                      <>
                        <span className="msg-text" dangerouslySetInnerHTML={{
                          __html: msg.text
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/\n/g, '<br/>')
                        }} />
                        <span className="msg-time">{formatTime(msg.time)}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="chat-msg bot">
                  <Robot size={18} className="msg-avatar bot-av" />
                  <div className="msg-bubble bot typing-bubble">
                    <span className="typing-dots">
                      <span /><span /><span />
                    </span>
                  </div>
                </div>
              )}

              {showOptions && !isHumanMode && !isTyping && (
                <div className="chat-options">
                  {BOT_RESPONSES.options.map(opt => (
                    <button key={opt.key} className={`chat-option ${opt.key === 'human' ? 'human-opt' : ''}`} onClick={() => handleOptionClick(opt)}>
                      {opt.key === 'human' && <Headset size={14} />}
                      {opt.text}
                    </button>
                  ))}
                </div>
              )}

              <div ref={messagesEnd} />
            </div>

            <div className="chat-input-bar">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder={isHumanMode ? 'Escribe a Camila...' : 'Escribe tu pregunta...'}
              />
              <button className="chat-send" onClick={handleSend} disabled={!input.trim()}>
                <PaperPlaneRight size={18} weight="fill" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
