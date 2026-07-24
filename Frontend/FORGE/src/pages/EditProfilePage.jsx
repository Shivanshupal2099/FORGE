import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaMapLocationDot } from 'react-icons/fa6';
import NavigationBar from '../Components/NavigationBar';
import Header from '../Components/Header';
import { useAuth } from '../contexts/AuthContext';
import axios from '../api/axios';
import maleImage from '../assets/male.png';
import femaleImage from '../assets/female.png';

function EditProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { supabase } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [profileData, setProfileData] = useState({ 
    name: '',
    bio: '',
    profession: '',
    domain: '',
    lookingFor: [],
    customLookingFor: '',
    contactNumber: '',
    gender: '',
    location: '',
    locationCoordinates: null,
    avatarUrl: '',
    isServiceProvider: false,
    services: [],
  });
  const [visibilitySettings, setVisibilitySettings] = useState({
    show_name: true,
    show_bio: true,
    show_looking_for: true,
    show_services: true
  });
  const [socialLinks, setSocialLinks] = useState([
    { title: '', url: '' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [professionSearch, setProfessionSearch] = useState('');
  const [showProfessionDropdown, setShowProfessionDropdown] = useState(false);
  const [lookingForSearch, setLookingForSearch] = useState('');
  const [showLookingForDropdown, setShowLookingForDropdown] = useState(false);
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');
  const [isWatchingLocation, setIsWatchingLocation] = useState(false);
  const [watchId, setWatchId] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState('success');


  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Load current user data from backend API
    const loadUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Use the user's email as UID since that's what we store in MongoDB
          const uid = user.email;
          
          const response = await axios.get(`/api/profile/${uid}`);
          
          if (response.data.success && response.data.profile) {
            setProfileData({
              name: `${response.data.profile.first_name} ${response.data.profile.last_name}`,
              bio: response.data.profile.bio || '',
              profession: response.data.profile.department || '',
              domain: response.data.profile.domain || '',
              lookingFor: response.data.profile.looking_for || [],
              customLookingFor: '',
              contactNumber: response.data.profile.contact_number || '',
              gender: response.data.profile.gender || '',
              location: response.data.profile.location || '',
              locationCoordinates: null,
              avatarUrl: response.data.profile.avatar_url || '',
              isServiceProvider: response.data.profile.is_service_provider || false,
              services: response.data.profile.services || [],
            });
            setVisibilitySettings(response.data.profile.visibility_settings || {
              show_name: true,
              show_bio: true,
              show_looking_for: true,
              show_services: true
            });
            setProfessionSearch(response.data.profile.department || '');
            
            // Load social links
            if (response.data.profile.github_url || response.data.profile.linkedin_url || response.data.profile.portfolio_url) {
              const links = [];
              if (response.data.profile.github_url) links.push({ title: 'GitHub', url: response.data.profile.github_url });
              if (response.data.profile.linkedin_url) links.push({ title: 'LinkedIn', url: response.data.profile.linkedin_url });
              if (response.data.profile.portfolio_url) links.push({ title: 'Portfolio', url: response.data.profile.portfolio_url });
              if (links.length > 0) {
                setSocialLinks(links);
              }
            }
          } else {
            // Fallback to user metadata if no profile exists
            setProfileData({
              name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
              bio: user.user_metadata?.bio || '',
              profession: user.user_metadata?.profession || '',
              lookingFor: user.user_metadata?.lookingFor || [],
              customLookingFor: '',
              contactNumber: user.user_metadata?.contactNumber || '',
              gender: user.user_metadata?.gender || '',
              location: user.user_metadata?.location || '',
              locationCoordinates: user.user_metadata?.locationCoordinates || null,
            });
            setProfessionSearch(user.user_metadata?.profession || '');
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfessionDropdown && !event.target.closest('[data-profession-dropdown]')) {
        setShowProfessionDropdown(false);
      }
      if (showLookingForDropdown && !event.target.closest('[data-looking-for-dropdown]')) {
        setShowLookingForDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfessionDropdown, showLookingForDropdown]);

  // Cleanup watchPosition on component unmount
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        setWatchId(null);
        setIsWatchingLocation(false);
      }
    };
  }, [watchId]);

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({ ...prev, avatarUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSocialLinkChange = (index, field, value) => {
    setSocialLinks((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const addSocialLink = () => {
    setSocialLinks((prev) => [...prev, { title: '', url: '' }]);
  };

  const removeSocialLink = (index) => {
    setSocialLinks((prev) => prev.filter((_, i) => i !== index));
  };


  const lookingForOptions = [
    'Startup Join Team Member',
    'Startup Join as Co-Founder',
    'Mentor',
    'Investor',
    'Team Member for Hackathon',
    'Other',
  ];

  const serviceOptions = [
    'Website Design',
    'Website Development',
    'E-commerce Store Development',
    'Mobile App Development',
    'UI/UX Design',
    'Graphic Design',
    'Logo Design',
    'Branding & Brand Identity',
    'Search Engine Optimization (SEO)',
    'Local SEO',
    'Technical SEO',
    'Content Writing',
    'Copywriting',
    'Blog Writing',
    'Social Media Management',
    'Social Media Marketing',
    'Pay-Per-Click (PPC) Advertising',
    'Google Ads Management',
    'Facebook & Instagram Ads',
    'Email Marketing',
    'SMS Marketing',
    'Affiliate Marketing',
    'Influencer Marketing',
    'Video Editing',
    'Motion Graphics',
    'Animation (2D/3D)',
    'YouTube Channel Management',
    'Podcast Editing & Production',
    'Photography Editing',
    'Virtual Assistant Services',
    'Data Entry',
    'Data Analysis',
    'Business Intelligence Dashboard Development',
    'CRM Setup & Management',
    'Marketing Automation',
    'Chatbot Development',
    'AI Automation Services',
    'AI Prompt Engineering',
    'Cybersecurity Consulting',
    'Cloud Migration & Cloud Management',
    'IT Support & Help Desk',
    'Software Testing (QA)',
    'API Integration',
    'ERP Implementation',
    'Accounting & Bookkeeping',
    'Business Consulting',
    'Online Course Creation',
    'Resume & LinkedIn Profile Writing',
    'Translation & Localization',
    'Digital Product Development (eBooks, Templates, Online Tools)',
  ];

  const domainOptions = [
    'Agriculture',
    'Automotive',
    'Aerospace & Defense',
    'Banking',
    'Biotechnology',
    'Chemicals',
    'Construction',
    'Consumer Goods',
    'Education',
    'Energy & Utilities',
    'Entertainment',
    'Environmental Services',
    'Fashion & Apparel',
    'Financial Services',
    'Food & Beverage',
    'Government & Public Sector',
    'Healthcare',
    'Hospitality',
    'Human Resources',
    'Information Technology (IT)',
    'Insurance',
    'Legal Services',
    'Logistics & Supply Chain',
    'Manufacturing',
    'Marine & Shipping',
    'Media & Publishing',
    'Mining & Metals',
    'Nonprofit & NGOs',
    'Oil & Gas',
    'Pharmaceuticals',
    'Real Estate',
    'Retail & E-commerce',
    'Telecommunications',
    'Tourism & Travel',
    'Transportation',
    'Warehousing',
    'Wholesale Distribution',
    'Sports & Recreation',
    'Research & Development',
    'Cybersecurity',
    'Artificial Intelligence (AI)',
    'Data Analytics',
    'Cloud Computing',
    'Internet of Things (IoT)',
    'Robotics & Automation',
    'Semiconductor',
    'Renewable Energy',
    'Digital Marketing',
    'Advertising',
    'Consulting',
    'Architecture & Interior Design',
    'Event Management',
    'Printing & Packaging',
    'Furniture',
    'Home Improvement',
    'Cosmetics & Beauty',
    'Personal Care',
    'Fitness & Wellness',
    'Veterinary Services',
    'Waste Management',
    'Water Treatment',
    'Aviation',
    'Space Technology',
    'Gaming',
    'EdTech',
    'FinTech',
    'HealthTech',
    'InsurTech',
    'PropTech',
    'AgriTech',
    'LegalTech',
    'TravelTech',
    'HRTech',
    'MarTech',
    'RetailTech',
    'CleanTech',
    'Smart Cities',
    'Blockchain & Web3',
    'Cryptocurrency',
    'Electronics & Hardware'
  ];

  const professionOptions = [
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

  const filteredProfessions = professionOptions.filter((profession) =>
    profession.toLowerCase().includes(professionSearch.toLowerCase())
  );

  const handleProfessionSelect = (profession) => {
    setProfileData((prev) => ({ ...prev, profession }));
    setProfessionSearch(profession);
    setShowProfessionDropdown(false);
  };

  const handleLookingForSelect = (value) => {
    setProfileData((prev) => {
      const currentLookingFor = prev.lookingFor || [];
      if (currentLookingFor.includes(value)) {
        return {
          ...prev,
          lookingFor: currentLookingFor.filter((item) => item !== value),
        };
      } else {
        return {
          ...prev,
          lookingFor: [...currentLookingFor, value],
        };
      }
    });
  };

  const removeLookingForItem = (value) => {
    setProfileData((prev) => ({
      ...prev,
      lookingFor: prev.lookingFor.filter((item) => item !== value),
    }));
  };

  const handleFetchLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Location is not supported by this browser.');
      return;
    }

    // If already watching, stop watching first
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setIsWatchingLocation(false);
      setLocationStatus('Location tracking stopped.');
      return;
    }

    setIsFetchingLocation(true);
    setLocationStatus('Starting continuous location tracking...');

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const nextCoordinates = {
          latitude,
          longitude,
          accuracy: Math.round(accuracy),
          capturedAt: new Date().toISOString(),
        };

        setProfileData((prev) => ({
          ...prev,
          location: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
          locationCoordinates: nextCoordinates,
        }));
        setLocationStatus(`Location updated: ~${Math.round(accuracy)}m accuracy. Tracking active.`);
        setIsFetchingLocation(false);
        setIsWatchingLocation(true);
      },
      (geoError) => {
        const messages = {
          1: 'Location permission was denied. You can type your location manually.',
          2: 'Location is unavailable right now. Please try again.',
          3: 'Location request timed out. Please try again.',
        };

        setLocationStatus(messages[geoError.code] || 'Could not fetch location.');
        setIsFetchingLocation(false);
        setIsWatchingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    setWatchId(id);
  };

  const allLookingForOptions = [
    ...lookingForOptions,
    ...professionOptions,
  ];

  const filteredLookingFor = allLookingForOptions.filter((option) =>
    option.toLowerCase().includes(lookingForSearch.toLowerCase())
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('No user found');
        alert('No user found. Please login again.');
        setIsLoading(false);
        return;
      }

      // Use email as UID to match MongoDB storage
      const uid = user.email;
      
      console.log('Saving profile with UID:', uid);
      console.log('Profile data:', profileData);
      console.log('Social links:', socialLinks);
      
      const response = await axios.put('/api/profile/update', {
        uid: uid,
        name: profileData.name,
        bio: profileData.bio,
        profession: profileData.profession,
        domain: profileData.domain,
        lookingFor: profileData.lookingFor,
        contactNumber: profileData.contactNumber,
        avatarUrl: profileData.avatarUrl,
        gender: profileData.gender,
        location: profileData.location,
        latitude: profileData.locationCoordinates?.latitude || null,
        longitude: profileData.locationCoordinates?.longitude || null,
        socialLinks: socialLinks,
        isServiceProvider: profileData.isServiceProvider,
        services: profileData.services,
        visibilitySettings: visibilitySettings
      });

      console.log('Response data:', response.data);

      if (response.data.success) {
        setPopupMessage('Profile saved successfully!');
        setPopupType('success');
        setShowPopup(true);
        setTimeout(() => {
          navigate('/profile');
        }, 1500);
      } else {
        setError('Failed to save profile');
        setPopupMessage('Failed to save profile: ' + (response.data.message || response.data.error || 'Unknown error'));
        setPopupType('error');
        setShowPopup(true);
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Error saving profile');
      setPopupMessage('Error saving profile: ' + err.message);
      setPopupType('error');
      setShowPopup(true);
    } finally {
      setIsLoading(false);
    }
  };

  const labelStyle = {
    display: 'block',
    fontWeight: 700,
    color: 'var(--app-text)',
    marginBottom: isMobile ? '6px' : '8px',
    fontSize: isMobile ? '0.9rem' : '1rem',
  };

  const fieldStyle = {
    width: '100%',
    padding: isMobile ? '12px 14px' : '14px 16px',
    border: '1.5px solid rgba(31, 23, 18, 0.14)',
    borderRadius: isMobile ? '12px' : '14px',
    background: 'var(--app-surface-strong)',
    color: 'var(--app-text)',
    boxSizing: 'border-box',
    fontSize: isMobile ? '0.9rem' : '1rem',
    outline: 'none',
    boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.28)',
  };

  const dropdownStyle = {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    maxHeight: isMobile ? '180px' : '200px',
    overflowY: 'auto',
    background: 'var(--app-surface-strong)',
    border: '1px solid var(--app-card-border)',
    borderRadius: isMobile ? '12px' : '14px',
    marginTop: '6px',
    zIndex: 1000,
    boxShadow: 'var(--app-soft-shadow)',
  };

  const chipStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    background: 'linear-gradient(135deg, rgba(239, 111, 150, 0.18), rgba(255, 157, 108, 0.2))',
    color: 'var(--app-text)',
    border: '1px solid rgba(239, 111, 150, 0.2)',
    fontWeight: 700,
  };

  const primaryActionStyle = {
    border: 'none',
    background: 'linear-gradient(135deg, #21120a 0%, #513041 100%)',
    color: '#ffffff',
    fontWeight: 800,
    cursor: 'pointer',
    boxShadow: '0 16px 34px rgba(31, 23, 18, 0.22)',
  };

  const secondaryActionStyle = {
    border: '1px solid rgba(31, 23, 18, 0.12)',
    background: 'rgba(255, 255, 255, 0.62)',
    color: 'var(--app-text)',
    fontWeight: 800,
    cursor: 'pointer',
    boxShadow: 'var(--app-soft-shadow)',
  };

  const avatarSrc =
    profileData.avatarUrl ||
    (profileData.gender === 'Male'
      ? maleImage
      : profileData.gender === 'Female'
        ? femaleImage
        : null);

  return (
    <div
      className="page-shell"
      style={{
        minHeight: '100vh',
        background: 'transparent',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Header />
      <div
        style={{
          flex: 1,
          padding: isMobile ? '12px' : '20px',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            width: '100%',
            maxWidth: isMobile ? '100%' : '820px',
            background: 'var(--app-card-bg)',
            borderRadius: isMobile ? '16px' : '28px',
            border: '1px solid var(--app-card-border)',
            boxShadow: 'var(--app-shadow)',
            backdropFilter: 'blur(18px)',
            padding: isMobile ? '16px' : '28px',
            boxSizing: 'border-box',
            marginBottom: isMobile ? '82px' : '90px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: isMobile ? '16px' : '20px' }}>
            <button
              type="button"
              onClick={() => navigate('/profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: isMobile ? '36px' : '40px',
                height: isMobile ? '36px' : '40px',
                border: '1px solid var(--app-card-border)',
                borderRadius: '50%',
                background: 'var(--app-surface-strong)',
                color: 'var(--app-text)',
                cursor: 'pointer',
                fontSize: isMobile ? '1rem' : '1.2rem',
                fontWeight: 'bold',
                marginRight: isMobile ? '12px' : '16px',
                boxShadow: 'var(--app-soft-shadow)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#21120a';
                e.target.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'var(--app-surface-strong)';
                e.target.style.color = 'var(--app-text)';
              }}
            >
              ←
            </button>
            <h1
              style={{
                margin: '0',
                color: 'var(--app-text)',
                fontSize: isMobile ? '1.3rem' : '2rem',
              }}
            >
              Edit Profile
            </h1>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: isMobile ? '20px' : '24px' }}>
            <div
              style={{
                width: isMobile ? '100px' : '120px',
                height: isMobile ? '100px' : '120px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '4px solid var(--app-surface-strong)',
                boxShadow: 'var(--app-soft-shadow)',
                background: 'var(--app-surface-strong)',
                position: 'relative',
              }}
            >
              {avatarSrc && (
                <img
                  src={avatarSrc}
                  alt={profileData.gender || 'Profile'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
              <label
                htmlFor="photo-upload"
                style={{
                  position: 'absolute',
                  bottom: '0',
                  left: '0',
                  right: '0',
                  background: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  textAlign: 'center',
                  padding: '4px',
                  fontSize: '10px',
                  cursor: 'pointer',
                }}
              >
                Change Photo
              </label>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: isMobile ? '12px' : '16px' }}>
            <label style={labelStyle}>
              Name
            </label>
            <input
              type="text"
              name="name"
              value={profileData.name}
              onChange={handleFieldChange}
              placeholder="Enter your name"
              style={fieldStyle}
              required
            />
          </div>

          <div style={{ marginBottom: isMobile ? '12px' : '16px' }}>
            <label style={labelStyle}>
              Gender
            </label>
            <select
              name="gender"
              value={profileData.gender}
              onChange={handleFieldChange}
              style={fieldStyle}
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div style={{ marginBottom: isMobile ? '12px' : '16px' }}>
            <label style={labelStyle}>
              Contact Number
            </label>
            <input
              type="tel"
              name="contactNumber"
              value={profileData.contactNumber}
              onChange={handleFieldChange}
              placeholder="Enter your contact number"
              style={fieldStyle}
            />
          </div>

          <div style={{ marginBottom: isMobile ? '12px' : '16px' }}>
            <label style={labelStyle}>
              Location
            </label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) auto',
                gap: '10px',
                alignItems: 'start',
              }}
            >
              <input
                type="text"
                name="location"
                value={profileData.location}
                onChange={(event) => {
                  handleFieldChange(event);
                  setLocationStatus('');
                }}
                placeholder="Add your city or fetch current location"
                style={fieldStyle}
              />
              <button
                type="button"
                onClick={handleFetchLocation}
                disabled={isFetchingLocation}
                style={{
                  minHeight: isMobile ? '44px' : '50px',
                  padding: isMobile ? '10px 14px' : '12px 18px',
                  borderRadius: isMobile ? '12px' : '14px',
                  opacity: isFetchingLocation ? 0.72 : 1,
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  ...(isWatchingLocation ? primaryActionStyle : secondaryActionStyle),
                }}
              >
                <FaMapLocationDot aria-hidden="true" />
                {isFetchingLocation ? 'Starting...' : isWatchingLocation ? 'Stop Tracking' : 'Track Location'}
              </button>
            </div>
            {locationStatus && (
              <p
                style={{
                  margin: '8px 0 0',
                  color: 'var(--app-muted-text)',
                  fontSize: isMobile ? '0.78rem' : '0.85rem',
                  fontWeight: 700,
                }}
              >
                {locationStatus}
              </p>
            )}
          </div>

          <div style={{ marginBottom: isMobile ? '12px' : '16px' }}>
            <label style={labelStyle}>
              Domain/Industry
            </label>
            <select
              name="domain"
              value={profileData.domain}
              onChange={handleFieldChange}
              style={fieldStyle}
            >
              <option value="">Select your domain/industry</option>
              {domainOptions.map((domain) => (
                <option key={domain} value={domain}>
                  {domain}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: isMobile ? '12px' : '16px' }}>
            <label style={labelStyle}>
              Bio
            </label>
            <textarea
              name="bio"
              value={profileData.bio}
              onChange={handleFieldChange}
              placeholder="Tell people about yourself"
              rows={isMobile ? 3 : 4}
              style={{ ...fieldStyle, resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ marginBottom: isMobile ? '12px' : '16px' }}>
            <label style={labelStyle}>
              Your Profession
            </label>
            <div style={{ position: 'relative' }} data-profession-dropdown>
              <input
                type="text"
                name="profession"
                value={professionSearch}
                onChange={(e) => {
                  setProfessionSearch(e.target.value);
                  setShowProfessionDropdown(true);
                }}
                onFocus={() => setShowProfessionDropdown(true)}
                placeholder="Search or select your profession"
                style={fieldStyle}
              />
              {showProfessionDropdown && (
                <div
                  style={dropdownStyle}
                >
                  {filteredProfessions.length > 0 ? (
                    filteredProfessions.map((profession) => (
                      <div
                        key={profession}
                        onClick={() => handleProfessionSelect(profession)}
                        style={{
                          padding: isMobile ? '10px 12px' : '12px 16px',
                          cursor: 'pointer',
                          borderBottom: '1px solid #e0e0e0',
                          transition: 'background 0.2s',
                          fontSize: isMobile ? '0.85rem' : '0.9rem',
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(239, 111, 150, 0.1)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                      >
                        {profession}
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: isMobile ? '10px 12px' : '12px 16px', color: '#666', fontSize: isMobile ? '0.85rem' : '0.9rem' }}>
                      No professions found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div style={{ marginBottom: isMobile ? '18px' : '22px' }}>
            <label style={labelStyle}>
              Looking For
            </label>
            <div style={{ position: 'relative' }} data-looking-for-dropdown>
              <input
                type="text"
                name="lookingFor"
                value={lookingForSearch}
                onChange={(e) => {
                  setLookingForSearch(e.target.value);
                  setShowLookingForDropdown(true);
                }}
                onFocus={() => setShowLookingForDropdown(true)}
                placeholder="Search or select what you're looking for"
                style={fieldStyle}
              />
              {showLookingForDropdown && (
                <div
                  style={dropdownStyle}
                >
                  {profileData.lookingFor.length > 0 && (
                    <div style={{ padding: isMobile ? '10px 12px' : '12px 16px', borderBottom: '1px solid rgba(31, 23, 18, 0.1)', background: 'rgba(255, 255, 255, 0.42)' }}>
                      <div style={{ fontSize: isMobile ? '0.75rem' : '0.8rem', fontWeight: 'bold', color: '#666', marginBottom: isMobile ? '6px' : '8px' }}>
                        Selected:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: isMobile ? '4px' : '6px' }}>
                        {profileData.lookingFor.map((item) => (
                          <span
                            key={item}
                            style={{
                              ...chipStyle,
                              padding: isMobile ? '3px 8px' : '4px 10px',
                              borderRadius: isMobile ? '10px' : '12px',
                              fontSize: isMobile ? '0.7rem' : '0.75rem',
                            }}
                          >
                            {item}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeLookingForItem(item);
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--app-text)',
                                cursor: 'pointer',
                                fontSize: isMobile ? '0.8rem' : '0.9rem',
                                padding: '0',
                                lineHeight: '1',
                              }}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {filteredLookingFor.length > 0 ? (
                    filteredLookingFor.map((option) => (
                      <div
                        key={option}
                        onClick={() => handleLookingForSelect(option)}
                        style={{
                          padding: isMobile ? '10px 12px' : '12px 16px',
                          cursor: 'pointer',
                          borderBottom: '1px solid #e0e0e0',
                          transition: 'background 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: isMobile ? '0.85rem' : '0.9rem',
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(239, 111, 150, 0.1)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                      >
                        <span>{option}</span>
                        {profileData.lookingFor.includes(option) && (
                          <span style={{ color: '#513041', fontWeight: 'bold', fontSize: isMobile ? '0.85rem' : '0.9rem' }}>✓</span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: isMobile ? '10px 12px' : '12px 16px', color: '#666', fontSize: isMobile ? '0.85rem' : '0.9rem' }}>
                      No options found
                    </div>
                  )}
                </div>
              )}
            </div>
            {profileData.lookingFor.length > 0 && (
              <div style={{ marginTop: isMobile ? '10px' : '12px', display: 'flex', flexWrap: 'wrap', gap: isMobile ? '6px' : '8px' }}>
                {profileData.lookingFor.map((item) => (
                  <span
                    key={item}
                    style={{
                      ...chipStyle,
                      padding: isMobile ? '6px 12px' : '8px 14px',
                      borderRadius: isMobile ? '16px' : '20px',
                      fontSize: isMobile ? '0.8rem' : '0.85rem',
                    }}
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => removeLookingForItem(item)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--app-text)',
                        cursor: 'pointer',
                        fontSize: isMobile ? '0.9rem' : '1rem',
                        padding: '0',
                        lineHeight: '1',
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginBottom: isMobile ? '18px' : '22px' }}>
            <label style={labelStyle}>
              Service Provider
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: isMobile ? '12px' : '16px' }}>
              <input
                type="checkbox"
                id="is-service-provider"
                checked={profileData.isServiceProvider}
                onChange={(e) => {
                  setProfileData(prev => ({ ...prev, isServiceProvider: e.target.checked }));
                  if (!e.target.checked) {
                    setProfileData(prev => ({ ...prev, services: [] }));
                  }
                }}
                style={{
                  width: isMobile ? '20px' : '24px',
                  height: isMobile ? '20px' : '24px',
                  cursor: 'pointer',
                  accentColor: '#ef6f96',
                }}
              />
              <label htmlFor="is-service-provider" style={{ cursor: 'pointer', fontWeight: '600', color: 'var(--app-text)' }}>
                I am a service provider
              </label>
            </div>
            
            {profileData.isServiceProvider && (
              <div style={{ position: 'relative' }}>
                <label style={{ ...labelStyle, marginBottom: isMobile ? '6px' : '8px' }}>
                  Services Offered
                </label>
                <div
                  data-service-dropdown
                  style={{ position: 'relative' }}
                >
                  <input
                    type="text"
                    value={profileData.services.join(', ')}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '') {
                        setProfileData(prev => ({ ...prev, services: [] }));
                      }
                    }}
                    placeholder="Select services you offer"
                    onClick={() => setShowLookingForDropdown(false)}
                    readOnly
                    style={{
                      ...fieldStyle,
                      cursor: 'pointer',
                      background: 'var(--app-surface-strong)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowLookingForDropdown(false);
                      setShowServiceDropdown(!showServiceDropdown);
                    }}
                    style={{
                      position: 'absolute',
                      right: isMobile ? '12px' : '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: isMobile ? '1rem' : '1.1rem',
                      color: 'var(--app-text)',
                      padding: '0',
                    }}
                  >
                    ▼
                  </button>
                  {showServiceDropdown && (
                    <div
                      style={dropdownStyle}
                    >
                      {profileData.services.length > 0 && (
                        <div style={{ padding: isMobile ? '10px 12px' : '12px 16px', borderBottom: '1px solid rgba(31, 23, 18, 0.1)', background: 'rgba(255, 255, 255, 0.42)' }}>
                          <div style={{ fontSize: isMobile ? '0.75rem' : '0.8rem', fontWeight: 'bold', color: '#666', marginBottom: isMobile ? '6px' : '8px' }}>
                            Selected:
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: isMobile ? '4px' : '6px' }}>
                            {profileData.services.map((item) => (
                              <span
                                key={item}
                                style={{
                                  ...chipStyle,
                                  padding: isMobile ? '3px 8px' : '4px 10px',
                                  borderRadius: isMobile ? '10px' : '12px',
                                  fontSize: isMobile ? '0.7rem' : '0.75rem',
                                }}
                              >
                                {item}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setProfileData(prev => ({
                                      ...prev,
                                      services: prev.services.filter(s => s !== item)
                                    }));
                                  }}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--app-text)',
                                    cursor: 'pointer',
                                    fontSize: isMobile ? '0.8rem' : '0.9rem',
                                    padding: '0',
                                    lineHeight: '1',
                                  }}
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {serviceOptions.map((option) => (
                        <div
                          key={option}
                          onClick={() => {
                            if (!profileData.services.includes(option)) {
                              setProfileData(prev => ({
                                ...prev,
                                services: [...prev.services, option]
                              }));
                            }
                          }}
                          style={{
                            padding: isMobile ? '10px 12px' : '12px 16px',
                            cursor: 'pointer',
                            borderBottom: '1px solid #e0e0e0',
                            transition: 'background 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: isMobile ? '0.85rem' : '0.9rem',
                          }}
                          onMouseEnter={(e) => e.target.style.background = 'rgba(239, 111, 150, 0.1)'}
                          onMouseLeave={(e) => e.target.style.background = 'transparent'}
                        >
                          <span>{option}</span>
                          {profileData.services.includes(option) && (
                            <span style={{ color: '#513041', fontWeight: 'bold', fontSize: isMobile ? '0.85rem' : '0.9rem' }}>✓</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {profileData.services.length > 0 && (
                  <div style={{ marginTop: isMobile ? '10px' : '12px', display: 'flex', flexWrap: 'wrap', gap: isMobile ? '6px' : '8px' }}>
                    {profileData.services.map((item) => (
                      <span
                        key={item}
                        style={{
                          ...chipStyle,
                          padding: isMobile ? '6px 12px' : '8px 14px',
                          borderRadius: isMobile ? '16px' : '20px',
                          fontSize: isMobile ? '0.8rem' : '0.85rem',
                        }}
                      >
                        {item}
                        <button
                          type="button"
                          onClick={() => {
                            setProfileData(prev => ({
                              ...prev,
                              services: prev.services.filter(s => s !== item)
                            }));
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--app-text)',
                            cursor: 'pointer',
                            fontSize: isMobile ? '0.9rem' : '1rem',
                            padding: '0',
                            lineHeight: '1',
                          }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ marginBottom: isMobile ? '18px' : '22px' }}>
            <label style={labelStyle}>
              Social Links
            </label>
            {socialLinks.map((link, index) => (
              <div
                key={index}
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr auto',
                  gap: '10px',
                  marginBottom: '12px',
                  alignItems: 'start',
                }}
              >
                <div>
                  <input
                    type="text"
                    value={link.title}
                    onChange={(e) => handleSocialLinkChange(index, 'title', e.target.value)}
                    placeholder="Title (e.g., LinkedIn, Twitter)"
                    style={{ ...fieldStyle, padding: '12px 14px', borderRadius: '12px' }}
                  />
                </div>
                <div>
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => handleSocialLinkChange(index, 'url', e.target.value)}
                    placeholder="URL (e.g., https://linkedin.com/in/username)"
                    style={{ ...fieldStyle, padding: '12px 14px', borderRadius: '12px' }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeSocialLink(index)}
                  disabled={socialLinks.length === 1}
                  style={{
                    padding: isMobile ? '10px 12px' : '12px 16px',
                    border: '1px solid rgba(31, 23, 18, 0.12)',
                    borderRadius: isMobile ? '10px' : '12px',
                    background: socialLinks.length === 1 ? 'rgba(31, 23, 18, 0.08)' : 'rgba(239, 111, 150, 0.14)',
                    color: 'var(--app-text)',
                    fontWeight: 700,
                    cursor: socialLinks.length === 1 ? 'not-allowed' : 'pointer',
                    fontSize: isMobile ? '0.85rem' : '0.9rem',
                    minWidth: isMobile ? '100%' : 'auto',
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addSocialLink}
              style={{
                padding: isMobile ? '10px 16px' : '12px 20px',
                border: '1.5px dashed rgba(31, 23, 18, 0.28)',
                borderRadius: isMobile ? '10px' : '12px',
                background: 'rgba(255, 255, 255, 0.34)',
                color: 'var(--app-text)',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: isMobile ? '0.85rem' : '0.95rem',
                width: '100%',
              }}
            >
              + Add Another Link
            </button>
          </div>

          <div style={{ marginBottom: isMobile ? '18px' : '22px' }}>
            <label style={labelStyle}>
              Profile Visibility Settings
            </label>
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.5)',
              borderRadius: isMobile ? '12px' : '16px',
              padding: isMobile ? '16px' : '20px',
              border: '1px solid rgba(31, 23, 18, 0.12)'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: isMobile ? '12px' : '16px' }}>
                {[
                  { key: 'show_name', label: 'Show Name' },
                  { key: 'show_bio', label: 'Show Bio' },
                  { key: 'show_looking_for', label: 'Show Looking For' },
                  { key: 'show_services', label: 'Show Services' }
                ].map(({ key, label }) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: isMobile ? '0.85rem' : '0.9rem', color: 'var(--app-text)' }}>{label}</span>
                    <button
                      type="button"
                      onClick={() => setVisibilitySettings(prev => ({ ...prev, [key]: !prev[key] }))}
                      style={{
                        width: isMobile ? '44px' : '48px',
                        height: isMobile ? '24px' : '26px',
                        borderRadius: isMobile ? '12px' : '13px',
                        background: visibilitySettings[key] 
                          ? 'linear-gradient(135deg, #ef6f96, #513041)' 
                          : 'rgba(31, 23, 18, 0.2)',
                        border: 'none',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'background 0.3s ease',
                        padding: 0
                      }}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          top: isMobile ? '2px' : '3px',
                          left: visibilitySettings[key] ? 'auto' : isMobile ? '2px' : '3px',
                          right: visibilitySettings[key] ? isMobile ? '2px' : '3px' : 'auto',
                          width: isMobile ? '20px' : '22px',
                          height: isMobile ? '20px' : '22px',
                          borderRadius: '50%',
                          background: 'white',
                          transition: 'left 0.3s ease, right 0.3s ease',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                        }}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: isMobile ? '12px' : '15px',
              borderRadius: isMobile ? '12px' : '16px',
              ...primaryActionStyle,
              fontSize: isMobile ? '0.9rem' : '1rem',
            }}
          >
            Save Profile
          </button>
        </form>
      </div>

      {showPopup && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setShowPopup(false)}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: '20px',
              padding: '32px',
              maxWidth: '400px',
              width: '100%',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              position: 'relative',
              textAlign: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: popupType === 'success' 
                  ? 'linear-gradient(135deg, #10b981, #059669)' 
                  : 'linear-gradient(135deg, #ef4444, #dc2626)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '32px',
                color: 'white'
              }}
            >
              {popupType === 'success' ? '✓' : '✕'}
            </div>
            <h2 style={{ margin: '0 0 8px', color: '#1f172a', fontSize: '24px' }}>
              {popupType === 'success' ? 'Success' : 'Error'}
            </h2>
            <p style={{ margin: '0', color: '#64748b', fontSize: '14px' }}>
              {popupMessage}
            </p>
            <button
              onClick={() => setShowPopup(false)}
              style={{
                width: '100%',
                padding: '14px 24px',
                background: popupType === 'success' 
                  ? 'linear-gradient(135deg, #10b981, #059669)' 
                  : 'linear-gradient(135deg, #ef4444, #dc2626)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                marginTop: '20px',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      <NavigationBar />
    </div>
  );
}

export default EditProfilePage;

