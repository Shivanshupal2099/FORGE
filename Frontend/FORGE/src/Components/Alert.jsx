import React, { useEffect, useState } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';
import './Alert.css';

const Alert = ({ 
  type = 'info', 
  message = '', 
  duration = 4000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    setIsClosing(false);

    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300);
  };

  const icons = {
    success: <FaCheckCircle />,
    error: <FaExclamationCircle />,
    warning: <FaExclamationTriangle />,
    info: <FaInfoCircle />
  };

  if (!isVisible) return null;

  return (
    <div className={`alert alert--${type} ${isClosing ? 'alert--closing' : ''}`}>
      <div className="alert__icon">
        {icons[type] || icons.info}
      </div>
      <div className="alert__message">
        {message}
      </div>
      <button 
        className="alert__close"
        onClick={handleClose}
        aria-label="Close alert"
      >
        <FaTimes />
      </button>
    </div>
  );
};

export default Alert;
