import { useState, useEffect } from "react";
import { FaTimes, FaCheck, FaBriefcase, FaUser, FaShieldAlt, FaClock } from "react-icons/fa";

const professionOptions = [
  "AI Agent Developer",
  "Prompt Engineer",
  "Robotics Engineer",
  "Blockchain Developer",
  "AR/VR Developer",
  "Quantum Computing Researcher",
  "Sustainability Consultant",
  "Climate Scientist",
  "Ethical Hacker",
  "Digital Forensics Expert",
  "Creator Economy Manager",
  "Space Systems Engineer",
  "Drone Pilot",
  "Bioinformatics Scientist",
  "AI Product Manager",
  "Software Engineer",
  "AI/ML Engineer",
  "Data Scientist",
  "Cybersecurity Engineer",
  "Cloud Engineer",
  "DevOps Engineer",
  "Product Manager",
  "UI/UX Designer",
  "Full-Stack Developer",
  "Mobile App Developer",
  "Doctor (Physician)",
  "Surgeon",
  "Dentist",
  "Pharmacist",
  "Nurse",
  "Psychologist",
  "Physiotherapist",
  "Veterinarian",
  "Lawyer",
  "Judge",
  "Chartered Accountant (CA)",
  "Financial Analyst",
  "Investment Banker",
  "Entrepreneur",
  "Startup Founder",
  "CEO",
  "Marketing Manager",
  "Sales Manager",
  "Human Resources (HR) Manager",
  "Business Analyst",
  "Civil Engineer",
  "Mechanical Engineer",
  "Electrical Engineer",
  "Aerospace Engineer",
  "Architect",
  "Scientist",
  "Researcher",
  "Professor",
  "School Teacher",
  "Journalist",
  "Content Creator",
  "Graphic Designer",
  "Photographer",
  "Film Director",
  "Pilot",
  "Air Traffic Controller",
  "Police Officer",
  "Firefighter",
  "Military Officer",
  "Social Worker"
];
const genderOptions = ["Any", "Male", "Female", "Non-binary"];
const onlineStatusOptions = ["Any", "Online now", "Active recently", "Offline"];



