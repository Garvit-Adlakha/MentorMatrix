import { BrowserRouter, Route, Routes } from "react-router-dom"
import { lazy, Suspense } from "react"
import AppRouter from "./router"

// Move this to AuthContext
const user = true

const App = () => {
  return (
    <>
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
    </>
  )
}

export default App