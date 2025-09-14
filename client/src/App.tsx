import { Navigate, Route, Routes } from 'react-router-dom'
import { Header } from '@/components/ui/Header'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { AccountPage } from '@/pages/auth/AccountPage'
import { UsersPage } from '@/pages/UsersPage'
import { useAuth } from '@/auth/useAuth'
import { Role } from '@/types/role'

// Protected route component that requires authentication
function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode, requiredRole?: Role }) {
  const { isAuthenticated, user, isLoading } = useAuth()

  if (isLoading) {
    return <div className="p-4 text-center">Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <div className="p-4 text-center text-red-600">
      You don't have permission to access this page.
    </div>
  }

  return <>{children}</>
}

export default function App() {
  return (
    <div className="min-h-dvh">
      <Header />
      <main className="container mx-auto max-w-6xl px-4 py-6">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Auth routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/account" element={
            <ProtectedRoute>
              <AccountPage />
            </ProtectedRoute>
          } />

          {/* Admin routes */}
          <Route path="/users" element={
            <ProtectedRoute requiredRole={Role.ADMIN}>
              <UsersPage />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
    </div>
  )
}
