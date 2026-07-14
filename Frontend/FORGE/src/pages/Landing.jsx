import forgeImage from "../assets/image.png";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login");
    }, 3500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="page-shell landing-screen">
      <div className="landing-card">
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 20px',
          borderRadius: '999px',
          background: 'linear-gradient(135deg, rgba(240, 114, 182, 0.15), rgba(254, 225, 64, 0.15))',
          border: '1px solid rgba(240, 114, 182, 0.3)',
          color: '#7a1f55',
          fontSize: '0.9rem',
          fontWeight: '800',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: '24px',
          boxShadow: '0 4px 16px rgba(240, 114, 182, 0.2)'
        }}>
          <span style={{ fontSize: '1.1rem' }}>✨</span>
          <span>Where Innovation Meets Purpose</span>
        </div>
        <img className="logo-mark" src={forgeImage} alt="Forge" />
        <h1 className="page-title">FORGE</h1>
        <p className="page-subtitle">
          Shape your ideas into a polished experience with a calmer, more modern product feel.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "8px" }}>
          <span className="progress-dot" />
          <span className="progress-dot" style={{ opacity: 0.5 }} />
          <span className="progress-dot" style={{ opacity: 0.3 }} />
        </div>
      </div>
    </div>
  );
}

export default Landing;





