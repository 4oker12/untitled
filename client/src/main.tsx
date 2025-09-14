import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'sonner'
import App from './App'
import { AuthProvider } from '@/auth/AuthProvider'
import '@/styles/index.css'

const isDev = import.meta.env.MODE !== 'production'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: isDev ? 1 : 3,
      refetchOnWindowFocus: false,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <App />
          <Toaster position="top-right" richColors />
        </BrowserRouter>
        {isDev ? <ReactQueryDevtools initialIsOpen={false} /> : null}
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
