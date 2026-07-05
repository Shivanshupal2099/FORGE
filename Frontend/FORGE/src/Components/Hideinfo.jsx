import React, { useState } from 'react';
import './Hideinfo.css';

const Hideinfo = () => {
  const [privacySettings, setPrivacySettings] = useState({
    name: false,
    photo: false,
    location: false,
    lookingFor: false
  });

  const toggleSetting = (setting) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  return (
    <>
      <h2 className="hideinfo-title">Privacy Settings</h2>
      <p className="hideinfo-subtitle">Control what you share publicly</p>
      
      <div className="privacy-options">
        <div className="privacy-option">
          <div className="option-info">
            <span className="option-label">Name</span>
            <span className="option-description">Share your name with others</span>
          </div>
          <button 
            className={`toggle-button ${privacySettings.name ? 'on' : 'off'}`}
            onClick={() => toggleSetting('name')}
            aria-label="Toggle name visibility"
          >
            <span className="toggle-slider"></span>
          </button>
        </div>

        <div className="privacy-option">
          <div className="option-info">
            <span className="option-label">Photo</span>
            <span className="option-description">Share your profile photo</span>
          </div>
          <button 
            className={`toggle-button ${privacySettings.photo ? 'on' : 'off'}`}
            onClick={() => toggleSetting('photo')}
            aria-label="Toggle photo visibility"
          >
            <span className="toggle-slider"></span>
          </button>
        </div>

        <div className="privacy-option">
          <div className="option-info">
            <span className="option-label">Live Location</span>
            <span className="option-description">Share your real-time location</span>
          </div>
          <button 
            className={`toggle-button ${privacySettings.location ? 'on' : 'off'}`}
            onClick={() => toggleSetting('location')}
            aria-label="Toggle location visibility"
          >
            <span className="toggle-slider"></span>
          </button>
        </div>

        <div className="privacy-option">
          <div className="option-info">
            <span className="option-label">Looking For</span>
            <span className="option-description">Share what you're looking for</span>
          </div>
          <button 
            className={`toggle-button ${privacySettings.lookingFor ? 'on' : 'off'}`}
            onClick={() => toggleSetting('lookingFor')}
            aria-label="Toggle looking for visibility"
          >
            <span className="toggle-slider"></span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Hideinfo;
