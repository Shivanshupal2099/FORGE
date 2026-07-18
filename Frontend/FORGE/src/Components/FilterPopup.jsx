import { useEffect, useState } from 'react';
import { FaFilter, FaTimes } from 'react-icons/fa';

function FilterPopup({ initialFilters, onApply, onClose }) {
  const [category, setCategory] = useState(initialFilters.category);
  const [freeOnly, setFreeOnly] = useState(initialFilters.freeOnly);
  const [paidOnly, setPaidOnly] = useState(initialFilters.paidOnly);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleApply = () => {
    onApply({
      category,
      freeOnly,
      paidOnly,
    });
  };

  const handleReset = () => {
    setCategory('Any');
    setFreeOnly(false);
    setPaidOnly(false);
  };

  return (
    <div className="home-popup-overlay" onClick={onClose} role="presentation">
      <div
        className="home-popup home-popup--filter"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-popup-title"
      >
        <button
          type="button"
          className="home-popup__close"
          onClick={onClose}
          aria-label="Close filter popup"
        >
          <FaTimes aria-hidden="true" />
        </button>

        <div className="home-popup__header">
          <span className="home-popup__icon">
            <FaFilter aria-hidden="true" />
          </span>
          <div>
            <h2 id="filter-popup-title" className="home-popup__title">
              Filter Events
            </h2>
            <p className="home-popup__subtitle">
              Filter your events by category, price type, and more.
            </p>
          </div>
        </div>

        <div className="home-popup__content" style={{ padding: '24px' }}>
          <div className="form-group">
            <label htmlFor="filter-category">
              <FaFilter aria-hidden="true" /> Category
            </label>
            <select
              id="filter-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Any">Any Category</option>
              <option value="Conference">Conference</option>
              <option value="Workshop">Workshop</option>
              <option value="Meetup">Meetup</option>
              <option value="Webinar">Webinar</option>
              <option value="Social">Social</option>
              <option value="Sports">Sports</option>
              <option value="Music">Music</option>
              <option value="Art">Art</option>
              <option value="Technology">Technology</option>
              <option value="Business">Business</option>
              <option value="Education">Education</option>
              <option value="Health">Health</option>
              <option value="Charity">Charity</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="filter-free">Free Events Only</label>
            <input
              type="checkbox"
              id="filter-free"
              checked={freeOnly}
              onChange={(e) => {
                setFreeOnly(e.target.checked);
                if (e.target.checked) setPaidOnly(false);
              }}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="filter-paid">Paid Events Only</label>
            <input
              type="checkbox"
              id="filter-paid"
              checked={paidOnly}
              onChange={(e) => {
                setPaidOnly(e.target.checked);
                if (e.target.checked) setFreeOnly(false);
              }}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
          </div>

          <div className="home-popup-actions" style={{ marginTop: '24px' }}>
            <button
              type="button"
              className="button-secondary"
              onClick={handleReset}
            >
              Reset Filters
            </button>
            <button
              type="button"
              className="button-primary"
              onClick={handleApply}
            >
              <FaFilter aria-hidden="true" /> Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FilterPopup;
