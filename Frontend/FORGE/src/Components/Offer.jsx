import { useEffect, useState } from 'react';
import { FaTags, FaTimes, FaPlus } from 'react-icons/fa';

function Offer({ onClose }) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newOffer, setNewOffer] = useState({
    title: '',
    description: '',
    industry: '',
    targetAudience: '',
    vendor: '',
    expires: ''
  });
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewOffer(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateOffer = (e) => {
    e.preventDefault();
    if (newOffer.title && newOffer.description && newOffer.industry && newOffer.targetAudience) {
      const offer = {
        id: offers.length + 1,
        title: newOffer.title,
        description: newOffer.description,
        industry: newOffer.industry,
        targetAudience: newOffer.targetAudience,
        vendor: newOffer.vendor || 'ForgeConnect Community',
        expires: newOffer.expires || 'TBD'
      };
      setOffers(prev => [offer, ...prev]);
      setNewOffer({
        title: '',
        description: '',
        industry: '',
        targetAudience: '',
        vendor: '',
        expires: ''
      });
      setShowCreateForm(false);
    }
  };

  return (
    <div className="home-popup-overlay" onClick={onClose} role="presentation">
      <div
        className="home-popup home-popup--offer"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="offer-popup-title"
      >
        <button
          type="button"
          className="home-popup__close"
          onClick={onClose}
          aria-label="Close offers popup"
        >
          <FaTimes aria-hidden="true" />
        </button>

        <div className="home-popup__header">
          <span className="home-popup__icon">
            <FaTags aria-hidden="true" />
          </span>
          <div>
            <h2 id="offer-popup-title" className="home-popup__title">
              Offers
            </h2>
            <p className="home-popup__subtitle">
              Redeem your Forge tokens for exclusive deals and community perks.
            </p>
          </div>
        </div>

        <div className="home-popup-actions">
          <button
            type="button"
            className="button-primary"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            <FaPlus aria-hidden="true" /> {showCreateForm ? 'Cancel' : 'Create Offer'}
          </button>
        </div>

        {showCreateForm && (
          <div className="home-popup-section">
            <h3 className="home-popup-section__title">Create New Offer</h3>
            <form onSubmit={handleCreateOffer} className="offer-create-form">
              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={newOffer.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter offer title"
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={newOffer.description}
                  onChange={handleInputChange}
                  required
                  placeholder="Describe the offer"
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label htmlFor="industry">Industry/Sector *</label>
                <input
                  type="text"
                  id="industry"
                  name="industry"
                  value={newOffer.industry}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Technology, Healthcare, Education"
                />
              </div>
              <div className="form-group">
                <label htmlFor="targetAudience">Target Audience *</label>
                <input
                  type="text"
                  id="targetAudience"
                  name="targetAudience"
                  value={newOffer.targetAudience}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Students, Professionals, Small Businesses"
                />
              </div>
              <div className="form-group">
                <label htmlFor="vendor">Vendor</label>
                <input
                  type="text"
                  id="vendor"
                  name="vendor"
                  value={newOffer.vendor}
                  onChange={handleInputChange}
                  placeholder="Vendor name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="expires">Expiration Date</label>
                <input
                  type="text"
                  id="expires"
                  name="expires"
                  value={newOffer.expires}
                  onChange={handleInputChange}
                  placeholder="e.g., Jul 15"
                />
              </div>
              <button type="submit" className="button-primary">
                Create Offer
              </button>
            </form>
          </div>
        )}

        <div className="home-popup-section">
          <h3 className="home-popup-section__title">Available offers</h3>
          <ul className="home-popup-list">
            {offers.map(({ id, title, vendor, expires, description, industry, targetAudience }) => (
              <li key={id} className="home-popup-list__item">
                <div className="home-popup-list__main">
                  <span className="home-popup-list__label">{title}</span>
                  <span className="home-popup-list__meta">
                    {vendor} · Expires {expires}
                  </span>
                  {description && (
                    <span className="home-popup-list__description">{description}</span>
                  )}
                  {(industry || targetAudience) && (
                    <span className="home-popup-list__tags">
                      {industry && <span className="tag">{industry}</span>}
                      {targetAudience && <span className="tag">{targetAudience}</span>}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Offer;
