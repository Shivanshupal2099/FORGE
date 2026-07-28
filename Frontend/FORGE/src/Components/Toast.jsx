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
      bg: 'rgba(255, 215, 0, 0.15)',
      border: 'rgba(255, 215, 0, 0.3)',
      icon: '#111111'
    },
    error: {
      bg: 'rgba(255, 107, 0, 0.15)',
      border: 'rgba(255, 107, 0, 0.3)',
      icon: '#111111'
    },
    info: {
      bg: 'rgba(255, 215, 0, 0.15)',
      border: 'rgba(255, 215, 0, 0.3)',
      icon: '#111111'
    },
    warning: {
      bg: 'rgba(255, 107, 0, 0.15)',
      border: 'rgba(255, 107, 0, 0.3)',
      icon: '#111111'
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
        borderRadius: '16px',
        background: colors[type].bg,
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: `1px solid ${colors[type].border}`,
        color: '#111111',
        fontSize: '0.95rem',
        fontWeight: '500',
        boxShadow: '0 8px 32px rgba(17, 17, 17, 0.12)',
        animation: 'slideIn 0.3s ease-out',
        minWidth: '300px',
        maxWidth: '400px'
      }}
    >
      <span style={{ fontSize: '1.2rem', color: colors[type].icon }}>
        {icons[type]}
      </span>
      <span style={{ flex: 1 }}>
        {message}
      </span>
      <button
        onClick={onClose}
        style={{
          background: 'rgba(255, 255, 255, 0.3)',
          border: 'none',
          color: '#111111',
          fontSize: '1.2rem',
          cursor: 'pointer',
          padding: '4px 8px',
          borderRadius: '999px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'rgba(255, 255, 255, 0.5)';
          e.target.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'rgba(255, 255, 255, 0.3)';
          e.target.style.transform = 'scale(1)';
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
