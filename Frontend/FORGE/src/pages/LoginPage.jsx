function LoginPage() {
  return (
    <div className="page-shell landing-screen">
      <div className="auth-card">
        <div className="hero-badge">Welcome back</div>
        <h2>Log in to FORGE</h2>
        <p>Access your workspace, keep momentum, and pick up where you left off.</p>

        <form className="form-stack">
          <input className="input-field" type="email" placeholder="Enter email" />
          <input className="input-field" type="password" placeholder="Enter password" />
          <button className="button-primary" type="submit">
            Continue
          </button>
          <button className="button-secondary" type="button">
            Sign in with Google
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "12px", color: "#7f6b4d" }}>Forgot password?</p>
        <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginTop: "14px", flexWrap: "wrap" }}>
          <span>Don&apos;t have an account?</span>
          <a href="/account" style={{ color: "#241700", fontWeight: 700 }}>
            Sign up
          </a>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
