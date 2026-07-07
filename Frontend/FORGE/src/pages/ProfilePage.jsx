import { Link } from 'react-router-dom';
import { IoSettingsSharp, IoMailOutline, IoLocationOutline, IoBriefcaseOutline, IoLinkOutline } from 'react-icons/io5';
import NavigationBar from '../Components/NavigationBar';
import { useAuth } from '../contexts/AuthContext';

function ProfilePage() {
  const { user, userId, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <div className="page-shell">
      <div className="profile-card">
        <div className="profile-card__cover"></div>
        
        <div className="profile-card__header">
          <div className="profile-photo">
            <img
              src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80"
              alt="Profile"
            />
          </div>
          <div className="profile-card__info">
            <div className="profile-card__title-row">
              <h1>{user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}</h1>
              <span className="profile-card__verify-tag">Verified</span>
            </div>
            <p className="profile-card__role">{user?.user_metadata?.role || 'User'}</p>
            <div className="profile-card__meta">
              <span className="profile-card__meta-item">
                <IoMailOutline />
                {user?.email || 'No email'}
              </span>
            </div>
            <span className="profile-card__badge">Pro Member</span>
          </div>
          <div className="profile-card__actions">
            <Link to="/profile/edit" className="profile-card__edit-button">
              Edit Profile
            </Link>
            <button
              onClick={handleSignOut}
              className="profile-card__edit-button"
              style={{ marginLeft: '8px' }}
            >
              Sign Out
            </button>
            <Link to="/settings" className="profile-card__settings-button">
              <IoSettingsSharp />
            </Link>
          </div>
        </div>

        <div className="profile-card__bio">
          <h3>About</h3>
          <p>
            Creative technologist building immersive web experiences for communities,
            networks, and real-world collaboration. Passionate about design systems,
            storytelling, and making digital spaces feel personal.
          </p>
        </div>

        <div className="profile-card__section">
          <h3>Professional Details</h3>
          <div className="profile-card__details">
            <div className="profile-card__detail-item">
              <div className="profile-card__detail-icon">
                <IoBriefcaseOutline />
              </div>
              <div className="profile-card__detail-content">
                <span className="profile-card__label">Profession</span>
                <strong>Product Designer</strong>
              </div>
            </div>
            <div className="profile-card__detail-item">
              <div className="profile-card__detail-icon">
                <IoLinkOutline />
              </div>
              <div className="profile-card__detail-content">
                <span className="profile-card__label">Portfolio</span>
                <strong>sarahmorgan.design</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-card__section">
          <h3>Skills & Interests</h3>
          <div className="profile-card__tags">
            <span className="profile-card__tag">UI/UX Design</span>
            <span className="profile-card__tag">Design Systems</span>
            <span className="profile-card__tag">Prototyping</span>
            <span className="profile-card__tag">User Research</span>
            <span className="profile-card__tag">Figma</span>
            <span className="profile-card__tag">React</span>
          </div>
        </div>
      </div>

      <NavigationBar />
    </div>
  );
}
export default ProfilePage;