function Filtersection() {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);
    const [filters, setFilters] = useState({
        profession: "",
        gender: "Any",
        onlineStatus: "Any",
        verifiedOnly: false
    });
    const [saved, setSaved] = useState(false);



    
    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        setFilters((prev) => ({ 
            ...prev, 
            [name]: type === "checkbox" ? checked : value 
        }));
        setSaved(false);
    };




    const resetFilters = () => {
        setFilters({
            profession: "",
            gender: "Any",
            onlineStatus: "Any",
            verifiedOnly: false
        });
        setSaved(false);
    };


    const getActiveFilterCount = () => {
        let count = 0;
        if (filters.profession) count++;
        if (filters.gender !== "Any") count++;
        if (filters.onlineStatus !== "Any") count++;
        if (filters.verifiedOnly) count++;
        return count;
    };


    const handleSave = () => {
        setSaved(true);
    };

    return (
        <div style={{ ...styles.card, ...(isMobile ? styles.cardMobile : {}) }}>
            <div style={{ ...styles.header, ...(isMobile ? styles.headerMobile : {}) }}>
                <div>
                    <h3 style={{ ...styles.title, ...(isMobile ? styles.titleMobile : {}) }}>Find People</h3>
                    {!isMobile && <p style={styles.subtitle}>Discover your perfect connections</p>}
                </div>
                <div style={{ ...styles.headerActions, ...(isMobile ? styles.headerActionsMobile : {}) }}>
                    <span style={{ ...styles.badge, ...(isMobile ? styles.badgeMobile : {}) }}>{getActiveFilterCount()} Active</span>
                    <button
                        onClick={resetFilters}
                        style={{ ...styles.resetButton, ...(isMobile ? styles.resetButtonMobile : {}) }}
                        title="Reset all filters"
                    >
                        <FaTimes style={styles.resetIcon} />
                    </button>
                </div>
            </div>


            <div style={{ ...styles.sectionContent, ...(isMobile ? styles.sectionContentMobile : {}) }}>
                <div style={{ ...styles.grid, ...(isMobile ? styles.gridMobile : {}) }}>
                    <label style={{ ...styles.field, ...(isMobile ? styles.fieldMobile : {}) }}>
                        <span style={{ ...styles.label, ...(isMobile ? styles.labelMobile : {}) }}><FaBriefcase style={styles.labelIcon} /> People You're Looking For</span>
                        <select
                            name="profession"
                            value={filters.profession}
                            onChange={handleChange}
                            style={{ ...styles.input, ...(isMobile ? styles.inputMobile : {}) }}
                        >
                            <option value="">Choose profession</option>
                            {professionOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label style={{ ...styles.field, ...(isMobile ? styles.fieldMobile : {}) }}>
                        <span style={{ ...styles.label, ...(isMobile ? styles.labelMobile : {}) }}><FaUser style={styles.labelIcon} /> Gender</span>
                        <select
                            name="gender"
                            value={filters.gender}
                            onChange={handleChange}
                            style={{ ...styles.input, ...(isMobile ? styles.inputMobile : {}) }}
                        >
                            {genderOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label style={{ ...styles.field, ...(isMobile ? styles.fieldMobile : {}) }}>
                        <span style={{ ...styles.label, ...(isMobile ? styles.labelMobile : {}) }}><FaClock style={styles.labelIcon} /> Online Status</span>
                        <select
                            name="onlineStatus"
                            value={filters.onlineStatus}
                            onChange={handleChange}
                            style={{ ...styles.input, ...(isMobile ? styles.inputMobile : {}) }}
                        >
                            {onlineStatusOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                {/* Verified Only Toggle */}
                <label style={{ ...styles.toggleContainer, ...(isMobile ? styles.toggleContainerMobile : {}) }}>
                    <div>
                        <span style={{ ...styles.label, ...(isMobile ? styles.labelMobile : {}) }}><FaShieldAlt style={styles.labelIcon} /> Verified profiles only</span>
                        <span style={{ ...styles.noteText, ...(isMobile ? styles.noteTextMobile : {}) }}>
                            Show genuine users who are verified and interested in being part of something great
                        </span>
                    </div>
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


            <div style={{ ...styles.actions, ...(isMobile ? styles.actionsMobile : {}) }}>
                <button type="button" onClick={handleSave} style={{ ...styles.saveButton, ...(isMobile ? styles.saveButtonMobile : {}) }}>
                    <FaCheck style={styles.saveIcon} /> Apply Filters
                </button>
            </div>

            {saved && (
                <div style={{ ...styles.successMessage, ...(isMobile ? styles.successMessageMobile : {}) }}>
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
    noteText: {
        fontSize: "12px",
        color: "#666666",
        fontWeight: 400,
        marginTop: "4px",
        display: "block"
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
    },
    // Mobile responsive styles
    cardMobile: {
        margin: "0",
        padding: "16px",
        borderRadius: "16px",
        maxWidth: "100%"
    },
    headerMobile: {
        marginBottom: "12px",
        paddingBottom: "12px"
    },
    titleMobile: {
        fontSize: "18px"
    },
    headerActionsMobile: {
        gap: "6px"
    },
    badgeMobile: {
        padding: "4px 10px",
        fontSize: "10px"
    },
    resetButtonMobile: {
        padding: "5px"
    },
    sectionMobile: {
        marginBottom: "8px"
    },
    sectionHeaderMobile: {
        padding: "8px 10px",
        borderRadius: "8px"
    },
    sectionTitleMobile: {
        fontSize: "11px"
    },
    sectionContentMobile: {
        padding: "10px"
    },
    gridMobile: {
        gridTemplateColumns: "1fr",
        gap: "10px"
    },
    fieldMobile: {
        gap: "4px"
    },
    fullWidthMobile: {
        marginTop: "10px"
    },
    labelMobile: {
        fontSize: "11px"
    },
    labelIcon: {
        color: "#667eea",
        fontSize: "10px"
    },
    inputMobile: {
        padding: "10px 12px",
        fontSize: "13px",
        borderRadius: "10px"
    },
    tagWrapMobile: {
        gap: "6px"
    },
    tagButtonMobile: {
        padding: "5px 10px",
        fontSize: "10px",
        borderRadius: "16px"
    },
    toggleContainerMobile: {
        padding: "8px",
        borderRadius: "8px"
    },
    noteTextMobile: {
        fontSize: "10px",
        marginTop: "2px"
    },
    actionsMobile: {
        marginTop: "10px"
    },
    saveButtonMobile: {
        padding: "10px 14px",
        fontSize: "13px",
        borderRadius: "10px"
    },
    successMessageMobile: {
        padding: "12px 14px",
        fontSize: "12px",
        borderRadius: "10px"
    }
};

export default Filtersection;