import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { login } from '../../service/authService';
import { IconAlertCircle } from '@tabler/icons-react';
import { motion } from 'motion/react';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when user types
    if (errorMessage) setErrorMessage('');
  };

  const loginMutation = useMutation({
    mutationFn: () => login(formData.email, formData.password),
    onSuccess: (data) => {
      console.log('Login successful:', data);
      navigate('/dashboard');
    },
    onError: (error) => {
      console.error('Login failed:', error);
      setErrorMessage(
        error.response?.data?.message || 
        'Login failed. Please check your credentials and try again.'
      );
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    loginMutation.mutate();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 p-8 bg-card rounded-xl shadow-lg border border-border"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold">Welcome Back</h2>
          <p className="mt-2 text-muted-foreground">Sign in to continue to Mentor Matrix</p>
        </div>
        
        {errorMessage && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-lg flex items-center gap-2">
            <IconAlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit} aria-label="Login form">
          <div className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                value={formData.email}
                onChange={handleChange}
                aria-describedby="email-error"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="password" className="block text-sm font-medium">
                  Password
                </label>
                <Link to="/forgot-password" className="text-sm text-primary hover:text-primary/80">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                value={formData.password}
                onChange={handleChange}
                aria-describedby="password-error"
              />
            </div>
          </div>

          <div>
            <button
              disabled={loginMutation.isPending}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium rounded-lg px-5 py-2.5 text-center transition-colors"
              aria-busy={loginMutation.isPending}
            >
              {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
          
          <div className="text-sm text-center">
            <p className="text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary hover:text-primary/80 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
