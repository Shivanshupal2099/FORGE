import { useEffect, useState } from 'react';
import { FaTags, FaTimes, FaPlus, FaCoins, FaClock, FaGift, FaArrowLeft, FaEdit, FaTrash, FaSpinner, FaFlag, FaExclamationCircle } from 'react-icons/fa';
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
    description: ''
  });
  const [editOffer, setEditOffer] = useState({
    title: '',
    description: '',
    is_active: true
  });
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [redeemedOfferId, setRedeemedOfferId] = useState(null);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isExpired = (offer) => {
    return false; // No expiry date functionality
  };

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
    if (newOffer.title.length > 45) {
      setErrorMessage('Title must not exceed 45 characters');
      setShowErrorPopup(true);
      return;
    }
    if (newOffer.description.length > 3801) {
      setErrorMessage('Description must not exceed 3801 characters');
      setShowErrorPopup(true);
      return;
    }
    try {
      if (newOffer.title && newOffer.description) {
        const response = await axios.post('/api/offers', newOffer);
        if (response.data.success) {
          setOffers(prev => [response.data.offer, ...prev]);
          setNewOffer({
            title: '',
            description: ''
          });
          setShowCreateForm(false);
        }
      }
    } catch (err) {
      console.error('Error creating offer:', err);
      const errorMsg = err.response?.data?.message || 'Failed to create offer';
      setErrorMessage(errorMsg);
      setShowErrorPopup(true);
      setError(errorMsg);
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
      is_active: selectedOffer.is_active
    });
    setShowEditForm(true);
  };

  const handleUpdateOffer = async (e) => {
    e.preventDefault();
    if (editOffer.title.length > 45) {
      alert('Title must not exceed 45 characters');
      return;
    }
    if (editOffer.description.length > 3801) {
      alert('Description must not exceed 3801 characters');
      return;
    }
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
      
      // Check if user is verified (tokens check removed)
      
      const response = await axios.post(`/api/offers/${offerId}/redeem`);
      if (response.data.success) {
        setRedeemedOfferId(offerId);
        setShowSuccessPopup(true);
        await fetchOffers();
        // After successful redemption, show the detail popup with offer details
        const offer = offers.find(o => o._id === offerId);
        if (offer) {
          setSelectedOffer(offer);
          setShowDetailPopup(true);
        }
      }
    } catch (err) {
      console.error('Error redeeming offer:', err);
      const errorMessage = err.response?.data?.message || 'Failed to redeem offer';
      
      // If already redeemed, show detail popup instead of alert
      if (errorMessage.includes('already redeemed') || err.response?.status === 400) {
        const offer = offers.find(o => o._id === offerId);
        if (offer) {
          setSelectedOffer(offer);
          setShowDetailPopup(true);
        }
      } else {
        alert(errorMessage);
      }
    }
  };

  const isOwner = (offer) => {
    return currentUserId && offer.created_by && 
           (offer.created_by._id === currentUserId || offer.created_by === currentUserId);
  };

  const isRedeemed = (offer) => {
    if (!offer.redeemed_by || !currentUserId) return false;
    return offer.redeemed_by.some(r => {
      const redeemedUserId = r.user_id?._id || r.user_id;
      return redeemedUserId && (redeemedUserId.toString() === currentUserId.toString());
    });
  };

  const handleSuccessPopupClose = () => {
    setShowSuccessPopup(false);
    // Remove the redeemed offer from the list
    if (redeemedOfferId) {
      setOffers(prev => prev.filter(offer => offer._id !== redeemedOfferId));
      setRedeemedOfferId(null);
    }
  };

  const handleReportOffer = async () => {
    if (!reportReason.trim()) {
      alert('Please provide a reason for reporting this offer');
      return;
    }
    
    try {
      setIsSubmittingReport(true);
      const response = await axios.post(`/api/offers/${selectedOffer._id}/report`, {
        reason: reportReason
      });
      
      if (response.data.success) {
        alert('Offer reported successfully');
        setShowReportDialog(false);
        setReportReason('');
      } else {
        alert(response.data.message || 'Failed to report offer');
      }
    } catch (err) {
      console.error('Error reporting offer:', err);
      alert(err.response?.data?.message || 'Failed to report offer');
    } finally {
      setIsSubmittingReport(false);
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
                      maxLength={45}
                      style={{
                        borderColor: newOffer.title.length > 45 ? '#ef4444' : undefined
                      }}
                    />
                    <span style={{
                      fontSize: '0.8rem',
                      color: newOffer.title.length > 45 ? '#ef4444' : '#64748b',
                      marginTop: '4px',
                      display: 'block'
                    }}>
                      {newOffer.title.length}/45 characters
                    </span>
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
                      maxLength={3801}
                      style={{
                        borderColor: newOffer.description.length > 3801 ? '#ef4444' : undefined
                      }}
                    />
                    <span style={{
                      fontSize: '0.8rem',
                      color: newOffer.description.length > 3801 ? '#ef4444' : '#64748b',
                      marginTop: '4px',
                      display: 'block'
                    }}>
                      {newOffer.description.length}/3801 characters
                    </span>
                  </div>
                  <button type="submit" className="button-primary">
                    Create Offer
                  </button>
                </form>
              </div>
            )}

            {!showCreateForm && !showDetailPopup && (
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
                      >
                        <div className="offer-card__header">
                          <span className="offer-card__title">{offer.title}</span>
                          {isOwner(offer) && (
                            <div className="offer-card__actions">
                              <button
                                type="button"
                                className="offer-card__action-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedOffer(offer);
                                  setShowDetailPopup(true);
                                  handleEditOffer();
                                }}
                                title="Edit offer"
                              >
                                <FaEdit />
                              </button>
                              <button
                                type="button"
                                className="offer-card__action-btn offer-card__action-btn--delete"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedOffer(offer);
                                  handleDeleteOffer();
                                }}
                                title="Delete offer"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          )}
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
                        {!isRedeemed(offer) && !isExpired(offer) && offer.is_active && (
                          <button
                            type="button"
                            className="offer-card__redeem-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRedeemOffer(offer._id);
                            }}
                          >
                            <FaGift /> Redeem
                          </button>
                        )}
                        {isRedeemed(offer) && (
                          <button
                            type="button"
                            className="offer-card__redeem-btn offer-card__redeem-btn--redeemed"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOffer(offer);
                              setShowDetailPopup(true);
                            }}
                          >
                            <FaGift /> View Details
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
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
                        maxLength={45}
                        style={{
                          borderColor: editOffer.title.length > 45 ? '#ef4444' : undefined
                        }}
                      />
                      <span style={{
                        fontSize: '0.8rem',
                        color: editOffer.title.length > 45 ? '#ef4444' : '#64748b',
                        marginTop: '4px',
                        display: 'block'
                      }}>
                        {editOffer.title.length}/45 characters
                      </span>
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
                        maxLength={3801}
                        style={{
                          borderColor: editOffer.description.length > 3801 ? '#ef4444' : undefined
                        }}
                      />
                      <span style={{
                        fontSize: '0.8rem',
                        color: editOffer.description.length > 3801 ? '#ef4444' : '#64748b',
                        marginTop: '4px',
                        display: 'block'
                      }}>
                        {editOffer.description.length}/3801 characters
                      </span>
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
                    {isOwner(selectedOffer) ? (
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
                    ) : (
                      <div className="offer-detail__actions">
                        <button
                          type="button"
                          className="button-icon button-icon--danger"
                          onClick={() => setShowReportDialog(true)}
                          title="Report offer"
                        >
                          <FaFlag />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="offer-detail__description">
                    {selectedOffer?.description}
                  </div>

                  <div className="offer-detail__meta">
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
                    <button
                      type="button"
                      className="button-primary button-large"
                      onClick={() => handleRedeemOffer(selectedOffer._id)}
                    >
                      <FaGift /> Redeem Offer
                    </button>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {showSuccessPopup && (
        <div className="home-popup-overlay" onClick={handleSuccessPopupClose}>
          <div className="home-popup" onClick={(e) => e.stopPropagation()}>
            <div className="home-popup__header">
              <span className="home-popup__icon">
                <FaGift />
              </span>
              <div>
                <h2 className="home-popup__title">Offer Redeemed!</h2>
                <p className="home-popup__subtitle">
                  Congratulations! You have successfully redeemed this offer.
                </p>
              </div>
            </div>
            <div className="home-popup-section">
              <button
                type="button"
                className="button-primary button-large"
                onClick={handleSuccessPopupClose}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {showErrorPopup && (
        <div className="home-popup-overlay" onClick={() => setShowErrorPopup(false)}>
          <div 
            className="home-popup home-popup--error" 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
              border: '2px solid #fecaca',
              boxShadow: '0 20px 40px rgba(239, 68, 68, 0.15)'
            }}
          >
            <div className="home-popup__header">
              <span 
                className="home-popup__icon" 
                style={{ 
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: '#ffffff',
                  boxShadow: '0 8px 20px rgba(239, 68, 68, 0.3)'
                }}
              >
                <FaExclamationCircle />
              </span>
              <div>
                <h2 
                  className="home-popup__title" 
                  style={{ 
                    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  Oops! Something went wrong
                </h2>
                <p className="home-popup__subtitle" style={{ color: '#991b1b' }}>
                  {errorMessage}
                </p>
              </div>
            </div>
            <div className="home-popup-section">
              <button
                type="button"
                className="button-primary button-large"
                onClick={() => setShowErrorPopup(false)}
                style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  boxShadow: '0 8px 20px rgba(239, 68, 68, 0.3)',
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {showReportDialog && (
        <div className="home-popup-overlay" onClick={() => setShowReportDialog(false)}>
          <div className="home-popup" onClick={(e) => e.stopPropagation()}>
            <div className="home-popup__header">
              <span className="home-popup__icon">
                <FaFlag />
              </span>
              <div>
                <h2 className="home-popup__title">Report Offer</h2>
                <p className="home-popup__subtitle">
                  Help us keep the community safe
                </p>
              </div>
            </div>
            <div className="home-popup-section">
              <div className="form-group">
                <label htmlFor="report-reason">Reason for reporting *</label>
                <textarea
                  id="report-reason"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Describe why you're reporting this offer..."
                  rows="4"
                  required
                />
              </div>
              <div className="offer-edit-actions">
                <button
                  type="button"
                  className="button-secondary"
                  onClick={() => {
                    setShowReportDialog(false);
                    setReportReason('');
                  }}
                  disabled={isSubmittingReport}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="button-danger"
                  onClick={handleReportOffer}
                  disabled={!reportReason.trim() || isSubmittingReport}
                >
                  {isSubmittingReport ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Offer;
