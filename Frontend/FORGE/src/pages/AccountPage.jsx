import { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

function AccountPage() 
{
  
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [state, setState] = useState('')
  const [city, setCity] = useState('')
  const [terms, setTerms] = useState(false)
  const [profilePhoto, setProfilePhoto] = useState(null)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)


  const validateForm = () => {
    const newErrors = {}

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!state.trim()) {
      newErrors.state = 'State is required'
    }

    if (!city.trim()) {
      newErrors.city = 'City is required'
    }

    if (!terms) {
      newErrors.terms = 'You must agree to the terms and conditions'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('firstName', firstName)
      formData.append('lastName', lastName)
      formData.append('email', email)
      formData.append('password', password)
      formData.append('state', state)
      formData.append('city', city)
      if (profilePhoto) {
        formData.append('profilePhoto', profilePhoto)
      }

      const response = await axios.post('http://localhost:5000/api/auth/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      console.log('Registration successful:', response.data)
      alert('Account created successfully!')
      
      // Reset form
      setFirstName('')
      setLastName('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setState('')
      setCity('')
      setTerms(false)
      setProfilePhoto(null)
      setErrors({})

    } catch (error) {
      console.error('Registration error:', error)
      if (error.response && error.response.data) {
        setErrors({ submit: error.response.data.message || 'Registration failed. Please try again.' })
      } else {
        setErrors({ submit: 'Network error. Please check your connection and try again.' })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: "var(--app-theme-gradient)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        boxSizing: "border-box"
      }}
    >
      <form
        className="account-form"
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: "820px",
          background: "#FFD700",
          padding: "36px",
          borderRadius: "28px",
          boxShadow: "0 20px 50px rgba(255, 215, 0, 0.3)",
          border: "2px solid #000000",
          transition: "transform 0.25s ease, box-shadow 0.25s ease"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.01)";
          e.currentTarget.style.boxShadow = "0 24px 60px rgba(0,0,0,0.25)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 20px 50px rgba(0,0,0,0.18)";
        }}
      >
        <h2 style={{ marginBottom: "18px", textAlign: "center", color: "#000000", fontSize: "2rem", fontWeight: 800, letterSpacing: "1px" }}>Create Your Forge Account</h2>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: "28px" }}>
          <label style={{ width: "120px", height: "120px", borderRadius: "50%", border: "3px solid #000000", display: "flex", justifyContent: "center", alignItems: "center", background: "#FFFFFF", cursor: "pointer", fontWeight: "700", color: "#000000", textAlign: "center", fontSize: "0.95rem", flexDirection: "column", padding: "12px" }}>
            <span style={{ fontSize: "1.8rem", marginBottom: "8px" }}>📷</span>
            Upload Photo
            <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => setProfilePhoto(e.target.files[0])} />
          </label>
        </div>

        <div style={{ marginBottom: "18px" }}>
          <div style={{ textTransform: "uppercase", letterSpacing: "1.5px", fontSize: "0.75rem", marginBottom: "12px", color: "#000000" }}>Personal Information</div>
          <div className="account-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "700", color: "#000000" }}>First Name</label>
              <input type="text" placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required style={{ width: "100%", padding: "14px 16px", marginBottom: errors.firstName ? "4px" : "16px", border: errors.firstName ? "2px solid #dc2626" : "2px solid #000000", borderRadius: "16px", boxSizing: "border-box", background: "#FFFFFF", color: "#000000" }} />
              {errors.firstName && <div style={{ color: "#dc2626", fontSize: "0.8rem", marginBottom: "12px" }}>{errors.firstName}</div>}
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "700", color: "#000000" }}>Last Name</label>
              <input type="text" placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} required style={{ width: "100%", padding: "14px 16px", marginBottom: errors.lastName ? "4px" : "16px", border: errors.lastName ? "2px solid #dc2626" : "2px solid #000000", borderRadius: "16px", boxSizing: "border-box", background: "#FFFFFF", color: "#000000" }} />
              {errors.lastName && <div style={{ color: "#dc2626", fontSize: "0.8rem", marginBottom: "12px" }}>{errors.lastName}</div>}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: "22px" }}>
          <div style={{ textTransform: "uppercase", letterSpacing: "1.5px", fontSize: "0.75rem", marginBottom: "12px", color: "#000000" }}>Contact Details</div>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "700", color: "#000000" }}>Email Address</label>
          <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: "100%", padding: "14px 16px", marginBottom: errors.email ? "4px" : "16px", border: errors.email ? "2px solid #dc2626" : "2px solid #000000", borderRadius: "16px", boxSizing: "border-box", background: "#FFFFFF", color: "#000000" }} />
          {errors.email && <div style={{ color: "#dc2626", fontSize: "0.8rem", marginBottom: "12px" }}>{errors.email}</div>}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "22px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "700", color: "#000000" }}>Password</label>
            <input type="password" placeholder="Min 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: "100%", padding: "14px 16px", marginBottom: errors.password ? "4px" : "16px", border: errors.password ? "2px solid #dc2626" : "2px solid #000000", borderRadius: "16px", boxSizing: "border-box", background: "#FFFFFF", color: "#000000" }} />
            {errors.password && <div style={{ color: "#dc2626", fontSize: "0.8rem", marginBottom: "8px" }}>{errors.password}</div>}
            <div style={{ marginTop: "8px", fontSize: "0.8rem", color: "#000000" }}>Enter a password</div>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "700", color: "#000000" }}>Confirm Password</label>
            <input type="password" placeholder="Repeat password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required style={{ width: "100%", padding: "14px 16px", marginBottom: errors.confirmPassword ? "4px" : "16px", border: errors.confirmPassword ? "2px solid #dc2626" : "2px solid #000000", borderRadius: "16px", boxSizing: "border-box", background: "#FFFFFF", color: "#000000" }} />
            {errors.confirmPassword && <div style={{ color: "#dc2626", fontSize: "0.8rem", marginBottom: "8px" }}>{errors.confirmPassword}</div>}
            <div style={{ marginTop: "8px", fontSize: "0.8rem", color: "#000000" }}>Repeat password</div>
          </div>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <div style={{ textTransform: "uppercase", letterSpacing: "1.5px", fontSize: "0.75rem", marginBottom: "12px", color: "#000000" }}>Location</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "700", color: "#000000" }}>State / Province</label>
              <input type="text" placeholder="Select state" value={state} onChange={(e) => setState(e.target.value)} required style={{ width: "100%", padding: "14px 16px", marginBottom: errors.state ? "4px" : "16px", border: errors.state ? "2px solid #dc2626" : "2px solid #000000", borderRadius: "16px", boxSizing: "border-box", background: "#FFFFFF", color: "#000000" }} />
              {errors.state && <div style={{ color: "#dc2626", fontSize: "0.8rem", marginBottom: "12px" }}>{errors.state}</div>}
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "700", color: "#000000" }}>City</label>
              <input type="text" placeholder="Select city" value={city} onChange={(e) => setCity(e.target.value)} required style={{ width: "100%", padding: "14px 16px", marginBottom: errors.city ? "4px" : "16px", border: errors.city ? "2px solid #dc2626" : "2px solid #000000", borderRadius: "16px", boxSizing: "border-box", background: "#FFFFFF", color: "#000000" }} />
              {errors.city && <div style={{ color: "#dc2626", fontSize: "0.8rem", marginBottom: "12px" }}>{errors.city}</div>}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "18px", borderRadius: "18px", background: "#FFFFFF", border: "2px solid #000000", marginBottom: "24px" }}>
          <input type="checkbox" id="terms" checked={terms} onChange={(e) => setTerms(e.target.checked)} required style={{ width: "18px", height: "18px", marginTop: "4px" }} />
          <label htmlFor="terms" style={{ color: "#000000", fontSize: "0.95rem", lineHeight: "1.55" }}>
            I agree to FORGE’s <strong>Terms of Service</strong> and <strong>Privacy Policy</strong>. I confirm I am a student or builder looking to connect and create.
          </label>
          {errors.terms && <div style={{ color: "#dc2626", fontSize: "0.8rem", marginTop: "8px" }}>{errors.terms}</div>}
        </div>

        {errors.submit && <div style={{ color: "#dc2626", fontSize: "0.95rem", marginBottom: "16px", textAlign: "center", padding: "12px", borderRadius: "12px", background: "rgba(220, 38, 38, 0.1)" }}>{errors.submit}</div>}
        <button type="submit" disabled={isSubmitting} style={{ width: "100%", padding: "16px", background: isSubmitting ? "#666666" : "var(--app-theme-gradient)", color: "#000000", border: "2px solid #000000", borderRadius: "18px", cursor: isSubmitting ? "not-allowed" : "pointer", fontWeight: "800", fontSize: "1rem", letterSpacing: "0.8px", boxShadow: "0 12px 28px rgba(0,0,0,0.24)", opacity: isSubmitting ? 0.7 : 1 }}>
          {isSubmitting ? 'Creating Account...' : 'Create My Forge Account'}
        </button>

        <div className="account-footer" style={{ marginTop: "20px", textAlign: "center", color: "#000000", fontSize: "0.95rem" }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: "#000000", fontWeight: 700, textDecoration: "underline" }}>
            Log in
          </Link>
        </div>
      </form>
    </div>
  );
}

export default AccountPage;