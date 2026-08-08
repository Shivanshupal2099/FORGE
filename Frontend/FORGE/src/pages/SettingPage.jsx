import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IoArrowBack, IoTrashOutline, IoLogOutOutline, IoDocumentTextOutline, IoShieldCheckmarkOutline, IoChatbubbleEllipsesOutline, IoLogoInstagram, IoMoonOutline, IoSunnyOutline, IoDesktopOutline, IoColorPaletteOutline, IoSettingsOutline, IoNotificationsOutline, IoNotificationsOffOutline } from 'react-icons/io5';
import NavigationBar from '../Components/NavigationBar';
import Header from '../Components/Header';
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '../contexts/AlertContext';
import axios from '../api/axios';

function SettingPage() {
  const { user, signOut } = useAuth();
  const { error: showError, success: showSuccess } = useAlert();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showIssueReportDialog, setShowIssueReportDialog] = useState(false);
  const [issueReport, setIssueReport] = useState({ subject: '', description: '' });
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  
  // Theme state
  const [currentTheme, setCurrentTheme] = useState('light');
  const [accentColor, setAccentColor] = useState('#FFD700');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    pushEnabled: false,
    chatNotifications: true,
    connectionRequests: true,
    eventReminders: true,
    marketingNotifications: false,
  });
  const [isMobile, setIsMobile] = useState(false);
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false);

  // Available themes
  const themes = [
    { id: 'light', name: 'Light', icon: <IoSunnyOutline />, description: 'Clean and bright interface' },
    { id: 'dark', name: 'Dark', icon: <IoMoonOutline />, description: 'Easy on the eyes' },
    { id: 'system', name: 'System', icon: <IoDesktopOutline />, description: 'Follows system preference' },
  ];

  // Available accent colors
  const accentColors = [
    { name: 'Gold', value: '#FFD700' },
    { name: 'Orange', value: '#FF6B00' },
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Green', value: '#10B981' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Teal', value: '#14B8A6' },
  ];

  useEffect(() => {
    // Load saved theme preference
    const savedTheme = localStorage.getItem('forge-theme') || 'light';
    setCurrentTheme(savedTheme);
    setIsDarkMode(savedTheme === 'dark');
    
    const savedAccent = localStorage.getItem('forge-accent') || '#FFD700';
    setAccentColor(savedAccent);
    
    applyTheme(savedTheme, savedAccent);

    // Check if mobile device
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      return /android|iphone|ipad|ipod|windows phone/i.test(userAgent);
    };
    setIsMobile(checkMobile());

    // Load notification settings from localStorage
    const savedNotifications = localStorage.getItem('forge-notification-settings');
    if (savedNotifications) {
      setNotificationSettings(JSON.parse(savedNotifications));
    }
  }, []);

  const applyTheme = (theme, accent) => {
    const root = document.documentElement;
    const body = document.body;
    
    // Apply accent color
    root.style.setProperty('--app-accent-bg', accent);
    
    // Apply theme
    if (theme === 'dark') {
      body.style.setProperty('--app-background', '#0f172a');
      body.style.setProperty('--app-surface', '#1e293b');
      body.style.setProperty('--app-surface-strong', '#334155');
      body.style.setProperty('--app-text', '#f8fafc');
      body.style.setProperty('--app-text-secondary', '#94a3b8');
      body.style.setProperty('--app-border', '#334155');
      body.style.setProperty('--app-card-bg', '#1e293b');
      body.style.setProperty('--app-card-border', '#334155');
      body.style.setProperty('--app-input-bg', '#1e293b');
      body.style.setProperty('--app-input-border', '#334155');
      body.style.setProperty('--app-button-bg', '#334155');
      body.style.setProperty('--app-button-text', '#f8fafc');
      setIsDarkMode(true);
    } else {
      body.style.setProperty('--app-background', '#FFFDF0');
      body.style.setProperty('--app-surface', '#FFFFFF');
      body.style.setProperty('--app-surface-strong', '#F5F5F0');
      body.style.setProperty('--app-text', '#111111');
      body.style.setProperty('--app-text-secondary', '#666666');
      body.style.setProperty('--app-border', '#E0E0D8');
      body.style.setProperty('--app-card-bg', '#FFFFFF');
      body.style.setProperty('--app-card-border', '#E0E0D8');
      body.style.setProperty('--app-input-bg', '#FFFFFF');
      body.style.setProperty('--app-input-border', '#E0E0D8');
      body.style.setProperty('--app-button-bg', '#FFD700');
      body.style.setProperty('--app-button-text', '#000000');
      setIsDarkMode(false);
    }
    
    // Save preferences
    localStorage.setItem('forge-theme', theme);
    localStorage.setItem('forge-accent', accent);
  };

  const handleThemeChange = (theme) => {
    setCurrentTheme(theme);
    applyTheme(theme, accentColor);
    showSuccess(`Theme changed to ${theme.charAt(0).toUpperCase() + theme.slice(1)}`);
  };

  const handleAccentChange = (color) => {
    setAccentColor(color);
    applyTheme(currentTheme, color);
    showSuccess('Accent color updated');
  };

  const handleNotificationToggle = async (setting, value) => {
    setIsUpdatingNotifications(true);
    
    try {
      const updatedSettings = {
        ...notificationSettings,
        [setting]: value
      };
      
      setNotificationSettings(updatedSettings);
      localStorage.setItem('forge-notification-settings', JSON.stringify(updatedSettings));
      
      // If enabling push notifications, request permission
      if (setting === 'pushEnabled' && value === true) {
        if ('Notification' in window) {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            showSuccess('Push notifications enabled');
          } else {
            showSuccess('Push notifications enabled (permission granted)');
          }
        } else {
          showError('Push notifications not supported on this device');
          setNotificationSettings(prev => ({ ...prev, pushEnabled: false }));
        }
      } else if (setting === 'pushEnabled' && value === false) {
        showSuccess('Push notifications disabled');
      } else {
        showSuccess(`${setting.replace(/([A-Z])/g, ' $1').toLowerCase().trim()} updated`);
      }
    } catch (error) {
      console.error('Error updating notification settings:', error);
      showError('Failed to update notification settings');
    } finally {
      setIsUpdatingNotifications(false);
    }
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

  const handleSubmitIssueReport = async () => {
    if (!issueReport.subject.trim() || !issueReport.description.trim()) {
      showError('Please fill in both subject and description');
      return;
    }

    setIsSubmittingReport(true);
    try {
      const response = await axios.post('/api/issues/report', {
        subject: issueReport.subject,
        description: issueReport.description,
        user_email: user?.email
      });

      if (response.data.success) {
        showSuccess('Issue report submitted successfully');
        setShowIssueReportDialog(false);
        setIssueReport({ subject: '', description: '' });
      } else {
        showError(response.data.message || 'Failed to submit issue report');
      }
    } catch (error) {
      console.error('Error submitting issue report:', error);
      showError('Failed to submit issue report. Please try again.');
    } finally {
      setIsSubmittingReport(false);
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
      <Header hideLogo={true} />
      <div className="settings-card">
        <div className="settings-card__header">
          <Link to="/profile" className="settings-card__back" aria-label="Back to profile">
            <IoArrowBack />
          </Link>
          <div>
            <span className="settings-card__eyebrow">
              <IoSettingsOutline />
              Customize
            </span>
            <h1>Settings</h1>
          </div>
        </div>

        {/* Theme Selection Section */}
        <section className="settings-theme-zone" aria-label="Theme Settings">
          <div className="settings-option settings-option--full">
            <div className="settings-option__icon">
              <IoColorPaletteOutline />
            </div>
            <div className="settings-option__content">
              <h2>Theme</h2>
              <p>Choose your preferred display mode</p>
            </div>
          </div>
          <div className="theme-selector">
            {themes.map((theme) => (
              <button
                key={theme.id}
                className={`theme-option ${currentTheme === theme.id ? 'theme-option--active' : ''}`}
                onClick={() => handleThemeChange(theme.id)}
                style={{
                  background: isDarkMode ? '#1e293b' : '#FFFFFF',
                  border: currentTheme === theme.id ? accentColor : isDarkMode ? '#334155' : '#E0E0D8',
                  color: isDarkMode ? '#f8fafc' : '#111111',
                }}
              >
                <div className="theme-option__icon">{theme.icon}</div>
                <div className="theme-option__info">
                  <span className="theme-option__name">{theme.name}</span>
                  <span className="theme-option__description">{theme.description}</span>
                </div>
                {currentTheme === theme.id && (
                  <div className="theme-option__check" style={{ background: accentColor }} />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Accent Color Selection Section */}
        <section className="settings-accent-zone" aria-label="Accent Color">
          <div className="settings-option settings-option--full">
            <div className="settings-option__icon">
              <IoColorPaletteOutline />
            </div>
            <div className="settings-option__content">
              <h2>Accent Color</h2>
              <p>Personalize your interface with accent colors</p>
            </div>
          </div>
          <div className="accent-colors">
            {accentColors.map((color) => (
              <button
                key={color.name}
                className={`accent-color-option ${accentColor === color.value ? 'accent-color-option--active' : ''}`}
                onClick={() => handleAccentChange(color.value)}
                style={{ background: color.value }}
                title={color.name}
              >
                {accentColor === color.value && (
                  <span className="accent-color-option__check">✓</span>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Notification Settings Section - Mobile Only */}
        {isMobile && (
          <section className="settings-notification-zone" aria-label="Notification Settings">
            <div className="settings-option settings-option--full">
              <div className="settings-option__icon">
                <IoNotificationsOutline />
              </div>
              <div className="settings-option__content">
                <h2>Notifications</h2>
                <p>Manage your push notification preferences</p>
              </div>
            </div>

            {/* Push Notifications Master Toggle */}
            <div className="notification-toggle-item">
              <div className="notification-toggle-info">
                <span className="notification-toggle-title">Push Notifications</span>
                <span className="notification-toggle-description">
                  {notificationSettings.pushEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <button
                className={`notification-toggle-switch ${notificationSettings.pushEnabled ? 'notification-toggle-switch--on' : ''}`}
                onClick={() => handleNotificationToggle('pushEnabled', !notificationSettings.pushEnabled)}
                disabled={isUpdatingNotifications}
                aria-label="Toggle push notifications"
              >
                <div className="notification-toggle-slider" />
              </button>
            </div>

            {/* Individual Notification Toggles */}
            {notificationSettings.pushEnabled && (
              <>
                <div className="notification-toggle-item notification-toggle-item--sub">
                  <div className="notification-toggle-info">
                    <span className="notification-toggle-title">Chat Messages</span>
                    <span className="notification-toggle-description">New message notifications</span>
                  </div>
                  <button
                    className={`notification-toggle-switch ${notificationSettings.chatNotifications ? 'notification-toggle-switch--on' : ''}`}
                    onClick={() => handleNotificationToggle('chatNotifications', !notificationSettings.chatNotifications)}
                    disabled={isUpdatingNotifications}
                    aria-label="Toggle chat notifications"
                  >
                    <div className="notification-toggle-slider" />
                  </button>
                </div>

                <div className="notification-toggle-item notification-toggle-item--sub">
                  <div className="notification-toggle-info">
                    <span className="notification-toggle-title">Connection Requests</span>
                    <span className="notification-toggle-description">New collaboration requests</span>
                  </div>
                  <button
                    className={`notification-toggle-switch ${notificationSettings.connectionRequests ? 'notification-toggle-switch--on' : ''}`}
                    onClick={() => handleNotificationToggle('connectionRequests', !notificationSettings.connectionRequests)}
                    disabled={isUpdatingNotifications}
                    aria-label="Toggle connection request notifications"
                  >
                    <div className="notification-toggle-slider" />
                  </button>
                </div>

                <div className="notification-toggle-item notification-toggle-item--sub">
                  <div className="notification-toggle-info">
                    <span className="notification-toggle-title">Event Reminders</span>
                    <span className="notification-toggle-description">Upcoming event alerts</span>
                  </div>
                  <button
                    className={`notification-toggle-switch ${notificationSettings.eventReminders ? 'notification-toggle-switch--on' : ''}`}
                    onClick={() => handleNotificationToggle('eventReminders', !notificationSettings.eventReminders)}
                    disabled={isUpdatingNotifications}
                    aria-label="Toggle event reminder notifications"
                  >
                    <div className="notification-toggle-slider" />
                  </button>
                </div>

                <div className="notification-toggle-item notification-toggle-item--sub">
                  <div className="notification-toggle-info">
                    <span className="notification-toggle-title">Marketing Updates</span>
                    <span className="notification-toggle-description">News and feature updates</span>
                  </div>
                  <button
                    className={`notification-toggle-switch ${notificationSettings.marketingNotifications ? 'notification-toggle-switch--on' : ''}`}
                    onClick={() => handleNotificationToggle('marketingNotifications', !notificationSettings.marketingNotifications)}
                    disabled={isUpdatingNotifications}
                    aria-label="Toggle marketing notifications"
                  >
                    <div className="notification-toggle-slider" />
                  </button>
                </div>
              </>
            )}
          </section>
        )}

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

        <section className="settings-issue-zone" aria-label="Report Issue">
          <div className="settings-option">
            <div className="settings-option__icon">
              <IoDocumentTextOutline />
            </div>
            <div className="settings-option__content">
              <h2>Report Issue</h2>
              <p>Report a bug or problem with the platform.</p>
            </div>
            <button
              type="button"
              className="settings-issue-button"
              onClick={() => setShowIssueReportDialog(true)}
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                background: 'var(--app-accent-bg)',
                color: 'var(--app-accent-text)',
                border: 'none',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Report
            </button>
          </div>
        </section>

        <section className="settings-legal-zone" aria-label="Legal">
          <div className="settings-option">
            <div className="settings-option__icon">
              <IoShieldCheckmarkOutline />
            </div>
            <div className="settings-option__content">
              <h2>Privacy & Security</h2>
              <p>View our privacy policy and learn how we protect your data.</p>
            </div>
            <Link
              to="/privacy"
              className="settings-issue-button"
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                background: 'var(--app-accent-bg)',
                color: 'var(--app-accent-text)',
                border: 'none',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textDecoration: 'none'
              }}
            >
              View
            </Link>
          </div>
        </section>

        <section className="settings-social-zone" aria-label="Connect with Developer">
          <div className="settings-option">
            <div className="settings-option__icon">
              <IoChatbubbleEllipsesOutline />
            </div>
            <div className="settings-option__content">
              <h2>Connect on WhatsApp</h2>
              <p>Join our WhatsApp community for support and updates.</p>
            </div>
            <a
              href="https://chat.whatsapp.com/L8uTSgubfj86hbm6UxQRFi?s=sh&p=i&ilr=0&amv=2"
              target="_blank"
              rel="noopener noreferrer"
              className="settings-issue-button"
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                background: '#25D366',
                color: 'white',
                border: 'none',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textDecoration: 'none'
              }}
            >
              Connect
            </a>
          </div>

          <div className="settings-option">
            <div className="settings-option__icon">
              <IoLogoInstagram />
            </div>
            <div className="settings-option__content">
              <h2>Follow on Instagram</h2>
              <p>Follow us on Instagram for latest updates and features.</p>
            </div>
            <a
              href="https://www.instagram.com/forgeconnect_0?igsh=cmxkZnh1ejJpYXdu"
              target="_blank"
              rel="noopener noreferrer"
              className="settings-issue-button"
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                color: 'white',
                border: 'none',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textDecoration: 'none'
              }}
            >
              Follow
            </a>
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
              <p className="settings-delete-dialog__warning">
                <strong>Warning:</strong> This action is permanent and cannot be undone. Deleting your account will permanently remove your account and all associated data, including your profile, authentication records, payments, subscriptions, notifications, preferences, uploaded files, activity history, and any other data linked to your account. You are solely responsible for this action.
              </p>
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

      {showIssueReportDialog && (
        <div className="settings-delete-dialog-overlay" onClick={() => setShowIssueReportDialog(false)}>
          <div className="settings-delete-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="settings-delete-dialog__header">
              <h2>Report Issue</h2>
              <p>Describe the issue you're experiencing with the platform.</p>
            </div>
            <div className="settings-delete-dialog__content">
              <label htmlFor="issue-subject">Subject</label>
              <input
                id="issue-subject"
                type="text"
                value={issueReport.subject}
                onChange={(e) => setIssueReport({ ...issueReport, subject: e.target.value })}
                placeholder="Brief description of the issue"
                disabled={isSubmittingReport}
                style={{ marginBottom: '16px' }}
              />
              <label htmlFor="issue-description">Description</label>
              <textarea
                id="issue-description"
                value={issueReport.description}
                onChange={(e) => setIssueReport({ ...issueReport, description: e.target.value })}
                placeholder="Detailed description of the issue, steps to reproduce, etc."
                disabled={isSubmittingReport}
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid var(--app-card-border)',
                  background: 'var(--app-surface-strong)',
                  color: 'var(--app-text)',
                  resize: 'vertical'
                }}
              />
            </div>
            <div className="settings-delete-dialog__actions">
              <button
                type="button"
                className="button-secondary"
                onClick={() => {
                  setShowIssueReportDialog(false);
                  setIssueReport({ subject: '', description: '' });
                }}
                disabled={isSubmittingReport}
              >
                Cancel
              </button>
              <button
                type="button"
                className="button-primary settings-delete-confirm"
                onClick={handleSubmitIssueReport}
                disabled={!issueReport.subject.trim() || !issueReport.description.trim() || isSubmittingReport}
              >
                {isSubmittingReport ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        </div>
      )}

      <NavigationBar isChatPage={false} />
    </div>
  );
}

export default SettingPage;