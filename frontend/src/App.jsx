import { BrowserRouter, Route, Routes } from "react-router-dom"
import { lazy, Suspense } from "react"

// Lazy load page components
const HomePage = lazy(() => import("./Pages/HomePage"))
const Login = lazy(() => import("./components/auth/Login"))
const Signup = lazy(() => import("./components/auth/Signup"))
const MentorPage=lazy(()=> import("./Pages/MentorPage"))
const Dashboard=lazy(()=> import("./Pages/Dashboard"))
// Move this to AuthContext
const user = true

const App = () => {
  return (
    <>
    <BrowserRouter>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/mentor" element={<MentorPage />} />
          <Route path="/login" element={<Login/>} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* 404 route */}
          <Route path="*" element={<>Not Found</>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
    </>
  )
}

export default App