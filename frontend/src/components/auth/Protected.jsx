import { useQuery } from "@tanstack/react-query"
import { Navigate, Outlet } from "react-router-dom"
import authService from "../../service/authService.js"
import React, { useState, useEffect } from 'react'
import Loader from "../ui/Loader.jsx"

const Protected = ({ children, redirect = '/login', requiredAuth = true }) => {
    const [isInitialLoad, setIsInitialLoad] = useState(true)
    
    const { data: user, isLoading, isError } = useQuery({
        queryKey: ['user'],
        queryFn:() => authService.currentUser(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        retry: 1,
        onSettled: () => {
            // Mark initial load as complete once we get a response (success or error)
            setIsInitialLoad(false)
        }
    })

    // Show loader only during initial page load
    if (isInitialLoad && isLoading) {
        return <div className="h-screen flex items-center justify-center">
            <Loader size="lg" text="Verifying authentication..." />
        </div>
    }

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