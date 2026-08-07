import { useState, useEffect } from 'react';
import { FaDownload, FaTimes } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import axiosInstance from '../api/axios';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Check if iOS
    const checkIOS = () => {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      setIsIOS(isIOS);
    };
    checkIOS();

    // Check if already installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = window.navigator.standalone === true;
      setIsInstalled(isStandalone || isInWebAppiOS);
    };
    checkInstalled();

    // Check if user has permanently dismissed or installed
    const hasInstalled = localStorage.getItem('pwa-installed');
    const hasLater = localStorage.getItem('pwa-install-later');
    
    if (hasInstalled) {
      setIsInstalled(true);
      return;
    }

    // Don't show prompt if user clicked "Later" - they'll see the button instead
    if (hasLater) {
      return;
    }

    // Listen for beforeinstallprompt event (works on Chrome/Edge, not Safari)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show prompt based on device and page
      if (!isInstalled && user) {
        // Desktop: show on all pages except map
        // Mobile: show only on profile page
        if (!isMobile && location.pathname !== '/map') {
          setShowPrompt(true);
        } else if (isMobile && location.pathname === '/profile') {
          setShowPrompt(true);
        }
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

    // For iOS Safari, show custom prompt since beforeinstallprompt doesn't work
    if (isIOS && !isInstalled && user && !hasLater) {
      if (isMobile && location.pathname === '/profile') {
        setShowPrompt(true);
      }
    }

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled, user, isMobile, isIOS, location.pathname]);

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
    if (isIOS) {
      // iOS doesn't support beforeinstallprompt, show instructions
      alert('To install on iOS:\n\n1. Tap the Share button (square with arrow up)\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add" in the top right');
      setShowPrompt(false);
      localStorage.setItem('pwa-install-dismissed', 'true');
      return;
    }

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
    // Mark that user clicked "Later" - show persistent button instead
    localStorage.setItem('pwa-install-later', 'true');
  };

  // Don't show if already installed, not logged in, or dismissed
  if (isInstalled || !user || !showPrompt) {
    return null;
  }

  // Desktop: don't show on map page
  // Mobile: only show on profile page
  if (!isMobile && location.pathname === '/map') {
    return null;
  }

  if (isMobile && location.pathname !== '/profile') {
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
          {isIOS 
            ? 'Install ForgeConnect on your home screen for faster access and offline support.'
            : 'Install ForgeConnect on your device for faster access, offline support, and a better experience.'
          }
        </p>

        {isIOS && (
          <div style={{
            background: 'rgba(255, 107, 0, 0.1)',
            border: '1px solid rgba(255, 107, 0, 0.2)',
            borderRadius: '12px',
            padding: '12px',
            fontSize: '0.85rem',
            color: '#475569',
            lineHeight: '1.6',
          }}>
            <strong style={{ color: '#FF6B00' }}>iOS Instructions:</strong><br />
            1. Tap the Share button <span style={{ fontSize: '1.2em' }}>⎋</span><br />
            2. Scroll down and tap "Add to Home Screen"<br />
            3. Tap "Add" in the top right
          </div>
        )}

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
            {isIOS ? 'View Instructions' : 'Install Now'}
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
