import { useQuery } from "@tanstack/react-query"
import { Navigate, Outlet } from "react-router-dom"
import authService from "../../service/authService.js"
import React from 'react'

const Protected = ({ children, redirect = '/login', requiredAuth = true }) => {
    const { data: user, isLoading, isError } = useQuery({
        queryKey: ['user'],
        queryFn:()=> authService.currentUser(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        retry: false
    })

    // Enhanced authentication check
    const authConditionMet = requiredAuth ? !!user : !user

    // Redirect if authentication condition is not met
    if (!authConditionMet) {
        return <Navigate to={redirect} replace />
    }

    // Render children or outlet
    return children?children : <Outlet />
}

export default Protected