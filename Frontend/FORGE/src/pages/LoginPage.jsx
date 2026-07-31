
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '../contexts/AlertContext';
import forgeImage from "../assets/forge.png";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { supabase } = useAuth();
  const { error: showError } = useAlert();

    const signInWithGoogle = async () => {
     const { error } = await supabase.auth.signInWithOAuth({
       provider: "google",
       options: {
         redirectTo: window.location.origin + '/auth/callback'
       }
     });

     if (error) {
       console.error('Error signing in:', error);
       showError('Error signing in with Google. Please try again.');
     }
   };

   useEffect(() => {
     // Get the intended destination from location state, default to home
     const from = location.state?.from?.pathname || '/home';

     // Check if user is already authenticated
     supabase.auth.getSession().then(({ data: { session } }) => {
       if (session) {
         console.log('LoginPage - User already authenticated, redirecting to:', from);
         console.log('LoginPage - REDIRECT TRIGGERED from LoginPage useEffect');
         // Redirect immediately to intended destination
         navigate(from, { replace: true });
       }
     });

     // Listen for auth state changes
     const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
       if (event === 'SIGNED_IN' && session) {
         console.log('LoginPage - User signed in, redirecting to:', from);
         console.log('LoginPage - REDIRECT TRIGGERED from LoginPage auth state change');
         // Redirect immediately to intended destination
         navigate(from, { replace: true });
       }
     });

    return () => subscription.unsubscribe();
  }, [navigate, location]);


  return (
    <div className="page-shell landing-screen login-screen">
      <div className="login-hero">
        <div className="login-hero__glow login-hero__glow--one" aria-hidden="true" />
        <div className="login-hero__glow login-hero__glow--two" aria-hidden="true" />
        
        <div className="login-hero__content">
          <div className="login-hero__logo">
            <img src={forgeImage} alt="ForgeConnect" />
          </div>
          
          <div className="auth-card">
            <div className="hero-badge">Welcome back</div>
            <h2>Log in to ForgeConnect</h2>
            <p>Access your workspace, keep momentum, and pick up where you left off.</p>

            <form className="form-stack" style={{ marginTop: "32px" }}>
              <button
                className="login-google-btn"
                type="button"
                onClick={signInWithGoogle}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign in with Google
              </button>
            </form>

            <div className="login-trust">
              <div className="login-trust__item">
                <span className="login-trust__icon">🔒</span>
                <span className="login-trust__text">Secure authentication</span>
              </div>
              <div className="login-trust__item">
                <span className="login-trust__icon">⚡</span>
                <span className="login-trust__text">Instant access</span>
              </div>
              <div className="login-trust__item">
                <span className="login-trust__icon">🎯</span>
                <span className="login-trust__text">No spam, ever</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
 }

 export default LoginPage;
