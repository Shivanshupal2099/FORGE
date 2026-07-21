import { useEffect, useMemo, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import EventFiltersection from './EventFiltersection';
import axios from '../api/axios';

function ActiveEvent({ onClose }) {
  const [filters, setFilters] = useState(null);
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

  const filteredEvents = useMemo(() => {
    const f =
      filters ||
      ({
        query: '',
        category: 'Any',
        tags: [],
        freeOnly: false,
        paidOnly: false,
        dateDays: 30,
      });

    const q = (f.query || '').trim().toLowerCase();
    const now = Date.now();
    const maxTs = now + (f.dateDays || 30) * 24 * 60 * 60 * 1000;

    return (events || []).filter((ev) => {
      const title = (ev?.title || '').toLowerCase();
      const desc = (ev?.description || '').toLowerCase();
      const categoryOk = f.category === 'Any' ? true : (ev?.category || '') === f.category;

      const qOk = !q ? true : title.includes(q) || desc.includes(q);

      // There is no tags field persisted by Event.jsx currently; keep query-only filtering for now.
      const freeOk = f.freeOnly ? ev?.priceType === 'Free' : true;
      const paidOk = f.paidOnly ? ev?.priceType === 'Paid' : true;

      const startAt = ev?.startAt ? new Date(ev.startAt).getTime() : null;
      const dateOk = startAt == null ? true : startAt >= now && startAt <= maxTs;

      return categoryOk && qOk && freeOk && paidOk && dateOk;
    });
  }, [events, filters]);

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
          ) : filteredEvents.length === 0 ? (
            <p style={{ margin: '10px 0', color: '#64748b', fontWeight: 700 }}>
              No published events found.
            </p>
          ) : (
            <ul className="home-popup-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {filteredEvents.map((ev, idx) => {
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
                      padding: '12px 0',
                      borderBottom: '1px solid #eef2f7',
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
                            padding: '6px 10px',
                            borderRadius: 999,
                            background: '#f1f5f9',
                            fontWeight: 900,
                            color: '#0f172a',
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
                    <div className="home-popup-list__value" style={{ whiteSpace: 'nowrap', fontWeight: 950 }}>
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

