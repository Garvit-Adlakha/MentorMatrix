import { BrowserRouter, Route, Routes } from "react-router-dom"
import { lazy, Suspense } from "react"

// Lazy load page components
const HomePage = lazy(() => import("./Pages/HomePage"))
const Login = lazy(() => import("./Components/auth/Login"))
const Signup = lazy(() => import("./Components/auth/Signup"))
// Move this to AuthContext
const user = true

const App = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login/>} />
          <Route path="/signup" element={<Signup />} />
          
          {/* 404 route */}
          <Route path="*" element={<>Not Found</>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App