import { useSuspenseQuery } from "@tanstack/react-query"
import { Navigate, Outlet } from "react-router-dom"
import authService from "../../service/authService.js"
    
const Protected = ({ children, redirect = '/login', requiredAuth = true }) => {
    const { data: user } = useSuspenseQuery({
        queryKey: ['user'],
        queryFn:() => authService.currentUser(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        retry: 1,
    })

    // Enhanced authentication check
    const authConditionMet = requiredAuth ? !!user : !user
    
    // Redirect if authentication condition is not met
    if (!authConditionMet) {
        return <Navigate to={redirect} replace />
    }

    // Render children or outlet
    return children || <Outlet />
}

export default Protected