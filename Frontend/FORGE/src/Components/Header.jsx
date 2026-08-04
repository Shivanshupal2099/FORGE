import { useNavigate, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { FaHandPaper, FaCoins, FaTags } from 'react-icons/fa';
import { IoAdd } from 'react-icons/io5';
import logoImage from '../assets/forge.png';

function Header({ mobileActions, pendingRequests, children, onJoinCommunity, showJoinCommunityOnMobile, hideLogo }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isMapPage = location.pathname === '/map';
  const isHomePage = location.pathname === '/home';

  return (
    <div className="app-header">
      {!hideLogo && (
        <button
          type="button"
          className={`app-header-logo${isMapPage ? ' app-header-logo--map' : ''}`}
          onClick={() => navigate('/home')}
          aria-label="Go to home"
        >
          <span className="app-header-logo__frame">
            <img
              className="app-header-logo__image"
              src={logoImage}
              alt="ForgeConnect"
            />
          </span>
        </button>
      )}
      
      {isHomePage && mobileActions && (
        <div className="app-header-mobile-actions">
          {mobileActions.map(({ label, icon: Icon, popup, onClick }) => (
            <button
              key={label}
              type="button"
              className="app-header-mobile-action-btn"
              onClick={onClick}
              aria-label={label}
              style={{ position: 'relative' }}
            >
              <Icon />
              {label === 'Request' && pendingRequests > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: '#ff0000',
                    border: '2px solid rgba(255, 255, 255, 0.8)',
                    boxShadow: '0 2px 8px rgba(255, 0, 0, 0.4)',
                  }}
                />
              )}
            </button>
          ))}
          <Link to="/survey" className="app-header-mobile-action-btn app-header-mobile-action-btn--create">
            <span>+</span>
          </Link>
        </div>
      )}

      {showJoinCommunityOnMobile && onJoinCommunity && (
        <div className="app-header-mobile-actions">
          <button
            type="button"
            className="app-header-mobile-action-btn app-header-mobile-action-btn--join"
            onClick={onJoinCommunity}
            aria-label="Join community"
          >
            <IoAdd />
          </button>
        </div>
      )}
      
      {children && (
        <div className="app-header-desktop-actions">
          {children}
        </div>
      )}
    </div>
  );
}

export default Header;
