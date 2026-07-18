import { useEffect, useMemo, useState } from "react";
import { FaTimes, FaCheck, FaCalendarAlt, FaTag, FaDollarSign } from "react-icons/fa";

const categories = ["Any", "Workshop", "Meetup", "Conference", "Community", "Sports", "Music", "Tech", "Other"];
const tagOptions = [
  "Networking",
  "Volunteering",
  "Beginner-friendly",
  "Beginner",
  "Advanced",
  "Online",
  "In-person",
  "Free",
  "Paid",
  "Career",
  "Social",
];

function EventFiltersection({ initialFilters, onApply }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);
  const [filters, setFilters] = useState(
    initialFilters || {
      category: "Any",
      freeOnly: false,
      paidOnly: false,
    }
  );

  useEffect(() => {
    setFilters(
      initialFilters || {
        category: "Any",
        freeOnly: false,
        paidOnly: false,
      }
    );
  }, [initialFilters]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activeCount = useMemo(() => {
    let c = 0;
    if (filters.category !== "Any") c++;
    if (filters.freeOnly) c++;
    if (filters.paidOnly) c++;
    return c;
  }, [filters]);

  const handleApply = () => {
    // enforce mutual exclusivity
    const normalized = {
      ...filters,
      freeOnly: filters.freeOnly && !filters.paidOnly,
      paidOnly: filters.paidOnly && !filters.freeOnly,
    };
    onApply?.(normalized);
  };

  return (
    <div style={{ ...styles.card, ...(isMobile ? styles.cardMobile : {}) }}>
      <div style={{ ...styles.header, ...(isMobile ? styles.headerMobile : {}) }}>
        <div>
          <h3 style={{ ...styles.title, ...(isMobile ? styles.titleMobile : {}) }}>Find Events</h3>
          {!isMobile && <p style={styles.subtitle}>Filter upcoming happenings around you</p>}
        </div>
        <div style={{ ...styles.headerActions, ...(isMobile ? styles.headerActionsMobile : {}) }}>
          <span style={{ ...styles.badge, ...(isMobile ? styles.badgeMobile : {}) }}>{activeCount} Active</span>
        </div>
      </div>


      <div style={{ ...styles.grid, ...(isMobile ? styles.gridMobile : {}) }}>
        <label style={{ ...styles.field, ...(isMobile ? styles.fieldMobile : {}) }}>
          <span style={{ ...styles.label, ...(isMobile ? styles.labelMobile : {}) }}>
            <FaTag style={styles.labelIcon} /> Category
          </span>
          <select
            style={{ ...styles.input, ...(isMobile ? styles.inputMobile : {}) }}
            value={filters.category}
            onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

      </div>

      <div style={{ ...styles.section, ...(isMobile ? styles.sectionMobile : {}) }}>
        <div style={{ ...styles.sectionTitleRow, ...(isMobile ? styles.sectionTitleRowMobile : {}) }}>
          <span style={{ ...styles.sectionTitle, ...(isMobile ? styles.sectionTitleMobile : {}) }}>
            <FaDollarSign style={styles.sectionIcon} /> Price
          </span>
        </div>

        <div style={{ ...styles.toggleRow, ...(isMobile ? styles.toggleRowMobile : {}) }}>
          <button
            type="button"
            onClick={() => setFilters((prev) => ({ ...prev, freeOnly: !prev.freeOnly, paidOnly: false }))}
            style={{
              ...styles.toggleButton,
              ...(isMobile ? styles.toggleButtonMobile : {}),
              ...(filters.freeOnly ? styles.toggleButtonActive : {}),
            }}
          >
            Free only
          </button>
          <button
            type="button"
            onClick={() => setFilters((prev) => ({ ...prev, paidOnly: !prev.paidOnly, freeOnly: false }))}
            style={{
              ...styles.toggleButton,
              ...(isMobile ? styles.toggleButtonMobile : {}),
              ...(filters.paidOnly ? styles.toggleButtonActive : {}),
            }}
          >
            Paid only
          </button>
        </div>
      </div>


      <div style={{ ...styles.actions, ...(isMobile ? styles.actionsMobile : {}) }}>
        <button
          type="button"
          onClick={() =>
            setFilters({
              category: "Any",
              freeOnly: false,
              paidOnly: false,
            })
          }
          style={{ ...styles.resetButton, ...(isMobile ? styles.resetButtonMobile : {}) }}
          title="Reset event filters"
        >
          <FaTimes style={styles.resetIcon} /> Reset
        </button>

        <button type="button" onClick={handleApply} style={{ ...styles.applyButton, ...(isMobile ? styles.applyButtonMobile : {}) }}>
          <FaCheck style={{ fontSize: 16 }} /> Apply Filters
        </button>
      </div>
    </div>
  );
}

