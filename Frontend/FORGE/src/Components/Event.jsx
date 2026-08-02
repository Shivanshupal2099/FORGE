import { useEffect, useMemo, useState } from 'react';
import {
  FaCalendarAlt,
  FaTimes,
  FaMapMarkerAlt,
  FaTag,
  FaGlobe,
  FaUsers,
  FaTicketAlt,
  FaUserTie,
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '../contexts/AlertContext';
import axios from '../api/axios';

function Event({ onClose, eventToEdit, onEventUpdated }) {
  const { user } = useAuth();
  const { error: showError, success: showSuccess } = useAlert();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(!!eventToEdit);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [title, setTitle] = useState(eventToEdit?.title || '');
  const [description, setDescription] = useState(eventToEdit?.description || '');
  const [category, setCategory] = useState(eventToEdit?.category || '');

  const [onlineType, setOnlineType] = useState(eventToEdit?.onlineType || 'Offline');
  const [locationOrLink, setLocationOrLink] = useState(eventToEdit?.locationOrLink || '');

  const [startDate, setStartDate] = useState(eventToEdit?.startAt ? new Date(eventToEdit.startAt).toISOString().split('T')[0] : '');
  const [startTime, setStartTime] = useState(eventToEdit?.startAt ? new Date(eventToEdit.startAt).toTimeString().slice(0, 5) : '');

  const [endDate, setEndDate] = useState(eventToEdit?.endAt ? new Date(eventToEdit.endAt).toISOString().split('T')[0] : '');
  const [endTime, setEndTime] = useState(eventToEdit?.endAt ? new Date(eventToEdit.endAt).toTimeString().slice(0, 5) : '');

  const [organizer, setOrganizer] = useState(eventToEdit?.organizer || '');

  const [registrationRequired, setRegistrationRequired] = useState(eventToEdit?.registrationRequired || false);
  const [maxAttendees, setMaxAttendees] = useState(eventToEdit?.maxAttendees || '');

  const [visibility, setVisibility] = useState(eventToEdit?.visibility || 'Public');
  const [priceType, setPriceType] = useState(eventToEdit?.priceType || 'Free');

  const [contactInformation, setContactInformation] = useState(eventToEdit?.contactInformation || '');

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const computedStart = useMemo(() => {
    if (!startDate || !startTime) return null;
    return new Date(`${startDate}T${startTime}:00`).getTime();
  }, [startDate, startTime]);

  const computedEnd = useMemo(() => {
    if (!endDate || !endTime) return null;
    return new Date(`${endDate}T${endTime}:00`).getTime();
  }, [endDate, endTime]);

  const validate = () => {
    if (!title.trim()) return 'Event title is required.';
    if (!startDate || !startTime) return 'Start date and time are required.';

    if ((endDate && !endTime) || (!endDate && endTime)) {
      return 'Please provide both end date and end time (or leave both empty).';
    }

    if (computedEnd != null && computedStart != null && computedEnd < computedStart) {
      return 'End date/time must be after the start date/time.';
    }

    if (registrationRequired) {
      const n = Number(maxAttendees);
      if (!maxAttendees || Number.isNaN(n) || !Number.isFinite(n)) {
        return 'Maximum attendees is required and must be a number when registration is required.';
      }
      if (n <= 0) {
        return 'Maximum attendees must be greater than 0.';
      }
    }

    return null;
  };

  const buildPayload = () => {
    const payload = {
      title: title.trim(),
      description: description.trim(),
      category: category || null,
      onlineType,
      locationOrLink: locationOrLink.trim() || null,
      startAt: computedStart ? new Date(computedStart).toISOString() : null,
      endAt: computedEnd != null ? new Date(computedEnd).toISOString() : null,
      organizer: organizer.trim() || null,
      registrationRequired,
      maxAttendees: registrationRequired && maxAttendees ? Number(maxAttendees) : null,
      visibility,
      priceType,
      contactInformation: contactInformation.trim() || null,
      status: 'published',
    };

    return payload;
  };

  const persistEvent = async (payload) => {
    try {
      setIsLoading(true);
      
      const url = isEditMode 
        ? `/api/events/${eventToEdit._id}`
        : '/api/events';
      
      const method = isEditMode ? 'put' : 'post';
      
      const response = await axios[method](url, payload);
      
      if (!response.data.success) {
        throw new Error(response.data.message || `Failed to ${isEditMode ? 'update' : 'create'} event`);
      }

      return response.data;
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} event:`, error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const err = validate();
    if (err) {
      showError(err);
      return;
    }

    const payload = buildPayload();

    try {
      await persistEvent(payload);

      showSuccess(`Event "${payload.title}" ${isEditMode ? 'updated and' : ''} published successfully!`);

      if (isEditMode && onEventUpdated) {
        onEventUpdated();
      }

      if (!isEditMode) {
        setTitle('');
        setDescription('');
        setCategory('');
        setOnlineType('Offline');
        setLocationOrLink('');
        setStartDate('');
        setStartTime('');
        setEndDate('');
        setEndTime('');
        setOrganizer('');
        setRegistrationRequired(false);
        setMaxAttendees('');
        setVisibility('Public');
        setPriceType('Free');
        setContactInformation('');
      }

      onClose?.();
    } catch (error) {
      alert(`Failed to publish event: ${error.message}`);
    }
  };

  return (
    <>
      <style>{`
        :root {
          --forge-orange: #FF6B00;
          --forge-orange-light: #FF8533;
          --forge-orange-shadow: rgba(255, 107, 0, 0.3);
        }
        
        .event-modal::-webkit-scrollbar {
          display: none;
        }
        
        @keyframes slideUpMobile {
          from {
            opacity: 0;
            transform: translateY(100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes fadeInOverlay {
          from {
            opacity: 0;
            backdrop-filter: blur(0px);
          }
          to {
            opacity: 1;
            backdrop-filter: blur(20px);
          }
        }
      `}</style>
      <div 
        onClick={onClose} 
        role="presentation"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: isMobile 
            ? 'linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.7) 100%)'
            : 'linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.5) 100%)',
          backdropFilter: isMobile ? 'blur(10px)' : 'blur(20px)',
          WebkitBackdropFilter: isMobile ? 'blur(10px)' : 'blur(20px)',
          display: 'flex',
          alignItems: isMobile ? 'flex-end' : 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: isMobile ? '0' : '24px',
          animation: 'fadeInOverlay 0.3s ease',
        }}
      >
        <div
          className="event-modal"
          onClick={(event) => event.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="event-popup-title"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 50%, rgba(248, 250, 252, 0.92) 100%)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderRadius: isMobile ? '28px 28px 0 0' : '32px',
            maxWidth: isMobile ? '100%' : '1100px',
            width: '100%',
            maxHeight: isMobile ? '92vh' : '90vh',
            overflow: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            boxShadow: isMobile 
              ? '0 -16px 48px rgba(0, 0, 0, 0.2)' 
              : '0 32px 90px rgba(0, 0, 0, 0.2)',
            position: 'relative',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            animation: isMobile ? 'slideUpMobile 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'fadeInScale 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close event popup"
            style={{
              position: 'absolute',
              top: isMobile ? '16px' : '20px',
              right: isMobile ? '16px' : '20px',
              width: isMobile ? '44px' : '48px',
              height: isMobile ? '44px' : '48px',
              borderRadius: '999px',
              border: '2px solid rgba(0, 0, 0, 0.08)',
              background: 'rgba(255, 255, 255, 0.9)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              zIndex: 10,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'linear-gradient(135deg, var(--forge-orange) 0%, var(--forge-orange-light) 100%)';
              e.target.style.transform = 'scale(1.1) rotate(90deg)';
              e.target.style.borderColor = 'var(--forge-orange)';
              e.target.style.boxShadow = '0 8px 24px var(--forge-orange-shadow)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.9)';
              e.target.style.transform = 'scale(1) rotate(0deg)';
              e.target.style.borderColor = 'rgba(0, 0, 0, 0.08)';
              e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
            }}
          >
            <FaTimes style={{ fontSize: isMobile ? '18px' : '20px', color: '#111111' }} />
          </button>

          <div style={{ padding: isMobile ? '28px 24px' : '48px 40px' }}>
            <div style={{ marginBottom: isMobile ? '28px' : '36px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div style={{
                  width: isMobile ? '64px' : '72px',
                  height: isMobile ? '64px' : '72px',
                  borderRadius: '999px',
                  background: 'linear-gradient(135deg, var(--forge-orange) 0%, var(--forge-orange-light) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 12px 32px var(--forge-orange-shadow)',
                }}>
                  <FaCalendarAlt style={{ fontSize: isMobile ? '28px' : '32px', color: '#FFFFFF' }} />
                </div>
                <div>
                  <h2 id="event-popup-title" style={{
                    margin: 0,
                    fontSize: isMobile ? '26px' : '32px',
                    fontWeight: '800',
                    background: 'linear-gradient(135deg, #1f172a 0%, #475569 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    letterSpacing: '-0.5px',
                  }}>
                    {isEditMode ? 'Edit Event' : 'Create Event'}
                  </h2>
                  <p style={{
                    margin: '6px 0 0',
                    fontSize: isMobile ? '14px' : '15px',
                    color: '#64748b',
                    fontWeight: '500',
                    lineHeight: '1.5',
                  }}>
                    {isEditMode ? 'Update your event details and settings.' : 'Organize community events and reward participants with Forge tokens.'}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 380px', gap: isMobile ? '24px' : '40px' }}>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: isMobile ? '16px' : '20px',
                padding: isMobile ? '0 24px' : '0 28px',
                borderRadius: '24px',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.4) 100%)',
                border: '2px solid rgba(255, 255, 255, 0.5)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '10px' : '12px' }}>
                  <label htmlFor="event-title" style={{
                    fontSize: isMobile ? '13px' : '14px',
                    fontWeight: '500',
                    color: '#666666',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <FaCalendarAlt style={{ color: '#111111', fontSize: '14px' }} />
                    Event Title *
                  </label>
                  <input
                    type="text"
                    id="event-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter event title"
                    required
                    style={{
                      padding: isMobile ? '14px 18px' : '16px 20px',
                      borderRadius: '20px',
                      border: '2px solid rgba(0, 0, 0, 0.08)',
                      fontSize: isMobile ? '15px' : '16px',
                      outline: 'none',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                      color: '#1f172a',
                      fontWeight: '500',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--forge-orange)';
                      e.target.style.background = 'rgba(255, 255, 255, 0.95)';
                      e.target.style.boxShadow = '0 4px 16px var(--forge-orange-shadow)';
                      e.target.style.transform = 'translateY(-1px)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(0, 0, 0, 0.08)';
                      e.target.style.background = 'rgba(255, 255, 255, 0.8)';
                      e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  />
                </div>

                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: isMobile ? '8px' : '10px',
                  padding: isMobile ? '20px' : '24px',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.2) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                }}>
                  <label htmlFor="event-description" style={{
                    fontSize: isMobile ? '13px' : '14px',
                    fontWeight: '500',
                    color: '#666666',
                  }}>
                    Description
                  </label>
                  <textarea
                    id="event-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your event, what to expect, and who should attend..."
                    rows="4"
                    style={{
                      padding: isMobile ? '14px 18px' : '16px 20px',
                      borderRadius: '20px',
                      border: '2px solid rgba(0, 0, 0, 0.08)',
                      fontSize: isMobile ? '15px' : '16px',
                      outline: 'none',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      color: '#1f172a',
                      fontWeight: '500',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--forge-orange)';
                      e.target.style.background = 'rgba(255, 255, 255, 0.95)';
                      e.target.style.boxShadow = '0 4px 16px var(--forge-orange-shadow)';
                      e.target.style.transform = 'translateY(-1px)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(0, 0, 0, 0.08)';
                      e.target.style.background = 'rgba(255, 255, 255, 0.8)';
                      e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  />
                </div>

                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: isMobile ? '8px' : '10px',
                  padding: isMobile ? '20px' : '24px',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.2) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                }}>
                  <label htmlFor="event-category" style={{
                    fontSize: isMobile ? '13px' : '14px',
                    fontWeight: '500',
                    color: '#666666',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <FaTag style={{ color: '#111111', fontSize: '14px' }} />
                    Category
                  </label>
                  <select
                    id="event-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{
                      padding: isMobile ? '14px 18px' : '16px 20px',
                      borderRadius: '20px',
                      border: '2px solid rgba(0, 0, 0, 0.08)',
                      fontSize: isMobile ? '15px' : '16px',
                      outline: 'none',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      cursor: 'pointer',
                      color: '#1f172a',
                      fontWeight: '500',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--forge-orange)';
                      e.target.style.background = 'rgba(255, 255, 255, 0.95)';
                      e.target.style.boxShadow = '0 4px 16px var(--forge-orange-shadow)';
                      e.target.style.transform = 'translateY(-1px)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(0, 0, 0, 0.08)';
                      e.target.style.background = 'rgba(255, 255, 255, 0.8)';
                      e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    <option value="">Select category</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Meetup">Meetup</option>
                    <option value="Conference">Conference</option>
                    <option value="Social">Social</option>
                    <option value="Sports">Sports</option>
                    <option value="Charity">Charity</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
                  gap: isMobile ? '12px' : '16px',
                  padding: isMobile ? '20px' : '24px',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.3) 100%)',
                  border: '2px solid rgba(255, 255, 255, 0.6)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '10px' : '12px' }}>
                    <label htmlFor="event-start-date" style={{
                      fontSize: isMobile ? '13px' : '14px',
                      fontWeight: '500',
                      color: '#666666',
                    }}>
                      Start date *
                    </label>
                    <input
                      type="date"
                      id="event-start-date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                      style={{
                        padding: isMobile ? '14px 18px' : '16px 20px',
                        borderRadius: '20px',
                        border: '2px solid rgba(0, 0, 0, 0.08)',
                        fontSize: isMobile ? '15px' : '16px',
                        outline: 'none',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        cursor: 'pointer',
                        color: '#1f172a',
                        fontWeight: '500',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--forge-orange)';
                        e.target.style.background = 'rgba(255, 255, 255, 0.95)';
                        e.target.style.boxShadow = '0 4px 16px var(--forge-orange-shadow)';
                        e.target.style.transform = 'translateY(-1px)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(0, 0, 0, 0.08)';
                        e.target.style.background = 'rgba(255, 255, 255, 0.8)';
                        e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '10px' : '12px' }}>
                    <label htmlFor="event-start-time" style={{
                      fontSize: isMobile ? '13px' : '14px',
                      fontWeight: '500',
                      color: '#666666',
                    }}>
                      Start time *
                    </label>
                    <input
                      type="time"
                      id="event-start-time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                      style={{
                        padding: isMobile ? '14px 18px' : '16px 20px',
                        borderRadius: '20px',
                        border: '2px solid rgba(0, 0, 0, 0.08)',
                        fontSize: isMobile ? '15px' : '16px',
                        outline: 'none',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        cursor: 'pointer',
                        color: '#1f172a',
                        fontWeight: '500',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--forge-orange)';
                        e.target.style.background = 'rgba(255, 255, 255, 0.95)';
                        e.target.style.boxShadow = '0 4px 16px var(--forge-orange-shadow)';
                        e.target.style.transform = 'translateY(-1px)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(0, 0, 0, 0.08)';
                        e.target.style.background = 'rgba(255, 255, 255, 0.8)';
                        e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    />
                  </div>
                </div>

                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
                  gap: isMobile ? '12px' : '16px',
                  padding: isMobile ? '20px' : '24px',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.3) 100%)',
                  border: '2px solid rgba(255, 255, 255, 0.6)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '10px' : '12px' }}>
                    <label htmlFor="event-end-date" style={{
                      fontSize: isMobile ? '13px' : '14px',
                      fontWeight: '500',
                      color: '#666666',
                    }}>
                      End date
                    </label>
                    <input
                      type="date"
                      id="event-end-date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      style={{
                        padding: isMobile ? '14px 18px' : '16px 20px',
                        borderRadius: '20px',
                        border: '2px solid rgba(0, 0, 0, 0.08)',
                        fontSize: isMobile ? '15px' : '16px',
                        outline: 'none',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        cursor: 'pointer',
                        color: '#1f172a',
                        fontWeight: '500',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--forge-orange)';
                        e.target.style.background = 'rgba(255, 255, 255, 0.95)';
                        e.target.style.boxShadow = '0 4px 16px var(--forge-orange-shadow)';
                        e.target.style.transform = 'translateY(-1px)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(0, 0, 0, 0.08)';
                        e.target.style.background = 'rgba(255, 255, 255, 0.8)';
                        e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '10px' : '12px' }}>
                    <label htmlFor="event-end-time" style={{
                      fontSize: isMobile ? '13px' : '14px',
                      fontWeight: '500',
                      color: '#666666',
                    }}>
                      End time
                    </label>
                    <input
                      type="time"
                      id="event-end-time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      style={{
                        padding: isMobile ? '14px 18px' : '16px 20px',
                        borderRadius: '20px',
                        border: '2px solid rgba(0, 0, 0, 0.08)',
                        fontSize: isMobile ? '15px' : '16px',
                        outline: 'none',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        cursor: 'pointer',
                        color: '#1f172a',
                        fontWeight: '500',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--forge-orange)';
                        e.target.style.background = 'rgba(255, 255, 255, 0.95)';
                        e.target.style.boxShadow = '0 4px 16px var(--forge-orange-shadow)';
                        e.target.style.transform = 'translateY(-1px)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(0, 0, 0, 0.08)';
                        e.target.style.background = 'rgba(255, 255, 255, 0.8)';
                        e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    />
                  </div>
                </div>

                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: isMobile ? '8px' : '10px',
                  padding: isMobile ? '20px' : '24px',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.2) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                }}>
                  <label htmlFor="event-online-type" style={{
                    fontSize: isMobile ? '13px' : '14px',
                    fontWeight: '500',
                    color: '#666666',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <FaGlobe style={{ color: '#111111', fontSize: '14px' }} />
                    Event Format
                  </label>
                  <select
                    id="event-online-type"
                    value={onlineType}
                    onChange={(e) => setOnlineType(e.target.value)}
                    style={{
                      padding: isMobile ? '14px 18px' : '16px 20px',
                      borderRadius: '20px',
                      border: '2px solid rgba(0, 0, 0, 0.08)',
                      fontSize: isMobile ? '15px' : '16px',
                      outline: 'none',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      cursor: 'pointer',
                      color: '#1f172a',
                      fontWeight: '500',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--forge-orange)';
                      e.target.style.background = 'rgba(255, 255, 255, 0.95)';
                      e.target.style.boxShadow = '0 4px 16px var(--forge-orange-shadow)';
                      e.target.style.transform = 'translateY(-1px)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(0, 0, 0, 0.08)';
                      e.target.style.background = 'rgba(255, 255, 255, 0.8)';
                      e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: isMobile ? '8px' : '10px',
                  padding: isMobile ? '20px' : '24px',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.2) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                }}>
                  <label htmlFor="event-location-or-link" style={{
                    fontSize: isMobile ? '13px' : '14px',
                    fontWeight: '500',
                    color: '#666666',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <FaMapMarkerAlt style={{ color: '#111111', fontSize: '14px' }} />
                    Location (or meeting link)
                  </label>
                  <input
                    type="text"
                    id="event-location-or-link"
                    value={locationOrLink}
                    onChange={(e) => setLocationOrLink(e.target.value)}
                    placeholder={
                      onlineType === 'Online'
                        ? 'Paste meeting link'
                        : 'Enter event location or venue'
                    }
                    style={{
                      padding: isMobile ? '14px 18px' : '16px 20px',
                      borderRadius: '20px',
                      border: '2px solid rgba(0, 0, 0, 0.08)',
                      fontSize: isMobile ? '15px' : '16px',
                      outline: 'none',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      color: '#1f172a',
                      fontWeight: '500',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--forge-orange)';
                      e.target.style.background = 'rgba(255, 255, 255, 0.95)';
                      e.target.style.boxShadow = '0 4px 16px var(--forge-orange-shadow)';
                      e.target.style.transform = 'translateY(-1px)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(0, 0, 0, 0.08)';
                      e.target.style.background = 'rgba(255, 255, 255, 0.8)';
                      e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  />
                </div>

                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: isMobile ? '8px' : '10px',
                  padding: isMobile ? '20px' : '24px',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.2) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                }}>
                  <label htmlFor="event-organizer" style={{
                    fontSize: isMobile ? '13px' : '14px',
                    fontWeight: '500',
                    color: '#666666',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <FaUserTie style={{ color: '#111111', fontSize: '14px' }} />
                    Organizer
                  </label>
                  <input
                    type="text"
                    id="event-organizer"
                    value={organizer}
                    onChange={(e) => setOrganizer(e.target.value)}
                    placeholder="Organizer name"
                    style={{
                      padding: isMobile ? '14px 18px' : '16px 20px',
                      borderRadius: '20px',
                      border: '2px solid rgba(0, 0, 0, 0.08)',
                      fontSize: isMobile ? '15px' : '16px',
                      outline: 'none',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      color: '#1f172a',
                      fontWeight: '500',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--forge-orange)';
                      e.target.style.background = 'rgba(255, 255, 255, 0.95)';
                      e.target.style.boxShadow = '0 4px 16px var(--forge-orange-shadow)';
                      e.target.style.transform = 'translateY(-1px)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(0, 0, 0, 0.08)';
                      e.target.style.background = 'rgba(255, 255, 255, 0.8)';
                      e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  />
                </div>

                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: isMobile ? '8px' : '10px',
                  padding: isMobile ? '20px' : '24px',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.2) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                }}>
                  <label htmlFor="event-registration-required" style={{
                    fontSize: isMobile ? '13px' : '14px',
                    fontWeight: '500',
                    color: '#666666',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <FaUsers style={{ color: '#111111', fontSize: '14px' }} />
                    Registration required
                  </label>
                  <select
                    id="event-registration-required"
                    value={registrationRequired ? 'Yes' : 'No'}
                    onChange={(e) => setRegistrationRequired(e.target.value === 'Yes')}
                    style={{
                      padding: isMobile ? '14px 18px' : '16px 20px',
                      borderRadius: '20px',
                      border: '2px solid rgba(0, 0, 0, 0.08)',
                      fontSize: isMobile ? '15px' : '16px',
                      outline: 'none',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      cursor: 'pointer',
                      color: '#1f172a',
                      fontWeight: '500',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--forge-orange)';
                      e.target.style.background = 'rgba(255, 255, 255, 0.95)';
                      e.target.style.boxShadow = '0 4px 16px var(--forge-orange-shadow)';
                      e.target.style.transform = 'translateY(-1px)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(0, 0, 0, 0.08)';
                      e.target.style.background = 'rgba(255, 255, 255, 0.8)';
                      e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>

                {registrationRequired ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '10px' : '12px' }}>
                    <label htmlFor="event-max-attendees" style={{
                      fontSize: isMobile ? '13px' : '14px',
                      fontWeight: '500',
                      color: '#666666',
                    }}>
                      Maximum attendees *
                    </label>
                    <input
                      type="number"
                      id="event-max-attendees"
                      value={maxAttendees}
                      onChange={(e) => setMaxAttendees(e.target.value)}
                      placeholder="e.g. 50"
                      min={1}
                      style={{
                        padding: isMobile ? '14px 18px' : '16px 20px',
                        borderRadius: '20px',
                        border: '2px solid rgba(0, 0, 0, 0.08)',
                        fontSize: isMobile ? '15px' : '16px',
                        outline: 'none',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        color: '#1f172a',
                        fontWeight: '500',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--forge-orange)';
                        e.target.style.background = 'rgba(255, 255, 255, 0.95)';
                        e.target.style.boxShadow = '0 4px 16px var(--forge-orange-shadow)';
                        e.target.style.transform = 'translateY(-1px)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(0, 0, 0, 0.08)';
                        e.target.style.background = 'rgba(255, 255, 255, 0.8)';
                        e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    />
                  </div>
                ) : null}

                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
                  gap: isMobile ? '12px' : '16px',
                  padding: isMobile ? '20px' : '24px',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.3) 100%)',
                  border: '2px solid rgba(255, 255, 255, 0.6)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '10px' : '12px' }}>
                    <label htmlFor="event-visibility" style={{
                      fontSize: isMobile ? '13px' : '14px',
                      fontWeight: '500',
                      color: '#666666',
                    }}>
                      Visibility
                    </label>
                    <select
                      id="event-visibility"
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value)}
                      style={{
                        padding: isMobile ? '14px 18px' : '16px 20px',
                        borderRadius: '20px',
                        border: '2px solid rgba(0, 0, 0, 0.08)',
                        fontSize: isMobile ? '15px' : '16px',
                        outline: 'none',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        cursor: 'pointer',
                        color: '#1f172a',
                        fontWeight: '500',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--forge-orange)';
                        e.target.style.background = 'rgba(255, 255, 255, 0.95)';
                        e.target.style.boxShadow = '0 4px 16px var(--forge-orange-shadow)';
                        e.target.style.transform = 'translateY(-1px)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(0, 0, 0, 0.08)';
                        e.target.style.background = 'rgba(255, 255, 255, 0.8)';
                        e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      <option value="Public">Public</option>
                      <option value="Private">Private</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '10px' : '12px' }}>
                    <label htmlFor="event-price" style={{
                      fontSize: isMobile ? '13px' : '14px',
                      fontWeight: '500',
                      color: '#666666',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}>
                      <FaTicketAlt style={{ color: '#111111', fontSize: '14px' }} />
                      Price Type
                    </label>
                    <select
                      id="event-price"
                      value={priceType}
                      onChange={(e) => setPriceType(e.target.value)}
                      style={{
                        padding: isMobile ? '14px 18px' : '16px 20px',
                        borderRadius: '20px',
                        border: '2px solid rgba(0, 0, 0, 0.08)',
                        fontSize: isMobile ? '15px' : '16px',
                        outline: 'none',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        cursor: 'pointer',
                        color: '#1f172a',
                        fontWeight: '500',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--forge-orange)';
                        e.target.style.background = 'rgba(255, 255, 255, 0.95)';
                        e.target.style.boxShadow = '0 4px 16px var(--forge-orange-shadow)';
                        e.target.style.transform = 'translateY(-1px)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(0, 0, 0, 0.08)';
                        e.target.style.background = 'rgba(255, 255, 255, 0.8)';
                        e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      <option value="Free">Free</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </div>
                </div>

                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: isMobile ? '8px' : '10px',
                  padding: isMobile ? '20px' : '24px',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.2) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                }}>
                  <label htmlFor="event-contact-info" style={{
                    fontSize: isMobile ? '13px' : '14px',
                    fontWeight: '500',
                    color: '#666666',
                  }}>
                    Contact information
                  </label>
                  <input
                    type="text"
                    id="event-contact-info"
                    value={contactInformation}
                    onChange={(e) => setContactInformation(e.target.value)}
                    placeholder="Public contact (email/phone)"
                    style={{
                      padding: isMobile ? '14px 18px' : '16px 20px',
                      borderRadius: '20px',
                      border: '2px solid rgba(0, 0, 0, 0.08)',
                      fontSize: isMobile ? '15px' : '16px',
                      outline: 'none',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      background: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      color: '#1f172a',
                      fontWeight: '500',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--forge-orange)';
                      e.target.style.background = 'rgba(255, 255, 255, 0.95)';
                      e.target.style.boxShadow = '0 4px 16px var(--forge-orange-shadow)';
                      e.target.style.transform = 'translateY(-1px)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(0, 0, 0, 0.08)';
                      e.target.style.background = 'rgba(255, 255, 255, 0.8)';
                      e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  />
                </div>
              </div>

              <div style={{ 
                display: isMobile ? 'none' : 'flex', 
                flexDirection: 'column', 
                gap: isMobile ? '16px' : '20px',
                padding: isMobile ? '0 24px' : '0 28px',
                borderRadius: '24px',
                background: 'linear-gradient(135deg, rgba(255, 107, 0.0.06) 0%, rgba(255, 107, 0, 0.03) 100%)',
                border: '2px solid rgba(255, 107, 0, 0.12)',
                boxShadow: '0 4px 16px rgba(255, 107, 0, 0.08)',
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
                  borderRadius: '24px',
                  padding: '28px',
                  color: '#1f172a',
                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)',
                  border: '2px solid rgba(255, 107, 0, 0.15)',
                }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '24px',
                    background: 'linear-gradient(135deg, var(--forge-orange) 0%, var(--forge-orange-light) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px',
                    boxShadow: '0 6px 16px var(--forge-orange-shadow)',
                  }}>
                    <FaCalendarAlt style={{ fontSize: '28px', color: '#FFFFFF' }} />
                  </div>
                  <p style={{
                    margin: '0 0 16px',
                    fontSize: '20px',
                    fontWeight: '700',
                    lineHeight: '1.3',
                  }}>
                    {title || 'Event Title'}
                  </p>
                  {startDate ? (
                    <p style={{
                      margin: '0 0 8px',
                      fontSize: '13px',
                      fontWeight: '400',
                      opacity: 0.9,
                    }}>
                      {new Date(startDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      {startTime ? `• ${startTime}` : null}
                    </p>
                  ) : null}
                  {endDate && endTime ? (
                    <p style={{
                      margin: '0 0 8px',
                      fontSize: '13px',
                      fontWeight: '400',
                      opacity: 0.9,
                    }}>
                      Ends{' '}
                      {new Date(endDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      • {endTime}
                    </p>
                  ) : null}
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '12px',
                    marginTop: '20px',
                    padding: '20px',
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.4) 100%)',
                    border: '2px solid rgba(255, 107, 0, 0.2)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
                  }}>
                    <span style={{
                      padding: '10px 18px',
                      borderRadius: '18px',
                      background: 'linear-gradient(135deg, rgba(255, 107, 0, 0.2) 0%, rgba(255, 107, 0, 0.12) 100%)',
                      color: '#1f172a',
                      fontSize: '13px',
                      fontWeight: '700',
                      border: '2px solid rgba(255, 107, 0, 0.3)',
                      boxShadow: '0 2px 8px rgba(255, 107, 0, 0.15)',
                    }}>
                      {onlineType}
                    </span>
                    <span style={{
                      padding: '10px 18px',
                      borderRadius: '18px',
                      background: 'linear-gradient(135deg, rgba(255, 107, 0, 0.2) 0%, rgba(255, 107, 0, 0.12) 100%)',
                      color: '#1f172a',
                      fontSize: '13px',
                      fontWeight: '700',
                      border: '2px solid rgba(255, 107, 0, 0.3)',
                      boxShadow: '0 2px 8px rgba(255, 107, 0, 0.15)',
                    }}>
                      {visibility}
                    </span>
                    <span style={{
                      padding: '10px 18px',
                      borderRadius: '18px',
                      background: 'linear-gradient(135deg, rgba(255, 107, 0, 0.2) 0%, rgba(255, 107, 0, 0.12) 100%)',
                      color: '#1f172a',
                      fontSize: '13px',
                      fontWeight: '700',
                      border: '2px solid rgba(255, 107, 0, 0.3)',
                      boxShadow: '0 2px 8px rgba(255, 107, 0, 0.15)',
                    }}>
                      {priceType}
                    </span>
                  </div>
                  {locationOrLink ? (
                    <p style={{
                      margin: '12px 0 0',
                      fontSize: '12px',
                      fontWeight: '400',
                      opacity: 0.85,
                      wordBreak: 'break-word',
                    }}>
                      {locationOrLink}
                    </p>
                  ) : null}
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: isMobile ? '12px' : '16px',
                marginTop: isMobile ? '28px' : '36px',
                paddingTop: isMobile ? '24px' : '28px',
                borderTop: '2px solid rgba(255, 255, 255, 0.4)',
                flexDirection: isMobile ? 'column' : 'row',
                padding: isMobile ? '0 28px' : '0 32px',
                borderRadius: '24px',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.4) 100%)',
                border: '2px solid rgba(255, 255, 255, 0.5)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
              }}>
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                style={{
                  padding: isMobile ? '16px 24px' : '16px 32px',
                  borderRadius: '20px',
                  border: '2px solid rgba(0, 0, 0, 0.1)',
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  color: '#374151',
                  fontSize: isMobile ? '15px' : '16px',
                  fontWeight: '700',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  width: isMobile ? '100%' : 'auto',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.target.style.background = 'rgba(255, 255, 255, 0.95)';
                    e.target.style.borderColor = 'rgba(0, 0, 0, 0.15)';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.12)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.8)';
                  e.target.style.borderColor = 'rgba(0, 0, 0, 0.1)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: isMobile ? '16px 24px' : '16px 32px',
                  borderRadius: '20px',
                  border: '2px solid transparent',
                  background: 'linear-gradient(135deg, var(--forge-orange) 0%, var(--forge-orange-light) 100%)',
                  color: '#FFFFFF',
                  fontSize: isMobile ? '15px' : '16px',
                  fontWeight: '800',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 8px 24px var(--forge-orange-shadow)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.target.style.transform = 'translateY(-3px)';
                    e.target.style.background = 'linear-gradient(135deg, var(--forge-orange-light) 0%, var(--forge-orange) 100%)';
                    e.target.style.boxShadow = '0 12px 36px var(--forge-orange-shadow)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.background = 'linear-gradient(135deg, var(--forge-orange) 0%, var(--forge-orange-light) 100%)';
                  e.target.style.boxShadow = '0 8px 24px var(--forge-orange-shadow)';
                }}
              >
                <FaCalendarAlt style={{ fontSize: '18px' }} />
                {isLoading ? 'Publishing...' : 'Publish Event'}
              </button>
            </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default Event;
