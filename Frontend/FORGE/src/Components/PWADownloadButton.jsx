import { useState, useEffect } from 'react';
import { FaDownload } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import axiosInstance from '../api/axios';

const PWADownloadButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
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

    // Check if user clicked "Later" - only show button if they did
    const hasLater = localStorage.getItem('pwa-install-later');
    if (!hasLater) {
      return;
    }

    // Check if already installed
    const hasInstalled = localStorage.getItem('pwa-installed');
    if (hasInstalled) {
      setIsInstalled(true);
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
      localStorage.setItem('pwa-installed', 'true');
      localStorage.removeItem('pwa-install-later');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

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
      return;
    }

    if (!deferredPrompt) {
      alert('Installation not available. Please use Chrome or Edge on desktop, or follow iOS instructions on mobile.');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstalled(true);
      localStorage.setItem('pwa-installed', 'true');
      localStorage.removeItem('pwa-install-later');
      await recordInstallation();
    }
  };

  // Don't show if already installed or not logged in
  if (isInstalled || !user) {
    return null;
  }

  // Don't show if user never clicked "Later"
  if (!localStorage.getItem('pwa-install-later')) {
    return null;
  }

  // Desktop: show on all pages except map
  // Mobile: only show on profile page
  if (!isMobile && location.pathname === '/map') {
    return null;
  }

  if (isMobile && location.pathname !== '/profile') {
    return null;
  }

  // Desktop: top-right, Mobile: bottom-right
  const buttonStyle = isMobile ? {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    zIndex: 9999,
  } : {
    position: 'fixed',
    top: '24px',
    right: '24px',
    zIndex: 9999,
  };

  return (
    <div style={buttonStyle}>
      <button
        onClick={handleInstall}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 20px',
          borderRadius: '12px',
          border: '2px solid transparent',
          background: 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)',
          color: '#ffffff',
          fontSize: '0.9rem',
          fontWeight: '700',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(255, 107, 0, 0.3)',
          transition: 'all 0.2s ease',
          animation: 'fadeIn 0.5s ease-out',
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
        <FaDownload style={{ fontSize: '1rem' }} />
        <span>Install App</span>
      </button>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: ${isMobile ? 'translateY(20px)' : 'translateY(-20px)'};
          }
          to {
            opacity: 1;
            transform: 'translateY(0)';
          }
        }
      `}</style>
    </div>
  );
};

export default PWADownloadButton;
