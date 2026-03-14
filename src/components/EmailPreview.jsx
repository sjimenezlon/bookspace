import { motion } from 'framer-motion';
import { X, EnvelopeSimple, Copy, CheckCircle } from '@phosphor-icons/react';
import { useState } from 'react';
import { generateConfirmationEmail, generateRejectionEmail } from '../utils/emailGenerator';
import './EmailPreview.css';

export default function EmailPreview({ data, onClose }) {
  const [copied, setCopied] = useState(false);

  const email = data.type === 'success'
    ? generateConfirmationEmail(data.reservation)
    : generateRejectionEmail(data.reservation);

  const handleCopy = () => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = email.html;
    const text = tempDiv.textContent || tempDiv.innerText;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <motion.div
      className="email-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="email-panel"
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="email-panel-header">
          <div className="email-header-left">
            <EnvelopeSimple size={20} weight="fill" className="email-icon" />
            <div>
              <h3>Email generado por IA</h3>
              <p className="email-subject">{email.subject}</p>
            </div>
          </div>
          <div className="email-header-actions">
            <button className="copy-btn" onClick={handleCopy}>
              {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
            <button className="close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="email-body">
          <div className="email-render" dangerouslySetInnerHTML={{ __html: email.html }} />
        </div>

        <div className="email-panel-footer">
          <span className="ai-tag">Generado con IA Generativa</span>
          <span className="email-time">{new Date().toLocaleTimeString('es-CO')}</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
