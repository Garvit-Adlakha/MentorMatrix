import { useSuspenseQuery } from "@tanstack/react-query"
import { Navigate, Outlet } from "react-router-dom"
import authService from "../../service/authService.js"
import PropTypes from 'prop-types'
    
const Protected = ({ children, redirect = '/login', requiredAuth = true, requiredRole }) => {
    const { data: user } = useSuspenseQuery({
        queryKey: ['user'],
        queryFn:() => authService.currentUser(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        retry: 1,
    })

    // 1. User is NOT logged in
    if (!user) {
        if (requiredAuth) { // Trying to access a protected route that requires login
            return <Navigate to={redirect} replace />;
        }
        // Not logged in, and route is public (requiredAuth = false).
        // This allows anonymous access to /, /mentor, /login, /signup.
        return children || <Outlet />;
    }

    // 2. User IS logged in. All subsequent logic assumes `user` exists.

    // 2a. Special handling for login/signup type pages when user is already logged in.
    // These routes have `requiredAuth = false` and NO `requiredRole` in your router setup.
    if (!requiredAuth && !requiredRole) {
        return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />;
    }

    // 2b. Role-based access control for all other scenarios where user is logged in.
    // This covers: 
    //    - Fully protected routes (requiredAuth = true)
    //    - Public-facing routes with role restrictions (requiredAuth = false, but requiredRole IS set, like for / and /mentor)

    // Handle Admin users
    if (user.role === "admin") {
        // If the route requires "admin" or has no specific role, allow admin.
        if (requiredRole === "admin" || !requiredRole) {
            return children || <Outlet />;
        }
        // Otherwise, admin is on a route not meant for them (e.g., a student-only page, or / and /mentor)
        return <Navigate to="/admin" replace />;
    }

    // Handle Student or Mentor users
    if (user.role === "student" || user.role === "mentor") {
        if (requiredRole === "admin") { // Student/Mentor trying to access an admin-only route
            return <Navigate to="/dashboard" replace />;
        }
        if (requiredRole) { // Check if current route has specific role requirements
            const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
            if (roles.includes(user.role)) {
                return children || <Outlet />; // Role matches (e.g., student on / or /mentor)
            }
            // Role does not match (e.g. student trying to access a mentor-specific page, if one existed)
            return <Navigate to="/dashboard" replace />;
        }
        // No specific requiredRole for this route, and user is student/mentor (e.g., /dashboard, /profile)
        return children || <Outlet />;
    }
    
    // Fallback for any other role or unexpected scenario (should ideally not be reached)
    return <Navigate to="/login" replace />;
}

Protected.propTypes = {
    children: PropTypes.node,
    redirect: PropTypes.string,
    requiredAuth: PropTypes.bool,
    requiredRole: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string)
    ])
}

export default Protected