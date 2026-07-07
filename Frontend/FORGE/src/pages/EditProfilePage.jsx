import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavigationBar from '../Components/NavigationBar';
import { useAuth } from '../contexts/AuthContext';

function EditProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { supabase } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [profileData, setProfileData] = useState({
    name: '',
    bio: '',
    profession: '',
    lookingFor: [],
    customLookingFor: '',
    contactNumber: '',
  });
  const [socialLinks, setSocialLinks] = useState([
    { title: '', url: '' }
  ]);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [professionSearch, setProfessionSearch] = useState('');
  const [showProfessionDropdown, setShowProfessionDropdown] = useState(false);
  const [lookingForSearch, setLookingForSearch] = useState('');
  const [showLookingForDropdown, setShowLookingForDropdown] = useState(false);

  useEffect(() => {
    if (!photoFile) {
      return undefined;
    }

    const objectUrl = URL.createObjectURL(photoFile);
    setPhotoPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [photoFile]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Load current user data from Supabase
    const loadUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setProfileData({
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
          bio: user.user_metadata?.bio || '',
          profession: user.user_metadata?.profession || '',
          lookingFor: user.user_metadata?.lookingFor || [],
          customLookingFor: '',
          contactNumber: user.user_metadata?.contactNumber || '',
        });
        setProfessionSearch(user.user_metadata?.profession || '');
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

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
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

  const handlePhotoUpload = (event) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setPhotoFile(selectedFile);
    }
  };

  const lookingForOptions = [
    'Startup Join Team Member',
    'Startup Join as Co-Founder',
    'Mentor',
    'Investor',
    'Team Member for Hackathon',
    'Other',
  ];

  const professionOptions = [
    'Doctor',
    'Surgeon',
    'Nurse',
    'Dentist',
    'Pharmacist',
    'Physiotherapist',
    'Psychologist',
    'Psychiatrist',
    'Veterinarian',
    'Medical Laboratory Scientist',
    'Software Engineer',
    'Data Scientist',
    'AI Engineer',
    'Machine Learning Engineer',
    'Cybersecurity Analyst',
    'Cloud Engineer',
    'DevOps Engineer',
    'Full-Stack Developer',
    'Mobile App Developer',
    'Game Developer',
    'Civil Engineer',
    'Mechanical Engineer',
    'Electrical Engineer',
    'Electronics Engineer',
    'Aerospace Engineer',
    'Chemical Engineer',
    'Biomedical Engineer',
    'Robotics Engineer',
    'Architect',
    'Interior Designer',
    'Lawyer',
    'Judge',
    'Public Prosecutor',
    'Chartered Accountant',
    'Financial Analyst',
    'Investment Banker',
    'Economist',
    'Auditor',
    'Tax Consultant',
    'Insurance Advisor',
    'Teacher',
    'Professor',
    'School Principal',
    'Research Scientist',
    'Lecturer',
    'Business Analyst',
    'Product Manager',
    'Project Manager',
    'Operations Manager',
    'Human Resources Manager',
    'Marketing Manager',
    'Sales Manager',
    'Digital Marketing Specialist',
    'Entrepreneur',
    'Startup Founder',
    'CEO (Chief Executive Officer)',
    'COO (Chief Operating Officer)',
    'CTO (Chief Technology Officer)',
    'Journalist',
    'News Anchor',
    'Content Writer',
    'Copywriter',
    'Technical Writer',
    'Editor',
    'Graphic Designer',
    'UI/UX Designer',
    'Animator',
    'Video Editor',
    'Photographer',
    'Filmmaker',
    'Music Producer',
    'Singer',
    'Actor',
    'Voice Artist',
    'YouTuber',
    'Social Media Manager',
    'Influencer',
    'Pilot',
    'Air Traffic Controller',
    'Flight Attendant',
    'Merchant Navy Officer',
    'Ship Captain',
    'Police Officer',
    'Firefighter',
    'Soldier',
    'Intelligence Officer',
    'Emergency Medical Technician (EMT)',
    'Paramedic',
    'Chef',
    'Hotel Manager',
    'Event Manager',
    'Real Estate Agent',
    'Urban Planner',
    'Environmental Scientist',
    'Agricultural Scientist',
    'Farmer',
    'Supply Chain Manager',
    'Logistics Manager',
    'Electrician',
    'Plumber',
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
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: profileData.name,
          bio: profileData.bio,
          profession: profileData.profession,
          lookingFor: profileData.lookingFor,
          contactNumber: profileData.contactNumber,
          socialLinks: socialLinks
        }
      });

      if (error) {
        setError('Failed to save profile');
        alert('Failed to save profile: ' + error.message);
      } else {
        alert('Profile saved successfully!');
        navigate('/profile');
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Error saving profile');
      alert('Error saving profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="page-shell"
      style={{
        minHeight: '100vh',
        background: '#000000',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
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
            maxWidth: '820px',
            background: '#FFD700',
            borderRadius: isMobile ? '20px' : '28px',
            border: '2px solid #000000',
            boxShadow: '0 20px 50px rgba(255, 215, 0, 0.3)',
            padding: isMobile ? '18px' : '28px',
            boxSizing: 'border-box',
            marginBottom: isMobile ? '82px' : '90px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <button
              type="button"
              onClick={() => navigate('/profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                border: '2px solid #000000',
                borderRadius: '50%',
                background: '#000000',
                color: '#FFD700',
                cursor: 'pointer',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                marginRight: '16px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#FFD700';
                e.target.style.color = '#000000';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#000000';
                e.target.style.color = '#FFD700';
              }}
            >
              ←
            </button>
            <h1
              style={{
                margin: '0',
                color: '#000000',
                fontSize: isMobile ? '1.55rem' : '2rem',
              }}
            >
              Edit Profile
            </h1>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <label style={{ cursor: 'pointer', textAlign: 'center' }}>
              <div
                style={{
                  width: isMobile ? '96px' : '120px',
                  height: isMobile ? '96px' : '120px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '3px solid #d29a00',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                  margin: '0 auto 10px auto',
                  background: '#fff',
                }}
              >
                <img
                  src={photoPreview}
                  alt="Profile preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <span style={{ color: '#000000', fontWeight: 700 }}>Change Profile Photo</span>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
            </label>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 700, color: '#000000', marginBottom: '8px' }}>
              Name
            </label>
            <input
              type="text"
              name="name"
              value={profileData.name}
              onChange={handleFieldChange}
              placeholder="Enter your name"
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '2px solid #000000',
                borderRadius: '14px',
                background: '#FFFFFF',
                boxSizing: 'border-box',
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 700, color: '#000000', marginBottom: '8px' }}>
              Contact Number
            </label>
            <input
              type="tel"
              name="contactNumber"
              value={profileData.contactNumber}
              onChange={handleFieldChange}
              placeholder="Enter your contact number"
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '2px solid #000000',
                borderRadius: '14px',
                background: '#FFFFFF',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 700, color: '#000000', marginBottom: '8px' }}>
              Bio
            </label>
            <textarea
              name="bio"
              value={profileData.bio}
              onChange={handleFieldChange}
              placeholder="Tell people about yourself"
              rows={4}
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '2px solid #000000',
                borderRadius: '14px',
                background: '#FFFFFF',
                boxSizing: 'border-box',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 700, color: '#000000', marginBottom: '8px' }}>
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
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '2px solid #000000',
                  borderRadius: '14px',
                  background: '#FFFFFF',
                  boxSizing: 'border-box',
                }}
              />
              {showProfessionDropdown && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    maxHeight: '200px',
                    overflowY: 'auto',
                    background: '#FFFFFF',
                    border: '2px solid #000000',
                    borderRadius: '14px',
                    marginTop: '4px',
                    zIndex: 1000,
                    boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                  }}
                >
                  {filteredProfessions.length > 0 ? (
                    filteredProfessions.map((profession) => (
                      <div
                        key={profession}
                        onClick={() => handleProfessionSelect(profession)}
                        style={{
                          padding: '12px 16px',
                          cursor: 'pointer',
                          borderBottom: '1px solid #e0e0e0',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#f5f5f5'}
                        onMouseLeave={(e) => e.target.style.background = '#FFFFFF'}
                      >
                        {profession}
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '12px 16px', color: '#666' }}>
                      No professions found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'block', fontWeight: 700, color: '#000000', marginBottom: '12px' }}>
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
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '2px solid #000000',
                  borderRadius: '14px',
                  background: '#FFFFFF',
                  boxSizing: 'border-box',
                }}
              />
              {showLookingForDropdown && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    maxHeight: '200px',
                    overflowY: 'auto',
                    background: '#FFFFFF',
                    border: '2px solid #000000',
                    borderRadius: '14px',
                    marginTop: '4px',
                    zIndex: 1000,
                    boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                  }}
                >
                  {profileData.lookingFor.length > 0 && (
                    <div style={{ padding: '12px 16px', borderBottom: '2px solid #e0e0e0', background: '#f9f9f9' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#666', marginBottom: '8px' }}>
                        Selected:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {profileData.lookingFor.map((item) => (
                          <span
                            key={item}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 10px',
                              background: '#000000',
                              color: '#FFD700',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
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
                                color: '#FFD700',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
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
                          padding: '12px 16px',
                          cursor: 'pointer',
                          borderBottom: '1px solid #e0e0e0',
                          transition: 'background 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#f5f5f5'}
                        onMouseLeave={(e) => e.target.style.background = '#FFFFFF'}
                      >
                        <span>{option}</span>
                        {profileData.lookingFor.includes(option) && (
                          <span style={{ color: '#FFD700', fontWeight: 'bold' }}>✓</span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '12px 16px', color: '#666' }}>
                      No options found
                    </div>
                  )}
                </div>
              )}
            </div>
            {profileData.lookingFor.length > 0 && (
              <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {profileData.lookingFor.map((item) => (
                  <span
                    key={item}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      background: '#000000',
                      color: '#FFD700',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                    }}
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => removeLookingForItem(item)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#FFD700',
                        cursor: 'pointer',
                        fontSize: '1rem',
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

          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'block', fontWeight: 700, color: '#000000', marginBottom: '12px' }}>
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
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      border: '2px solid #000000',
                      borderRadius: '12px',
                      background: '#FFFFFF',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => handleSocialLinkChange(index, 'url', e.target.value)}
                    placeholder="URL (e.g., https://linkedin.com/in/username)"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      border: '2px solid #000000',
                      borderRadius: '12px',
                      background: '#FFFFFF',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeSocialLink(index)}
                  disabled={socialLinks.length === 1}
                  style={{
                    padding: '12px 16px',
                    border: '2px solid #000000',
                    borderRadius: '12px',
                    background: socialLinks.length === 1 ? '#666666' : '#000000',
                    color: '#FFD700',
                    fontWeight: 700,
                    cursor: socialLinks.length === 1 ? 'not-allowed' : 'pointer',
                    fontSize: '0.9rem',
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
                padding: '12px 20px',
                border: '2px dashed #000000',
                borderRadius: '12px',
                background: 'transparent',
                color: '#000000',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.95rem',
                width: '100%',
              }}
            >
              + Add Another Link
            </button>
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '15px',
              border: '2px solid #000000',
              borderRadius: '16px',
              background: '#000000',
              color: '#FFD700',
              fontWeight: 800,
              fontSize: isMobile ? '0.95rem' : '1rem',
              cursor: 'pointer',
              boxShadow: '0 12px 25px rgba(0,0,0,0.4)',
            }}
          >
            Save Profile
          </button>
        </form>
      </div>

      <NavigationBar />
    </div>
  );
}

export default EditProfilePage;
