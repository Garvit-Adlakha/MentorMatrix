import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { IconAlertCircle, IconLock, IconMail, IconEye, IconEyeOff } from '../../components/ui/Icons';
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import authService from "../../service/authService";

/* ── animated floating orbs ── */
const Orb = ({ style }) => (
  <div className="auth-orb" style={style} />
);

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [focusedField, setFocusedField] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("success")) setSuccessMessage("Account created successfully. Please sign in.");
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage("");
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) { setErrorMessage("All fields are required"); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { setErrorMessage("Please enter a valid email address"); return false; }
    return true;
  };

  const queryClient = useQueryClient();

  const handleLoginMutation = useMutation({
    mutationFn: () => authService.login(formData),
    onSuccess: () => {
      setIsSubmitting(false);
      queryClient.invalidateQueries(["user"]);
      toast.success("Welcome back! 🎉");
      navigate("/dashboard");
    },
    onError: (error) => {
      setIsSubmitting(false);
      setErrorMessage(error.response?.data?.message || "Login failed. Please try again.");
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");
    try { await handleLoginMutation.mutateAsync(); } finally { setIsSubmitting(false); }
  };

  return (
    <div className="auth-root">
      {/* ── animated background ── */}
      <div className="auth-bg">
        <Orb style={{ width: 420, height: 420, top: "-80px", left: "-100px", animationDelay: "0s" }} />
        <Orb style={{ width: 280, height: 280, bottom: "60px", right: "-60px", animationDelay: "2s" }} />
        <Orb style={{ width: 180, height: 180, top: "40%", left: "55%", animationDelay: "4s" }} />
        <div className="auth-grid" />
      </div>

      <div className="auth-split">
        {/* ── left panel ── */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="auth-left"
        >
          <Link to="/" className="auth-brand">
            <div className="auth-brand-icon">
              <svg viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="18" stroke="url(#g1)" strokeWidth="2" />
                <path d="M12 20 L18 14 L24 20 L30 14" stroke="url(#g1)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 26 L18 20 L24 26 L30 20" stroke="#ff6b00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="40" y2="40">
                    <stop stopColor="#ff6b00" />
                    <stop offset="1" stopColor="#ff9d00" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="auth-brand-name">Campus<span>Connect</span></span>
          </Link>

          <div className="auth-left-content">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <h2 className="auth-left-headline">
                Connect. Learn.<br />
                <span className="auth-highlight">Grow Together.</span>
              </h2>
              <p className="auth-left-sub">
                Join thousands of students and mentors building the future — one session at a time.
              </p>
            </motion.div>
{/*
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="auth-stats"
            >
              {[
                { value: "5K+", label: "Students" },
                { value: "800+", label: "Mentors" },
                { value: "12K+", label: "Sessions" },
              ].map(({ value, label }) => (
                <div key={label} className="auth-stat">
                  <span className="auth-stat-value">{value}</span>
                  <span className="auth-stat-label">{label}</span>
                </div>
              ))}
            </motion.div> */}
          </div>

          <div className="auth-left-deco" />
        </motion.div>

        {/* ── right panel / form ── */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="auth-right"
        >
          <div className="auth-card">
            <div className="auth-card-header">
              <h1 className="auth-card-title">Welcome back</h1>
              <p className="auth-card-sub">Sign in to your Campus Connect account</p>
            </div>

            <AnimatePresence mode="wait">
              {successMessage && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="auth-alert auth-alert-success"
                >
                  <svg viewBox="0 0 20 20" fill="none" width={18} height={18}>
                    <circle cx="10" cy="10" r="9" stroke="#22c55e" strokeWidth="1.5" />
                    <path d="M6 10l3 3 5-5" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {successMessage}
                </motion.div>
              )}
              {errorMessage && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="auth-alert auth-alert-error"
                >
                  <IconAlertCircle size={18} />
                  {errorMessage}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              {/* Email */}
              <div className={`auth-field ${focusedField === "email" ? "auth-field--focused" : ""}`}>
                <label htmlFor="login-email" className="auth-label">Email Address</label>
                <div className="auth-input-wrap">
                  <IconMail size={17} className="auth-input-icon" />
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="auth-input"
                    placeholder="you@university.edu"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>
              </div>

              {/* Password */}
              <div className={`auth-field ${focusedField === "password" ? "auth-field--focused" : ""}`}>
                <div className="auth-label-row">
                  <label htmlFor="login-password" className="auth-label">Password</label>
                  <Link to="/forgot-password" className="auth-link-small">Forgot password?</Link>
                </div>
                <div className="auth-input-wrap">
                  <IconLock size={17} className="auth-input-icon" />
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    className="auth-input"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                  />
                  <button
                    type="button"
                    className="auth-eye-btn"
                    onClick={() => setShowPassword(p => !p)}
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <IconEyeOff size={17} /> : <IconEye size={17} />}
                  </button>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 8px 32px rgba(255, 107, 0, 0.35)" }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="auth-submit-btn"
              >
                {isSubmitting ? (
                  <span className="auth-btn-loading">
                    <svg className="auth-spinner" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  <>
                    Sign In
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </motion.button>
            </form>

            <div className="auth-divider"><span>or</span></div>

            <div className="auth-footer-links">
              <p className="auth-footer-text">
                Don't have an account?{" "}
                <Link to="/signup" className="auth-link">Sign up as Student</Link>
              </p>
              <p className="auth-footer-text">
                Are you a mentor?{" "}
                <Link to="/signup/mentor" className="auth-link">Join as Mentor</Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <style>{authStyles}</style>
    </div>
  );
};

/* ──────────────────────────────────────────
   Shared auth styles (injected as a string)
   ────────────────────────────────────────── */
export const authStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

  .auth-root {
    position: relative;
    min-height: 100vh;
    display: flex;
    align-items: stretch;
    font-family: 'Inter', 'Poppins', sans-serif;
    overflow: hidden;
    background: #0a0a0f;
  }

  /* ── background ── */
  .auth-bg {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
  }
  .auth-orb {
    position: absolute;
    border-radius: 50%;
    background: radial-gradient(circle at 40% 40%, rgba(255,107,0,0.22) 0%, rgba(255,157,0,0.10) 50%, transparent 80%);
    filter: blur(40px);
    animation: orbFloat 8s ease-in-out infinite alternate;
  }
  @keyframes orbFloat {
    0%   { transform: translate(0, 0) scale(1); }
    100% { transform: translate(20px, 30px) scale(1.08); }
  }
  .auth-grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,107,0,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,107,0,0.04) 1px, transparent 1px);
    background-size: 60px 60px;
    mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
  }

  /* ── split layout ── */
  .auth-split {
    position: relative;
    z-index: 1;
    display: flex;
    width: 100%;
    min-height: 100vh;
  }

  /* ── left panel ── */
  .auth-left {
    display: none;
    flex-direction: column;
    justify-content: space-between;
    padding: 2.5rem;
    background: linear-gradient(160deg, #0f0f18 0%, #140d00 60%, #1a0900 100%);
    border-right: 1px solid rgba(255,107,0,0.12);
    position: relative;
    overflow: hidden;
    width: 42%;
    flex-shrink: 0;
  }
  @media (min-width: 900px) { .auth-left { display: flex; } }

  .auth-left-deco {
    position: absolute;
    bottom: -160px;
    left: -100px;
    width: 420px;
    height: 420px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255,107,0,0.12) 0%, transparent 70%);
    pointer-events: none;
  }

  /* brand */
  .auth-brand {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    text-decoration: none;
    flex-shrink: 0;
  }
  .auth-brand-icon { width: 40px; height: 40px; flex-shrink: 0; }
  .auth-brand-name {
    font-size: 1.35rem;
    font-weight: 700;
    color: #f5f5f5;
    letter-spacing: -0.02em;
  }
  .auth-brand-name span { color: #ff6b00; }

  .auth-left-content { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 2.5rem; }

  .auth-left-headline {
    font-size: clamp(1.8rem, 3vw, 2.6rem);
    font-weight: 800;
    color: #f0f0f0;
    line-height: 1.2;
    letter-spacing: -0.03em;
  }
  .auth-highlight {
    background: linear-gradient(90deg, #ff6b00, #ff9d00);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .auth-left-sub {
    margin-top: 1rem;
    color: rgba(255,255,255,0.45);
    font-size: 0.95rem;
    line-height: 1.65;
  }

  .auth-stats { display: flex; gap: 2rem; }
  .auth-stat { display: flex; flex-direction: column; gap: 0.15rem; }
  .auth-stat-value {
    font-size: 1.6rem;
    font-weight: 800;
    color: #ff6b00;
    letter-spacing: -0.02em;
    line-height: 1;
  }
  .auth-stat-label { font-size: 0.78rem; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.05em; }

  /* ── right panel ── */
  .auth-right {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1.5rem;
    background: #0a0a0f;
  }

  /* ── glass card ── */
  .auth-card {
    width: 100%;
    max-width: 430px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,107,0,0.14);
    border-radius: 20px;
    padding: 2.5rem 2rem;
    backdrop-filter: blur(20px);
    box-shadow:
      0 0 0 1px rgba(255,107,0,0.06),
      0 24px 64px rgba(0,0,0,0.5),
      inset 0 1px 0 rgba(255,255,255,0.05);
  }
  .auth-card-header { margin-bottom: 1.75rem; }
  .auth-card-title {
    font-size: 1.65rem;
    font-weight: 700;
    color: #f5f5f5;
    letter-spacing: -0.03em;
    margin: 0 0 0.35rem;
  }
  .auth-card-sub { color: rgba(255,255,255,0.4); font-size: 0.9rem; margin: 0; }

  /* ── alerts ── */
  .auth-alert {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.75rem 1rem;
    border-radius: 10px;
    font-size: 0.88rem;
    margin-bottom: 1.25rem;
  }
  .auth-alert-success {
    background: rgba(34,197,94,0.08);
    border: 1px solid rgba(34,197,94,0.25);
    color: #4ade80;
  }
  .auth-alert-error {
    background: rgba(239,68,68,0.08);
    border: 1px solid rgba(239,68,68,0.25);
    color: #f87171;
  }

  /* ── form ── */
  .auth-form { display: flex; flex-direction: column; gap: 1.2rem; }

  .auth-field { display: flex; flex-direction: column; gap: 0.45rem; }
  .auth-field--focused .auth-input { border-color: rgba(255,107,0,0.5); box-shadow: 0 0 0 3px rgba(255,107,0,0.1); }

  .auth-label {
    font-size: 0.82rem;
    font-weight: 600;
    color: rgba(255,255,255,0.65);
    letter-spacing: 0.01em;
  }
  .auth-label-row { display: flex; align-items: center; justify-content: space-between; }
  .auth-link-small { font-size: 0.78rem; color: #ff6b00; text-decoration: none; transition: color 0.2s; }
  .auth-link-small:hover { color: #ff9d00; }

  .auth-input-wrap { position: relative; display: flex; align-items: center; }
  .auth-input-icon {
    position: absolute;
    left: 0.9rem;
    color: rgba(255,255,255,0.3);
    pointer-events: none;
    flex-shrink: 0;
  }
  .auth-input {
    width: 100%;
    padding: 0.8rem 1rem 0.8rem 2.6rem;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 10px;
    color: #f0f0f0;
    font-size: 0.9rem;
    font-family: inherit;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    -webkit-appearance: none;
  }
  .auth-input::placeholder { color: rgba(255,255,255,0.2); }
  .auth-input:hover { border-color: rgba(255,255,255,0.18); }
  .auth-input:focus { border-color: rgba(255,107,0,0.5); box-shadow: 0 0 0 3px rgba(255,107,0,0.1); background: rgba(255,255,255,0.06); }

  .auth-eye-btn {
    position: absolute;
    right: 0.8rem;
    color: rgba(255,255,255,0.3);
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.2rem;
    display: flex;
    align-items: center;
    transition: color 0.2s;
  }
  .auth-eye-btn:hover { color: rgba(255,255,255,0.7); }

  .auth-input-error {
    font-size: 0.78rem;
    color: #f87171;
    margin-top: 0.2rem;
  }

  /* ── submit button ── */
  .auth-submit-btn {
    margin-top: 0.5rem;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.85rem 1.5rem;
    background: linear-gradient(135deg, #ff6b00 0%, #e05a00 100%);
    border: none;
    border-radius: 10px;
    color: #fff;
    font-size: 0.95rem;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    transition: opacity 0.2s, box-shadow 0.2s;
    letter-spacing: 0.01em;
    position: relative;
    overflow: hidden;
  }
  .auth-submit-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 60%);
    pointer-events: none;
  }
  .auth-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .auth-submit-btn:hover:not(:disabled) { opacity: 0.92; }

  .auth-btn-loading { display: flex; align-items: center; gap: 0.5rem; }
  .auth-spinner {
    width: 18px; height: 18px;
    animation: spin 0.8s linear infinite;
    stroke-linecap: round;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── divider ── */
  .auth-divider {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin: 1.5rem 0 1rem;
    color: rgba(255,255,255,0.2);
    font-size: 0.78rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .auth-divider::before, .auth-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(255,255,255,0.08);
  }

  /* ── footer links ── */
  .auth-footer-links { display: flex; flex-direction: column; gap: 0.5rem; text-align: center; }
  .auth-footer-text { margin: 0; font-size: 0.85rem; color: rgba(255,255,255,0.35); }
  .auth-link { color: #ff6b00; text-decoration: none; font-weight: 600; transition: color 0.2s; }
  .auth-link:hover { color: #ff9d00; }

  /* ── tag chips (mentor form) ── */
  .auth-tag-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.3rem 0.75rem;
    background: rgba(255,107,0,0.12);
    border: 1px solid rgba(255,107,0,0.25);
    border-radius: 999px;
    color: #ff9d00;
    font-size: 0.8rem;
    font-weight: 500;
  }
  .auth-tag-remove {
    background: none; border: none; cursor: pointer;
    color: rgba(255,107,0,0.6); font-size: 1rem;
    line-height: 1; padding: 0; transition: color 0.2s;
    display: flex; align-items: center; justify-content: center;
  }
  .auth-tag-remove:hover { color: #ff6b00; }

  .auth-tags-wrap { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.6rem; min-height: 0; }

  /* ── role badge (signup) ── */
  .auth-role-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.25rem 0.75rem;
    background: rgba(255,107,0,0.1);
    border: 1px solid rgba(255,107,0,0.2);
    border-radius: 999px;
    color: #ff6b00;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 0.5rem;
  }

  /* ── scrollbar (card) ── */
  .auth-card::-webkit-scrollbar { width: 4px; }
  .auth-card::-webkit-scrollbar-thumb { background: rgba(255,107,0,0.3); border-radius: 4px; }
`;

export default Login;
