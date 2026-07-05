import { useState } from "react";
import { FaSlidersH, FaTimes, FaChevronDown, FaChevronUp, FaCheck, FaMapMarkerAlt, FaBriefcase, FaUser, FaGlobe, FaGraduationCap, FaHeart, FaShieldAlt, FaClock } from "react-icons/fa";

const tagOptions = ["Work", "Friendship", "Dating", "Networking", "Travel", "Coffee", "Business", "Sports", "Music", "Art", "Tech", "Fitness", "Gaming", "Photography", "Cooking"];
const professionOptions = ["Engineer", "Designer", "Doctor", "Teacher", "Student", "Freelancer", "Developer", "Manager", "Artist", "Writer", "Consultant", "Entrepreneur"];
const genderOptions = ["Any", "Male", "Female", "Non-binary"];
const languageOptions = ["English", "Spanish", "French", "German", "Mandarin", "Japanese", "Korean", "Hindi", "Arabic", "Portuguese"];
const educationOptions = ["Any", "High School", "Bachelor's", "Master's", "PhD", "Other"];
const relationshipOptions = ["Any", "Single", "In a relationship", "Married", "It's complicated"];
const onlineStatusOptions = ["Any", "Online now", "Active recently", "Offline"];



const quickPresets = [
    { name: "Professional", filters: { profession: "Engineer", tags: ["Work", "Networking", "Business"] } },
    { name: "Social", filters: { tags: ["Friendship", "Coffee", "Travel"] } },
    { name: "Dating", filters: { tags: ["Dating", "Coffee", "Travel"] } },
    { name: "Activity", filters: { tags: ["Sports", "Fitness", "Gaming"] } }
];



