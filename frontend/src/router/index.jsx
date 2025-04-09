import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Protected from '../components/auth/Protected';
import Loader from '../components/ui/Loader';

// Lazy load page components
const HomePage = lazy(() => import("../Pages/HomePage"))
const Login = lazy(() => import("../components/auth/Login"))
const Signup = lazy(() => import("../components/auth/Signup"))
const MentorPage = lazy(() => import("../Pages/MentorPage"))
const Dashboard = lazy(() => import("../Pages/Dashboard"))
const Profile = lazy(() => import("../Pages/Profile"))

const AppRouter = () => { 
    return (
        <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader size="lg" text="Loading application..." /></div>}>
            <Routes>
                {/* Public routes - no authentication check */}
                <Route path="/" element={<HomePage />} />
                <Route path="/mentor" element={<MentorPage />} />
               
                {/* Auth routes - redirect to dashboard if already logged in */}
                <Route path="/login" element={
                    <Protected requiredAuth={false} redirect="/dashboard">
                    <Login />
                    </Protected>
                    } />
                <Route path="/signup" element={
                    <Protected requiredAuth={false} redirect="/dashboard">
                    <Signup />
                    </Protected>
                    } />
                
                {/* Protected routes - redirect to login if not logged in */}
                <Route path="/dashboard" element={
                    <Protected requiredAuth={true} redirect="/login">
                        <Dashboard />
                    </Protected>
                } />
                <Route path="/profile" element={
                    <Protected requiredAuth={true} redirect="/login">
                        <Profile />
                    </Protected>
                } />
                
                {/* 404 route */}
                <Route path="*" element={<div>Not Found</div>} />
            </Routes>
        </Suspense>
    );
};

export default AppRouter;