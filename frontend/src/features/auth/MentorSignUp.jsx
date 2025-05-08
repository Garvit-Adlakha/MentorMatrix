import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { motion } from 'motion/react';
import { IconAlertCircle, IconLock, IconMail, IconEye, IconEyeOff, IconUser, IconBuilding, IconSchool, IconTags } from '../../components/ui/Icons';
import authService from '../../service/authService';
import Loader from '../../components/ui/Loader';
import AccountVerificationModal from './AccountVerificationModal';

const MentorSignUp = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        department: '',
        university: '',
        expertise: [],
        currentExpertise: ''
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleAddExpertise = () => {
        if (formData.currentExpertise.trim()) {
            setFormData(prev => ({
                ...prev,
                expertise: [...prev.expertise, prev.currentExpertise.trim()],
                currentExpertise: ''
            }));
        }
    };

    const handleRemoveExpertise = (index) => {
        setFormData(prev => ({
            ...prev,
            expertise: prev.expertise.filter((_, i) => i !== index)
        }));
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddExpertise();
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }
        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        if (!formData.department.trim()) newErrors.department = 'Department is required';
        if (!formData.university.trim()) newErrors.university = 'University is required';
        if (formData.expertise.length === 0) newErrors.expertise = 'At least one area of expertise is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const signupMutation = useMutation({
        mutationFn: async () => {
            if (!validateForm()) {
                throw new Error('Please fix the form errors');
            }
            const { confirmPassword, currentExpertise, ...signupData } = formData;
            return authService.registerMentor(signupData);
        },
        onSuccess: () => {
            setShowVerificationModal(true);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Something went wrong');
        }
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        signupMutation.mutate();
    };

    const togglePasswordVisibility = () => {
        setShowPassword(prev => !prev);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(prev => !prev);
    };

    const handleDismissModal = () => {
        setShowVerificationModal(false);
        navigate('/login');
    };

    if (signupMutation.isPending) {
        return (
            <div className='flex justify-center items-center h-screen'>
                <Loader size='lg' text='Creating your account...' />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-background/60 px-4 py-12">
            {showVerificationModal && (
                <AccountVerificationModal onDismiss={handleDismissModal} />
            )}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full space-y-6"
            >
                <div className="text-center mb-8">
                    <Link to="/" className="inline-block mb-6">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            MentorMatrix
                        </h1>
                    </Link>
                    <h2 className="text-2xl font-bold text-foreground">Become a Mentor</h2>
                    <p className="mt-2 text-muted-foreground">Join our community of mentors</p>
                </div>

                <div className="bg-card/80 backdrop-blur-sm rounded-xl shadow-lg border border-border/50 p-8">
                    {Object.keys(errors).length > 0 && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-500/30 text-red-700 dark:text-red-300 p-4 rounded-lg flex items-center gap-3 mb-6" role="alert">
                            <div className="p-1 bg-red-100 dark:bg-red-800/30 rounded-full">
                                <IconAlertCircle size={18} className="text-red-500" />
                            </div>
                            <span>Please fix the errors in the form</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
                                Full Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <IconUser size={18} className="text-muted-foreground" />
                                </div>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    className={`block w-full pl-10 pr-3 py-3 border ${errors.name ? 'border-red-500' : 'border-border'} bg-card/50 focus:ring-2 focus:ring-primary/30 focus:border-primary/30 rounded-lg transition-all placeholder:text-muted-foreground`}
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <IconMail size={18} className="text-muted-foreground" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className={`block w-full pl-10 pr-3 py-3 border ${errors.email ? 'border-red-500' : 'border-border'} bg-card/50 focus:ring-2 focus:ring-primary/30 focus:border-primary/30 rounded-lg transition-all placeholder:text-muted-foreground`}
                                    placeholder="your.email@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                        </div>

                        <div>
                            <label htmlFor="department" className="block text-sm font-medium text-foreground mb-1">
                                Department
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <IconBuilding size={18} className="text-muted-foreground" />
                                </div>
                                <input
                                    id="department"
                                    name="department"
                                    type="text"
                                    required
                                    className={`block w-full pl-10 pr-3 py-3 border ${errors.department ? 'border-red-500' : 'border-border'} bg-card/50 focus:ring-2 focus:ring-primary/30 focus:border-primary/30 rounded-lg transition-all placeholder:text-muted-foreground`}
                                    placeholder="Computer Science"
                                    value={formData.department}
                                    onChange={handleChange}
                                />
                            </div>
                            {errors.department && <p className="mt-1 text-sm text-red-600">{errors.department}</p>}
                        </div>

                        <div>
                            <label htmlFor="university" className="block text-sm font-medium text-foreground mb-1">
                                University
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <IconSchool size={18} className="text-muted-foreground" />
                                </div>
                                <input
                                    id="university"
                                    name="university"
                                    type="text"
                                    required
                                    className={`block w-full pl-10 pr-3 py-3 border ${errors.university ? 'border-red-500' : 'border-border'} bg-card/50 focus:ring-2 focus:ring-primary/30 focus:border-primary/30 rounded-lg transition-all placeholder:text-muted-foreground`}
                                    placeholder="Your University"
                                    value={formData.university}
                                    onChange={handleChange}
                                />
                            </div>
                            {errors.university && <p className="mt-1 text-sm text-red-600">{errors.university}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                                Areas of Expertise
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <IconTags size={18} className="text-muted-foreground" />
                                </div>
                                <input
                                    type="text"
                                    name="currentExpertise"
                                    value={formData.currentExpertise}
                                    onChange={handleChange}
                                    onKeyPress={handleKeyPress}
                                    className={`block w-full pl-10 pr-3 py-3 border ${errors.expertise ? 'border-red-500' : 'border-border'} bg-card/50 focus:ring-2 focus:ring-primary/30 focus:border-primary/30 rounded-lg transition-all placeholder:text-muted-foreground`}
                                    placeholder="Add expertise (press Enter)"
                                />
                            </div>
                            {errors.expertise && <p className="mt-1 text-sm text-red-600">{errors.expertise}</p>}
                            
                            <div className="mt-2 flex flex-wrap gap-2">
                                {formData.expertise.map((exp, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary"
                                    >
                                        {exp}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveExpertise(index)}
                                            className="ml-2 text-primary hover:text-primary/80"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <IconLock size={18} className="text-muted-foreground" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    required
                                    className={`block w-full pl-10 pr-10 py-3 border ${errors.password ? 'border-red-500' : 'border-border'} bg-card/50 focus:ring-2 focus:ring-primary/30 focus:border-primary/30 rounded-lg transition-all`}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={togglePasswordVisibility}
                                    tabIndex="-1"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <IconEyeOff size={18} className="text-muted-foreground hover:text-foreground" />
                                    ) : (
                                        <IconEye size={18} className="text-muted-foreground hover:text-foreground" />
                                    )}
                                </button>
                            </div>
                            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <IconLock size={18} className="text-muted-foreground" />
                                </div>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    required
                                    className={`block w-full pl-10 pr-10 py-3 border ${errors.confirmPassword ? 'border-red-500' : 'border-border'} bg-card/50 focus:ring-2 focus:ring-primary/30 focus:border-primary/30 rounded-lg transition-all`}
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={toggleConfirmPasswordVisibility}
                                    tabIndex="-1"
                                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                >
                                    {showConfirmPassword ? (
                                        <IconEyeOff size={18} className="text-muted-foreground hover:text-foreground" />
                                    ) : (
                                        <IconEye size={18} className="text-muted-foreground hover:text-foreground" />
                                    )}
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                        </div>

                        <div>
                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                type="submit"
                                disabled={signupMutation.isPending}
                                className={`relative w-full py-3 px-4 flex justify-center items-center rounded-lg text-white font-medium transition-all ${
                                    signupMutation.isPending ? "bg-primary/70 cursor-not-allowed" : "bg-primary hover:bg-primary/90"
                                }`}
                            >
                                {signupMutation.isPending ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating account...
                                    </>
                                ) : (
                                    "Sign up"
                                )}
                            </motion.button>
                        </div>
                    </form>
                </div>

                <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link to="/login" className="text-primary hover:text-primary/90 font-medium transition-colors">
                            Sign in
                        </Link>
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                        Are you a student?{" "}
                        <Link to="/signup" className="text-primary hover:text-primary/90 font-medium transition-colors">
                            Sign up as Student
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default MentorSignUp; 