import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { IconAlertCircle, IconLock, IconMail, IconEye, IconEyeOff } from '../../components/ui/Icons';
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import authService from "../../service/authService";
import Loader from "../../components/ui/Loader";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  const navigate = useNavigate();
  const location = useLocation();



  // Check if user was redirected from signup with success message
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const success = params.get("success");
    if (success) {
      setSuccessMessage("Account created successfully. Please login.");
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setErrorMessage("All fields are required");
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMessage("Please enter a valid email address");
      return false;
    }
    
    return true;
  };

  const queryClient=useQueryClient()

 const handleLoginMutation = useMutation({
      mutationFn: ()=> authService.login(formData),
      onSuccess: () => {
        setIsSubmitting(false);
        setSuccessMessage("Login successful!");
        queryClient.invalidateQueries(["user"]);
        toast.success("Login successful!");
        navigate("/dashboard");
      },
      onError: (error) => {
        setIsSubmitting(false);
        setErrorMessage(error.response.data.message || "Login failed. Please try again.");
        toast.error(error.response.data.message || "Login failed. Please try again.");
      },
 })

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      await handleLoginMutation.mutateAsync();
    } finally {
      setIsSubmitting(false);
    }
  };

  if(handleLoginMutation.isLoading) {
    return (
      <div>
        <Loader />
      </div>
    )
  }

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-background/60 px-4 py-12">
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
          <h2 className="text-2xl font-bold text-foreground">Welcome Back</h2>
          <p className="mt-2 text-muted-foreground">Sign in to continue to your account</p>
        </div>
        
        <div className="bg-card/80 backdrop-blur-sm rounded-xl shadow-lg border border-border/50 p-8">
          {successMessage && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-500/30 text-green-700 dark:text-green-300 p-4 rounded-lg flex items-center gap-3 mb-6" role="alert">
              <div className="p-1 bg-green-100 dark:bg-green-800/30 rounded-full">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <span>{successMessage}</span>
            </div>
          )}
          
          {errorMessage && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-500/30 text-red-700 dark:text-red-300 p-4 rounded-lg flex items-center gap-3 mb-6" role="alert">
              <div className="p-1 bg-red-100 dark:bg-red-800/30 rounded-full">
                <IconAlertCircle size={18} className="text-red-500" />
              </div>
              <span>{errorMessage}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  className="block w-full pl-10 pr-3 py-3 border border-border bg-card/50 focus:ring-2 focus:ring-primary/30 focus:border-primary/30 rounded-lg transition-all placeholder:text-muted-foreground"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-foreground">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-primary hover:text-primary/90 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IconLock size={18} className="text-muted-foreground" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="block w-full pl-10 pr-10 py-3 border border-border bg-card/50 focus:ring-2 focus:ring-primary/30 focus:border-primary/30 rounded-lg transition-all"
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
            </div>
            
            <div>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={isSubmitting}
                className={`relative w-full py-3 px-4 flex justify-center items-center rounded-lg text-white font-medium transition-all ${
                  isSubmitting ? "bg-primary/70 cursor-not-allowed" : "bg-primary hover:bg-primary/90"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </motion.button>
            </div>
          </form>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:text-primary/90 font-medium transition-colors">
              Sign up now
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
