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
} from 'react-icons/fa';

function ViewEvent({ event, onClose, onEdit, onDelete }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

        {/* Action Buttons - Only show for owner */}
        {event.isOwner && (
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            marginBottom: '24px',
            padding: '16px',
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
            borderRadius: '12px',
            border: '1px solid rgba(102, 126, 234, 0.2)'
          }}>
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
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#ffffff',
                fontSize: '0.95rem',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 6px 16px rgba(102, 126, 234, 0.35)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 10px 24px rgba(102, 126, 234, 0.45)';
                e.target.style.background = 'linear-gradient(135deg, #7c8efc 0%, #8a5bd6 100%)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.35)';
                e.target.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
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
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: '#ffffff',
                fontSize: '0.95rem',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 6px 16px rgba(239, 68, 68, 0.35)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 10px 24px rgba(239, 68, 68, 0.45)';
                e.target.style.background = 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.35)';
                e.target.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
              }}
            >
              <FaTrash /> Delete Event
            </button>
          </div>
        )}

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
                padding: '6px 14px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                {event.category || 'Uncategorized'}
              </span>
              <span style={{ 
                padding: '6px 14px',
                borderRadius: '20px',
                background: event.status === 'published' ? 'linear-gradient(135deg, #34d399 0%, #10b981 100%)' : '#f1f5f9',
                color: event.status === 'published' ? '#ffffff' : '#64748b',
                fontSize: '0.85rem',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                {event.status || 'Draft'}
              </span>
              <span style={{ 
                padding: '6px 14px',
                borderRadius: '20px',
                background: event.priceType === 'Free' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                {event.priceType || 'Free'}
              </span>
              <span style={{ 
                padding: '6px 14px',
                borderRadius: '20px',
                background: event.visibility === 'Public' ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                {event.visibility || 'Public'}
              </span>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(248, 250, 252, 0.5)', borderRadius: '12px' }}>
              <p style={{ 
                color: '#475569', 
                fontSize: '1rem', 
                fontWeight: '500', 
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
            {/* Start Date & Time */}
            <div style={{ 
              padding: '16px', 
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              borderRadius: '12px',
              border: '1px solid rgba(102, 126, 234, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <FaCalendarAlt style={{ color: '#667eea', fontSize: '1.2rem' }} />
                <span style={{ fontWeight: '700', color: '#667eea', fontSize: '0.9rem' }}>START DATE</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--app-text)', fontSize: '0.95rem', fontWeight: '600' }}>
                <FaClock style={{ color: '#667eea', fontSize: '0.9rem' }} />
                <span>{formatDate(event.startAt)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--app-text)', fontSize: '0.9rem', fontWeight: '500', marginTop: '4px' }}>
                <span style={{ color: '#667eea' }}>Time:</span>
                <span>{formatTime(event.startAt)}</span>
              </div>
            </div>

            {/* End Date & Time */}
            {event.endAt && (
              <div style={{ 
                padding: '16px', 
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%)',
                borderRadius: '12px',
                border: '1px solid rgba(245, 158, 11, 0.2)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <FaCalendarAlt style={{ color: '#f59e0b', fontSize: '1.2rem' }} />
                  <span style={{ fontWeight: '700', color: '#f59e0b', fontSize: '0.9rem' }}>END DATE</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--app-text)', fontSize: '0.95rem', fontWeight: '600' }}>
                  <FaClock style={{ color: '#f59e0b', fontSize: '0.9rem' }} />
                  <span>{formatDate(event.endAt)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--app-text)', fontSize: '0.9rem', fontWeight: '500', marginTop: '4px' }}>
                  <span style={{ color: '#f59e0b' }}>Time:</span>
                  <span>{formatTime(event.endAt)}</span>
                </div>
              </div>
            )}

            {/* Location/Link */}
            {event.locationOrLink && (
              <div style={{ 
                padding: '16px', 
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)',
                borderRadius: '12px',
                border: '1px solid rgba(239, 68, 68, 0.2)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  {event.onlineType === 'Online' ? (
                    <FaGlobe style={{ color: '#ef4444', fontSize: '1.2rem' }} />
                  ) : (
                    <FaMapMarkerAlt style={{ color: '#ef4444', fontSize: '1.2rem' }} />
                  )}
                  <span style={{ fontWeight: '700', color: '#ef4444', fontSize: '0.9rem' }}>
                    {event.onlineType === 'Online' ? 'ONLINE LINK' : 'LOCATION'}
                  </span>
                </div>
                <p style={{ 
                  color: 'var(--app-text)', 
                  fontSize: '0.95rem', 
                  fontWeight: '600',
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
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
              borderRadius: '12px',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <FaGlobe style={{ color: '#10b981', fontSize: '1.2rem' }} />
                <span style={{ fontWeight: '700', color: '#10b981', fontSize: '0.9rem' }}>EVENT TYPE</span>
              </div>
              <p style={{ 
                color: 'var(--app-text)', 
                fontSize: '0.95rem', 
                fontWeight: '600',
                margin: '0'
              }}>
                {event.onlineType || 'Offline'}
              </p>
            </div>

            {/* Visibility */}
            <div style={{ 
              padding: '16px', 
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)',
              borderRadius: '12px',
              border: '1px solid rgba(59, 130, 246, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <FaEye style={{ color: '#3b82f6', fontSize: '1.2rem' }} />
                <span style={{ fontWeight: '700', color: '#3b82f6', fontSize: '0.9rem' }}>VISIBILITY</span>
              </div>
              <p style={{ 
                color: 'var(--app-text)', 
                fontSize: '0.95rem', 
                fontWeight: '600',
                margin: '0'
              }}>
                {event.visibility || 'Public'}
              </p>
            </div>

            {/* Price */}
            <div style={{ 
              padding: '16px', 
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%)',
              borderRadius: '12px',
              border: '1px solid rgba(245, 158, 11, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <FaDollarSign style={{ color: '#f59e0b', fontSize: '1.2rem' }} />
                <span style={{ fontWeight: '700', color: '#f59e0b', fontSize: '0.9rem' }}>PRICE TYPE</span>
              </div>
              <p style={{ 
                color: 'var(--app-text)', 
                fontSize: '0.95rem', 
                fontWeight: '600',
                margin: '0'
              }}>
                {event.priceType || 'Free'}
              </p>
            </div>

            {/* Max Attendees */}
            {event.maxAttendees && (
              <div style={{ 
                padding: '16px', 
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)',
                borderRadius: '12px',
                border: '1px solid rgba(139, 92, 246, 0.2)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <FaUsers style={{ color: '#8b5cf6', fontSize: '1.2rem' }} />
                  <span style={{ fontWeight: '700', color: '#8b5cf6', fontSize: '0.9rem' }}>MAX ATTENDEES</span>
                </div>
                <p style={{ 
                  color: 'var(--app-text)', 
                  fontSize: '0.95rem', 
                  fontWeight: '600',
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
                background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(219, 39, 119, 0.1) 100%)',
                borderRadius: '12px',
                border: '1px solid rgba(236, 72, 153, 0.2)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <FaUserTie style={{ color: '#ec4899', fontSize: '1.2rem' }} />
                  <span style={{ fontWeight: '700', color: '#ec4899', fontSize: '0.9rem' }}>ORGANIZER</span>
                </div>
                <p style={{ 
                  color: 'var(--app-text)', 
                  fontSize: '0.95rem', 
                  fontWeight: '600',
                  margin: '0'
                }}>
                  {event.organizer}
                </p>
              </div>
            )}

            {/* Registration Required */}
            <div style={{ 
              padding: '16px', 
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
              borderRadius: '12px',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <FaTicketAlt style={{ color: '#10b981', fontSize: '1.2rem' }} />
                <span style={{ fontWeight: '700', color: '#10b981', fontSize: '0.9rem' }}>REGISTRATION</span>
              </div>
              <p style={{ 
                color: 'var(--app-text)', 
                fontSize: '0.95rem', 
                fontWeight: '600',
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
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)',
              borderRadius: '12px',
              border: '1px solid rgba(59, 130, 246, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <FaEnvelope style={{ color: '#3b82f6', fontSize: '1.2rem' }} />
                <span style={{ fontWeight: '700', color: '#3b82f6', fontSize: '0.9rem' }}>CONTACT INFORMATION</span>
              </div>
              <p style={{ 
                color: 'var(--app-text)', 
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
    </div>
  );
}

export default ViewEvent;
