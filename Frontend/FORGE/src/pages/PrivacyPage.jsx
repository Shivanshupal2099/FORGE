import { Link, useNavigate } from 'react-router-dom';
import Header from '../Components/Header';
import NavigationBar from '../Components/NavigationBar';
import './PrivacyPage.css';

function PrivacyPage() {
  const navigate = useNavigate();
  
  const handleBack = () => {
    // Check if there's a previous page in history
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // If no history, go to home
      navigate('/');
    }
  };
  
  return (
    <div className="page-shell">
      <Header />
      <div className="page-container">
        <div className="privacy-page">
          <button 
            onClick={handleBack}
            className="privacy-page__back"
          >
            ← Back
          </button>
          
          <div className="privacy-page__header">
            <div className="privacy-page__icon">🔒</div>
            <h1 className="privacy-page__title">Privacy Policy</h1>
            <p className="privacy-page__subtitle">How we protect and handle your data</p>
            <p className="privacy-page__date">Last Updated: August 4, 2026</p>
          </div>

          <div className="privacy-page__intro">
            <p>Welcome to ForgeConnect. We value your privacy and are committed to protecting your personal information.</p>
            <p>This Privacy Policy explains how we collect, use, and safeguard your data when you use our platform. By using ForgeConnect, you agree to the practices described in this policy.</p>
          </div>

          <section className="privacy-page__section">
            <h2 className="privacy-page__section-title">1. Information We Collect</h2>
            <p>We collect information you provide directly to us, including:</p>
            <ul className="privacy-page__list">
              <li><strong>Account Information:</strong> Name, email, profile picture, bio, and other details you provide when creating your account.</li>
              <li><strong>Profile Data:</strong> Profession, domain, location, interests, and other profile preferences.</li>
              <li><strong>Payment Information:</strong> Payment details processed securely through Cashfree (we do not store complete card information).</li>
              <li><strong>Usage Data:</strong> How you interact with our platform, features you use, and your preferences.</li>
            </ul>
          </section>

          <section className="privacy-page__section">
            <h2 className="privacy-page__section-title">2. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="privacy-page__list">
              <li>Provide, maintain, and improve our Services</li>
              <li>Process transactions and send related information</li>
              <li>Send technical notices and support messages</li>
              <li>Respond to comments and questions</li>
              <li>Monitor and analyze trends, usage, and activities</li>
              <li>Detect, prevent, and address technical issues and fraud</li>
            </ul>
          </section>

          <section className="privacy-page__section">
            <h2 className="privacy-page__section-title">3. Information Sharing</h2>
            <p>We do not sell or rent your personal information to advertisers or third parties.</p>
            <p>We may share your information only in the following circumstances:</p>
            <ul className="privacy-page__list">
              <li><strong>Service Providers:</strong> With trusted third parties who assist in operating our platform (e.g., Cashfree for payments, authentication providers)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, sale, or transfer of assets</li>
              <li><strong>With Your Consent:</strong> When you explicitly authorize us to share your information</li>
            </ul>
          </section>

          <section className="privacy-page__section">
            <h2 className="privacy-page__section-title">4. Data Security</h2>
            <p>We implement appropriate security measures to protect your personal information:</p>
            <ul className="privacy-page__list">
              <li>Secure socket layer (SSL) encryption for data transmission</li>
              <li>Secure payment processing through Cashfree</li>
              <li>Regular security audits and updates</li>
              <li>Restricted access to personal data</li>
            </ul>
            <p className="privacy-page__warning">While we strive to protect your information, no method of transmission over the Internet is 100% secure.</p>
          </section>

          <section className="privacy-page__section">
            <h2 className="privacy-page__section-title">5. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="privacy-page__list">
              <li>Access and update your personal information</li>
              <li>Delete your account and associated data</li>
              <li>Opt-out of marketing communications</li>
              <li>Request information about how we use your data</li>
            </ul>
          </section>

          <section className="privacy-page__section">
            <h2 className="privacy-page__section-title">6. Cookies and Tracking</h2>
            <p>We use cookies and similar technologies to:</p>
            <ul className="privacy-page__list">
              <li>Remember your preferences and settings</li>
              <li>Analyze platform usage and performance</li>
              <li>Provide personalized content</li>
            </ul>
            <p>You can control cookies through your browser settings.</p>
          </section>

          <section className="privacy-page__section">
            <h2 className="privacy-page__section-title">7. Third-Party Services</h2>
            <p>Our platform may include links to third-party websites or integrate with third-party services. These third parties have their own privacy policies. We encourage you to review their privacy policies.</p>
            <p>We are not responsible for the privacy practices of these third parties.</p>
          </section>

          <section className="privacy-page__section">
            <h2 className="privacy-page__section-title">8. Children's Privacy</h2>
            <p>ForgeConnect is not intended for individuals under 18 years of age.</p>
            <p className="privacy-page__warning">We do not knowingly collect personal information from children under 18. If we become aware that we have collected such information, we will take steps to delete it.</p>
          </section>

          <section className="privacy-page__section">
            <h2 className="privacy-page__section-title">9. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.</p>
            <p>Your continued use of the platform after changes constitutes acceptance of the updated policy.</p>
          </section>

          <section className="privacy-page__section">
            <h2 className="privacy-page__section-title">10. Contact Information</h2>
            <p>If you have any questions about this Privacy Policy, please contact us:</p>
            <div className="privacy-page__contact">
              <h3>ForgeConnect Support</h3>
              <p><strong>Email:</strong> palshivanshu2005@gmail.com</p>
              <p><strong>Business Hours:</strong> Monday – Saturday, 10:00 AM – 6:00 PM (IST)</p>
              <p>We aim to respond to privacy-related inquiries within 24–48 business hours.</p>
            </div>
          </section>
        </div>
      </div>
      <NavigationBar isChatPage={false} />
    </div>
  );
}

export default PrivacyPage;
