import AppRouter from "./router"
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"
import { BrowserRouter } from "react-router-dom"
import { Toaster } from 'react-hot-toast'

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
      <BrowserRouter>
      <AppRouter />
      </BrowserRouter>
      <Toaster 
        position="top-right" 
        reverseOrder={false}
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
            borderRadius: '8px',
            padding: '16px',
            fontSize: '16px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.2s ease-in-out',
            transform: 'translateY(-10px)',
            opacity: 0,
            zIndex: 10000, // Very high z-index to ensure visibility
          },
        }}
        containerStyle={{
          zIndex: 10000, // Ensure the container also has high z-index
        }}
      />
    </QueryClientProvider>
    </>
  )
}

export default App