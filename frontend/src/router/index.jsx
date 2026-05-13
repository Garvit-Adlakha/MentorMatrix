import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Loader from '../components/ui/Loader';
import Protected from '../features/auth/Protected'
import NotFound from '../Pages/NotFound';

// Lazy load page components
const HomePage = lazy(() => import("../Pages/HomePage"))
const Login = lazy(() => import("../features/auth/Login"))
const Signup = lazy(()=> import("../features/auth/StudentSignUp"))
const MentorSignIn = lazy(() => import("../features/auth/MentorSignUp"))
const ForgotPassword = lazy(() => import("../features/auth/ForgotPassword"))
const ResetPassword = lazy(() => import("../features/auth/ResetPassword"))
const MentorPage = lazy(() => import("../Pages/MentorPage"))
const Dashboard = lazy(() => import("../Pages/Dashboard"))
const Profile = lazy(() => import("../Pages/Profile"))
const ChatPage = lazy(() => import("../Pages/ChatPage"))
const CollaborationPage = lazy(() => import("../Pages/CollaborationPage"))
const ProjectDetailPage = lazy(() => import("../Pages/ProjectDetailPage"))
const MeetingRoomPage = lazy(() => import("../Pages/MeetingRoomPage"));

// Admin components
const AdminDashboard = lazy(() => import("../components/admin/AdminDashboard"))
const AdminUsers = lazy(() => import("../components/admin/Users"))
const AdminMentorRequests = lazy(() => import("../components/admin/MentorRequests"))

const AppRouter = () => { 
    return (
        <Routes>
            {/* Public routes - no authentication check but block admin access */}
            <Route path="/" element={
                <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader size="lg" text="Loading homepage..." /></div>}>
                    <Protected requiredAuth={false} requiredRole={["student", "mentor"]}>
                        <HomePage />
                    </Protected>
                </Suspense>
            } />
            <Route path="/mentor" element={
                <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader size="lg" text="Discovering mentors..." /></div>}>
                    <Protected requiredAuth={false} requiredRole="student">
                        <MentorPage />
                    </Protected>
                </Suspense>
            } />
           
            {/* Auth routes - redirect to dashboard if already logged in */}
            <Route path="/login" element={
                <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader size="lg" text="Preparing login..." /></div>}>
                    <Protected requiredAuth={false} redirect="/dashboard">
                        <Login />
                    </Protected>
                </Suspense>
            } />
            <Route path="/signup" element={
                <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader size="lg" text="Preparing signup..." /></div>}>
                    <Protected requiredAuth={false} redirect="/dashboard">
                        <Signup />
                    </Protected>
                </Suspense>
            } />
            <Route path="/forgot-password" element={
                <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader size="lg" text="Loading password recovery..." /></div>}>
                    <Protected requiredAuth={false} redirect="/dashboard">
                        <ForgotPassword />
                    </Protected>
                </Suspense>
            } />
            <Route path="/reset-password/:token" element={
                <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader size="lg" text="Preparing password reset..." /></div>}>
                    <Protected requiredAuth={false} redirect="/dashboard">
                        <ResetPassword />
                    </Protected>
                </Suspense>
            } />
            <Route path="/signup/mentor" element={
                <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader size="lg" text="Preparing mentor signup..." /></div>}>
                    <MentorSignIn />
                </Suspense>
            } />
            
            {/* Protected routes - redirect to login if not logged in */}
            <Route path="/dashboard" element={
                <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader size="lg" text="Preparing your dashboard..." /></div>}>
                    <Protected requiredAuth={true} redirect="/login">
                        <Dashboard />
                    </Protected>
                </Suspense>
            } />
            <Route path="/profile" element={
                <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader size="lg" text="Loading your profile..." /></div>}>
                    <Protected requiredAuth={true} redirect="/login">
                        <Profile />
                    </Protected>
                </Suspense>
            } />
            <Route path="/projects/:projectId" element={
                <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader size="lg" text="Fetching project details..." /></div>}>
                    <Protected requiredAuth={true} redirect="/login">
                        <ProjectDetailPage />
                    </Protected>
                </Suspense>
            } />
            <Route path="/chat/:chatId" element={
                <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader size="lg" text="Loading conversations..." /></div>}>
                    <Protected requiredAuth={true} redirect="/login">
                        <ChatPage />
                    </Protected>
                </Suspense>
            } />
            <Route path="/chat" element={
                <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader size="lg" text="Loading conversations..." /></div>}>
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
            <Route path="/meetings/:meetingId" element={
                <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader size="lg" text="Loading meeting..." /></div>}>
                    <Protected requiredAuth={true} redirect="/login">
                        <MeetingRoomPage />
                    </Protected>
                </Suspense>
            } />

            {/* Admin routes - protected and require admin role */}
            <Route path="/admin" element={
                <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader size="lg" text="Loading admin..." /></div>}>
                    <Protected requiredAuth={true} redirect="/login" requiredRole="admin">
                        <AdminDashboard />
                    </Protected>
                </Suspense>
            } />
            <Route path="/admin/users" element={
                <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader size="lg" text="Loading user directory..." /></div>}>
                    <Protected requiredAuth={true} redirect="/login" requiredRole="admin">
                        <AdminUsers />
                    </Protected>
                </Suspense>
            } />
            <Route path="/admin/mentor-requests" element={
                <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader size="lg" text="Loading mentor requests..." /></div>}>
                    <Protected requiredAuth={true} redirect="/login" requiredRole="admin">
                        <AdminMentorRequests />
                    </Protected>
                </Suspense>
            } />
            
            {/* 404 route */}
            <Route path="*" element={
                <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader size="lg" text="Page not found" /></div>}>
                   <NotFound />
                </Suspense>
            } />
        </Routes>
    );
};

export default AppRouter;