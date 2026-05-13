import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import { IconAlertCircle, IconLock, IconMail, IconEye, IconEyeOff, IconUser, IconBuilding, IconSchool, IconTags } from '../../components/ui/Icons';
import authService from '../../service/authService';
import Loader from '../../components/ui/Loader';
import AccountVerificationModal from './AccountVerificationModal';
import { authStyles } from './Login';

const Orb = ({ style }) => <div className="auth-orb" style={style} />;

const MentorSignUp = () => {
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', confirmPassword: '',
        department: '', university: '', expertise: [], currentExpertise: ''
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleAddExpertise = () => {
        const trimmed = formData.currentExpertise.trim();
        if (trimmed && !formData.expertise.includes(trimmed)) {
            setFormData(prev => ({ ...prev, expertise: [...prev.expertise, trimmed], currentExpertise: '' }));
            if (errors.expertise) setErrors(prev => ({ ...prev, expertise: '' }));
        }
    };

    const handleRemoveExpertise = (index) => {
        setFormData(prev => ({ ...prev, expertise: prev.expertise.filter((_, i) => i !== index) }));
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') { e.preventDefault(); handleAddExpertise(); }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) newErrors.email = 'Please enter a valid email';
        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        if (!formData.department.trim()) newErrors.department = 'Department is required';
        if (!formData.university.trim()) newErrors.university = 'University is required';
        if (formData.expertise.length === 0) newErrors.expertise = 'At least one area of expertise is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const queryClient = useQueryClient();

    const signupMutation = useMutation({
        mutationFn: async () => {
            if (!validateForm()) throw new Error('Please fix the form errors');
            const { confirmPassword, currentExpertise, ...signupData } = formData;
            return authService.registerMentor(signupData);
        },
        onSuccess: () => {
            setShowVerificationModal(true);
            queryClient.invalidateQueries(['user']);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Something went wrong');
        }
    });

    const handleDismissModal = () => { setShowVerificationModal(false); navigate('/login'); };

    if (signupMutation.isPending) {
        return (
            <div className="auth-root" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Loader size="lg" text="Setting up your mentor profile..." />
                <style>{authStyles}</style>
            </div>
        );
    }

    const inputClass = (field) => `auth-input${errors[field] ? ' auth-input--error' : ''}`;

    return (
        <div className="auth-root">
            {showVerificationModal && <AccountVerificationModal onDismiss={handleDismissModal} />}

            <div className="auth-bg">
                <Orb style={{ width: 400, height: 400, top: "-80px", right: "-80px", animationDelay: "0s" }} />
                <Orb style={{ width: 240, height: 240, bottom: "30px", left: "-40px", animationDelay: "2.5s" }} />
                <Orb style={{ width: 160, height: 160, top: "35%", left: "30%", animationDelay: "5s" }} />
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
                                <circle cx="20" cy="20" r="18" stroke="url(#gm1)" strokeWidth="2" />
                                <path d="M12 20 L18 14 L24 20 L30 14" stroke="url(#gm1)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M12 26 L18 20 L24 26 L30 20" stroke="#ff6b00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
                                <defs>
                                    <linearGradient id="gm1" x1="0" y1="0" x2="40" y2="40">
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
                                Share Your<br />
                                <span className="auth-highlight">Expertise &amp; Lead.</span>
                            </h2>
                            <p className="auth-left-sub">
                                Become a mentor on Campus Connect and make a real difference in students' academic journeys.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.6 }}
                            className="auth-mentor-perks"
                        >
                            {[
                                { icon: "🎯", title: "Impactful Guidance", desc: "Help students navigate real challenges" },
                                { icon: "🤝", title: "Grow Your Network", desc: "Connect with driven learners" },
                                { icon: "⚡", title: "Flexible Sessions", desc: "Set your own availability" },
                            ].map(({ icon, title, desc }) => (
                                <div key={title} className="auth-perk">
                                    <span className="auth-perk-icon">{icon}</span>
                                    <div>
                                        <div className="auth-perk-title">{title}</div>
                                        <div className="auth-perk-desc">{desc}</div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
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
                            <div className="auth-role-badge" style={{
                                background: 'rgba(255,157,0,0.1)',
                                borderColor: 'rgba(255,157,0,0.25)',
                                color: '#ff9d00'
                            }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
                                    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                                </svg>
                                Mentor
                            </div>
                            <h1 className="auth-card-title">Become a Mentor</h1>
                            <p className="auth-card-sub">Share your knowledge with students worldwide</p>
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
                                <label htmlFor="m-name" className="auth-label">Full Name</label>
                                <div className="auth-input-wrap">
                                    <IconUser size={17} className="auth-input-icon" />
                                    <input id="m-name" name="name" type="text" required className={inputClass('name')}
                                        placeholder="Dr. Jane Smith" value={formData.name} onChange={handleChange}
                                        onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)} />
                                </div>
                                {errors.name && <p className="auth-input-error">{errors.name}</p>}
                            </div>

                            {/* Email */}
                            <div className={`auth-field ${focusedField === 'email' ? 'auth-field--focused' : ''}`}>
                                <label htmlFor="m-email" className="auth-label">Email Address</label>
                                <div className="auth-input-wrap">
                                    <IconMail size={17} className="auth-input-icon" />
                                    <input id="m-email" name="email" type="email" autoComplete="email" required className={inputClass('email')}
                                        placeholder="mentor@university.edu" value={formData.email} onChange={handleChange}
                                        onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)} />
                                </div>
                                {errors.email && <p className="auth-input-error">{errors.email}</p>}
                            </div>

                            {/* Two-column: Department + University */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className={`auth-field ${focusedField === 'department' ? 'auth-field--focused' : ''}`}>
                                    <label htmlFor="m-dept" className="auth-label">Department</label>
                                    <div className="auth-input-wrap">
                                        <IconBuilding size={17} className="auth-input-icon" />
                                        <input id="m-dept" name="department" type="text" required className={inputClass('department')}
                                            placeholder="Computer Science" value={formData.department} onChange={handleChange}
                                            onFocus={() => setFocusedField('department')} onBlur={() => setFocusedField(null)} />
                                    </div>
                                    {errors.department && <p className="auth-input-error">{errors.department}</p>}
                                </div>

                                <div className={`auth-field ${focusedField === 'university' ? 'auth-field--focused' : ''}`}>
                                    <label htmlFor="m-uni" className="auth-label">University</label>
                                    <div className="auth-input-wrap">
                                        <IconSchool size={17} className="auth-input-icon" />
                                        <input id="m-uni" name="university" type="text" required className={inputClass('university')}
                                            placeholder="MIT" value={formData.university} onChange={handleChange}
                                            onFocus={() => setFocusedField('university')} onBlur={() => setFocusedField(null)} />
                                    </div>
                                    {errors.university && <p className="auth-input-error">{errors.university}</p>}
                                </div>
                            </div>

                            {/* Expertise */}
                            <div className={`auth-field ${focusedField === 'currentExpertise' ? 'auth-field--focused' : ''}`}>
                                <label className="auth-label">Areas of Expertise</label>
                                <div className="auth-input-wrap">
                                    <IconTags size={17} className="auth-input-icon" />
                                    <input
                                        type="text" name="currentExpertise"
                                        value={formData.currentExpertise} onChange={handleChange} onKeyPress={handleKeyPress}
                                        className={`auth-input${errors.expertise ? ' auth-input--error' : ''}`}
                                        style={{ paddingRight: '5rem' }}
                                        placeholder="e.g. Machine Learning"
                                        onFocus={() => setFocusedField('currentExpertise')} onBlur={() => setFocusedField(null)}
                                    />
                                    <button
                                        type="button" onClick={handleAddExpertise}
                                        style={{
                                            position: 'absolute', right: '0.5rem',
                                            background: 'rgba(255,107,0,0.15)', border: '1px solid rgba(255,107,0,0.3)',
                                            borderRadius: '6px', color: '#ff6b00', padding: '0.25rem 0.6rem',
                                            fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap'
                                        }}
                                    >Add</button>
                                </div>
                                {errors.expertise && <p className="auth-input-error">{errors.expertise}</p>}
                                {formData.expertise.length > 0 && (
                                    <div className="auth-tags-wrap">
                                        {formData.expertise.map((exp, idx) => (
                                            <span key={idx} className="auth-tag-chip">
                                                {exp}
                                                <button type="button" className="auth-tag-remove" onClick={() => handleRemoveExpertise(idx)}>×</button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Password */}
                            <div className={`auth-field ${focusedField === 'password' ? 'auth-field--focused' : ''}`}>
                                <label htmlFor="m-password" className="auth-label">Password</label>
                                <div className="auth-input-wrap">
                                    <IconLock size={17} className="auth-input-icon" />
                                    <input id="m-password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" required
                                        className={inputClass('password')} placeholder="Min. 8 characters"
                                        value={formData.password} onChange={handleChange}
                                        onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)} />
                                    <button type="button" className="auth-eye-btn" onClick={() => setShowPassword(p => !p)} tabIndex={-1}>
                                        {showPassword ? <IconEyeOff size={17} /> : <IconEye size={17} />}
                                    </button>
                                </div>
                                {errors.password && <p className="auth-input-error">{errors.password}</p>}
                            </div>

                            {/* Confirm Password */}
                            <div className={`auth-field ${focusedField === 'confirmPassword' ? 'auth-field--focused' : ''}`}>
                                <label htmlFor="m-confirm" className="auth-label">Confirm Password</label>
                                <div className="auth-input-wrap">
                                    <IconLock size={17} className="auth-input-icon" />
                                    <input id="m-confirm" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} autoComplete="new-password" required
                                        className={inputClass('confirmPassword')} placeholder="Repeat your password"
                                        value={formData.confirmPassword} onChange={handleChange}
                                        onFocus={() => setFocusedField('confirmPassword')} onBlur={() => setFocusedField(null)} />
                                    <button type="button" className="auth-eye-btn" onClick={() => setShowConfirmPassword(p => !p)} tabIndex={-1}>
                                        {showConfirmPassword ? <IconEyeOff size={17} /> : <IconEye size={17} />}
                                    </button>
                                </div>
                                {errors.confirmPassword && <p className="auth-input-error">{errors.confirmPassword}</p>}
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02, boxShadow: "0 8px 32px rgba(255, 157, 0, 0.35)" }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={signupMutation.isPending}
                                className="auth-submit-btn"
                                style={{ marginTop: '0.75rem', background: 'linear-gradient(135deg, #ff9d00 0%, #e08000 100%)' }}
                            >
                                {signupMutation.isPending ? (
                                    <span className="auth-btn-loading">
                                        <svg className="auth-spinner" viewBox="0 0 24 24" fill="none">
                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" />
                                        </svg>
                                        Creating mentor profile...
                                    </span>
                                ) : (
                                    <>
                                        Apply as Mentor
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
                                Are you a student?{" "}
                                <Link to="/signup" className="auth-link">Sign up as Student</Link>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            <style>{authStyles}</style>
            <style>{`
                .auth-input--error { border-color: rgba(239,68,68,0.5) !important; }
                .auth-mentor-perks { display: flex; flex-direction: column; gap: 1.1rem; }
                .auth-perk { display: flex; align-items: flex-start; gap: 0.75rem; }
                .auth-perk-icon { font-size: 1.2rem; line-height: 1; flex-shrink: 0; margin-top: 0.1rem; }
                .auth-perk-title { font-size: 0.88rem; font-weight: 600; color: rgba(255,255,255,0.8); margin-bottom: 0.15rem; }
                .auth-perk-desc { font-size: 0.78rem; color: rgba(255,255,255,0.35); }
            `}</style>
        </div>
    );
};

export default MentorSignUp;