
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { supabase } = useAuth();

    const signInWithGoogle = async () => {
     const { error } = await supabase.auth.signInWithOAuth({
       provider: "google",
       options: {
         redirectTo: window.location.origin + '/auth/callback'
       }
     });

     if (error) {
       console.error('Error signing in:', error);
       alert('Error signing in with Google. Please try again.');
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
     <div className="page-shell landing-screen">
       <div className="auth-card">
         <div className="hero-badge">Welcome back</div>
         <h2>Log in to FORGE</h2>
         <p>Access your workspace, keep momentum, and pick up where you left off.</p>

         <form className="form-stack" style={{ marginTop: "32px" }}>
           <button
             className="button-secondary"
             type="button"
             onClick={signInWithGoogle}
             style={{
               width: "100%",
               padding: "14px 20px",
               fontSize: "16px",
               fontWeight: "600",
               display: "flex",
               alignItems: "center",
               justifyContent: "center",
               gap: "12px",
               backgroundColor: "#FFD700",
               color: "#000000",
               border: "none",
               borderRadius: "8px",
               boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
               cursor: "pointer",
               transition: "transform 0.2s, box-shadow 0.2s"
             }}
             onMouseOver={(e) => {
               e.currentTarget.style.transform = "translateY(-2px)";
               e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.2)";
             }}
             onMouseOut={(e) => {
               e.currentTarget.style.transform = "translateY(0)";
               e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
             }}
           >
             Sign in with Google
           </button>
         </form>
       </div>
     </div>
   );
 }

 export default LoginPage;
