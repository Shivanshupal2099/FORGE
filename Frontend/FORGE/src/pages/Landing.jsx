import forgeImage from "../assets/forge.png";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const REDIRECT_MS = 4000;

function Landing() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [progress, setProgress] = useState(0);

  const goToNextPage = useCallback(() => {
    if (user) {
      navigate("/home");
    } else {
      navigate("/visitor");
    }
  }, [navigate, user]);

  useEffect(() => {
    // Wait for auth to complete before starting redirect timer
    if (loading) return;

    const start = Date.now();
    const tick = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(Math.min(100, (elapsed / REDIRECT_MS) * 100));
    }, 40);

    const timer = setTimeout(goToNextPage, REDIRECT_MS);

    return () => {
      clearInterval(tick);
      clearTimeout(timer);
    };
  }, [goToNextPage, loading]);

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
              <span className="landing-hero__eyebrow">Builder Platform</span>
              <h1 className="landing-hero__title">
                Forge<span className="landing-hero__title-accent">Connect</span>
              </h1>
              </div>
          </div>

          <div className="landing-hero__actions">
            <button
              type="button"
              className="landing-hero__cta"
              onClick={goToNextPage}
            >
              Get Started
              <span className="landing-hero__cta-arrow" aria-hidden="true">→</span>
            </button>
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
