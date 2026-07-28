import React, { useEffect, useState } from 'react';
import { FaCheckCircle, FaArrowRight, FaList, FaTimes } from 'react-icons/fa';
import './SuccessModal.css';

const SuccessModal = ({ 
  isOpen, 
  onClose, 
  title = 'Success!', 
  message = 'Operation completed successfully',
  actions = [],
  autoClose = true,
  autoCloseDelay = 4000
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsClosing(false);
      
      if (autoClose) {
        const timer = setTimeout(() => {
          handleClose();
        }, autoCloseDelay);
        
        return () => clearTimeout(timer);
      }
    } else {
      setIsClosing(true);
      setTimeout(() => {
        setIsVisible(false);
      }, 300);
    }
  }, [isOpen, autoClose, autoCloseDelay]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  const handleAction = (action) => {
    handleClose();
    if (action.onClick) {
      action.onClick();
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`success-modal-overlay ${isClosing ? 'closing' : ''}`}>
      <div className={`success-modal ${isClosing ? 'closing' : ''}`}>
        <div className="success-modal__content">
          <div className="success-modal__icon-wrapper">
            <div className="success-modal__icon">
              <FaCheckCircle />
            </div>
            <div className="success-modal__icon-ring"></div>
          </div>
          
          <h2 className="success-modal__title">{title}</h2>
          <p className="success-modal__message">{message}</p>
          
          {actions.length > 0 && (
            <div className="success-modal__actions">
              {actions.map((action, index) => (
                <button
                  key={index}
                  className={`success-modal__button success-modal__button--${action.variant || 'primary'}`}
                  onClick={() => handleAction(action)}
                >
                  {action.icon && <span className="success-modal__button-icon">{action.icon}</span>}
                  {action.label}
                </button>
              ))}
            </div>
          )}
          
          <button 
            className="success-modal__close"
            onClick={handleClose}
            aria-label="Close modal"
          >
            <FaTimes />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
