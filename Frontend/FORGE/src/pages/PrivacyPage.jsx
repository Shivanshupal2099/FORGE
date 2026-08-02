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
            <div className="privacy-page__icon">📜</div>
            <h1 className="privacy-page__title">Terms and Conditions</h1>
            <p className="privacy-page__subtitle">Your legal agreement with ForgeConnect</p>
            <p className="privacy-page__date">Last Updated: August 1, 2026</p>
          </div>

          <div className="privacy-page__intro">
            <p>Welcome to ForgeConnect.</p>
            <p>These Terms and Conditions govern your access to and use of the ForgeConnect website, applications, software, APIs, premium services, digital products, and all related services (collectively referred to as the "Services").</p>
            <p>By accessing, registering, browsing, or using ForgeConnect, you confirm that you have read, understood, and agree to comply with these Terms and Conditions. If you do not agree with any part of these Terms and Conditions, you must stop using the Services immediately.</p>
          </div>

          <section className="privacy-page__section">
            <h2 className="privacy-page__section-title">1. Definitions</h2>
            <p>For the purpose of these Terms:</p>
            <ul className="privacy-page__list">
              <li><strong>ForgeConnect</strong> refers to the website, platform, applications, APIs, and all related services.</li>
              <li><strong>User</strong> means any individual who creates an account or accesses the Services.</li>
              <li><strong>Account</strong> means a registered ForgeConnect account.</li>
              <li><strong>Services</strong> include all features, tools, subscriptions, premium memberships, digital products, and content provided through ForgeConnect.</li>
              <li><strong>Community Guidelines</strong> refer to the rules that govern user behavior on the platform.</li>
            </ul>
          </section>

          <section className="privacy-page__section">
            <h2 className="privacy-page__section-title">2. Eligibility</h2>
            <p>ForgeConnect is intended only for individuals who are 18 years of age or older.</p>
            <p>By creating an account, you represent and warrant that:</p>
            <ul className="privacy-page__list">
              <li>You are at least 18 years old.</li>
              <li>You are legally capable of entering into a binding agreement.</li>
              <li>All information provided by you is accurate and truthful.</li>
            </ul>
            <p className="privacy-page__warning">Individuals below the age of 18 years are strictly prohibited from creating an account or using ForgeConnect.</p>
            <p>If ForgeConnect discovers that an account belongs to a person under the age of 18, the account may be suspended or permanently terminated immediately without prior notice.</p>
          </section>

          <section className="privacy-page__section">
            <h2 className="privacy-page__section-title">3. User Registration</h2>
            <p>To access certain features, users must create an account.</p>
            <p>When registering, you agree to:</p>
            <ul className="privacy-page__list">
              <li>Provide accurate information.</li>
              <li>Maintain the security of your account.</li>
              <li>Keep your login credentials confidential.</li>
              <li>Update your information whenever necessary.</li>
            </ul>
            <p>You are solely responsible for all activities performed through your account.</p>
          </section>

          <section className="privacy-page__section">
            <h2 className="privacy-page__section-title">4. Account Security</h2>
            <p>Users are responsible for maintaining the confidentiality of their passwords and authentication credentials.</p>
            <p>ForgeConnect shall not be responsible for any unauthorized access resulting from:</p>
            <ul className="privacy-page__list">
              <li>Sharing passwords.</li>
              <li>Weak passwords.</li>
              <li>User negligence.</li>
              <li>Device compromise.</li>
            </ul>
            <p>If you suspect unauthorized access, you should immediately contact us.</p>
          </section>

          <section className="privacy-page__section">
            <h2 className="privacy-page__section-title">5. Acceptable Use</h2>
            <p>Users agree that they will not use ForgeConnect for any unlawful or harmful purpose.</p>
            <p>You must not:</p>
            <ul className="privacy-page__list">
              <li>Violate any applicable law.</li>
              <li>Upload malicious software.</li>
              <li>Attempt to hack or gain unauthorized access.</li>
              <li>Reverse engineer any part of the platform.</li>
              <li>Interfere with platform operations.</li>
              <li>Use automated bots to abuse the Services.</li>
              <li>Conduct phishing or fraud.</li>
              <li>Impersonate another person.</li>
              <li>Distribute spam.</li>
              <li>Circumvent platform security.</li>
              <li>Engage in activities that may damage ForgeConnect or its users.</li>
            </ul>
          </section>

          <section className="privacy-page__section">
            <h2 className="privacy-page__section-title">6. Community Guidelines</h2>
            <p>ForgeConnect is committed to maintaining a respectful, inclusive, and safe community.</p>
            <p>Users must not:</p>
            <ul className="privacy-page__list">
              <li>Harass, bully, or threaten others.</li>
              <li>Promote violence or terrorism.</li>
              <li>Spread hate speech or discriminatory content.</li>
              <li>Upload obscene or sexually explicit material.</li>
              <li>Share illegal or pirated content.</li>
              <li>Publish misleading or fraudulent information.</li>
              <li>Create fake accounts for abuse or deception.</li>
              <li>Infringe upon copyrights or trademarks.</li>
              <li>Encourage self-harm or criminal activity.</li>
            </ul>
            <p>ForgeConnect reserves the right to remove any content that violates these guidelines.</p>
          </section>

          <section className="privacy-page__section">
            <h2 className="privacy-page__section-title">7. Content Moderation</h2>
            <p>ForgeConnect may review reports submitted by users and investigate violations of these Terms.</p>
            <p>ForgeConnect reserves the right to:</p>
            <ul className="privacy-page__list">
              <li>Remove content.</li>
              <li>Restrict access to specific features.</li>
              <li>Suspend accounts.</li>
              <li>Permanently terminate accounts.</li>
              <li>Cooperate with law enforcement where legally required.</li>
            </ul>
            <p>Repeated or severe violations may result in permanent account termination without prior notice.</p>
          </section>

          <section className="privacy-page__section">
            <h2 className="privacy-page__section-title">8. Intellectual Property</h2>
            <p>All trademarks, logos, software, interfaces, graphics, branding, designs, and technology used on ForgeConnect are the exclusive property of ForgeConnect or its licensors.</p>
            <p>Users may not:</p>
            <ul className="privacy-page__list">
              <li>Copy platform software.</li>
              <li>Modify platform code.</li>
              <li>Reverse engineer platform functionality.</li>
              <li>Sell or redistribute platform materials.</li>
              <li>Use ForgeConnect branding without written permission.</li>
            </ul>
          </section>

          <section className="privacy-page__section">
            <h2 className="privacy-page__section-title">9. Payments and Billing</h2>
            <p>Certain Services require payment.</p>
            <p>Payments are securely processed through trusted third-party payment providers, including Razorpay.</p>
            <p>By making a payment, you confirm that:</p>
            <ul className="privacy-page__list">
              <li>You are authorized to use the selected payment method.</li>
              <li>Payment information is accurate.</li>
              <li>You accept applicable charges and taxes.</li>
            </ul>
            <p>ForgeConnect does not store complete debit card or credit card information.</p>
          </section>

          <section className="privacy-page__section">
            <h2 className="privacy-page__section-title">10. Premium Services</h2>
            <p>Premium memberships and paid digital services become available after successful payment confirmation.</p>
            <p>Premium access is intended solely for the purchasing account and may not be transferred, shared, or resold without written permission.</p>
          </section>

          <section className="privacy-page__section">
            <h2 className="privacy-page__section-title">11. Cancellation and Refunds</h2>
            <p>Refunds are governed by the ForgeConnect Cancellation and Refund Policy.</p>
            <p>Refund requests may be considered only in situations such as:</p>
            <ul className="privacy-page__list">
              <li>Duplicate payments.</li>
              <li>Verified technical failures.</li>
            </ul>
            <p>Refunds are not guaranteed and are reviewed on a case-by-case basis.</p>
          </section>

          <section className="privacy-page__section">
            <h2 className="privacy-page__section-title">12. Account Suspension and Termination</h2>
            <p>ForgeConnect reserves the right to suspend or permanently terminate any account that:</p>
            <ul className="privacy-page__list">
              <li>Violates these Terms.</li>
              <li>Violates Community Guidelines.</li>
              <li>Engages in fraudulent activities.</li>
              <li>Misuses platform features.</li>
              <li>Attempts unauthorized access.</li>
              <li>Shares illegal content.</li>
              <li>Uses the platform for unlawful purposes.</li>
            </ul>
            <p>Termination may occur immediately and without prior notice where necessary to protect the platform or its users.</p>
          </section>

          <section className="privacy-page__section">
            <h2 className="privacy-page__section-title">13. No Refund for Policy Violations</h2>
            <p>If an account is suspended or permanently terminated because the user violated these Terms or Community Guidelines:</p>
            <ul className="privacy-page__list">
              <li>Access to premium features may be revoked.</li>
              <li>Active subscriptions may be cancelled.</li>
              <li>Previously paid fees are non-refundable, except where required by applicable law.</li>
            </ul>
          </section>

          <section className="privacy-page__section">
            <h2 className="privacy-page__section-title">14. Privacy</h2>
            <p>ForgeConnect respects your privacy.</p>
            <p>Personal information is collected only to:</p>
            <ul className="privacy-page__list">
              <li>Create and manage user accounts.</li>
              <li>Provide requested Services.</li>
              <li>Improve platform functionality.</li>
              <li>Process payments.</li>
              <li>Prevent fraud and maintain platform security.</li>
              <li>Communicate important service updates.</li>
            </ul>
            <p>ForgeConnect does not sell or rent users' personal information to advertisers or unrelated third parties.</p>
            <p>Information may only be shared:</p>
            <ul className="privacy-page__list">
              <li>With trusted service providers necessary to operate the platform (such as Razorpay for payment processing).</li>
              <li>When required by law.</li>
              <li>To protect the rights, safety, or security of ForgeConnect or its users.</li>
              <li>With your explicit consent.</li>
            </ul>
            <p>Additional details are available in our Privacy Policy.</p>
          </section>

          <section className="privacy-page__section">
            <h2 className="privacy-page__section-title">15. Third-Party Services</h2>
            <p>ForgeConnect may integrate with third-party providers including payment processors, authentication providers, cloud infrastructure providers, analytics providers, and communication services.</p>
            <p>ForgeConnect is not responsible for the availability, functionality, or policies of third-party services.</p>
            <p>Users are subject to the respective terms of those third-party providers.</p>
          </section>

          <section className="privacy-page__section">
            <h2 className="privacy-page__section-title">16. Platform Availability</h2>
            <p>ForgeConnect strives to provide reliable Services.</p>
            <p>However, uninterrupted availability cannot be guaranteed.</p>
            <p>Services may become unavailable due to:</p>
            <ul className="privacy-page__list">
              <li>Maintenance.</li>
              <li>Security updates.</li>
              <li>Technical failures.</li>
              <li>Internet outages.</li>
              <li>Government restrictions.</li>
              <li>Events beyond reasonable control.</li>
            </ul>
            <p>ForgeConnect shall not be liable for temporary interruptions.</p>
          </section>

          <section className="privacy-page__section">
            <h2 className="privacy-page__section-title">17. Limitation of Liability</h2>
            <p>To the maximum extent permitted by applicable law, ForgeConnect shall not be liable for any indirect, incidental, consequential, special, or punitive damages arising from the use or inability to use the Services.</p>
          </section>

          <section className="privacy-page__section">
            <h2 className="privacy-page__section-title">18. Indemnification</h2>
            <p>You agree to indemnify and hold harmless ForgeConnect from any claims, liabilities, losses, damages, expenses, or legal costs arising from:</p>
            <ul className="privacy-page__list">
              <li>Your use of the Services.</li>
              <li>Your violation of these Terms.</li>
              <li>Your violation of applicable laws.</li>
              <li>Your infringement of another person's rights.</li>
            </ul>
          </section>

          <section className="privacy-page__section">
            <h2 className="privacy-page__section-title">19. Changes to These Terms</h2>
            <p>ForgeConnect may update these Terms and Conditions at any time.</p>
            <p>Updated versions will become effective upon publication on the platform.</p>
            <p>Your continued use of the Services after changes are published constitutes acceptance of the updated Terms.</p>
          </section>

          <section className="privacy-page__section">
            <h2 className="privacy-page__section-title">20. Governing Law</h2>
            <p>These Terms and Conditions shall be governed by and interpreted in accordance with the laws of India.</p>
            <p>Any disputes arising from the use of ForgeConnect shall be subject to the exclusive jurisdiction of the competent courts in India.</p>
          </section>

          <section className="privacy-page__section">
            <h2 className="privacy-page__section-title">21. Contact Information</h2>
            <p>For questions regarding these Terms and Conditions, please contact:</p>
            <div className="privacy-page__contact">
              <h3>ForgeConnect Support</h3>
              <p><strong>Email:</strong> palshivanshu2005@gmail.com</p>
              <p><strong>Business Hours:</strong> Monday – Saturday, 10:00 AM – 6:00 PM (IST)</p>
              <p>We aim to respond to support requests within 24–48 business hours.</p>
            </div>
          </section>

          <div className="privacy-page__agreement">
            <h2 className="privacy-page__section-title">Agreement</h2>
            <p>By creating an account or using ForgeConnect, you acknowledge that you have read, understood, and agreed to these Terms and Conditions. Continued use of the Services indicates your ongoing acceptance of any future updates to these Terms.</p>
          </div>
        </div>
      </div>
      <NavigationBar />
    </div>
  );
}

export default PrivacyPage;
