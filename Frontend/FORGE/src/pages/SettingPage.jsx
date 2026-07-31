import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IoArrowBack, IoColorPaletteOutline, IoMoonOutline, IoSparklesOutline, IoSunnyOutline, IoTrashOutline, IoLogOutOutline } from 'react-icons/io5';
import NavigationBar from '../Components/NavigationBar';
import Header from '../Components/Header';
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '../contexts/AlertContext';
import axios from '../api/axios';
const THEME_KEY = 'forge-theme';



function SettingPage() {
  const { user, signOut } = useAuth();
  const { error: showError, success: showSuccess } = useAlert();
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'sunset');
  const isMonoTheme = theme === 'mono';
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'sunset' ? 'mono' : 'sunset'));
  };

  const handleSignOut = async () => {
    try {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('forge-theme');
      
      // Sign out from Supabase
      await signOut();
      
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Error signing out:', error);
      showError('An error occurred while signing out. Please try again.');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') return;

    if (!user) {
      showError('You are not authenticated. Please log in again.');
      return;
    }

    setIsDeleting(true);
    try {
      console.log('Deleting account for user:', user.email);
      const response = await axios.delete('/api/auth/delete-account');

      // Check HTTP status first
      if (response.status === 200 || response.status === 204) {
        // Success - clear local storage
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('forge-theme');
        
        // Sign out from Supabase
        try {
          await signOut();
        } catch (signOutError) {
          console.error('Error signing out from Supabase:', signOutError);
          // Continue with redirect even if signOut fails
        }
        
        showSuccess('Account deleted successfully');
        
        // Redirect to login page (not home, since account is deleted)
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      } else {
        // Non-success HTTP status
        const errorMessage = response.data?.message || `Server returned status ${response.status}`;
        showError(`Failed to delete account: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      
      // Handle different error scenarios
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const message = error.response.data?.message || 'Unknown error';
        
        switch (status) {
          case 401:
            showError('Authentication failed. Please log in again and try.');
            break;
          case 403:
            showError('You do not have permission to delete this account.');
            break;
          case 404:
            showError('Delete account endpoint not found. Please contact support.');
            break;
          case 500:
            showError('Server error. Please try again later.');
            break;
          default:
            showError(`Failed to delete account: ${message}`);
        }
      } else if (error.request) {
        // Request made but no response received
        showError('Network error. Please check your connection and try again.');
      } else {
        // Error in request setup
        showError(`Error: ${error.message}`);
      }
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setDeleteConfirmation('');
    }
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
          <span>The selected theme is saved on this device and applied across ForgeConnect.</span>
        </div>

        <section className="settings-signout-zone" aria-label="Sign out">
          <div className="settings-option">
            <div className="settings-option__icon">
              <IoLogOutOutline />
            </div>
            <div className="settings-option__content">
              <h2>Sign Out</h2>
              <p>Sign out of your account on this device.</p>
            </div>
            <button
              type="button"
              className="settings-signout-button"
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </div>
        </section>

        <section className="settings-danger-zone" aria-label="Danger zone">
          <div className="settings-option">
            <div className="settings-option__icon">
              <IoTrashOutline />
            </div>
            <div className="settings-option__content">
              <h2>Delete Account</h2>
              <p>Permanently delete your account and all associated data. This action cannot be undone.</p>
            </div>
            <button
              type="button"
              className="settings-delete-button"
              onClick={() => setShowDeleteDialog(true)}
            >
              Delete Account
            </button>
          </div>
        </section>
      </div>

      {showDeleteDialog && (
        <div className="settings-delete-dialog-overlay" onClick={() => setShowDeleteDialog(false)}>
          <div className="settings-delete-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="settings-delete-dialog__header">
              <h2>Delete Account</h2>
              <p>Are you sure you want to delete your account? This action is permanent and cannot be undone.</p>
            </div>
            <div className="settings-delete-dialog__content">
              <label htmlFor="delete-confirmation">
                Type <strong>DELETE</strong> to confirm:
              </label>
              <input
                id="delete-confirmation"
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="DELETE"
                disabled={isDeleting}
              />
            </div>
            <div className="settings-delete-dialog__actions">
              <button
                type="button"
                className="button-secondary"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setDeleteConfirmation('');
                }}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="button-primary settings-delete-confirm"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmation !== 'DELETE' || isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      <NavigationBar />
    </div>
  );
}

export default SettingPage;