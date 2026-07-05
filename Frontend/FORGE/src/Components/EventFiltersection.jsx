import { useEffect, useMemo, useState } from "react";
import { FaTimes, FaCheck, FaCalendarAlt, FaTag, FaSearch, FaDollarSign } from "react-icons/fa";

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
  const [filters, setFilters] = useState(
    initialFilters || {
      query: "",
      category: "Any",
      tags: [],
      freeOnly: false,
      paidOnly: false,
      dateDays: 30, // events happening in next N days
    }
  );

  useEffect(() => {
    setFilters(
      initialFilters || {
        query: "",
        category: "Any",
        tags: [],
        freeOnly: false,
        paidOnly: false,
        dateDays: 30,
      }
    );
  }, [initialFilters]);

  const activeCount = useMemo(() => {
    let c = 0;
    if (filters.query?.trim()) c++;
    if (filters.category !== "Any") c++;
    if (filters.tags.length) c++;
    if (filters.freeOnly) c++;
    if (filters.paidOnly) c++;
    if (filters.dateDays !== 30) c++;
    return c;
  }, [filters]);

  const toggleTag = (tag) => {
    setFilters((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }));
  };

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
    <div style={styles.card}>
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>Find Events</h3>
          <p style={styles.subtitle}>Filter upcoming happenings around you</p>
        </div>
        <div style={styles.headerActions}>
          <span style={styles.badge}>{activeCount} Active</span>
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitleRow}>
          <span style={styles.sectionTitle}>
            <FaSearch style={styles.sectionIcon} /> Search
          </span>
        </div>
        <label style={styles.field}>
          <span style={styles.label}>
            <FaSearch style={styles.labelIcon} /> Keyword
          </span>
          <input
            style={styles.input}
            value={filters.query}
            placeholder="e.g. workshop, music, community..."
            onChange={(e) => setFilters((prev) => ({ ...prev, query: e.target.value }))}
          />
        </label>
      </div>

      <div style={styles.grid}>
        <label style={styles.field}>
          <span style={styles.label}>
            <FaTag style={styles.labelIcon} /> Category
          </span>
          <select
            style={styles.input}
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

        <label style={styles.field}>
          <span style={styles.label}>
            <FaCalendarAlt style={styles.labelIcon} /> Date (next {filters.dateDays} days)
          </span>
          <input
            style={styles.input}
            type="range"
            min={1}
            max={120}
            step={1}
            value={filters.dateDays}
            onChange={(e) => setFilters((prev) => ({ ...prev, dateDays: Number(e.target.value) }))}
          />
        </label>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitleRow}>
          <span style={styles.sectionTitle}>
            <FaDollarSign style={styles.sectionIcon} /> Price
          </span>
        </div>

        <div style={styles.toggleRow}>
          <button
            type="button"
            onClick={() => setFilters((prev) => ({ ...prev, freeOnly: !prev.freeOnly, paidOnly: false }))}
            style={{
              ...styles.toggleButton,
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
              ...(filters.paidOnly ? styles.toggleButtonActive : {}),
            }}
          >
            Paid only
          </button>
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitleRow}>
          <span style={styles.sectionTitle}>
            <FaTag style={styles.sectionIcon} /> Tags
          </span>
        </div>
        <div style={styles.tagWrap}>
          {tagOptions.map((tag) => {
            const active = filters.tags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                style={{
                  ...styles.tagButton,
                  ...(active ? styles.tagButtonActive : {}),
                }}
              >
                {active ? <FaCheck style={styles.tagCheckIcon} /> : null}
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      <div style={styles.actions}>
        <button
          type="button"
          onClick={() =>
            setFilters({
              query: "",
              category: "Any",
              tags: [],
              freeOnly: false,
              paidOnly: false,
              dateDays: 30,
            })
          }
          style={styles.resetButton}
          title="Reset event filters"
        >
          <FaTimes style={styles.resetIcon} /> Reset
        </button>

        <button type="button" onClick={handleApply} style={styles.applyButton}>
          <FaCheck style={{ fontSize: 16 }} /> Apply Event Filters
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
};

export default EventFiltersection;
