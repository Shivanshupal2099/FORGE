import { useEffect, useState } from 'react';
import { FaTimes, FaShareAlt, FaCopy, FaCheck, FaUserPlus } from 'react-icons/fa';
import axios from '../api/axios';
import Toast from './Toast';

function ActiveEvent({ onClose }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shareModal, setShareModal] = useState({ show: false, eventId: null, eventTitle: '' });
  const [toast, setToast] = useState(null);
  const [registering, setRegistering] = useState({});

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

  const handleRegister = async (eventId) => {
    // Find the event to check registration status
    const event = events.find(ev => ev._id === eventId);
    
    // Prevent registration if already registered - multiple checks for safety
    if (event && (event.isRegistered === true || event.isRegistered === 'true')) {
      console.log('User already registered, blocking registration attempt');
      showToast('You are already registered for this event', 'info');
      return;
    }

    setRegistering(prev => ({ ...prev, [eventId]: true }));
    try {
      const response = await axios.post(`/api/events/${eventId}/register`);
      if (response.data.success) {
        showToast('Successfully registered for the event!', 'success');
        // Update local state immediately to show registered status
        setEvents(events.map(ev => 
          ev._id === eventId 
            ? { ...ev, isRegistered: true, attendeeCount: (ev.attendeeCount || 0) + 1, spotsRemaining: ev.spotsRemaining ? ev.spotsRemaining - 1 : null }
            : ev
        ));
      } else {
        // If backend returns success: false, show the message
        showToast(response.data.message || 'Failed to register', 'error');
      }
    } catch (error) {
      // Handle the error - if it says already registered, update local state
      const errorMessage = error.response?.data?.message || error.message;
      console.log('Registration error:', errorMessage);
      
      if (errorMessage === 'You are already registered for this event' || 
          errorMessage.includes('already registered') ||
          errorMessage.includes('duplicate')) {
        setEvents(events.map(ev => 
          ev._id === eventId 
            ? { ...ev, isRegistered: true }
            : ev
        ));
        showToast('You are already registered for this event', 'info');
      } else {
        showToast(errorMessage || 'Failed to register', 'error');
      }
    } finally {
      setRegistering(prev => ({ ...prev, [eventId]: false }));
    }
  };

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/events');
      
      if (response.data.success) {
        setEvents(Array.isArray(response.data.events) ? response.data.events : []);
      }
    } catch (error) {
      console.error('Error loading events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);


  return (
    <div className="home-popup-overlay" onClick={onClose} role="presentation">
      <div
        className="home-popup home-popup--event"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="active-event-popup-title"
      >
        <button
          type="button"
          className="home-popup__close"
          onClick={onClose}
          aria-label="Close active events popup"
        >
          <FaTimes aria-hidden="true" />
        </button>

        <div className="home-popup__header">
          <span className="home-popup__icon">
            <span aria-hidden="true">📅</span>
          </span>
          <div>
            <h2 id="active-event-popup-title" className="home-popup__title">
              Active Events
            </h2>
            <p className="home-popup__subtitle">
              Show created & published events
            </p>
          </div>
        </div>

        <div className="home-popup-section" style={{ padding: '14px 16px' }}>
          <h3 className="home-popup-section__title">Published Events</h3>

          {loading ? (
            <p style={{ margin: '10px 0', color: '#64748b', fontWeight: 700 }}>
              Loading events...
            </p>
          ) : events.length === 0 ? (
            <p style={{ margin: '10px 0', color: '#64748b', fontWeight: 700 }}>
              No published events found.
            </p>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
              gap: '16px',
              maxHeight: '500px',
              overflowY: 'auto',
              paddingRight: '8px'
            }}>
              {events.map((ev, idx) => {
                const startDate = ev.startAt ? new Date(ev.startAt) : null;
                const startText = startDate
                  ? startDate.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'TBD';
                const startTime = startDate
                  ? startDate.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '';

                return (
                  <div
                    key={ev._id || ev.title || idx}
                    style={{
                      background: 'rgba(255, 255, 255, 0.7)',
                      backdropFilter: 'blur(20px) saturate(180%)',
                      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                      borderRadius: '20px',
                      padding: '20px',
                      border: '1px solid rgba(255, 255, 255, 0.5)',
                      boxShadow: '0 8px 32px rgba(17, 17, 17, 0.08)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 16px 48px rgba(17, 17, 17, 0.12)';
                      e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 8px 32px rgba(17, 17, 17, 0.08)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                    }}
                  >
                    {/* Category Badge */}
                    <div style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '999px',
                      background: 'rgba(255, 215, 0, 0.15)',
                      color: '#111111',
                      fontSize: '0.7rem',
                      fontWeight: '500',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      marginBottom: '12px',
                    }}>
                      {ev.category || 'Event'}
                    </div>

                    {/* Title */}
                    <h4 style={{
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      color: '#111111',
                      marginBottom: '12px',
                      lineHeight: '1.4',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {ev.title || 'Untitled Event'}
                    </h4>

                    {/* Registration Stats - Only show for owners when registration is required */}
                    {ev.isOwner && ev.registrationRequired && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '8px',
                        padding: '6px 10px',
                        borderRadius: '999px',
                        background: 'rgba(255, 215, 0, 0.1)',
                      }}>
                        <FaUsers style={{ color: '#111111', fontSize: '0.9rem' }} />
                        <span style={{
                          fontSize: '0.85rem',
                          fontWeight: '500',
                          color: '#111111',
                        }}>
                          {ev.attendeeCount || 0}
                        </span>
                        {ev.maxAttendees && (
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: '400',
                            color: '#666666',
                          }}>
                            / {ev.maxAttendees}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Date & Time */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '8px',
                      color: '#666666',
                      fontSize: '0.85rem',
                      fontWeight: '400',
                    }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '999px',
                        background: 'rgba(255, 215, 0, 0.1)',
                        color: '#111111',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                      }}>
                        {startText}
                      </span>
                      {startTime && (
                        <span style={{ color: '#666666', fontWeight: '400' }}>
                          at {startTime}
                        </span>
                      )}
                    </div>

                    {/* Location */}
                    {ev.locationOrLink && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '12px',
                        color: '#666666',
                        fontSize: '0.8rem',
                        fontWeight: '400',
                      }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: 'rgba(255, 215, 0, 0.1)',
                          color: '#111111',
                          fontSize: '0.7rem',
                        }}>
                          {ev.onlineType === 'Online' ? '🌐' : '📍'}
                        </span>
                        <span style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {ev.locationOrLink}
                        </span>
                      </div>
                    )}

                    {/* Footer */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '16px',
                      paddingTop: '12px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.3)',
                    }}>
                      {/* Event Type */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '400',
                        color: '#64748b',
                      }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          background: ev.onlineType === 'Online' 
                            ? 'rgba(59, 130, 246, 0.1)' 
                            : 'rgba(16, 185, 129, 0.1)',
                          color: ev.onlineType === 'Online' ? '#3b82f6' : '#10b981',
                        }}>
                          {ev.onlineType || 'Offline'}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {/* Share Button */}
                        <button
                          onClick={() => handleShare(ev._id, ev.title)}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '999px',
                            border: 'none',
                            background: 'rgba(255, 215, 0, 0.15)',
                            color: '#111111',
                            fontSize: '0.8rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = 'rgba(255, 215, 0, 0.25)';
                            e.target.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = 'rgba(255, 215, 0, 0.15)';
                            e.target.style.transform = 'translateY(0)';
                          }}
                        >
                          <FaShareAlt style={{ fontSize: '0.9rem' }} />
                          Share
                        </button>

                        {/* Register Button */}
                        {ev.registrationRequired && (ev.isRegistered === false || ev.isRegistered === undefined) && ev.spotsRemaining !== 0 && (
                          <button
                            onClick={() => handleRegister(ev._id)}
                            disabled={registering[ev._id] || ev.spotsRemaining === 0 || ev.isRegistered === true}
                            style={{
                              padding: '8px 16px',
                              borderRadius: '999px',
                              border: 'none',
                              background: registering[ev._id] || ev.spotsRemaining === 0 || ev.isRegistered === true
                                ? '#E0E0D8'
                                : '#FF6B00',
                              color: '#111111',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              cursor: registering[ev._id] || ev.spotsRemaining === 0 || ev.isRegistered === true
                                ? 'not-allowed'
                                : 'pointer',
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              boxShadow: registering[ev._id] || ev.spotsRemaining === 0 || ev.isRegistered === true
                                ? 'none'
                                : '0 4px 12px rgba(255, 107, 0, 0.25)',
                            }}
                            onMouseEnter={(e) => {
                              if (!registering[ev._id] && ev.spotsRemaining !== 0 && ev.isRegistered !== true) {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.background = '#FF8533';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!registering[ev._id] && ev.spotsRemaining !== 0 && ev.isRegistered !== true) {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.background = '#FF6B00';
                              }
                            }}
                          >
                            <FaUserPlus style={{ fontSize: '0.9rem' }} />
                            {registering[ev._id] ? 'Registering...' : ev.spotsRemaining === 0 ? 'Full' : 'Register'}
                          </button>
                        )}

                        {/* Registered Badge */}
                        {ev.isRegistered && (
                          <div style={{
                            padding: '8px 16px',
                            borderRadius: '999px',
                            background: 'rgba(255, 215, 0, 0.2)',
                            color: '#111111',
                            fontSize: '0.8rem',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}>
                            <FaCheck style={{ fontSize: '0.9rem' }} />
                            Registered
                          </div>
                        )}

                        {/* Price Badge */}
                        <div style={{
                          padding: '6px 14px',
                          borderRadius: '999px',
                          background: ev.priceType === 'Paid' 
                            ? 'rgba(255, 107, 0, 0.15)' 
                            : 'rgba(255, 215, 0, 0.15)',
                          color: '#111111',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}>
                          {ev.priceType || 'Free'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="home-popup-actions">
          <button type="button" className="button-secondary" onClick={onClose}>
            Close
          </button>
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

export default ActiveEvent;

