import React from 'react';
import './Usercard.css';

const Usercard = ({ user, onClose }) => {
  if (!user) return null;

  return (
    <div className="usercard-overlay" onClick={onClose}>
      <div className="usercard" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button className="usercard__close" onClick={onClose}>
          ✕
        </button>

        {/* Header with photo and verified badge */}
        <div className="usercard__header">
          <div className="usercard__photoWrapper">
            {user.photo ? (
              <img src={user.photo} alt={user.name} className="usercard__photo" />
            ) : (
              <div className="usercard__photoPlaceholder">
                {user.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
            {user.isVerified && (
              <div className="usercard__verifiedBadge" title="Verified User">
                ✓
              </div>
            )}
          </div>
          <div className="usercard__headerInfo">
            <h2 className="usercard__name">
              {user.name}
              {user.isVerified && <span className="usercard__verifiedText">Verified</span>}
            </h2>
            <p className="usercard__profession">{user.profession}</p>
            <div className="usercard__status">
              <span className={`usercard__statusDot ${user.status?.toLowerCase()}`} />
              {user.status || 'Active'}
            </div>
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <div className="usercard__section">
            <h3 className="usercard__sectionTitle">About</h3>
            <p className="usercard__bio">{user.bio}</p>
          </div>
        )}

        {/* Visibility */}
        <div className="usercard__section">
          <h3 className="usercard__sectionTitle">Visibility</h3>
          <div className="usercard__visibility">
            <span className={`usercard__visibilityBadge ${user.visibility?.toLowerCase()}`}>
              {user.visibility || 'Public'}
            </span>
          </div>
        </div>

        {/* Looking For */}
        {user.lookingFor && user.lookingFor.length > 0 && (
          <div className="usercard__section">
            <h3 className="usercard__sectionTitle">Looking For</h3>
            <div className="usercard__tags">
              {user.lookingFor.map((item, index) => (
                <span key={index} className="usercard__tag">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Contact Information */}
        <div className="usercard__section">
          <h3 className="usercard__sectionTitle">Contact</h3>
          {user.contactNumber && (
            <div className="usercard__contactItem">
              <span className="usercard__contactIcon">📞</span>
              <span className="usercard__contactValue">{user.contactNumber}</span>
            </div>
          )}
          {user.email && (
            <div className="usercard__contactItem">
              <span className="usercard__contactIcon">✉️</span>
              <span className="usercard__contactValue">{user.email}</span>
            </div>
          )}
        </div>

        {/* Social Links */}
        {user.socialLinks && Object.keys(user.socialLinks).length > 0 && (
          <div className="usercard__section">
            <h3 className="usercard__sectionTitle">Social Links</h3>
            <div className="usercard__socialLinks">
              {user.socialLinks.linkedin && (
                <a href={user.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="usercard__socialLink">
                  LinkedIn
                </a>
              )}
              {user.socialLinks.twitter && (
                <a href={user.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="usercard__socialLink">
                  Twitter
                </a>
              )}
              {user.socialLinks.github && (
                <a href={user.socialLinks.github} target="_blank" rel="noopener noreferrer" className="usercard__socialLink">
                  GitHub
                </a>
              )}
              {user.socialLinks.instagram && (
                <a href={user.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="usercard__socialLink">
                  Instagram
                </a>
              )}
            </div>
          </div>
        )}

        {/* Location */}
        {user.location && (
          <div className="usercard__section">
            <h3 className="usercard__sectionTitle">Location</h3>
            <div className="usercard__location">
              <span className="usercard__locationIcon">📍</span>
              <span className="usercard__locationValue">{user.location}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="usercard__actions">
          <button className="usercard__actionButton usercard__actionButton--primary">
            Message
          </button>
          <button className="usercard__actionButton usercard__actionButton--secondary">
            Connect
          </button>
        </div>
      </div>
    </div>
  );
};

export default Usercard;
