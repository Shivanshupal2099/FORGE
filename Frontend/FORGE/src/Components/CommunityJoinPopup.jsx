import { useState } from 'react';
import { IoClose, IoPeople, IoBusiness, IoCodeSlash, IoRocket, IoHeart, IoSparkles, IoCheckmarkCircle, IoAdd, IoGlobe } from 'react-icons/io5';
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
  const [customCommunityType, setCustomCommunityType] = useState('');
  const [activeTab, setActiveTab] = useState('existing'); // 'existing' or 'custom'
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [memberCount, setMemberCount] = useState(12);
  const [selectedMembers, setSelectedMembers] = useState([]);

  const handleSelectType = (typeId) => {
    setSelectedType(typeId);
  };

  const handleCustomSubmit = () => {
    if (customCommunityType.trim()) {
      setShowComingSoon(true);
      setTimeout(() => {
        setShowComingSoon(false);
        onClose();
      }, 3000);
    }
  };

  const handleExistingSubmit = () => {
    if (selectedType) {
      setShowComingSoon(true);
      setTimeout(() => {
        setShowComingSoon(false);
        onClose();
      }, 3000);
    }
  };

  const handleMemberCountChange = (count) => {
    if (count >= 2 && count <= 12) {
      setMemberCount(count);
    }
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
          <h2>Join or Create a Community</h2>
          <p>Connect with small groups of 12 like-minded people from diverse regions of the world. Join existing communities or create your own custom community to connect with people who share your interests.</p>
        </div>

        <div className="community-join-popup__tabs">
          <button
            type="button"
            className={`community-join-popup__tab ${activeTab === 'existing' ? 'community-join-popup__tab--active' : ''}`}
            onClick={() => setActiveTab('existing')}
          >
            <IoPeople />
            Existing Communities
          </button>
          <button
            type="button"
            className={`community-join-popup__tab ${activeTab === 'custom' ? 'community-join-popup__tab--active' : ''}`}
            onClick={() => setActiveTab('custom')}
          >
            <IoAdd />
            Create Custom Community
          </button>
        </div>

        {activeTab === 'existing' && !showComingSoon && (
          <>
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
            <div style={{
              padding: '12px 20px',
              background: 'linear-gradient(135deg, rgba(255, 107, 0, 0.1) 0%, rgba(255, 107, 0, 0.05) 100%)',
              border: '1px solid rgba(255, 107, 0, 0.2)',
              borderRadius: '12px',
              fontSize: '0.85rem',
              color: '#FF6B00',
              fontWeight: '600',
              textAlign: 'center',
              marginBottom: '32px'
            }}>
              ⚡ Feature coming soon - Submit to join waitlist
            </div>
          </>
        )}

        {activeTab === 'custom' && !showComingSoon && (
          <div className="community-join-popup__custom">
            <div className="community-join-popup__custom-header">
              <div className="community-join-popup__custom-icon">
                <IoGlobe />
              </div>
              <h3>Create Your Own Community</h3>
              <p>Connect with people from different regions who share your interests. Our smart matching system will auto-connect you with diverse members worldwide.</p>
            </div>
            <div className="community-join-popup__custom-form">
              <label htmlFor="custom-community-type">Community Type / Interest</label>
              <input
                type="text"
                id="custom-community-type"
                value={customCommunityType}
                onChange={(e) => setCustomCommunityType(e.target.value)}
                placeholder="e.g., AI Research, Digital Marketing, Sustainability..."
                maxLength={50}
              />
              
              <label htmlFor="member-count">Number of Members (Max 12)</label>
              <div className="community-join-popup__member-selector">
                <button
                  type="button"
                  className="community-join-popup__member-btn"
                  onClick={() => handleMemberCountChange(memberCount - 1)}
                  disabled={memberCount <= 2}
                >
                  -
                </button>
                <input
                  type="number"
                  id="member-count"
                  value={memberCount}
                  onChange={(e) => handleMemberCountChange(parseInt(e.target.value) || 2)}
                  min="2"
                  max="12"
                  className="community-join-popup__member-input"
                />
                <button
                  type="button"
                  className="community-join-popup__member-btn"
                  onClick={() => handleMemberCountChange(memberCount + 1)}
                  disabled={memberCount >= 12}
                >
                  +
                </button>
              </div>
              
              <div className="community-join-popup__custom-info">
                <IoPeople />
                <span>You'll be matched with {memberCount} diverse members from different regions</span>
              </div>
              <div style={{
                marginTop: '12px',
                padding: '10px 16px',
                background: 'linear-gradient(135deg, rgba(255, 107, 0, 0.1) 0%, rgba(255, 107, 0, 0.05) 100%)',
                border: '1px solid rgba(255, 107, 0, 0.2)',
                borderRadius: '12px',
                fontSize: '0.85rem',
                color: '#FF6B00',
                fontWeight: '600',
                textAlign: 'center'
              }}>
                ⚡ Feature coming soon - Submit to join waitlist
              </div>
            </div>
          </div>
        )}

        {activeTab === 'existing' && !showComingSoon && (
          <div style={{
            padding: '12px 20px',
            background: 'linear-gradient(135deg, rgba(255, 107, 0, 0.1) 0%, rgba(255, 107, 0, 0.05) 100%)',
            border: '1px solid rgba(255, 107, 0, 0.2)',
            borderRadius: '12px',
            fontSize: '0.85rem',
            color: '#FF6B00',
            fontWeight: '600',
            textAlign: 'center',
            marginBottom: '32px'
          }}>
            ⚡ Feature coming soon - Submit to join waitlist
          </div>
        )}

        {showComingSoon && (
          <div className="community-join-popup__coming-soon">
            <IoSparkles />
            <h3>Coming Soon in Next Version</h3>
            <p>We're working hard to bring you this exciting feature. Stay tuned!</p>
          </div>
        )}

        {!showComingSoon && (
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
              disabled={activeTab === 'existing' ? !selectedType : !customCommunityType.trim()}
              onClick={activeTab === 'existing' ? handleExistingSubmit : handleCustomSubmit}
            >
              Submit
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CommunityJoinPopup;
