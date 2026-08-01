import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import NavigationBar from '../Components/NavigationBar';
import Header from '../Components/Header';
import {
  IoShieldCheckmark,
  IoEye,
  IoTrash,
  IoServer,
  IoCloud,
  IoCard,
  IoWarning,
  IoCheckmarkCircle,
  IoSparkles,
  IoGlobe,
  IoMail,
  IoCloudUpload,
  IoDownload,
  IoPerson,
  IoTime,
  IoFlash,
} from 'react-icons/io5';

function PrivacyPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animated');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.legal-page__detail').forEach((section) => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const sections = [
    {
      id: 'collection',
      icon: IoCloudUpload,
      title: 'Data Collection',
      content: 'We collect only the information necessary to provide our services, including your profile details, communication preferences, and usage data.'
    },
    {
      id: 'usage',
      icon: IoEye,
      title: 'Data Usage',
      content: 'Your information is used solely to improve your experience, provide requested services, and maintain platform security.'
    },
    {
      id: 'retention',
      icon: IoTrash,
      title: 'Data Retention',
      content: 'We retain your data only as long as necessary for the purposes outlined in our policy, unless required by law.'
    },
    {
      id: 'third-party',
      icon: IoServer,
      title: 'Third-Party Services',
      content: 'We use trusted third-party services like Razorpay for payments and Supabase for authentication, all with strong privacy protections.'
    },
    {
      id: 'cloud',
      icon: IoCloud,
      title: 'Cloud Storage',
      content: 'Your data is stored on secure cloud infrastructure with regular backups and disaster recovery measures.'
    },
    {
      id: 'payment',
      icon: IoCard,
      title: 'Payment Security',
      content: 'Payment information is processed securely through Razorpay. We do not store complete card details on our servers.'
    }
  ];

  return (
    <div className="page-shell">
      <Header />
      <div className="legal-page">
        <NavigationBar />
        
        <div className="legal-page__content">
          <div className="legal-page__header">
            <div className="legal-page__icon">
              <IoShieldCheckmark />
            </div>
            <div className="legal-page__title">
              <h1>Privacy & Terms</h1>
              <p>Last Updated: August 1, 2026</p>
            </div>
          </div>

          <div className="legal-page__intro">
            <p>
              At ForgeConnect, we take your privacy and security seriously. This policy outlines how we collect, use, protect, and manage your personal information. By using our platform, you agree to the practices described in this policy.
            </p>
          </div>

          <div className="legal-page__sections">
            {sections.map((section, index) => (
              <div key={index} className="legal-page__section">
                <div className="legal-page__section-icon">
                  <section.icon />
                </div>
                <div className="legal-page__section-content">
                  <h3>{section.title}</h3>
                  <p>{section.content}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="legal-page__details">
            <h2>Detailed Information</h2>
            
            <div className="legal-page__detail" id="terms-section">
              <h3>Terms & Conditions</h3>
              <p>By using ForgeConnect, you agree to our Terms & Conditions. Key points include:</p>
              <div className="legal-page__info-list">
                <div className="legal-page__info-list-item">
                  <span className="legal-page__check">✓</span>
                  <span>You must be at least 18 years old to use our platform</span>
                </div>
                <div className="legal-page__info-list-item">
                  <span className="legal-page__check">✓</span>
                  <span>You are responsible for maintaining account security</span>
                </div>
                <div className="legal-page__info-list-item">
                  <span className="legal-page__check">✓</span>
                  <span>Unlawful use, harassment, or fraud is prohibited</span>
                </div>
                <div className="legal-page__info-list-item">
                  <span className="legal-page__check">✓</span>
                  <span>Payments are processed securely through Razorpay</span>
                </div>
                <div className="legal-page__info-list-item">
                  <span className="legal-page__check">✓</span>
                  <span>Refunds are only for duplicate payments or technical failures</span>
                </div>
                <div className="legal-page__info-list-item">
                  <span className="legal-page__check">✓</span>
                  <span>We reserve the right to suspend accounts for violations</span>
                </div>
              </div>
              <div className="legal-page__highlight">
                <IoShieldCheckmark />
                <span>Full Terms & Conditions are incorporated into this Privacy Policy by reference.</span>
              </div>
            </div>
            
            <div className="legal-page__detail" id="information">
              <h3>1. Information We Collect</h3>
              <p>We collect the following types of personal information:</p>
              <div className="legal-page__info-grid">
                <div className="legal-page__info-item">
                  <span className="legal-page__info-icon"><IoPerson /></span>
                  <div>
                    <strong>Account Information</strong>
                    <span>Name, email, profile picture, bio, and other profile details you provide</span>
                  </div>
                </div>
                <div className="legal-page__info-item">
                  <span className="legal-page__info-icon"><IoSparkles /></span>
                  <div>
                    <strong>Usage Data</strong>
                    <span>How you interact with our platform, features you use, and your preferences</span>
                  </div>
                </div>
                <div className="legal-page__info-item">
                  <span className="legal-page__info-icon"><IoGlobe /></span>
                  <div>
                    <strong>Location Data</strong>
                    <span>Geographic information you choose to share for better matching</span>
                  </div>
                </div>
                <div className="legal-page__info-item">
                  <span className="legal-page__info-icon"><IoMail /></span>
                  <div>
                    <strong>Communication Data</strong>
                    <span>Messages and connection requests you send</span>
                  </div>
                </div>
                <div className="legal-page__info-item">
                  <span className="legal-page__info-icon"><IoCard /></span>
                  <div>
                    <strong>Payment Data</strong>
                    <span>Payment information processed through secure third-party providers</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="legal-page__detail" id="usage-info">
              <h3>2. How We Use Your Information</h3>
              <p>We use your information to:</p>
              <div className="legal-page__info-list">
                <div className="legal-page__info-list-item">
                  <span className="legal-page__check">✓</span>
                  <span>Provide, maintain, and improve our Services</span>
                </div>
                <div className="legal-page__info-list-item">
                  <span className="legal-page__check">✓</span>
                  <span>Process transactions and send related information</span>
                </div>
                <div className="legal-page__info-list-item">
                  <span className="legal-page__check">✓</span>
                  <span>Send technical notices and support messages</span>
                </div>
                <div className="legal-page__info-list-item">
                  <span className="legal-page__check">✓</span>
                  <span>Respond to comments and questions</span>
                </div>
                <div className="legal-page__info-list-item">
                  <span className="legal-page__check">✓</span>
                  <span>Monitor and analyze trends, usage, and activities</span>
                </div>
                <div className="legal-page__info-list-item">
                  <span className="legal-page__check">✓</span>
                  <span>Detect, prevent, and address technical issues and fraud</span>
                </div>
              </div>
            </div>

            <div className="legal-page__detail" id="data-retention">
              <h3>3. Data Retention</h3>
              <p>We retain your data only as long as necessary for the purposes outlined in our policy:</p>
              <div className="legal-page__retention-timeline">
                <div className="legal-page__retention-item">
                  <div className="legal-page__retention-period">Until deletion</div>
                  <div className="legal-page__retention-label">Account Data</div>
                </div>
                <div className="legal-page__retention-item">
                  <div className="legal-page__retention-period">2 minutes</div>
                  <div className="legal-page__retention-label">Messages</div>
                </div>
              </div>
            </div>



            <div className="legal-page__detail" id="third-party">
              <h3>4. Third-Party Disclosures</h3>
              <p>We may share your information only with:</p>
              <div className="legal-page__disclosure-list">
                <div className="legal-page__disclosure-item">
                  <span className="legal-page__disclosure-icon"><IoServer /></span>
                  <div>
                    <strong>Service providers</strong>
                    <span>Payment processors, authentication providers</span>
                  </div>
                </div>
                <div className="legal-page__disclosure-item">
                  <span className="legal-page__disclosure-icon"><IoWarning /></span>
                  <div>
                    <strong>Law enforcement</strong>
                    <span>When required by law</span>
                  </div>
                </div>
                <div className="legal-page__disclosure-item">
                  <span className="legal-page__disclosure-icon"><IoCheckmarkCircle /></span>
                  <div>
                    <strong>With consent</strong>
                    <span>Your explicit permission</span>
                  </div>
                </div>
              </div>
              <div className="legal-page__highlight">
                <IoShieldCheckmark />
                <span>We never sell your personal information to advertisers or third parties.</span>
              </div>
            </div>



            <div className="legal-page__detail" id="children">
              <h3>5. Children's Privacy</h3>
              <p>ForgeConnect is not intended for individuals under 18 years of age. We do not knowingly collect personal information from children under 18. If we become aware of such collection, we will take immediate steps to delete it.</p>
              <div className="legal-page__age-badge">
                <IoShieldCheckmark />
                <span>18+ Only</span>
              </div>
            </div>

            <div className="legal-page__detail" id="changes">
              <h3>6. Changes to This Policy</h3>
              <p>We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last Updated" date.</p>
              <div className="legal-page__update-banner">
                <IoSparkles />
                <span>Last Updated: August 1, 2026</span>
              </div>
            </div>

            <div className="legal-page__detail" id="contact">
              <h3>7. Contact Us</h3>
              <p>If you have questions about this Privacy Policy or our data practices, please contact us:</p>
              <div className="legal-page__contact-cards">
                <div className="legal-page__contact-card">
                  <div className="legal-page__contact-icon">
                    <IoMail />
                  </div>
                  <div>
                    <strong>Email</strong>
                    <span>palshivanshu2005@gmail.com</span>
                  </div>
                </div>
                <div className="legal-page__contact-card">
                  <div className="legal-page__contact-icon">
                    <IoTime />
                  </div>
                  <div>
                    <strong>Business Hours</strong>
                    <span>Mon – Sat, 10:00 AM – 6:00 PM (IST)</span>
                  </div>
                </div>
                <div className="legal-page__contact-card">
                  <div className="legal-page__contact-icon">
                    <IoFlash />
                  </div>
                  <div>
                    <strong>Response Time</strong>
                    <span>24–48 business hours</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="legal-page__footer">
            <Link to="/profile/edit" className="legal-page__back">
              ← Back to Edit Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPage;