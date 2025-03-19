import { BrowserRouter, Route, Routes } from "react-router-dom"
import { lazy, Suspense } from "react"
import HomePage from "./Pages/HomePage"
// ... your lazy imports ...

import LoginSignupPage from "./Pages/LoginSignupPage"

// Move this to AuthContext
const user =true

const App = () => {
  return (
    <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginSignupPage />} />
          
          {/* 404 route */}
          <Route path="*" element={<>Not Found</>} />
        </Routes>
    </BrowserRouter>
  )
}

export default App