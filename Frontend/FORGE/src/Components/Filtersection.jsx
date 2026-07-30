import { useState, useEffect } from "react";
import { FaTimes, FaCheck, FaBriefcase, FaUser, FaShieldAlt, FaClock } from "react-icons/fa";

const lookingForOptions = [
  'Startup Join Team Member',
  'Startup Join as Co-Founder',
  'Mentor',
  'Investor',
  'Team Member for Hackathon',
  'Other',
  'Mentorship',
  'Collaboration',
  'Networking',
  'Job Opportunities',
  'Freelance Work',
  'Partnership',
  'Investment',
  'Advice',
  'Learning',
  'Project Collaboration',
  'Startup Co-founder',
  'Technical Support',
  'Business Development',
  'Research Collaboration',
  'Internship',
  'Consulting',
  'Volunteering',
  'Community Building',
  'Skill Exchange',
  'Industry Connections',
  'AI Agent Developer',
  'Prompt Engineer',
  'Robotics Engineer',
  'Blockchain Developer',
  'AR/VR Developer',
  'Quantum Computing Researcher',
  'Sustainability Consultant',
  'Climate Scientist',
  'Ethical Hacker',
  'Digital Forensics Expert',
  'Creator Economy Manager',
  'Space Systems Engineer',
  'Drone Pilot',
  'Bioinformatics Scientist',
  'AI Product Manager',
  'Software Engineer',
  'AI/ML Engineer',
  'Data Scientist',
  'Cybersecurity Engineer',
  'Cloud Engineer',
  'DevOps Engineer',
  'Product Manager',
  'UI/UX Designer',
  'Full-Stack Developer',
  'Mobile App Developer',
  'Doctor (Physician)',
  'Surgeon',
  'Dentist',
  'Pharmacist',
  'Nurse',
  'Psychologist',
  'Physiotherapist',
  'Veterinarian',
  'Lawyer',
  'Judge',
  'Chartered Accountant (CA)',
  'Financial Analyst',
  'Investment Banker',
  'Entrepreneur',
  'Startup Founder',
  'CEO',
  'Marketing Manager',
  'Sales Manager',
  'Human Resources (HR) Manager',
  'Business Analyst',
  'Civil Engineer',
  'Mechanical Engineer',
  'Electrical Engineer',
  'Aerospace Engineer',
  'Architect',
  'Scientist',
  'Researcher',
  'Professor',
  'School Teacher',
  'Journalist',
  'Content Creator',
  'Graphic Designer',
  'Photographer',
  'Film Director',
  'Pilot',
  'Air Traffic Controller',
  'Police Officer',
  'Firefighter',
  'Military Officer',
  'Social Worker'
];



