import { useEffect, useState } from 'react';
import {
  FaCalendarAlt,
  FaTimes,
  FaMapMarkerAlt,
  FaTag,
  FaGlobe,
  FaUsers,
  FaTicketAlt,
  FaUserTie,
  FaClock,
  FaEye,
  FaDollarSign,
  FaPhone,
  FaEnvelope,
  FaEdit,
  FaTrash,
  FaShareAlt,
  FaCopy,
  FaCheck,
  FaUserPlus,
} from 'react-icons/fa';
import axios from '../api/axios';
import Toast from './Toast';

function ViewEvent({ event, onClose, onEdit, onDelete, onEventUpdated }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [shareModal, setShareModal] = useState({ show: false, eventId: null, eventTitle: '' });
  const [toast, setToast] = useState(null);
  const [registering, setRegistering] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleShare = (eventId, eventTitle) => {
    const shareUrl = `${window.location.origin}/event/${eventId}`;
    setShareModal({ show: true, eventId, eventTitle, shareUrl });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareModal.shareUrl);
      showToast('Link copied to clipboard!', 'success');
    } catch (err) {
      showToast('Failed to copy link', 'error');
    }
  };

  const handleNativeShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: shareModal.eventTitle,
          url: shareModal.shareUrl
        });
        showToast('Shared successfully!', 'success');
      } else {
        copyToClipboard();
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        showToast('Failed to share', 'error');
      }
    }
  };

  const handleRegister = async () => {
    // Prevent registration if already registered - multiple checks for safety
    if (event.isRegistered === true || event.isRegistered === 'true') {
      console.log('User already registered, blocking registration attempt');
      showToast('You are already registered for this event', 'info');
      return;
    }

    setRegistering(true);
    try {
      const response = await axios.post(`/api/events/${event._id}/register`);
      if (response.data.success) {
        showToast('Successfully registered for the event!', 'success');
        // Refresh event data from server
        if (onEventUpdated) {
          onEventUpdated();
        }
      } else {
        // If backend returns success: false, show the message
        showToast(response.data.message || 'Failed to register', 'error');
      }
    } catch (error) {
      // Handle the error - if it says already registered, refresh data to update UI
      const errorMessage = error.response?.data?.message || error.message;
      console.log('Registration error:', errorMessage);
      
      if (errorMessage === 'You are already registered for this event' || 
          errorMessage.includes('already registered') ||
          errorMessage.includes('duplicate')) {
        showToast('You are already registered for this event', 'info');
        // Refresh event data from server to get updated status
        if (onEventUpdated) {
          onEventUpdated();
        }
      } else {
        showToast(errorMessage || 'Failed to register', 'error');
      }
    } finally {
      setRegistering(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    setIsDeleting(true);
    try {
      const success = await onDelete(event._id);
      if (success) {
        setShowDeleteConfirm(false);
        onClose();
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    if (onEdit && event.isOwner) {
      onEdit(event);
    }
  };

  return (
    <div className="home-popup-overlay" onClick={onClose} role="presentation">
      <div className="home-popup home-popup--event" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="home-popup__close" onClick={onClose} aria-label="Close event popup">
          <FaTimes aria-hidden="true" />
        </button>

        <div className="home-popup__header">
          <span className="home-popup__icon">
            <FaCalendarAlt aria-hidden="true" />
          </span>
          <div>
            <h2 id="event-popup-title" className="home-popup__title">
              Event Details
            </h2>
            <p className="home-popup__subtitle">
              View all information about this event
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          marginBottom: '24px',
          padding: '16px',
          background: 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          flexWrap: 'wrap'
        }}>
          {/* Share Button - Always show */}
          <button
            onClick={() => handleShare(event._id, event.title)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '14px 24px',
              border: 'none',
              borderRadius: '999px',
              background: 'rgba(255, 215, 0, 0.15)',
              color: '#111111',
              fontSize: '0.95rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-3px)';
              e.target.style.background = 'rgba(255, 215, 0, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.background = 'rgba(255, 215, 0, 0.15)';
            }}
          >
            <FaShareAlt /> Share Event
          </button>

          {/* Register Button - Show if registration required and not registered */}
          {event.registrationRequired && (event.isRegistered === false || event.isRegistered === undefined) && event.spotsRemaining !== 0 && (
            <button
              onClick={handleRegister}
              disabled={registering || event.spotsRemaining === 0 || event.isRegistered === true}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '14px 24px',
                border: 'none',
                borderRadius: '999px',
                background: registering || event.spotsRemaining === 0 || event.isRegistered === true
                  ? '#E0E0D8'
                  : '#FF6B00',
                color: '#111111',
                fontSize: '0.95rem',
                fontWeight: '600',
                cursor: registering || event.spotsRemaining === 0 || event.isRegistered === true
                  ? 'not-allowed'
                  : 'pointer',
                boxShadow: registering || event.spotsRemaining === 0 || event.isRegistered === true
                  ? 'none'
                  : '0 6px 16px rgba(255, 107, 0, 0.25)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onMouseEnter={(e) => {
                if (!registering && event.spotsRemaining !== 0 && event.isRegistered !== true) {
                  e.target.style.transform = 'translateY(-3px)';
                  e.target.style.background = '#FF8533';
                }
              }}
              onMouseLeave={(e) => {
                if (!registering && event.spotsRemaining !== 0) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.background = '#FF6B00';
                }
              }}
            >
              <FaUserPlus /> {registering ? 'Registering...' : event.spotsRemaining === 0 ? 'Registration Full' : 'Register for Event'}
            </button>
          )}

          {/* Registered Badge - Show if already registered */}
          {event.isRegistered && (
            <div style={{
              padding: '14px 24px',
              borderRadius: '999px',
              background: 'rgba(255, 215, 0, 0.2)',
              color: '#111111',
              fontSize: '0.95rem',
              fontWeight: '500',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <FaCheck /> You are Registered
            </div>
          )}

          {/* Owner Actions - Only show for owner */}
          {event.isOwner && (
            <>
              <button
                onClick={handleEdit}
                style={{
                  flex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '14px 24px',
                  border: 'none',
                  borderRadius: '999px',
                  background: 'rgba(255, 215, 0, 0.15)',
                  color: '#111111',
                  fontSize: '0.95rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-3px)';
                  e.target.style.background = 'rgba(255, 215, 0, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.background = 'rgba(255, 215, 0, 0.15)';
                }}
              >
                <FaEdit /> Edit Event
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                style={{
                  flex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '14px 24px',
                  border: 'none',
                  borderRadius: '999px',
                  background: 'rgba(255, 107, 0, 0.15)',
                  color: '#111111',
                  fontSize: '0.95rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-3px)';
                  e.target.style.background = 'rgba(255, 107, 0, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.background = 'rgba(255, 107, 0, 0.15)';
                }}
              >
                <FaTrash /> Delete Event
              </button>
            </>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3000,
          }}>
            <div style={{
              background: '#ffffff',
              padding: '24px',
              borderRadius: '16px',
              maxWidth: '400px',
              width: '90%',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            }}>
              <h3 style={{ 
                margin: '0 0 16px 0', 
                color: '#1e293b', 
                fontSize: '1.25rem',
                fontWeight: '800'
              }}>
                Delete Event
              </h3>
              <p style={{ 
                margin: '0 0 24px 0', 
                color: '#64748b', 
                fontSize: '1rem',
                lineHeight: '1.5'
              }}>
                Are you sure you want to delete this event? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  style={{
                    flex: 1,
                    padding: '12px 20px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '10px',
                    background: '#ffffff',
                    color: '#64748b',
                    fontSize: '0.95rem',
                    fontWeight: '700',
                    cursor: isDeleting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isDeleting) {
                      e.target.style.background = '#f8fafc';
                      e.target.style.borderColor = '#cbd5e1';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#ffffff';
                    e.target.style.borderColor = '#e2e8f0';
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  style={{
                    flex: 1,
                    padding: '14px 24px',
                    border: 'none',
                    borderRadius: '12px',
                    background: isDeleting ? '#94a3b8' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: '#ffffff',
                    fontSize: '0.95rem',
                    fontWeight: '700',
                    cursor: isDeleting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: isDeleting ? 'none' : '0 6px 16px rgba(239, 68, 68, 0.35)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isDeleting) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 10px 24px rgba(239, 68, 68, 0.45)';
                      e.target.style.background = 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isDeleting) {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.35)';
                      e.target.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
                    }
                  }}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="home-popup__content" style={{ padding: '24px' }}>
          {/* Event Title */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '800', 
              color: 'var(--app-text)', 
              marginBottom: '12px',
              lineHeight: '1.3'
            }}>
              {event.title || 'Untitled Event'}
            </h3>
            
            {/* Status and Category Badges */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
              <span style={{ 
                padding: '4px 12px',
                borderRadius: '999px',
                background: 'rgba(255, 215, 0, 0.15)',
                color: '#111111',
                fontSize: '0.75rem',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}>
                {event.category || 'Uncategorized'}
              </span>
              <span style={{ 
                padding: '4px 12px',
                borderRadius: '999px',
                background: event.status === 'published' ? 'rgba(255, 215, 0, 0.15)' : 'rgba(255, 107, 0, 0.15)',
                color: '#111111',
                fontSize: '0.75rem',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}>
                {event.status || 'Draft'}
              </span>
              <span style={{ 
                padding: '4px 12px',
                borderRadius: '999px',
                background: event.priceType === 'Free' ? 'rgba(255, 215, 0, 0.15)' : 'rgba(255, 107, 0, 0.15)',
                color: '#111111',
                fontSize: '0.75rem',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}>
                {event.priceType || 'Free'}
              </span>
              <span style={{ 
                padding: '4px 12px',
                borderRadius: '999px',
                background: 'rgba(255, 215, 0, 0.15)',
                color: '#111111',
                fontSize: '0.75rem',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}>
                {event.visibility || 'Public'}
              </span>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(255, 255, 255, 0.5)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.3)' }}>
              <p style={{ 
                color: '#666666', 
                fontSize: '1rem', 
                fontWeight: '400', 
                lineHeight: '1.6',
                margin: '0'
              }}>
                {event.description}
              </p>
            </div>
          )}

          {/* Event Details Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '16px',
            marginBottom: '24px'
          }}>
            {/* Registration Info - Only show for owners when registration is required */}
            {event.isOwner && event.registrationRequired && (
              <div style={{ 
                padding: '16px', 
                background: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <FaUsers style={{ color: '#111111', fontSize: '1.2rem' }} />
                  <span style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: '500', 
                    color: '#666666',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em'
                  }}>
                    Registration Stats
                  </span>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111111', marginBottom: '4px' }}>
                  {event.attendeeCount || 0}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666666', fontWeight: '400' }}>
                  {event.maxAttendees 
                    ? `${event.spotsRemaining || 0} spots remaining`
                    : 'No limit on attendees'
                  }
                </div>
              </div>
            )}

            {/* Start Date & Time */}
            <div style={{ 
              padding: '16px', 
              background: 'rgba(255, 255, 255, 0.5)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <FaCalendarAlt style={{ color: '#111111', fontSize: '1.2rem' }} />
                <span style={{ fontWeight: '500', color: '#666666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>START DATE</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#111111', fontSize: '0.95rem', fontWeight: '500' }}>
                <FaClock style={{ color: '#111111', fontSize: '0.9rem' }} />
                <span>{formatDate(event.startAt)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666666', fontSize: '0.9rem', fontWeight: '400', marginTop: '4px' }}>
                <span style={{ color: '#111111' }}>Time:</span>
                <span>{formatTime(event.startAt)}</span>
              </div>
            </div>

            {/* End Date & Time */}
            {event.endAt && (
              <div style={{ 
                padding: '16px', 
                background: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <FaCalendarAlt style={{ color: '#111111', fontSize: '1.2rem' }} />
                  <span style={{ fontWeight: '500', color: '#666666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>END DATE</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#111111', fontSize: '0.95rem', fontWeight: '500' }}>
                  <FaClock style={{ color: '#111111', fontSize: '0.9rem' }} />
                  <span>{formatDate(event.endAt)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666666', fontSize: '0.9rem', fontWeight: '400', marginTop: '4px' }}>
                  <span style={{ color: '#111111' }}>Time:</span>
                  <span>{formatTime(event.endAt)}</span>
                </div>
              </div>
            )}

            {/* Location/Link */}
            {event.locationOrLink && (
              <div style={{ 
                padding: '16px', 
                background: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  {event.onlineType === 'Online' ? (
                    <FaGlobe style={{ color: '#111111', fontSize: '1.2rem' }} />
                  ) : (
                    <FaMapMarkerAlt style={{ color: '#111111', fontSize: '1.2rem' }} />
                  )}
                  <span style={{ fontWeight: '500', color: '#666666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {event.onlineType === 'Online' ? 'ONLINE LINK' : 'LOCATION'}
                  </span>
                </div>
                <p style={{ 
                  color: '#111111', 
                  fontSize: '0.95rem', 
                  fontWeight: '500',
                  margin: '0',
                  wordBreak: 'break-word'
                }}>
                  {event.locationOrLink}
                </p>
              </div>
            )}

            {/* Event Type */}
            <div style={{ 
              padding: '16px', 
              background: 'rgba(255, 255, 255, 0.5)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <FaGlobe style={{ color: '#111111', fontSize: '1.2rem' }} />
                <span style={{ fontWeight: '500', color: '#666666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>EVENT TYPE</span>
              </div>
              <p style={{ 
                color: '#111111', 
                fontSize: '0.95rem', 
                fontWeight: '500',
                margin: '0'
              }}>
                {event.onlineType || 'Offline'}
              </p>
            </div>

            {/* Visibility */}
            <div style={{ 
              padding: '16px', 
              background: 'rgba(255, 255, 255, 0.5)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <FaEye style={{ color: '#111111', fontSize: '1.2rem' }} />
                <span style={{ fontWeight: '500', color: '#666666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>VISIBILITY</span>
              </div>
              <p style={{ 
                color: '#111111', 
                fontSize: '0.95rem', 
                fontWeight: '500',
                margin: '0'
              }}>
                {event.visibility || 'Public'}
              </p>
            </div>

            {/* Price */}
            <div style={{ 
              padding: '16px', 
              background: 'rgba(255, 255, 255, 0.5)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <FaDollarSign style={{ color: '#111111', fontSize: '1.2rem' }} />
                <span style={{ fontWeight: '500', color: '#666666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>PRICE TYPE</span>
              </div>
              <p style={{ 
                color: '#111111', 
                fontSize: '0.95rem', 
                fontWeight: '500',
                margin: '0'
              }}>
                {event.priceType || 'Free'}
              </p>
            </div>

            {/* Max Attendees */}
            {event.maxAttendees && (
              <div style={{ 
                padding: '16px', 
                background: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <FaUsers style={{ color: '#111111', fontSize: '1.2rem' }} />
                  <span style={{ fontWeight: '500', color: '#666666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>MAX ATTENDEES</span>
                </div>
                <p style={{ 
                  color: '#111111', 
                  fontSize: '0.95rem', 
                  fontWeight: '500',
                  margin: '0'
                }}>
                  {event.maxAttendees}
                </p>
              </div>
            )}

            {/* Organizer */}
            {event.organizer && (
              <div style={{ 
                padding: '16px', 
                background: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <FaUserTie style={{ color: '#111111', fontSize: '1.2rem' }} />
                  <span style={{ fontWeight: '500', color: '#666666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>ORGANIZER</span>
                </div>
                <p style={{ 
                  color: '#111111', 
                  fontSize: '0.95rem', 
                  fontWeight: '500',
                  margin: '0'
                }}>
                  {event.organizer}
                </p>
              </div>
            )}

            {/* Registration Required */}
            <div style={{ 
              padding: '16px', 
              background: 'rgba(255, 255, 255, 0.5)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <FaTicketAlt style={{ color: '#111111', fontSize: '1.2rem' }} />
                <span style={{ fontWeight: '500', color: '#666666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>REGISTRATION</span>
              </div>
              <p style={{ 
                color: '#111111', 
                fontSize: '0.95rem', 
                fontWeight: '500',
                margin: '0'
              }}>
                {event.registrationRequired ? 'Required' : 'Not Required'}
              </p>
            </div>
          </div>

          {/* Contact Information */}
          {event.contactInformation && (
            <div style={{ 
              marginBottom: '24px',
              padding: '16px', 
              background: 'rgba(255, 255, 255, 0.5)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <FaEnvelope style={{ color: '#111111', fontSize: '1.2rem' }} />
                <span style={{ fontWeight: '500', color: '#666666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>CONTACT INFORMATION</span>
              </div>
              <p style={{ 
                color: '#111111', 
                fontSize: '0.95rem', 
                fontWeight: '600',
                margin: '0',
                wordBreak: 'break-word'
              }}>
                {event.contactInformation}
              </p>
            </div>
          )}

          {/* Event Image */}
          {event.imageUrl && (
            <div style={{ marginBottom: '24px' }}>
              <img 
                src={event.imageUrl} 
                alt={event.title || 'Event Image'} 
                style={{ 
                  width: '100%', 
                  maxHeight: '300px', 
                  objectFit: 'cover',
                  borderRadius: '12px',
                  border: '1px solid var(--app-card-border)'
                }}
              />
            </div>
          )}

          {/* Timestamps */}
          <div style={{ 
            padding: '16px', 
            background: 'rgba(248, 250, 252, 0.5)', 
            borderRadius: '12px',
            fontSize: '0.85rem',
            color: '#64748b',
            fontWeight: '500'
          }}>
            <div style={{ marginBottom: '4px' }}>
              Created: {event.createdAt ? formatDate(event.createdAt) : 'Not specified'}
            </div>
            <div>
              Last Updated: {event.updatedAt ? formatDate(event.updatedAt) : 'Not specified'}
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {shareModal.show && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
        }}
          onClick={() => setShareModal({ show: false, eventId: null, eventTitle: '', shareUrl: '' })}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '32px',
              maxWidth: '450px',
              width: '90%',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '800',
                color: '#1e293b',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                <FaShareAlt style={{ color: '#667eea' }} />
                Share Event
              </h3>
              <p style={{
                fontSize: '0.95rem',
                color: '#64748b',
                fontWeight: '500',
                margin: 0,
              }}>
                {shareModal.eventTitle}
              </p>
            </div>

            <div style={{
              marginBottom: '24px',
            }}>
              <label style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: '700',
                color: '#475569',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Event Link
              </label>
              <div style={{
                display: 'flex',
                gap: '8px',
              }}>
                <input
                  type="text"
                  value={shareModal.shareUrl}
                  readOnly
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '2px solid #e2e8f0',
                    background: '#f8fafc',
                    fontSize: '0.9rem',
                    color: '#475569',
                    fontWeight: '600',
                  }}
                />
                <button
                  onClick={copyToClipboard}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                  }}
                >
                  <FaCopy />
                  Copy
                </button>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
            }}>
              <button
                onClick={handleNativeShare}
                style={{
                  flex: 1,
                  padding: '14px 24px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                }}
              >
                Share via {navigator.share ? 'Native Share' : 'Copy Link'}
              </button>
              <button
                onClick={() => setShareModal({ show: false, eventId: null, eventTitle: '', shareUrl: '' })}
                style={{
                  padding: '14px 24px',
                  borderRadius: '12px',
                  border: '2px solid #e2e8f0',
                  background: '#ffffff',
                  color: '#64748b',
                  fontSize: '0.95rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#f8fafc';
                  e.target.style.borderColor = '#cbd5e1';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#ffffff';
                  e.target.style.borderColor = '#e2e8f0';
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default ViewEvent;
