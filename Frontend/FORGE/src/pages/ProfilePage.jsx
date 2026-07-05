import { Link } from 'react-router-dom';
import { IoSettingsSharp, IoMailOutline, IoLocationOutline, IoBriefcaseOutline, IoLinkOutline } from 'react-icons/io5';
import NavigationBar from '../Components/NavigationBar';
import { useState, useEffect } from 'react';

function ProfilePage() {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Get user ID from localStorage or token
    const token = localStorage.getItem('token');
    if (token) {
      // For now, we'll parse the token or get user ID from localStorage
      // This is a placeholder - you might need to decode the JWT or store userId separately
      const storedUserId = localStorage.getItem('userId');
      if (storedUserId) {
        setUserId(storedUserId);
      }
    }
  }, []);

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
              <h1>Sarah Morgan</h1>
              <span className="profile-card__verify-tag">Verified</span>
            </div>
            <p className="profile-card__role">Product Designer</p>
            <div className="profile-card__meta">
              <span className="profile-card__meta-item">
                <IoLocationOutline />
                United States · California
              </span>
              <span className="profile-card__meta-item">
                <IoMailOutline />
                sarah.morgan@email.com
              </span>
            </div>
            <span className="profile-card__badge">Pro Member</span>
          </div>
          <div className="profile-card__actions">
            <Link to={userId ? `/profile/edit/${userId}` : '/profile/edit'} className="profile-card__edit-button">
              Edit Profile
            </Link>
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