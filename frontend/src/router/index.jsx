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
const ChatPage = lazy(() => import("../Pages/ChatPage"))
const CollaborationPage = lazy(() => import("../Pages/CollaborationPage"))

const AppRouter = () => { 
    return (
        <Routes>
            {/* Public routes - no authentication check */}
            <Route path="/" element={
                <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader size="lg" text="Loading homepage..." /></div>}>
                    <HomePage />
                </Suspense>
            } />
            <Route path="/mentor" element={
                <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader size="lg" text="Loading mentors..." /></div>}>
                    <MentorPage />
                </Suspense>
            } />
           
            {/* Auth routes - redirect to dashboard if already logged in */}
            <Route path="/login" element={
                <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader size="lg" text="Loading login..." /></div>}>
                    <Protected requiredAuth={false} redirect="/dashboard">
                        <Login />
                    </Protected>
                </Suspense>
            } />
            <Route path="/signup" element={
                <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader size="lg" text="Loading signup..." /></div>}>
                    <Protected requiredAuth={false} redirect="/dashboard">
                        <Signup />
                    </Protected>
                </Suspense>
            } />
            
            {/* Protected routes - redirect to login if not logged in */}
            <Route path="/dashboard" element={
                <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader size="lg" text="Loading dashboard..." /></div>}>
                    <Protected requiredAuth={true} redirect="/login">
                        <Dashboard />
                    </Protected>
                </Suspense>
            } />
            <Route path="/profile" element={
                <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader size="lg" text="Loading profile..." /></div>}>
                    <Protected requiredAuth={true} redirect="/login">
                        <Profile />
                    </Protected>
                </Suspense>
            } />
            <Route path="/chat/:id" element={
                <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader size="lg" text="Loading chat..." /></div>}>
                    <Protected requiredAuth={true} redirect="/login">
                        <ChatPage />
                    </Protected>
                </Suspense>
            } />
            <Route path="/chat" element={
                <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader size="lg" text="Loading chat..." /></div>}>
                    <Protected requiredAuth={true} redirect="/login">
                        <ChatPage />
                    </Protected>
                </Suspense>
            } />
            <Route path="/collaborate" element={
                <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader size="lg" text="Loading collaborate..." /></div>}>
                    <Protected requiredAuth={true} redirect="/login">
                        <CollaborationPage />
                    </Protected>
                </Suspense>
            } />
            

            
            {/* 404 route */}
            <Route path="*" element={
                <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader size="lg" text="Page not found" /></div>}>
                    <div>Not Found</div>
                </Suspense>
            } />
        </Routes>
    );
};

export default AppRouter;