function Filtersection({ onFilterChange, initialFilters = null, onReset, onApply }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);
    const [filters, setFilters] = useState(initialFilters || {
        lookingFor: ""
    });
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (initialFilters) {
            setFilters(initialFilters);
        }
    }, [initialFilters]);



    
    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        setFilters((prev) => ({ 
            ...prev, 
            [name]: type === "checkbox" ? checked : value 
        }));
        setSaved(false);
    };

    const resetFilters = () => {
        const defaultFilters = {
            lookingFor: ""
        };
        setFilters(defaultFilters);
        setSaved(false);
        if (onReset) {
            onReset();
        }
    };


    const getActiveFilterCount = () => {
        let count = 0;
        if (filters.lookingFor) count++;
        return count;
    };


    const handleSave = () => {
        setSaved(true);
        // Auto-hide success message after 2 seconds
        setTimeout(() => setSaved(false), 2000);
        // Send current filters to parent on apply
        if (onFilterChange) {
            onFilterChange(filters);
        }
        // Call onApply callback to close popup and apply filters
        if (onApply) {
            onApply(filters);
        }
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
                            name="lookingFor"
                            value={filters.lookingFor}
                            onChange={handleChange}
                            style={{ ...styles.input, ...(isMobile ? styles.inputMobile : {}) }}
                        >
                            <option value="">What are you looking for?</option>
                            {lookingForOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
            </div>


            <div style={{ ...styles.actions, ...(isMobile ? styles.actionsMobile : {}) }}>
                <button type="button" onClick={handleSave} style={{ ...styles.saveButton, ...(isMobile ? styles.saveButtonMobile : {}) }}>
                    <FaCheck style={styles.saveIcon} /> Apply Filters
                </button>
            </div>

            {saved && (
                <div style={{ ...styles.successMessage, ...(isMobile ? styles.successMessageMobile : {}) }}>
                    <FaCheck style={styles.successIcon} />
                    <span>Filters applied successfully!</span>
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
        borderRadius: "24px",
        background: "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        boxShadow: "0 16px 48px rgba(17, 17, 17, 0.12)",
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        border: "1px solid rgba(255, 255, 255, 0.5)"
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
        paddingBottom: "20px",
        borderBottom: "1px solid rgba(255, 255, 255, 0.3)"
    },
    headerActions: {
        display: "flex",
        alignItems: "center",
        gap: "12px"
    },
    title: {
        margin: 0,
        fontSize: "28px",
        color: "#111111",
        fontWeight: "600",
        letterSpacing: "-0.5px"
    },
    subtitle: {
        margin: "6px 0 0",
        fontSize: "15px",
        color: "#666666",
        fontWeight: "400"
    },
    badge: {
        padding: "8px 16px",
        borderRadius: "999px",
        background: "rgba(255, 215, 0, 0.25)",
        color: "#111111",
        fontSize: "13px",
        fontWeight: "500",
        boxShadow: "0 4px 12px rgba(255, 215, 0, 0.15)"
    },
    resetButton: {
        padding: "8px",
        borderRadius: "999px",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        background: "rgba(255, 255, 255, 0.5)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
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
        borderBottom: "1px solid rgba(255, 255, 255, 0.3)"
    },
    presetsLabel: {
        fontSize: "13px",
        fontWeight: "500",
        color: "#666666",
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
        border: "1px solid rgba(255, 255, 255, 0.3)",
        background: "rgba(255, 255, 255, 0.5)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        color: "#111111",
        cursor: "pointer",
        fontWeight: "500",
        fontSize: "13px",
        transition: "all 0.2s ease",
        boxShadow: "0 2px 6px rgba(17, 17, 17, 0.05)"
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
        background: "rgba(255, 255, 255, 0.5)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        cursor: "pointer",
        transition: "all 0.2s ease",
        marginBottom: "8px"
    },
    sectionTitle: {
        fontSize: "16px",
        fontWeight: "600",
        color: "#111111",
        display: "flex",
        alignItems: "center",
        gap: "10px"
    },
    sectionIcon: {
        color: "#FFD700"
    },
    sectionContent: {
        padding: "20px",
        background: "rgba(255, 255, 255, 0.3)",
        borderRadius: "16px",
        border: "1px solid rgba(255, 255, 255, 0.3)"
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
        fontWeight: "500",
        color: "#111111",
        display: "flex",
        alignItems: "center",
        gap: "8px"
    },
    labelIcon: {
        color: "#FFD700",
        fontSize: "12px"
    },
    input: {
        width: "100%",
        padding: "14px 16px",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        borderRadius: "16px",
        fontSize: "15px",
        outline: "none",
        background: "rgba(255, 255, 255, 0.5)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        boxSizing: "border-box",
        boxShadow: "0 2px 8px rgba(17, 17, 17, 0.04)",
        transition: "all 0.2s ease",
        color: "#111111"
    },
    range: {
        width: "100%",
        accentColor: "#FFD700",
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
        border: "1px solid rgba(255, 255, 255, 0.3)",
        background: "rgba(255, 255, 255, 0.5)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        color: "#111111",
        cursor: "pointer",
        fontWeight: "500",
        fontSize: "13px",
        transition: "all 0.2s ease",
        boxShadow: "0 2px 6px rgba(17, 17, 17, 0.06)",
        display: "flex",
        alignItems: "center",
        gap: "6px"
    },
    tagButtonActive: {
        background: "rgba(255, 215, 0, 0.25)",
        color: "#111111",
        borderColor: "rgba(255, 215, 0, 0.3)",
        boxShadow: "0 4px 12px rgba(255, 215, 0, 0.2)"
    },
    tagCheckIcon: {
        fontSize: "10px"
    },
    languageTag: {
        padding: "8px 14px",
        borderRadius: "999px",
        border: "1px solid rgba(255, 215, 0, 0.3)",
        background: "rgba(255, 215, 0, 0.25)",
        color: "#111111",
        cursor: "pointer",
        fontWeight: "500",
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
        background: "rgba(255, 255, 255, 0.5)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderRadius: "16px",
        border: "1px solid rgba(255, 255, 255, 0.3)"
    },
    noteText: {
        fontSize: "12px",
        color: "#666666",
        fontWeight: "400",
        marginTop: "4px",
        display: "block"
    },
    toggleButton: {
        width: "52px",
        height: "28px",
        borderRadius: "999px",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        background: "rgba(255, 255, 255, 0.5)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        cursor: "pointer",
        transition: "all 0.3s ease",
        position: "relative",
        padding: 0
    },
    toggleButtonActive: {
        background: "rgba(255, 215, 0, 0.25)",
        borderColor: "rgba(255, 215, 0, 0.3)"
    },
    toggleSlider: {
        position: "absolute",
        top: "3px",
        left: "3px",
        width: "18px",
        height: "18px",
        borderRadius: "50%",
        background: "#ffffff",
        boxShadow: "0 2px 6px rgba(17, 17, 17, 0.2)",
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
        borderRadius: "999px",
        background: "#FF6B00",
        color: "#111111",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "16px",
        boxShadow: "0 8px 24px rgba(255, 107, 0, 0.25)",
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
        borderRadius: "16px",
        background: "rgba(34, 197, 94, 0.15)",
        color: "#22c55e",
        fontSize: "14px",
        fontWeight: "500",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        border: "1px solid rgba(34, 197, 94, 0.3)"
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