import forgeImage from "../assets/forge.png";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const REDIRECT_MS = 4000;

const FEATURES = [
  { icon: "🔗", label: "Connect", desc: "Find builders & founders near you" },
  { icon: "🎯", label: "Collaborate", desc: "Join events and grow together" },
  { icon: "⚡", label: "Earn", desc: "Collect Forge tokens for contributions" },
];

function Landing() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  const goToLogin = useCallback(() => {
    navigate("/login");
  }, [navigate]);

  useEffect(() => {
    const start = Date.now();
    const tick = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(Math.min(100, (elapsed / REDIRECT_MS) * 100));
    }, 40);

    const timer = setTimeout(goToLogin, REDIRECT_MS);

    return () => {
      clearInterval(tick);
      clearTimeout(timer);
    };
  }, [goToLogin]);

  return (
    <div className="page-shell landing-screen landing-screen--hero">
      <div className="landing-hero">
        <div className="landing-hero__glow landing-hero__glow--one" aria-hidden="true" />
        <div className="landing-hero__glow landing-hero__glow--two" aria-hidden="true" />

        <div className="landing-hero__content">
          <div className="landing-hero__brand">
            <div className="landing-hero__logo-wrap">
              <div className="landing-hero__logo-ring" aria-hidden="true" />
              <img
                className="landing-hero__logo"
                src={forgeImage}
                alt="ForgeConnect"
              />
            </div>

            <div className="landing-hero__copy">
              <span className="landing-hero__eyebrow">Community Platform</span>
              <h1 className="landing-hero__title">
                Forge<span className="landing-hero__title-accent">Connect</span>
              </h1>
              <p className="landing-hero__subtitle">
                Where innovation meets purpose — shape ideas, build connections,
                and grow with a community that moves with you.
              </p>
            </div>
          </div>

          <ul className="landing-hero__features">
            {FEATURES.map((feature, i) => (
              <li
                key={feature.label}
                className="landing-hero__feature"
                style={{ animationDelay: `${0.15 + i * 0.1}s` }}
              >
                <span className="landing-hero__feature-icon" aria-hidden="true">
                  {feature.icon}
                </span>
                <div>
                  <strong>{feature.label}</strong>
                  <span>{feature.desc}</span>
                </div>
              </li>
            ))}
          </ul>

          <div className="landing-hero__actions">
            <button
              type="button"
              className="landing-hero__cta"
              onClick={goToLogin}
            >
              Get Started
              <span className="landing-hero__cta-arrow" aria-hidden="true">→</span>
            </button>
            <p className="landing-hero__hint">
              Redirecting automatically in a moment…
            </p>
          </div>
        </div>
      </div>

      <div className="landing-hero__progress-track" aria-hidden="true">
        <div
          className="landing-hero__progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export default Landing;
