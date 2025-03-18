import { BrowserRouter, Route, Routes } from "react-router-dom"
import { lazy, Suspense } from "react"

// ... your lazy imports ...



// Move this to AuthContext
const user =true

const App = () => {
  return (
    <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          
          {/* 404 route */}
          <Route path="*" element={<>Not Found</>} />
        </Routes>
    </BrowserRouter>
  )
}

export default App