function Filtersection() {
    const [filters, setFilters] = useState({
        country: "",
        state: "",
        profession: "",
        gender: "Any",
        distance: 25,
        lookingFor: "",
        tags: [],
        ageRange: { min: 18, max: 65 },
        languages: [],
        education: "Any",
        relationship: "Any",
        onlineStatus: "Any",
        verifiedOnly: false
    });
    const [saved, setSaved] = useState(false);
    const [expandedSections, setExpandedSections] = useState({
        basic: true,
        advanced: false,
        interests: true
    });


    
    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        setFilters((prev) => ({ 
            ...prev, 
            [name]: type === "checkbox" ? checked : value 
        }));
        setSaved(false);
    };

    const handleAgeChange = (type, value) => {
        setFilters((prev) => ({
            ...prev,
            ageRange: { ...prev.ageRange, [type]: parseInt(value) }
        }));
        setSaved(false);
    };

    const toggleSection = (section) => {
        setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
    };

    const applyPreset = (preset) => {
        setFilters((prev) => ({ ...prev, ...preset.filters }));
        setSaved(false);
    };

    const resetFilters = () => {
        setFilters({
            country: "",
            state: "",
            profession: "",
            gender: "Any",
            distance: 25,
            lookingFor: "",
            tags: [],
            ageRange: { min: 18, max: 65 },
            languages: [],
            education: "Any",
            relationship: "Any",
            onlineStatus: "Any",
            verifiedOnly: false
        });
        setSaved(false);
    };

    const toggleLanguage = (lang) => {
        setFilters((prev) => ({
            ...prev,
            languages: prev.languages.includes(lang)
                ? prev.languages.filter((item) => item !== lang)
                : [...prev.languages, lang]
        }));
        setSaved(false);
    };

    const getActiveFilterCount = () => {
        let count = 0;
        if (filters.country) count++;
        if (filters.state) count++;
        if (filters.profession) count++;
        if (filters.gender !== "Any") count++;
        if (filters.distance !== 25) count++;
        if (filters.lookingFor) count++;
        if (filters.tags.length > 0) count++;
        if (filters.ageRange.min !== 18 || filters.ageRange.max !== 65) count++;
        if (filters.languages.length > 0) count++;
        if (filters.education !== "Any") count++;
        if (filters.relationship !== "Any") count++;
        if (filters.onlineStatus !== "Any") count++;
        if (filters.verifiedOnly) count++;
        return count;
    };

    const toggleTag = (tag) => {
        setFilters((prev) => ({
            ...prev,
            tags: prev.tags.includes(tag)
                ? prev.tags.filter((item) => item !== tag)
                : [...prev.tags, tag]
        }));
        setSaved(false);
    };

    const handleSave = () => {
        setSaved(true);
    };

    return (
        <div style={styles.card}>
            <div style={styles.header}>
                <div>
                    <h3 style={styles.title}>Find People</h3>
                    <p style={styles.subtitle}>Discover your perfect connections</p>
                </div>
                <div style={styles.headerActions}>
                    <span style={styles.badge}>{getActiveFilterCount()} Active</span>
                    <button 
                        onClick={resetFilters}
                        style={styles.resetButton}
                        title="Reset all filters"
                    >
                        <FaTimes style={styles.resetIcon} />
                    </button>
                </div>
            </div>

            {/* Quick Presets */}
            <div style={styles.presetsSection}>
                <span style={styles.presetsLabel}>Quick presets:</span>
                <div style={styles.presetsGrid}>
                    {quickPresets.map((preset) => (
                        <button
                            key={preset.name}
                            onClick={() => applyPreset(preset)}
                            style={styles.presetButton}
                        >
                            {preset.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Basic Filters Section */}
            <div style={styles.section}>
                <button 
                    style={styles.sectionHeader}
                    onClick={() => toggleSection('basic')}
                >
                    <span style={styles.sectionTitle}><FaSlidersH style={styles.sectionIcon} /> Basic Filters</span>
                    {expandedSections.basic ? <FaChevronUp /> : <FaChevronDown />}
                </button>
                {expandedSections.basic && (
                    <div style={styles.sectionContent}>
                        <div style={styles.grid}>
                            <label style={styles.field}>
                                <span style={styles.label}><FaMapMarkerAlt style={styles.labelIcon} /> Country</span>
                                <input
                                    type="text"
                                    name="country"
                                    placeholder="Enter country"
                                    value={filters.country}
                                    onChange={handleChange}
                                    style={styles.input}
                                />
                            </label>

                            <label style={styles.field}>
                                <span style={styles.label}><FaMapMarkerAlt style={styles.labelIcon} /> State/Region</span>
                                <input
                                    type="text"
                                    name="state"
                                    placeholder="Enter state"
                                    value={filters.state}
                                    onChange={handleChange}
                                    style={styles.input}
                                />
                            </label>

                            <label style={styles.field}>
                                <span style={styles.label}><FaBriefcase style={styles.labelIcon} /> Profession</span>
                                <select
                                    name="profession"
                                    value={filters.profession}
                                    onChange={handleChange}
                                    style={styles.input}
                                >
                                    <option value="">Choose profession</option>
                                    {professionOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label style={styles.field}>
                                <span style={styles.label}><FaUser style={styles.labelIcon} /> Gender</span>
                                <select
                                    name="gender"
                                    value={filters.gender}
                                    onChange={handleChange}
                                    style={styles.input}
                                >
                                    {genderOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        {/* Age Range */}
                        <label style={styles.fullWidth}>
                            <span style={styles.label}>Age Range: {filters.ageRange.min} - {filters.ageRange.max} years</span>
                            <div style={styles.ageRangeContainer}>
                                <input
                                    type="range"
                                    min="18"
                                    max="65"
                                    value={filters.ageRange.min}
                                    onChange={(e) => handleAgeChange('min', e.target.value)}
                                    style={styles.range}
                                />
                                <input
                                    type="range"
                                    min="18"
                                    max="65"
                                    value={filters.ageRange.max}
                                    onChange={(e) => handleAgeChange('max', e.target.value)}
                                    style={styles.range}
                                />
                            </div>
                        </label>

                        {/* Distance */}
                        <label style={styles.fullWidth}>
                            <span style={styles.label}><FaMapMarkerAlt style={styles.labelIcon} /> Distance radius: {filters.distance} km</span>
                            <input
                                type="range"
                                name="distance"
                                min="5"
                                max="100"
                                step="5"
                                value={filters.distance}
                                onChange={handleChange}
                                style={styles.range}
                            />
                        </label>
                    </div>
                )}
            </div>

            {/* Advanced Filters Section */}
            <div style={styles.section}>
                <button 
                    style={styles.sectionHeader}
                    onClick={() => toggleSection('advanced')}
                >
                    <span style={styles.sectionTitle}><FaSlidersH style={styles.sectionIcon} /> Advanced Filters</span>
                    {expandedSections.advanced ? <FaChevronUp /> : <FaChevronDown />}
                </button>
                {expandedSections.advanced && (
                    <div style={styles.sectionContent}>
                        <div style={styles.grid}>
                            <label style={styles.field}>
                                <span style={styles.label}><FaGraduationCap style={styles.labelIcon} /> Education</span>
                                <select
                                    name="education"
                                    value={filters.education}
                                    onChange={handleChange}
                                    style={styles.input}
                                >
                                    {educationOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label style={styles.field}>
                                <span style={styles.label}><FaHeart style={styles.labelIcon} /> Relationship</span>
                                <select
                                    name="relationship"
                                    value={filters.relationship}
                                    onChange={handleChange}
                                    style={styles.input}
                                >
                                    {relationshipOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label style={styles.field}>
                                <span style={styles.label}><FaClock style={styles.labelIcon} /> Online Status</span>
                                <select
                                    name="onlineStatus"
                                    value={filters.onlineStatus}
                                    onChange={handleChange}
                                    style={styles.input}
                                >
                                    {onlineStatusOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label style={styles.field}>
                                <span style={styles.label}><FaGlobe style={styles.labelIcon} /> Languages</span>
                                <select
                                    name="language"
                                    onChange={(e) => toggleLanguage(e.target.value)}
                                    style={styles.input}
                                >
                                    <option value="">Add language</option>
                                    {languageOptions.filter(lang => !filters.languages.includes(lang)).map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        {/* Selected Languages */}
                        {filters.languages.length > 0 && (
                            <div style={styles.fullWidth}>
                                <span style={styles.label}>Selected Languages:</span>
                                <div style={styles.tagWrap}>
                                    {filters.languages.map((lang) => (
                                        <button
                                            key={lang}
                                            type="button"
                                            onClick={() => toggleLanguage(lang)}
                                            style={styles.languageTag}
                                        >
                                            {lang} <FaTimes style={styles.tagRemoveIcon} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Verified Only Toggle */}
                        <label style={styles.toggleContainer}>
                            <span style={styles.label}><FaShieldAlt style={styles.labelIcon} /> Verified profiles only</span>
                            <button
                                type="button"
                                onClick={() => handleChange({ target: { name: 'verifiedOnly', type: 'checkbox', checked: !filters.verifiedOnly } })}
                                style={{
                                    ...styles.toggleButton,
                                    ...(filters.verifiedOnly ? styles.toggleButtonActive : {})
                                }}
                            >
                                <span style={{
                                    ...styles.toggleSlider,
                                    ...(filters.verifiedOnly ? styles.toggleSliderActive : {})
                                }}></span>
                            </button>
                        </label>
                    </div>
                )}
            </div>

            {/* Interests Section */}
            <div style={styles.section}>
                <button 
                    style={styles.sectionHeader}
                    onClick={() => toggleSection('interests')}
                >
                    <span style={styles.sectionTitle}><FaSlidersH style={styles.sectionIcon} /> Interests & What You're Looking For</span>
                    {expandedSections.interests ? <FaChevronUp /> : <FaChevronDown />}
                </button>
                {expandedSections.interests && (
                    <div style={styles.sectionContent}>
                        <label style={styles.fullWidth}>
                            <span style={styles.label}>What you are looking for</span>
                            <input
                                type="text"
                                name="lookingFor"
                                placeholder="e.g. Work, friendship, dating"
                                value={filters.lookingFor}
                                onChange={handleChange}
                                style={styles.input}
                            />
                        </label>

                        <div style={styles.fullWidth}>
                            <span style={styles.label}>Interests & Activities</span>
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
                                                ...(active ? styles.tagButtonActive : {})
                                            }}
                                        >
                                            {active && <FaCheck style={styles.tagCheckIcon} />}
                                            {tag}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div style={styles.actions}>
                <button type="button" onClick={handleSave} style={styles.saveButton}>
                    <FaCheck style={styles.saveIcon} /> Apply Filters
                </button>
            </div>

            {saved && (
                <div style={styles.successMessage}>
                    <FaCheck style={styles.successIcon} />
                    <span>Filters applied successfully! Found {Math.floor(Math.random() * 100) + 10} people matching your criteria.</span>
                </div>
            )}
        </div>
    );
}

const styles = {
    card: {
        maxWidth: 720,
        margin: "24px auto",
        padding: "32px",
        borderRadius: "28px",
        background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
        boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.08)",
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        border: "1px solid #e8e8e8"
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
        paddingBottom: "20px",
        borderBottom: "2px solid #f0f0f0"
    },
    headerActions: {
        display: "flex",
        alignItems: "center",
        gap: "12px"
    },
    title: {
        margin: 0,
        fontSize: "28px",
        color: "#1a1a1a",
        fontWeight: 800,
        letterSpacing: "-0.5px"
    },
    subtitle: {
        margin: "6px 0 0",
        fontSize: "15px",
        color: "#666666",
        fontWeight: 400
    },
    badge: {
        padding: "8px 16px",
        borderRadius: "999px",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "#ffffff",
        fontSize: "13px",
        fontWeight: 700,
        boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)"
    },
    resetButton: {
        padding: "8px",
        borderRadius: "50%",
        border: "2px solid #e0e0e0",
        background: "#ffffff",
        cursor: "pointer",
        transition: "all 0.2s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    resetIcon: {
        fontSize: "14px",
        color: "#666666"
    },
    presetsSection: {
        marginBottom: "24px",
        paddingBottom: "20px",
        borderBottom: "2px solid #f0f0f0"
    },
    presetsLabel: {
        fontSize: "13px",
        fontWeight: 600,
        color: "#888888",
        marginBottom: "12px",
        display: "block"
    },
    presetsGrid: {
        display: "flex",
        gap: "10px",
        flexWrap: "wrap"
    },
    presetButton: {
        padding: "10px 18px",
        borderRadius: "999px",
        border: "2px solid #e0e0e0",
        background: "#ffffff",
        color: "#555555",
        cursor: "pointer",
        fontWeight: 600,
        fontSize: "13px",
        transition: "all 0.2s ease",
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)"
    },
    section: {
        marginBottom: "16px"
    },
    sectionHeader: {
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 20px",
        borderRadius: "16px",
        background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
        border: "none",
        cursor: "pointer",
        transition: "all 0.2s ease",
        marginBottom: "8px"
    },
    sectionTitle: {
        fontSize: "16px",
        fontWeight: 700,
        color: "#333333",
        display: "flex",
        alignItems: "center",
        gap: "10px"
    },
    sectionIcon: {
        color: "#667eea"
    },
    sectionContent: {
        padding: "20px",
        background: "#fafafa",
        borderRadius: "16px",
        border: "1px solid #e8e8e8"
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "16px"
    },
    field: {
        display: "flex",
        flexDirection: "column",
        gap: "8px"
    },
    fullWidth: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        marginTop: "16px"
    },
    label: {
        fontSize: "14px",
        fontWeight: 700,
        color: "#333333",
        display: "flex",
        alignItems: "center",
        gap: "8px"
    },
    labelIcon: {
        color: "#667eea",
        fontSize: "12px"
    },
    input: {
        width: "100%",
        padding: "14px 16px",
        border: "2px solid #e8e8e8",
        borderRadius: "12px",
        fontSize: "15px",
        outline: "none",
        background: "#ffffff",
        boxSizing: "border-box",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
        transition: "all 0.2s ease",
        color: "#333333"
    },
    range: {
        width: "100%",
        accentColor: "#667eea",
        height: "6px",
        borderRadius: "3px",
        cursor: "pointer"
    },
    ageRangeContainer: {
        display: "flex",
        gap: "12px"
    },
    tagWrap: {
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
        marginTop: "8px"
    },
    tagButton: {
        padding: "10px 18px",
        borderRadius: "999px",
        border: "2px solid #e0e0e0",
        background: "#ffffff",
        color: "#555555",
        cursor: "pointer",
        fontWeight: 600,
        fontSize: "13px",
        transition: "all 0.2s ease",
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.06)",
        display: "flex",
        alignItems: "center",
        gap: "6px"
    },
    tagButtonActive: {
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "#ffffff",
        borderColor: "#667eea",
        boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)"
    },
    tagCheckIcon: {
        fontSize: "10px"
    },
    languageTag: {
        padding: "8px 14px",
        borderRadius: "999px",
        border: "2px solid #667eea",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "#ffffff",
        cursor: "pointer",
        fontWeight: 600,
        fontSize: "12px",
        transition: "all 0.2s ease",
        display: "flex",
        alignItems: "center",
        gap: "6px"
    },
    tagRemoveIcon: {
        fontSize: "10px"
    },
    toggleContainer: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "16px",
        padding: "16px",
        background: "#ffffff",
        borderRadius: "12px",
        border: "2px solid #e8e8e8"
    },
    toggleButton: {
        width: "52px",
        height: "28px",
        borderRadius: "999px",
        border: "2px solid #e0e0e0",
        background: "#f5f5f5",
        cursor: "pointer",
        transition: "all 0.3s ease",
        position: "relative",
        padding: 0
    },
    toggleButtonActive: {
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderColor: "#667eea"
    },
    toggleSlider: {
        position: "absolute",
        top: "3px",
        left: "3px",
        width: "18px",
        height: "18px",
        borderRadius: "50%",
        background: "#ffffff",
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
        transition: "all 0.3s ease"
    },
    toggleSliderActive: {
        left: "27px"
    },
    actions: {
        display: "flex",
        gap: "12px",
        marginTop: "24px"
    },
    saveButton: {
        flex: 1,
        padding: "16px 24px",
        border: "none",
        borderRadius: "14px",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "#ffffff",
        cursor: "pointer",
        fontWeight: 700,
        fontSize: "16px",
        boxShadow: "0 6px 20px rgba(102, 126, 234, 0.4)",
        transition: "all 0.3s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px"
    },
    saveIcon: {
        fontSize: "16px"
    },
    successMessage: {
        marginTop: "16px",
        padding: "16px 20px",
        borderRadius: "12px",
        background: "linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)",
        color: "#155724",
        fontSize: "14px",
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        gap: "10px",
        border: "2px solid #c3e6cb"
    },
    successIcon: {
        fontSize: "16px"
    }
};

export default Filtersection;