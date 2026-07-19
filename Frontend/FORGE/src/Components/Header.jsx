import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logoImage from '../assets/image.png';

function Header() {
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const logoContainerStyle = {
    position: 'fixed',
    top: isMobile ? '16px' : '20px',
    left: isMobile ? '16px' : '24px',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? '8px' : '14px',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
  };

  const logoImageStyle = {
    width: isMobile ? '40px' : '56px',
    height: isMobile ? '40px' : '56px',
    borderRadius: '12px',
    objectFit: 'cover',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  };

  const isMapPage = location.pathname === '/map';
  
  const logoTextStyle = {
    fontSize: isMobile ? '1rem' : '1.6rem',
    fontWeight: '800',
    color: isMapPage ? '#ffffff' : 'var(--app-text)',
    letterSpacing: '-0.3px',
    ...(isMapPage ? {
      textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
    } : {
      background: 'linear-gradient(135deg, #21120a 0%, #513041 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    })
  };

  const handleLogoClick = () => {
    navigate('/home');
  };

  const handleMouseEnter = (e) => {
    e.currentTarget.style.transform = 'scale(1.05)';
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.transform = 'scale(1)';
  };

  return (
    <div 
      style={logoContainerStyle}
      onClick={handleLogoClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <img 
        src={logoImage} 
        alt="Forge Logo" 
        style={logoImageStyle}
      />
      {!isMobile && <span style={logoTextStyle}>Forge Connect</span>}
    </div>
  );
}

export default Header;
