import forgeImage from "../assets/forge.png";
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
        <div className="hero-badge">⚡ Built for your next move</div>
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





