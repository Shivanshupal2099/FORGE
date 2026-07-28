import { useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import axios from '../api/axios';

function ActiveEvent({ onClose }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load events from backend API
    const loadEvents = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/events');
        
        if (response.data.success) {
          // Only keep published events
          setEvents(Array.isArray(response.data.events) ? response.data.events.filter((e) => e?.status === 'published') : []);
        }
      } catch (error) {
        console.error('Error loading events:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

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
            <ul className="home-popup-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {events.map((ev, idx) => {
                const startText = ev.startAt
                  ? new Date(ev.startAt).toLocaleString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'TBD';

                return (
                  <li
                    key={ev._id || ev.title || idx}
                    className="home-popup-list__item"
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: 12,
                      padding: '16px',
                      borderBottom: '1px solid #eef2f7',
                      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%)',
                      borderRadius: '12px',
                      marginBottom: '8px',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      border: '1px solid rgba(102, 126, 234, 0.1)',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.15)';
                      e.target.style.borderColor = 'rgba(102, 126, 234, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                      e.target.style.borderColor = 'rgba(102, 126, 234, 0.1)';
                    }}
                  >
                    <div className="home-popup-list__main" style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <span className="home-popup-list__label" style={{ fontWeight: 900 }}>
                          {ev.title || 'Untitled Event'}
                        </span>
                        <span
                          className="tag"
                          style={{
                            padding: '6px 14px',
                            borderRadius: '20px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            fontWeight: '700',
                            color: '#ffffff',
                            fontSize: '0.75rem',
                            boxShadow: '0 2px 8px rgba(102, 126, 234, 0.25)',
                          }}
                        >
                          {ev.category || 'Uncategorized'}
                        </span>
                      </div>
                      <div style={{ color: '#475569', fontWeight: 700, marginTop: 6 }}>
                        {startText} • {ev.onlineType || 'Offline'} • {ev.priceType || 'Free'}
                      </div>
                      {ev.locationOrLink ? (
                        <div style={{ color: '#64748b', fontWeight: 700, marginTop: 6 }}>
                          {ev.locationOrLink}
                        </div>
                      ) : null}
                    </div>
                    <div className="home-popup-list__value" style={{ whiteSpace: 'nowrap', fontWeight: 700, padding: '6px 14px', borderRadius: '20px', background: ev.priceType === 'Paid' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#ffffff', fontSize: '0.8rem', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)' }}>
                      {ev.priceType === 'Paid' ? 'Paid' : 'Free'}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="home-popup-actions">
          <button type="button" className="button-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ActiveEvent;

