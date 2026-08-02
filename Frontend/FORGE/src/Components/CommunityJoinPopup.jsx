import { useState } from 'react';
import { IoClose, IoPeople, IoBusiness, IoCodeSlash, IoRocket, IoHeart, IoSparkles, IoCheckmarkCircle } from 'react-icons/io5';
import './CommunityJoinPopup.css';

const COMMUNITY_TYPES = [
  {
    id: 'startup',
    label: 'Startup Founders',
    icon: IoRocket,
    description: 'Connect with entrepreneurs building innovative startups',
    color: '#FF6B00',
    comingSoon: false
  },
  {
    id: 'tech',
    label: 'Tech Professionals',
    icon: IoCodeSlash,
    description: 'Network with developers, engineers, and tech enthusiasts',
    color: '#667eea',
    comingSoon: false
  },
  {
    id: 'business',
    label: 'Business Professionals',
    icon: IoBusiness,
    description: 'Connect with business leaders and industry experts',
    color: '#48bb78',
    comingSoon: true
  },
  {
    id: 'creative',
    label: 'Creative Professionals',
    icon: IoSparkles,
    description: 'Join designers, artists, and creative minds',
    color: '#f093fb',
    comingSoon: true
  },
  {
    id: 'social',
    label: 'Social Impact',
    icon: IoHeart,
    description: 'Connect with people making a difference in society',
    color: '#ed64a6',
    comingSoon: true
  },
  {
    id: 'general',
    label: 'General Networking',
    icon: IoPeople,
    description: 'Open networking for all professionals and interests',
    color: '#4299e1',
    comingSoon: false
  }
];

function CommunityJoinPopup({ onClose, onJoin }) {
  const [selectedType, setSelectedType] = useState(null);

  const handleSelectType = (typeId) => {
    setSelectedType(typeId);
  };

  return (
    <div className="community-join-overlay" onClick={onClose}>
      <div className="community-join-popup" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="community-join-popup__close"
          onClick={onClose}
          aria-label="Close popup"
        >
          <IoClose />
        </button>

        <div className="community-join-popup__header">
          <div className="community-join-popup__icon">
            <IoPeople />
          </div>
          <div className="community-join-popup__badges">
            <div className="community-join-popup__premium-badge">
              <span className="community-join-popup__premium-badge-icon">⭐</span>
              <span className="community-join-popup__premium-badge-text">Premium Feature</span>
            </div>
            <div className="community-join-popup__verified-badge">
              <IoCheckmarkCircle className="community-join-popup__verified-badge-icon" />
              <span className="community-join-popup__verified-badge-text">Only for Verified Users</span>
            </div>
          </div>
          <h2>Join a Community</h2>
          <p>Connect with small groups of 12 like-minded people from diverse regions of the world. No noise like WhatsApp communities - focused, meaningful connections.</p>
        </div>

        <div className="community-join-popup__types">
          {COMMUNITY_TYPES.map((type) => (
            <button
              key={type.id}
              type="button"
              className={`community-join-popup__type ${selectedType === type.id ? 'community-join-popup__type--selected' : ''} ${type.comingSoon ? 'community-join-popup__type--disabled' : ''}`}
              onClick={() => handleSelectType(type.id)}
              style={{ '--type-color': type.color }}
              aria-label={type.comingSoon ? `${type.label} - Coming Soon` : type.label}
            >
              <div className="community-join-popup__type-icon" style={{ background: type.color }}>
                <type.icon />
              </div>
              <div className="community-join-popup__type-content">
                <h3>{type.label}</h3>
                <p>{type.description}</p>
              </div>
              {type.comingSoon && (
                <div className="community-join-popup__type-badge">
                  Coming Soon
                </div>
              )}
              {!type.comingSoon && (
                <div className="community-join-popup__type-check">
                  {selectedType === type.id && <span>✓</span>}
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="community-join-popup__actions">
          <button
            type="button"
            className="community-join-popup__button community-join-popup__button--secondary"
            onClick={onClose}
          >
            Close
          </button>
          <button
            type="button"
            className="community-join-popup__button community-join-popup__button--primary"
            disabled={true}
          >
            Coming Soon
          </button>
        </div>
      </div>
    </div>
  );
}

export default CommunityJoinPopup;
