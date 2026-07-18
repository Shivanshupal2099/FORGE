import { useEffect, useState } from 'react';
import { FaHandSparkles, FaRocket, FaCheckCircle, FaTimes } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

function WelcomeCard({ onClose }) {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already seen the welcome message
    const hasSeenWelcome = localStorage.getItem(`forge_welcome_seen_${user?.email}`);
    
    if (!hasSeenWelcome) {
      setIsVisible(true);
    }
  }, [user]);

  const handleClose = () => {
    // Mark as seen in localStorage
    localStorage.setItem(`forge_welcome_seen_${user?.email}`, 'true');
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        zIndex: 3000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.3s ease',
      }}
      onClick={handleClose}
    >
      <div
        style={{
          background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '24px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          animation: 'slideUp 0.4s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            fontSize: '1.2rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(239, 68, 68, 0.2)';
            e.target.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(239, 68, 68, 0.1)';
            e.target.style.transform = 'scale(1)';
          }}
        >
          <FaTimes />
        </button>

        {/* Content */}
        <div style={{ padding: 'clamp(32px, 5vw, 48px)' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: '0 12px 32px rgba(102, 126, 234, 0.4)',
            }}>
              <FaHandSparkles style={{ fontSize: '3rem', color: '#ffffff' }} />
            </div>
            <h1 style={{
              margin: '0 0 12px',
              fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Welcome to Forge Connect!
            </h1>
            <p style={{
              margin: '0',
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              color: '#64748b',
              fontWeight: '500',
            }}>
              We're excited to have you here, {user?.email?.split('@')[0] || 'User'}!
            </p>
          </div>

          {/* Features */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
              marginBottom: '20px',
              padding: '16px',
              background: 'rgba(102, 126, 234, 0.05)',
              borderRadius: '16px',
              border: '1px solid rgba(102, 126, 234, 0.1)',
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <FaRocket style={{ fontSize: '1.2rem', color: '#ffffff' }} />
              </div>
              <div>
                <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: '700', color: 'var(--app-text)' }}>
                  Create Amazing Events
                </h3>
                <p style={{ margin: '0', fontSize: '0.95rem', color: '#64748b', lineHeight: '1.5' }}>
                  Organize community events, workshops, meetups, and more with our easy-to-use event creation tools.
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
              marginBottom: '20px',
              padding: '16px',
              background: 'rgba(16, 185, 129, 0.05)',
              borderRadius: '16px',
              border: '1px solid rgba(16, 185, 129, 0.1)',
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <FaCheckCircle style={{ fontSize: '1.2rem', color: '#ffffff' }} />
              </div>
              <div>
                <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: '700', color: 'var(--app-text)' }}>
                  Earn Forge Tokens
                </h3>
                <p style={{ margin: '0', fontSize: '0.95rem', color: '#64748b', lineHeight: '1.5' }}>
                  Participate in events and get rewarded with Forge tokens for your contributions.
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
              padding: '16px',
              background: 'rgba(245, 158, 11, 0.05)',
              borderRadius: '16px',
              border: '1px solid rgba(245, 158, 11, 0.1)',
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <FaHandSparkles style={{ fontSize: '1.2rem', color: '#ffffff' }} />
              </div>
              <div>
                <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: '700', color: 'var(--app-text)' }}>
                  Connect with Community
                </h3>
                <p style={{ margin: '0', fontSize: '0.95rem', color: '#64748b', lineHeight: '1.5' }}>
                  Join a vibrant community of creators, innovators, and event enthusiasts.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleClose}
            style={{
              width: '100%',
              padding: '16px 32px',
              border: 'none',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#ffffff',
              fontSize: '1.1rem',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
              transition: 'all 0.3s ease',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 12px 32px rgba(102, 126, 234, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.4)';
            }}
          >
            Get Started
          </button>
        </div>

        {/* Animation Styles */}
        <style>
          {`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideUp {
              from { 
                opacity: 0;
                transform: translateY(30px);
              }
              to { 
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}
        </style>
      </div>
    </div>
  );
}

export default WelcomeCard;
