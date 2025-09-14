import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '@/auth/useAuth'
import { Spinner } from '@/components/ui/Spinner'
import { ErrorBanner } from '@/components/ui/ErrorBanner'
import { Card } from '@/components/ui/Card'

export function AccountPage() {
  const navigate = useNavigate()
  const { user, isLoading, isAuthenticated, logout } = useAuth()

  // Redirect to login if not authenticated and not loading
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login')
    }
  }, [isLoading, isAuthenticated, navigate])

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out successfully')
      navigate('/login')
    } catch (error) {
      toast.error('Failed to logout. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="py-10 flex justify-center">
        <Spinner />
      </div>
    )
  }

  if (!user) {
    return <ErrorBanner message="Authentication required. Please log in." />
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">My Account</h1>
        <p className="text-gray-600 mt-1">View and manage your account information</p>
      </div>

      <Card className="p-6 space-y-4">
        <div>
          <h2 className="text-lg font-medium">Profile Information</h2>
          <div className="mt-4 space-y-3">
            <div>
              <div className="text-sm text-gray-500">User ID</div>
              <div>{user.id}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Email</div>
              <div>{user.email}</div>
            </div>
            {user.name && (
              <div>
                <div className="text-sm text-gray-500">Name</div>
                <div>{user.name}</div>
              </div>
            )}
            <div>
              <div className="text-sm text-gray-500">Role</div>
              <div className={user.role === 'ADMIN' ? 'font-semibold text-blue-600' : ''}>
                {user.role}
                {user.role === 'ADMIN' && ' (You have administrator privileges)'}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Logout
          </button>
        </div>
      </Card>
    </div>
  )
}
