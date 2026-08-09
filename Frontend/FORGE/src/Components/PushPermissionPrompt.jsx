import React, { useState, useEffect } from 'react';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { X } from 'lucide-react';

/**
 * PushPermissionPrompt - A component to request push notification permission
 * Only shows on mobile devices (Android/iOS) when permission is not granted
 */
const PushPermissionPrompt = () => {
  const { isSupported, isMobile, permission, requestPermission, isLoading, error } = usePushNotifications();
  const [isVisible, setIsVisible] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(false);

  useEffect(() => {
    // Check if user has previously dismissed the prompt
    const dismissed = localStorage.getItem('pushPromptDismissed');
    if (dismissed) {
      setHasDismissed(true);
    }

    // Show prompt only if:
    // - Device is mobile
    // - Push is supported
    // - Permission is default (not asked yet)
    // - User hasn't dismissed before
    if (isMobile && isSupported && permission === 'default' && !hasDismissed) {
      // Delay showing the prompt by 2 seconds
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isMobile, isSupported, permission, hasDismissed]);

  const handleAllow = async () => {
    const granted = await requestPermission();
    if (granted) {
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setHasDismissed(true);
    localStorage.setItem('pushPromptDismissed', 'true');
  };

  if (!isVisible || !isMobile || !isSupported) {
    return null;
  }

  if (permission === 'granted' || permission === 'denied') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)',
      WebkitBackdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #FF6B00 0%, #FF8C00 100%)',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 4px 20px rgba(255, 107, 0, 0.3)',
        color: 'white',
        position: 'relative',
        maxWidth: '400px',
        width: '100%',
      }}>
        <button
          onClick={handleDismiss}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'white',
            padding: 0,
          }}
        >
          <X size={16} />
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '12px',
        }}>
          <div style={{
            fontSize: '24px',
            marginRight: '12px',
          }}>
            🔔
          </div>
          <div>
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '4px',
            }}>
              Stay Connected
            </div>
            <div style={{
              fontSize: '13px',
              opacity: 0.9,
            }}>
              Get notified about messages and connection requests
            </div>
          </div>
        </div>

        {error && (
          <div style={{
            fontSize: '12px',
            color: '#FFE5E5',
            marginBottom: '12px',
            background: 'rgba(255, 0, 0, 0.2)',
            padding: '8px',
            borderRadius: '8px',
          }}>
            {error}
          </div>
        )}

        <div style={{
          display: 'flex',
          gap: '12px',
        }}>
          <button
            onClick={handleDismiss}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '8px',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              fontSize: '14px',
              fontWeight: '500',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            Not Now
          </button>
          <button
            onClick={handleAllow}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '8px',
              border: 'none',
              background: 'white',
              color: '#FF6B00',
              fontSize: '14px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            {isLoading ? 'Enabling...' : 'Enable'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PushPermissionPrompt;
