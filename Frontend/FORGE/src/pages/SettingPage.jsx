import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IoArrowBack, IoTrashOutline, IoLogOutOutline, IoDocumentTextOutline } from 'react-icons/io5';
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
      <Header />
      <div className="settings-card">
        <div className="settings-card__header">
          <Link to="/profile" className="settings-card__back" aria-label="Back to profile">
            <IoArrowBack />
          </Link>
          <div>
            <span className="settings-card__eyebrow">
              <IoTrashOutline />
              Account
            </span>
            <h1>Settings</h1>
          </div>
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
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                color: 'white',
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

      <NavigationBar />
    </div>
  );
}

export default SettingPage;