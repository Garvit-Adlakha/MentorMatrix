import { BrowserRouter, Route, Routes } from "react-router-dom"
import { lazy, Suspense } from "react"
import AppRouter from "./router"
import { QueryClientProvider,QueryClient } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

// Move this to AuthContext
const user = true

const App = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: false,
      },
    },
  })
  return (
    <>
    <QueryClientProvider client={queryClient}>
    <ReactQueryDevtools initialIsOpen={false} />
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
    </QueryClientProvider>
    </>
  )
}

export default App