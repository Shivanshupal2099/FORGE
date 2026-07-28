import { useEffect } from 'react';
import { FaCheck, FaTimes, FaInfo, FaExclamationTriangle } from 'react-icons/fa';

function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <FaCheck />,
    error: <FaTimes />,
    info: <FaInfo />,
    warning: <FaExclamationTriangle />
  };

  const colors = {
    success: {
      bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      border: 'rgba(16, 185, 129, 0.3)'
    },
    error: {
      bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      border: 'rgba(239, 68, 68, 0.3)'
    },
    info: {
      bg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      border: 'rgba(59, 130, 246, 0.3)'
    },
    warning: {
      bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      border: 'rgba(245, 158, 11, 0.3)'
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px 20px',
        borderRadius: '12px',
        background: colors[type].bg,
        border: `1px solid ${colors[type].border}`,
        color: '#ffffff',
        fontSize: '0.95rem',
        fontWeight: '600',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
        animation: 'slideIn 0.3s ease-out',
        minWidth: '300px',
        maxWidth: '400px'
      }}
    >
      <span style={{ fontSize: '1.2rem' }}>
        {icons[type]}
      </span>
      <span style={{ flex: 1 }}>
        {message}
      </span>
      <button
        onClick={onClose}
        style={{
          background: 'rgba(255, 255, 255, 0.2)',
          border: 'none',
          color: '#ffffff',
          fontSize: '1.2rem',
          cursor: 'pointer',
          padding: '4px 8px',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'rgba(255, 255, 255, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'rgba(255, 255, 255, 0.2)';
        }}
      >
        <FaTimes />
      </button>
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export default Toast;
