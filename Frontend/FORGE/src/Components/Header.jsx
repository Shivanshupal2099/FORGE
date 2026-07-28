import { useNavigate, useLocation } from 'react-router-dom';
import logoImage from '../assets/forge.png';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMapPage = location.pathname === '/map';

  return (
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
  );
}

export default Header;
