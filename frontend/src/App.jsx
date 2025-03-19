import { BrowserRouter, Route, Routes } from "react-router-dom"
import { lazy, Suspense } from "react"

// Lazy load page components
const HomePage = lazy(() => import("./Pages/HomePage"))
const LoginSignupPage = lazy(() => import("./Pages/LoginSignupPage"))

// Move this to AuthContext
const user = true

const App = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginSignupPage />} />
          
          {/* 404 route */}
          <Route path="*" element={<>Not Found</>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App