import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IoArrowBack, IoColorPaletteOutline, IoMoonOutline, IoSparklesOutline, IoSunnyOutline } from 'react-icons/io5';
import NavigationBar from '../Components/NavigationBar';
import Header from '../Components/Header';

const THEME_KEY = 'forge-theme';

function SettingPage() {
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'sunset');
  const isMonoTheme = theme === 'mono';

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'sunset' ? 'mono' : 'sunset'));
  };

  return (
    <div className="page-shell settings-page">
      <Header />
      <div className="settings-card">
        <div className="settings-card__header">
          <Link to="/profile" className="settings-card__back" aria-label="Back to profile">
            <IoArrowBack />
          </Link>
          <div>
            <span className="settings-card__eyebrow">
              <IoColorPaletteOutline />
              Appearance
            </span>
            <h1>Settings</h1>
          </div>
        </div>

        <section className="settings-hero" aria-label="Current theme">
          <div className="settings-hero__visual">
            <span />
            <span />
            <span />
          </div>
          <div className="settings-option">
            <div className="settings-option__icon">
              {isMonoTheme ? <IoMoonOutline /> : <IoSunnyOutline />}
            </div>
            <div className="settings-option__content">
              <h2>{isMonoTheme ? 'Black & white mode' : 'Sunset mode'}</h2>
              <p>{isMonoTheme ? 'Sharp contrast, clean cards, and editorial black accents.' : 'Warm color, glass surfaces, and softer depth across the app.'}</p>
            </div>
            <button
              type="button"
              className={`settings-theme-toggle ${isMonoTheme ? 'settings-theme-toggle--on' : ''}`}
              onClick={toggleTheme}
              aria-pressed={isMonoTheme}
            >
              <span className="settings-theme-toggle__thumb" />
            </button>
          </div>
        </section>

        <div className="settings-theme-preview">
          <button type="button" className={`settings-theme-choice ${!isMonoTheme ? 'active' : ''}`} onClick={() => setTheme('sunset')}>
            <span className="settings-theme-choice__swatch settings-theme-choice__swatch--sunset" />
            <span>
              <strong>Sunset</strong>
              <small>Warm glass UI</small>
            </span>
          </button>
          <button type="button" className={`settings-theme-choice ${isMonoTheme ? 'active' : ''}`} onClick={() => setTheme('mono')}>
            <span className="settings-theme-choice__swatch settings-theme-choice__swatch--mono" />
            <span>
              <strong>Black & white</strong>
              <small>Bold minimal UI</small>
            </span>
          </button>
        </div>

        <div className="settings-note">
          <IoSparklesOutline />
          <span>The selected theme is saved on this device and applied across FORGE.</span>
        </div>
      </div>

      <NavigationBar />
    </div>
  );
}

export default SettingPage;