const styles = {
  card: {
    maxWidth: 720,
    padding: "10px 0",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    margin: 0,
    fontSize: 24,
    color: "#1a1a1a",
    fontWeight: 850,
    letterSpacing: "-0.4px",
  },
  subtitle: {
    margin: "6px 0 0",
    fontSize: 14,
    color: "#666666",
    fontWeight: 500,
  },
  headerActions: { display: "flex", alignItems: "center", gap: 12 },
  badge: {
    padding: "8px 16px",
    borderRadius: 999,
    background: "linear-gradient(135deg, #16a34a 0%, #0ea5e9 100%)",
    color: "#fff",
    fontSize: 13,
    fontWeight: 800,
    boxShadow: "0 4px 12px rgba(16,185,129,0.25)",
  },
  section: { marginBottom: 16, padding: "14px 16px", borderRadius: 16, background: "#fafafa", border: "1px solid #eef2f7" },
  sectionTitleRow: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  sectionTitle: { fontWeight: 900, color: "#0f172a", display: "flex", alignItems: "center", gap: 10 },
  sectionIcon: { color: "#10b981", fontSize: 14 },
  grid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16, marginBottom: 16 },
  field: { display: "flex", flexDirection: "column", gap: 8 },
  label: { fontSize: 14, fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: 8 },
  labelIcon: { color: "#10b981", fontSize: 12 },
  input: {
    width: "100%",
    padding: "12px 14px",
    border: "2px solid #e5e7eb",
    borderRadius: 12,
    background: "#fff",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  },
  toggleRow: { display: "flex", gap: 12, flexWrap: "wrap" },
  toggleButton: {
    flex: "1 1 140px",
    border: "2px solid #e5e7eb",
    background: "#fff",
    color: "#0f172a",
    borderRadius: 14,
    padding: "12px 14px",
    fontWeight: 900,
    cursor: "pointer",
  },
  toggleButtonActive: {
    borderColor: "#10b981",
    background: "linear-gradient(135deg, #34d399 0%, #10b981 100%)",
    color: "#fff",
  },
  tagWrap: { display: "flex", flexWrap: "wrap", gap: 10 },
  tagButton: {
    borderRadius: 999,
    border: "2px solid #e5e7eb",
    background: "#fff",
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 13,
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "#334155",
  },
  tagButtonActive: {
    background: "linear-gradient(135deg, #34d399 0%, #10b981 100%)",
    borderColor: "#10b981",
    color: "#fff",
  },
  tagCheckIcon: { fontSize: 12 },
  actions: { display: "flex", gap: 12, marginTop: 16 },
  resetButton: {
    flex: "0 0 auto",
    padding: "12px 14px",
    borderRadius: 14,
    background: "#fff",
    border: "2px solid #e5e7eb",
    cursor: "pointer",
    fontWeight: 900,
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "#0f172a",
  },
  resetIcon: { fontSize: 14, color: "#64748b" },
  applyButton: {
    flex: 1,
    padding: "14px 18px",
    border: "none",
    borderRadius: 14,
    background: "linear-gradient(135deg, #34d399 0%, #10b981 100%)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 950,
    fontSize: 15,
    boxShadow: "0 10px 24px rgba(16,185,129,0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  // Mobile responsive styles
  cardMobile: {
    padding: "16px",
  },
  headerMobile: {
    marginBottom: "12px",
  },
  titleMobile: {
    fontSize: "18px",
  },
  headerActionsMobile: {
    gap: "6px",
  },
  badgeMobile: {
    padding: "4px 10px",
    fontSize: "10px",
  },
  gridMobile: {
    gridTemplateColumns: "1fr",
    gap: "10px",
    marginBottom: "12px",
  },
  fieldMobile: {
    gap: "4px",
  },
  labelMobile: {
    fontSize: "11px",
  },
  labelIcon: {
    color: "#10b981",
    fontSize: "10px",
  },
  inputMobile: {
    padding: "10px 12px",
    fontSize: "13px",
    borderRadius: "10px",
  },
  sectionMobile: {
    marginBottom: "12px",
    padding: "12px",
    borderRadius: "10px",
  },
  sectionTitleRowMobile: {
    marginBottom: "8px",
  },
  sectionTitleMobile: {
    fontSize: "12px",
  },
  sectionIcon: {
    color: "#10b981",
    fontSize: "12px",
  },
  toggleRowMobile: {
    gap: "8px",
  },
  toggleButtonMobile: {
    padding: "8px 10px",
    fontSize: "11px",
    borderRadius: "8px",
  },
  actionsMobile: {
    marginTop: "10px",
    gap: "6px",
  },
  resetButtonMobile: {
    padding: "8px 10px",
    fontSize: "11px",
  },
  applyButtonMobile: {
    padding: "10px 12px",
    fontSize: "13px",
  },
};

export default EventFiltersection;
