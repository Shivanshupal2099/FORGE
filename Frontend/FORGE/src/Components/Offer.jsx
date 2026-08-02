import { useEffect, useState } from 'react';
import { FaTags, FaTimes, FaPlus, FaCoins, FaClock, FaGift, FaArrowLeft, FaEdit, FaTrash, FaSpinner } from 'react-icons/fa';
import axios from '../api/axios';
import { useAuth } from '../contexts/AuthContext';

function Offer({ onClose }) {
  const { user } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showDetailPopup, setShowDetailPopup] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [newOffer, setNewOffer] = useState({
    title: '',
    description: '',
    category: 'other'
  });
  const [editOffer, setEditOffer] = useState({
    title: '',
    description: '',
    category: 'other',
    is_active: true
  });
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tokensLoading, setTokensLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userTokens, setUserTokens] = useState(0);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (showDetailPopup) {
          setShowDetailPopup(false);
          setSelectedOffer(null);
        } else if (showEditForm) {
          setShowEditForm(false);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, showDetailPopup, showEditForm]);

  useEffect(() => {
    fetchOffers();
    if (user?.email) {
      fetchUserTokens(user.email);
      setCurrentUserId(user._id || user.id);
    }
  }, [user]);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/offers');
      if (response.data.success) {
        setOffers(response.data.offers || []);
      } else {
        setError('Failed to load offers');
      }
    } catch (err) {
      console.error('Error fetching offers:', err);
      if (err.response?.status === 404) {
        setOffers([]);
        setError(null);
      } else {
        setError(err.response?.data?.message || 'Failed to load offers');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTokens = async (userEmail) => {
    try {
      setTokensLoading(true);
      if (userEmail) {
        const response = await axios.get(`/api/tokens/user/${userEmail}`);
        if (response.data.success) {
          setUserTokens(response.data.tokens.total_tokens || 0);
        } else {
          setUserTokens(0);
        }
      }
    } catch (err) {
      console.error('Error fetching user tokens:', err);
      setUserTokens(0);
    } finally {
      setTokensLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewOffer(prev => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditOffer(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleCreateOffer = async (e) => {
    e.preventDefault();
    try {
      if (newOffer.title && newOffer.description) {
        const response = await axios.post('/api/offers', newOffer);
        if (response.data.success) {
          setOffers(prev => [response.data.offer, ...prev]);
          setNewOffer({
            title: '',
            description: '',
            category: 'other'
          });
          setShowCreateForm(false);
        }
      }
    } catch (err) {
      console.error('Error creating offer:', err);
      setError('Failed to create offer');
    }
  };

  const handleOfferClick = (offer) => {
    setSelectedOffer(offer);
    setShowDetailPopup(true);
  };

  const handleBackToOffers = () => {
    setShowDetailPopup(false);
    setSelectedOffer(null);
  };

  const handleEditOffer = () => {
    setEditOffer({
      title: selectedOffer.title,
      description: selectedOffer.description,
      category: selectedOffer.category,
      is_active: selectedOffer.is_active
    });
    setShowEditForm(true);
  };

  const handleUpdateOffer = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`/api/offers/${selectedOffer._id}`, editOffer);
      if (response.data.success) {
        // Update the offer in the list
        setOffers(prev => prev.map(offer => 
          offer._id === selectedOffer._id ? response.data.offer : offer
        ));
        setSelectedOffer(response.data.offer);
        setShowEditForm(false);
      }
    } catch (err) {
      console.error('Error updating offer:', err);
      setError('Failed to update offer');
    }
  };

  const handleDeleteOffer = async () => {
    if (!window.confirm('Are you sure you want to delete this offer?')) {
      return;
    }
    try {
      const response = await axios.delete(`/api/offers/${selectedOffer._id}`);
      if (response.data.success) {
        // Remove the offer from the list
        setOffers(prev => prev.filter(offer => offer._id !== selectedOffer._id));
        setShowDetailPopup(false);
        setSelectedOffer(null);
      }
    } catch (err) {
      console.error('Error deleting offer:', err);
      setError('Failed to delete offer');
    }
  };

  const handleRedeemOffer = async (offerId) => {
    try {
      if (!user?.email) {
        alert('Please log in to redeem offers');
        return;
      }
      
      if (!user.is_verified) {
        alert('You must be verified to redeem offers. Please complete your profile verification.');
        return;
      }
      
      const response = await axios.post(`/api/offers/${offerId}/redeem`);
      if (response.data.success) {
        setUserTokens(response.data.remaining_tokens);
        await fetchOffers();
        alert('Offer redeemed successfully!');
      }
    } catch (err) {
      console.error('Error redeeming offer:', err);
      const errorMessage = err.response?.data?.message || 'Failed to redeem offer';
      alert(errorMessage);
    }
  };

  const isOwner = (offer) => {
    return currentUserId && offer.created_by && 
           (offer.created_by._id === currentUserId || offer.created_by === currentUserId);
  };

  const isRedeemed = (offer) => {
    return offer.redeemed_by?.some(r => r.user_id === currentUserId);
  };

  const isExpired = (offer) => {
    return false; // No expiry date functionality
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

        {!showDetailPopup ? (
          <>
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

            <div className="home-popup__token-balance">
              {tokensLoading ? (
                <div className="token-loading">
                  <FaSpinner className="spinner" />
                  <span>Loading tokens...</span>
                </div>
              ) : (
                <>
                  <FaCoins className="token-icon" />
                  <div className="token-info">
                    <span className="token-amount">{userTokens}</span>
                    <span className="token-label">Tokens Available</span>
                  </div>
                </>
              )}
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
                    <label htmlFor="category">Category</label>
                    <select
                      id="category"
                      name="category"
                      value={newOffer.category}
                      onChange={handleInputChange}
                    >
                      <option value="other">Other</option>
                      <option value="discount">Discount</option>
                      <option value="bonus">Bonus</option>
                      <option value="exclusive">Exclusive</option>
                      <option value="community">Community</option>
                    </select>
                  </div>
                  <button type="submit" className="button-primary">
                    Create Offer
                  </button>
                </form>
              </div>
            )}

            <div className="home-popup-section">
              <h3 className="home-popup-section__title">Available offers</h3>
              {loading ? (
                <div className="loading-container">
                  <FaSpinner className="spinner large" />
                  <p className="loading-text">Loading offers...</p>
                </div>
              ) : error ? (
                <div className="error-container">
                  <p className="error-text">{error}</p>
                  <button 
                    type="button" 
                    className="button-secondary"
                    onClick={fetchOffers}
                  >
                    Retry
                  </button>
                </div>
              ) : offers.length === 0 ? (
                <div className="empty-container">
                  <div className="empty-icon">
                    <FaTags />
                  </div>
                  <p className="empty-text">No offers yet shared by builder community</p>
                  <p className="empty-subtext">Be the first to create an exclusive offer for the community!</p>
                </div>
              ) : (
                <div className="offer-cards-grid offer-cards-grid--scrollable">
                  {offers.map((offer) => (
                    <div 
                      key={offer._id} 
                      className={`offer-card ${isRedeemed(offer) ? 'redeemed' : ''} ${isExpired(offer) ? 'expired' : ''}`}
                      onClick={() => handleOfferClick(offer)}
                    >
                      <div className="offer-card__header">
                        <span className="offer-card__title">{offer.title}</span>
                        <span className="offer-card__category">{offer.category}</span>
                      </div>
                      <div className="offer-card__meta">
                        <span className="offer-card__cost">
                          <FaCoins /> 100 tokens
                        </span>
                        {isRedeemed(offer) && (
                          <span className="offer-card__status redeemed-badge">Redeemed</span>
                        )}
                        {isExpired(offer) && (
                          <span className="offer-card__status expired-badge">Expired</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {showEditForm ? (
              <>
                <button
                  type="button"
                  className="home-popup__back"
                  onClick={() => setShowEditForm(false)}
                >
                  <FaArrowLeft aria-hidden="true" /> Back to Offer
                </button>

                <div className="home-popup__header">
                  <span className="home-popup__icon">
                    <FaEdit aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="home-popup__title">Edit Offer</h2>
                    <p className="home-popup__subtitle">
                      Update your offer details
                    </p>
                  </div>
                </div>

                <div className="home-popup-section">
                  <form onSubmit={handleUpdateOffer} className="offer-create-form">
                    <div className="form-group">
                      <label htmlFor="edit-title">Title *</label>
                      <input
                        type="text"
                        id="edit-title"
                        name="title"
                        value={editOffer.title}
                        onChange={handleEditInputChange}
                        required
                        placeholder="Enter offer title"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="edit-description">Description *</label>
                      <textarea
                        id="edit-description"
                        name="description"
                        value={editOffer.description}
                        onChange={handleEditInputChange}
                        required
                        placeholder="Describe the offer"
                        rows="4"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="edit-category">Category</label>
                      <select
                        id="edit-category"
                        name="category"
                        value={editOffer.category}
                        onChange={handleEditInputChange}
                      >
                        <option value="other">Other</option>
                        <option value="discount">Discount</option>
                        <option value="bonus">Bonus</option>
                        <option value="exclusive">Exclusive</option>
                        <option value="community">Community</option>
                      </select>
                    </div>
                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          name="is_active"
                          checked={editOffer.is_active}
                          onChange={handleEditInputChange}
                        />
                        <span>Active Offer</span>
                      </label>
                    </div>
                    <div className="offer-edit-actions">
                      <button type="submit" className="button-primary">
                        Update Offer
                      </button>
                      <button
                        type="button"
                        className="button-danger"
                        onClick={handleDeleteOffer}
                      >
                        <FaTrash /> Delete Offer
                      </button>
                    </div>
                  </form>
                </div>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="home-popup__back"
                  onClick={handleBackToOffers}
                >
                  <FaArrowLeft aria-hidden="true" /> Back to Offers
                </button>

                <div className="home-popup__header">
                  <span className="home-popup__icon">
                    <FaTags aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="home-popup__title">{selectedOffer?.title}</h2>
                    <p className="home-popup__subtitle">
                      Offer Details
                    </p>
                  </div>
                </div>

                <div className="offer-detail-card">
                  <div className="offer-detail__header">
                    <span className="offer-detail__category">{selectedOffer?.category}</span>
                    {isOwner(selectedOffer) && (
                      <div className="offer-detail__actions">
                        <button
                          type="button"
                          className="button-icon"
                          onClick={handleEditOffer}
                          title="Edit offer"
                        >
                          <FaEdit />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="offer-detail__description">
                    {selectedOffer?.description}
                  </div>

                  <div className="offer-detail__meta">
                    <div className="offer-detail__meta-item">
                      <span className="offer-detail__meta-label">
                        <FaCoins /> Token Cost
                      </span>
                      <span className="offer-detail__meta-value">
                        100 tokens
                      </span>
                    </div>
                    {selectedOffer?.max_redemptions && (
                      <div className="offer-detail__meta-item">
                        <span className="offer-detail__meta-label">Redemptions</span>
                        <span className="offer-detail__meta-value">
                          {selectedOffer.redeemed_by.length}/{selectedOffer.max_redemptions}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="offer-detail__status">
                    {!user?.is_verified && (
                      <span className="verification-badge">Verification Required</span>
                    )}
                    {isRedeemed(selectedOffer) && (
                      <span className="redeemed-badge">You have redeemed this offer</span>
                    )}
                    {isExpired(selectedOffer) && (
                      <span className="expired-badge">This offer has expired</span>
                    )}
                    {!selectedOffer?.is_active && (
                      <span className="expired-badge">This offer is inactive</span>
                    )}
                  </div>

                  {!isRedeemed(selectedOffer) && !isExpired(selectedOffer) && selectedOffer?.is_active && (
                    <>
                      {!user?.is_verified ? (
                        <button
                          type="button"
                          className="button-primary button-large"
                          disabled
                        >
                          <FaGift /> Verify to Redeem
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="button-primary button-large"
                          onClick={() => handleRedeemOffer(selectedOffer._id)}
                          disabled={userTokens < 100}
                        >
                          <FaGift /> Redeem Offer (100 tokens)
                        </button>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Offer;
