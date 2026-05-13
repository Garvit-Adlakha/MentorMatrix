import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'motion/react';
import { IconAlertCircle, IconLock, IconMail, IconEye, IconEyeOff, IconUser, IconId } from '../../components/ui/Icons';
import authService from '../../service/authService';
import Loader from '../../components/ui/Loader';
import { authStyles } from './Login';

const Orb = ({ style }) => <div className="auth-orb" style={style} />;

const StudentSignIn = () => {
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', confirmPassword: '', roll_no: '',
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) newErrors.email = 'Please enter a valid email';
        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        if (!formData.roll_no.trim()) newErrors.roll_no = 'Roll number is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const queryClient = useQueryClient();

    const signupMutation = useMutation({
        mutationFn: async () => {
            if (!validateForm()) throw new Error('Please fix the form errors');
            const { confirmPassword, ...signupData } = formData;
            return authService.registerStudent(signupData);
        },
        onSuccess: () => {
            toast.success('Welcome to Mentor Matrix! 🎉');
            queryClient.invalidateQueries(['user']);
            navigate('/');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Something went wrong');
        }
    });

    if (signupMutation.isPending) {
        return (
            <div className="auth-root" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Loader size="lg" text="Creating your account..." />
                <style>{authStyles}</style>
            </div>
        );
    }

    const inputClass = (field) =>
        `auth-input${errors[field] ? ' auth-input--error' : ''}${focusedField === field ? ' auth-input--active' : ''}`;

    return (
        <div className="auth-root">
            <div className="auth-bg">
                <Orb style={{ width: 380, height: 380, top: "-60px", left: "-80px", animationDelay: "0s" }} />
                <Orb style={{ width: 260, height: 260, bottom: "40px", right: "-50px", animationDelay: "3s" }} />
                <Orb style={{ width: 160, height: 160, top: "50%", left: "60%", animationDelay: "6s" }} />
                <div className="auth-grid" />
            </div>

            <div className="auth-split">
                {/* Left panel */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7 }}
                    className="auth-left"
                >
                    <Link to="/" className="auth-brand">
                        <div className="auth-brand-icon">
                            <svg viewBox="0 0 40 40" fill="none">
                                <circle cx="20" cy="20" r="18" stroke="url(#gs1)" strokeWidth="2" />
                                <path d="M12 20 L18 14 L24 20 L30 14" stroke="url(#gs1)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M12 26 L18 20 L24 26 L30 20" stroke="#ff6b00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
                                <defs>
                                    <linearGradient id="gs1" x1="0" y1="0" x2="40" y2="40">
                                        <stop stopColor="#ff6b00" /><stop offset="1" stopColor="#ff9d00" />
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
                                Start Your<br />
                                <span className="auth-highlight">Academic Journey</span>
                            </h2>
                            <p className="auth-left-sub">
                                Get personalized mentorship, collaborate on projects, and accelerate your growth as a student.
                            </p>
                        </motion.div>

                        <motion.ul
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.6 }}
                            className="auth-feature-list"
                        >
                            {[
                                "Connect with expert mentors 1-on-1",
                                "Join collaborative project teams",
                                "Track your learning milestones",
                                "Access real-time video sessions",
                            ].map((item) => (
                                <li key={item} className="auth-feature-item">
                                    <span className="auth-feature-dot" />
                                    {item}
                                </li>
                            ))}
                        </motion.ul>
                    </div>
                    <div className="auth-left-deco" />
                </motion.div>

                {/* Right panel */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7 }}
                    className="auth-right"
                    style={{ overflowY: 'auto', paddingTop: '2.5rem', paddingBottom: '2.5rem' }}
                >
                    <div className="auth-card" style={{ maxHeight: 'none' }}>
                        <div className="auth-card-header">
                            <div className="auth-role-badge">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
                                </svg>
                                Student
                            </div>
                            <h1 className="auth-card-title">Create Account</h1>
                            <p className="auth-card-sub">Join Mentor Matrix as a student</p>
                        </div>

                        <AnimatePresence>
                            {Object.keys(errors).length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                    className="auth-alert auth-alert-error"
                                >
                                    <IconAlertCircle size={18} /> Please fix the errors below
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={(e) => { e.preventDefault(); signupMutation.mutate(); }} className="auth-form" noValidate>
                            {/* Name */}
                            <div className={`auth-field ${focusedField === 'name' ? 'auth-field--focused' : ''}`}>
                                <label htmlFor="s-name" className="auth-label">Full Name</label>
                                <div className="auth-input-wrap">
                                    <IconUser size={17} className="auth-input-icon" />
                                    <input id="s-name" name="name" type="text" required
                                        className={inputClass('name')}
                                        placeholder="Alex Johnson"
                                        value={formData.name} onChange={handleChange}
                                        onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)}
                                    />
                                </div>
                                {errors.name && <p className="auth-input-error">{errors.name}</p>}
                            </div>

                            {/* Email */}
                            <div className={`auth-field ${focusedField === 'email' ? 'auth-field--focused' : ''}`}>
                                <label htmlFor="s-email" className="auth-label">Email Address</label>
                                <div className="auth-input-wrap">
                                    <IconMail size={17} className="auth-input-icon" />
                                    <input id="s-email" name="email" type="email" autoComplete="email" required
                                        className={inputClass('email')}
                                        placeholder="you@university.edu"
                                        value={formData.email} onChange={handleChange}
                                        onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                                    />
                                </div>
                                {errors.email && <p className="auth-input-error">{errors.email}</p>}
                            </div>

                            {/* Roll Number */}
                            <div className={`auth-field ${focusedField === 'roll_no' ? 'auth-field--focused' : ''}`}>
                                <label htmlFor="s-roll" className="auth-label">Roll Number</label>
                                <div className="auth-input-wrap">
                                    <IconId size={17} className="auth-input-icon" />
                                    <input id="s-roll" name="roll_no" type="text" required
                                        className={inputClass('roll_no')}
                                        placeholder="e.g. CS2024001"
                                        value={formData.roll_no} onChange={handleChange}
                                        onFocus={() => setFocusedField('roll_no')} onBlur={() => setFocusedField(null)}
                                    />
                                </div>
                                {errors.roll_no && <p className="auth-input-error">{errors.roll_no}</p>}
                            </div>

                            {/* Password */}
                            <div className={`auth-field ${focusedField === 'password' ? 'auth-field--focused' : ''}`}>
                                <label htmlFor="s-password" className="auth-label">Password</label>
                                <div className="auth-input-wrap">
                                    <IconLock size={17} className="auth-input-icon" />
                                    <input id="s-password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" required
                                        className={inputClass('password')}
                                        placeholder="Min. 8 characters"
                                        value={formData.password} onChange={handleChange}
                                        onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)}
                                    />
                                    <button type="button" className="auth-eye-btn" onClick={() => setShowPassword(p => !p)} tabIndex={-1}>
                                        {showPassword ? <IconEyeOff size={17} /> : <IconEye size={17} />}
                                    </button>
                                </div>
                                {errors.password && <p className="auth-input-error">{errors.password}</p>}
                            </div>

                            {/* Confirm Password */}
                            <div className={`auth-field ${focusedField === 'confirmPassword' ? 'auth-field--focused' : ''}`}>
                                <label htmlFor="s-confirm" className="auth-label">Confirm Password</label>
                                <div className="auth-input-wrap">
                                    <IconLock size={17} className="auth-input-icon" />
                                    <input id="s-confirm" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} autoComplete="new-password" required
                                        className={inputClass('confirmPassword')}
                                        placeholder="Repeat your password"
                                        value={formData.confirmPassword} onChange={handleChange}
                                        onFocus={() => setFocusedField('confirmPassword')} onBlur={() => setFocusedField(null)}
                                    />
                                    <button type="button" className="auth-eye-btn" onClick={() => setShowConfirmPassword(p => !p)} tabIndex={-1}>
                                        {showConfirmPassword ? <IconEyeOff size={17} /> : <IconEye size={17} />}
                                    </button>
                                </div>
                                {errors.confirmPassword && <p className="auth-input-error">{errors.confirmPassword}</p>}
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02, boxShadow: "0 8px 32px rgba(255, 107, 0, 0.35)" }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={signupMutation.isPending}
                                className="auth-submit-btn"
                                style={{ marginTop: '0.75rem' }}
                            >
                                {signupMutation.isPending ? (
                                    <span className="auth-btn-loading">
                                        <svg className="auth-spinner" viewBox="0 0 24 24" fill="none">
                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" />
                                        </svg>
                                        Creating account...
                                    </span>
                                ) : (
                                    <>
                                        Create Student Account
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
                                Already have an account?{" "}
                                <Link to="/login" className="auth-link">Sign in</Link>
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
            <style>{`
                .auth-feature-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.75rem; }
                .auth-feature-item { display: flex; align-items: center; gap: 0.65rem; color: rgba(255,255,255,0.55); font-size: 0.88rem; }
                .auth-feature-dot { width: 8px; height: 8px; border-radius: 50%; background: linear-gradient(135deg, #ff6b00, #ff9d00); flex-shrink: 0; box-shadow: 0 0 8px rgba(255,107,0,0.4); }
                .auth-input--error { border-color: rgba(239,68,68,0.5) !important; }
            `}</style>
        </div>
    );
};

export default StudentSignIn;