import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { IoIosChatboxes } from 'react-icons/io'
import { FaMapMarkedAlt } from 'react-icons/fa'
import { FaUserCircle } from 'react-icons/fa'
import { FaHome } from 'react-icons/fa'
import { MdEvent } from 'react-icons/md'

function NavigationBar() {
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
    padding: '8px',
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    borderRadius: '999px',
    boxShadow: '0 8px 32px rgba(17, 17, 17, 0.12)',
    maxWidth: 'min(92vw, 520px)',
    width: 'calc(100% - 16px)',
    zIndex: 1000
  }

  const linkStyle = {
    flex: 1,
    minWidth: '0',
    textAlign: 'center',
    padding: '16px 18px',
    borderRadius: '999px',
    textDecoration: 'none',
    color: '#666666',
    background: 'rgba(255, 255, 255, 0.5)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    transition: 'transform 0.25s ease, background 0.25s ease, color 0.25s ease, box-shadow 0.25s ease, padding 0.25s ease',
    boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.3)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '500',
    fontSize: '1rem',
    overflow: 'hidden',
    minHeight: '56px'
  }




  const activeStyle = {
    background: 'rgba(255, 215, 0, 0.25)',
    color: '#111111',
    boxShadow: '0 4px 16px rgba(255, 215, 0, 0.2)',
    transform: 'translateY(-2px) scale(1.03)',
    padding: '12px 16px'
  }




  const iconStyle = {
    fontSize: '1.25rem',
    transition: 'transform 0.25s ease'
  }



  
  const renderNavItem = (to, Icon, label, iconSize) => (
    <NavLink
      key={to}
      to={to}
      style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : { ...linkStyle, opacity: 0.9 })}
    >
      {({ isActive }) => (
        <>
          <Icon
            style={isActive ? { ...iconStyle, transform: 'scale(1.12)' } : { ...iconStyle, fontSize: iconSize }}
            aria-label={label.toLowerCase()}
          />
          {!isMobile && <span>{label}</span>}
        </>
      )}
    </NavLink>
  )

  return (
    <div style={navStyle}>
      {renderNavItem('/home', FaHome, 'Home', '1.25rem')}
      {renderNavItem('/chat', IoIosChatboxes, 'Chat', '1.25rem')}
      {renderNavItem('/map', FaMapMarkedAlt, 'Map', '1.35rem')}
      {renderNavItem('/events', MdEvent, 'Events', '1.25rem')}
      {renderNavItem('/profile', FaUserCircle, 'Profile', '1.25rem')}
    </div>
  )
}

export default NavigationBar;
