import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { IoIosChatboxes } from 'react-icons/io'
import { FaMapMarkedAlt } from 'react-icons/fa'
import { FaUserCircle } from 'react-icons/fa'
import { FaHome } from 'react-icons/fa'
import { MdEvent } from 'react-icons/md'
import { IoAdd } from 'react-icons/io5'

function NavigationBar({ onJoinCommunity = null, isChatPage = false }) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 480)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  const navStyle = {
    position: 'fixed',
    bottom: '12px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
    padding: isMobile ? '8px' : '12px 16px',
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    borderRadius: isMobile ? '999px' : '20px',
    maxWidth: isMobile ? 'min(92vw, 520px)' : 'min(90vw, 700px)',
    width: isMobile ? 'calc(100% - 16px)' : 'auto',
    zIndex: 1000,
    boxShadow: isMobile ? 'none' : '0 8px 32px rgba(0, 0, 0, 0.1)'
  }

  const linkStyle = {
    flex: isMobile ? 1 : 'none',
    minWidth: isMobile ? '0' : 'auto',
    textAlign: 'center',
    padding: isMobile ? '16px 18px' : '12px 20px',
    borderRadius: isMobile ? '999px' : '16px',
    textDecoration: 'none',
    color: '#666666',
    background: 'rgba(255, 255, 255, 0.5)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    transition: 'transform 0.25s ease, background 0.25s ease, color 0.25s ease, padding 0.25s ease',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: isMobile ? '8px' : '10px',
    fontWeight: '500',
    fontSize: isMobile ? '1rem' : '0.95rem',
    overflow: 'hidden',
    minHeight: isMobile ? '56px' : '48px',
    whiteSpace: 'nowrap'
  }




  const activeStyle = {
    background: 'rgba(255, 107, 0, 0.15)',
    color: '#FF6B00',
    transform: isMobile ? 'translateY(-2px) scale(1.03)' : 'translateY(-2px)',
    padding: isMobile ? '12px 16px' : '10px 18px',
    border: '1px solid rgba(255, 107, 0, 0.2)'
  }




  const iconStyle = {
    fontSize: isMobile ? '1.25rem' : '1.15rem',
    transition: 'transform 0.25s ease'
  }



  
  const renderNavItem = (to, Icon, label, iconSize, isMapButton = false) => {
    const mapButtonStyle = isMapButton ? {
      flex: isMobile ? 1 : 'none',
      minWidth: isMobile ? '0' : 'auto',
      textAlign: 'center',
      padding: isMobile ? '24px 26px' : '20px 26px',
      borderRadius: '999px',
      textDecoration: 'none',
      color: '#111111',
      background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      transition: 'transform 0.25s ease, background 0.25s ease, color 0.25s ease, padding 0.25s ease',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: isMobile ? '12px' : '14px',
      fontWeight: '700',
      fontSize: isMobile ? '1.1rem' : '1.05rem',
      overflow: 'hidden',
      minHeight: isMobile ? '72px' : '64px',
      whiteSpace: 'nowrap',
      border: '3px solid #FF6B00',
      boxShadow: '0 6px 20px rgba(255, 107, 0, 0.4)'
    } : linkStyle;

    const mapActiveStyle = isMapButton ? {
      background: 'linear-gradient(135deg, #FF6B00 0%, #FFD700 100%)',
      color: '#111111',
      transform: isMobile ? 'translateY(-4px) scale(1.08)' : 'translateY(-4px) scale(1.06)',
      padding: isMobile ? '22px 24px' : '18px 24px',
      border: '3px solid #CC5500',
      boxShadow: '0 8px 24px rgba(255, 107, 0, 0.5)'
    } : activeStyle;

    const mapIconStyle = isMapButton ? {
      fontSize: isMobile ? '1.8rem' : '1.65rem',
      transition: 'transform 0.25s ease'
    } : iconStyle;

    return (
      <NavLink
        key={to}
        to={to}
        style={({ isActive }) => (isActive ? { ...mapButtonStyle, ...mapActiveStyle } : { ...mapButtonStyle, opacity: 0.95 })}
      >
        {({ isActive }) => (
          <>
            <Icon
              style={isActive ? { ...mapIconStyle, transform: 'scale(1.15)' } : { ...mapIconStyle, fontSize: iconSize }}
              aria-label={label.toLowerCase()}
            />
            {!isMobile && <span>{label}</span>}
          </>
        )}
      </NavLink>
    )
  }

  return (
    <div style={navStyle}>
      {renderNavItem('/home', FaHome, 'Home', '1.25rem')}
      {renderNavItem('/chat', IoIosChatboxes, 'Chat', '1.25rem')}
      {renderNavItem('/map', FaMapMarkedAlt, 'Map', '1.35rem', true)}
      {renderNavItem('/events', MdEvent, 'Events', '1.25rem')}
      {renderNavItem('/profile', FaUserCircle, 'Profile', '1.25rem')}
      {!isMobile && onJoinCommunity && isChatPage && (
        <button
          onClick={onJoinCommunity}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            borderRadius: '999px',
            background: 'linear-gradient(135deg, var(--forge-orange) 0%, var(--forge-orange-light) 100%)',
            color: '#FFFFFF',
            border: 'none',
            cursor: 'pointer',
            transition: 'transform 0.25s ease, background 0.25s ease',
            minHeight: '56px',
            minWidth: '56px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
            e.currentTarget.style.background = 'linear-gradient(135deg, var(--forge-orange-light) 0%, var(--forge-orange) 100%)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.background = 'linear-gradient(135deg, var(--forge-orange) 0%, var(--forge-orange-light) 100%)';
          }}
          aria-label="Join community"
        >
          <IoAdd style={{ fontSize: '1.25rem' }} />
        </button>
      )}
    </div>
  )
}

export default NavigationBar;
