import { Routes, Route } from 'react-router-dom';
import { lazy } from 'react';
// Lazy load page components
const HomePage = lazy(() => import("../Pages/HomePage"))
const Login = lazy(() => import("../components/auth/Login"))
const Signup = lazy(() => import("../components/auth/Signup"))
const MentorPage=lazy(()=> import("../Pages/MentorPage"))
const Dashboard=lazy(()=> import("../Pages/Dashboard"))
const Profile=lazy(()=> import("../Pages/Profile"))
// Move this to AuthContext
const user = true

const AppRouter = () => { 
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/mentor" element={<MentorPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/Dashboard" element={<Dashboard/>} />
            <Route path="/Profile" element={<Profile/>} />
            
            {/* 404 route */}
            <Route path="*" element={<div>Not Found</div>} />
        </Routes>
    );
};

export default AppRouter;