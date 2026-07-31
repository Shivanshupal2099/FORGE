import { createContext, useContext, useState, useCallback } from 'react';
import Alert from '../Components/Alert';

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  const showAlert = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now();
    const newAlert = { id, message, type, duration };
    
    setAlerts(prev => [...prev, newAlert]);

    if (duration > 0) {
      setTimeout(() => {
        removeAlert(id);
      }, duration);
    }

    return id;
  }, []);

  const removeAlert = useCallback((id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  const success = useCallback((message, duration) => showAlert(message, 'success', duration), [showAlert]);
  const error = useCallback((message, duration) => showAlert(message, 'error', duration), [showAlert]);
  const warning = useCallback((message, duration) => showAlert(message, 'warning', duration), [showAlert]);
  const info = useCallback((message, duration) => showAlert(message, 'info', duration), [showAlert]);

  const value = {
    showAlert,
    success,
    error,
    warning,
    info,
    removeAlert
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
      <div className="alert-container">
        {alerts.map(alert => (
          <Alert
            key={alert.id}
            type={alert.type}
            message={alert.message}
            duration={0}
            onClose={() => removeAlert(alert.id)}
          />
        ))}
      </div>
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};
