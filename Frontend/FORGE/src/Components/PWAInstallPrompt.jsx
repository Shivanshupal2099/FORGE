import { useState, useEffect } from 'react';
import { FaDownload, FaTimes } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import axiosInstance from '../api/axios';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Check if already installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = window.navigator.standalone === true;
      setIsInstalled(isStandalone || isInWebAppiOS);
    };
    checkInstalled();

    // Check if user has permanently dismissed or installed
    const hasInstalled = localStorage.getItem('pwa-installed');
    const hasDismissed = localStorage.getItem('pwa-install-dismissed');
    
    if (hasInstalled) {
      setIsInstalled(true);
      return;
    }

    if (hasDismissed) {
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Only show prompt if not installed and user is logged in
      if (!isInstalled && user) {
        setShowPrompt(true);
      }
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowPrompt(false);
      setIsInstalled(true);
      localStorage.setItem('pwa-installed', 'true');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled, user]);

  const recordInstallation = async () => {
    try {
      await axiosInstance.post('/api/pwa/install', {
        email: user.email,
        device: navigator.userAgent,
        platform: navigator.platform,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to record PWA installation:', error);
    }
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
      localStorage.setItem('pwa-installed', 'true');
      await recordInstallation();
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Permanently dismiss for this user
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if already installed, not logged in, or dismissed
  if (isInstalled || !user || !showPrompt) {
    return null;
  }

  // Don't show on map page
  if (location.pathname === '/map') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 10000,
      animation: 'fadeInUp 0.5s ease-out',
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        borderRadius: '20px',
        padding: '24px',
        maxWidth: '380px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(255, 107, 0, 0.3)',
            }}>
              <FaDownload style={{ color: '#ffffff', fontSize: '1.2rem' }} />
            </div>
            <div>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '800',
                color: '#1e293b',
                margin: 0,
                marginBottom: '4px',
              }}>
                Install App
              </h3>
              <p style={{
                fontSize: '0.85rem',
                color: '#64748b',
                margin: 0,
                fontWeight: '500',
              }}>
                Get the full experience
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(0, 0, 0, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
            }}
          >
            <FaTimes style={{ color: '#64748b', fontSize: '1rem' }} />
          </button>
        </div>

        <p style={{
          fontSize: '0.9rem',
          color: '#475569',
          lineHeight: '1.5',
          margin: 0,
        }}>
          Install ForgeConnect on your device for faster access, offline support, and a better experience.
        </p>

        <div style={{
          display: 'flex',
          gap: '12px',
        }}>
          <button
            onClick={handleInstall}
            style={{
              flex: 1,
              padding: '14px 24px',
              borderRadius: '12px',
              border: '2px solid transparent',
              background: 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)',
              color: '#ffffff',
              fontSize: '0.95rem',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(255, 107, 0, 0.3)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 16px rgba(255, 107, 0, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(255, 107, 0, 0.3)';
            }}
          >
            Install Now
          </button>
          <button
            onClick={handleDismiss}
            style={{
              padding: '14px 24px',
              borderRadius: '12px',
              border: '2px solid #e2e8f0',
              background: 'transparent',
              color: '#64748b',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = '#cbd5e1';
              e.target.style.background = 'rgba(0, 0, 0, 0.02)';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = '#e2e8f0';
              e.target.style.background = 'transparent';
            }}
          >
            Later
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default PWAInstallPrompt;
