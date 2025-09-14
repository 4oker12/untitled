import { NavLink } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import { Role } from '@/types/role'

export function Header() {
  const { user, isAuthenticated, logout } = useAuth()

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`

  const isAdmin = user?.role === Role.ADMIN

  return (
    <header className="bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-10">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="flex h-14 items-center justify-between">
          <div className="text-lg font-semibold">Your App</div>

          <div className="flex items-center gap-4">
            {isAuthenticated && (
              <div className="text-sm text-gray-600">
                Signed in as <span className="font-medium">{user?.email}</span>
                {isAdmin && (
                  <span className="ml-1 text-xs text-blue-600 font-medium">(Admin)</span>
                )}
              </div>
            )}

            <nav className="flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <NavLink to="/account" className={navLinkClass}>
                    Account
                  </NavLink>

                  {/* Admin-only link to Users page */}
                  {isAdmin && (
                    <NavLink to="/users" className={navLinkClass}>
                      Users
                    </NavLink>
                  )}

                  <button
                    onClick={() => logout()}
                    className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login" className={navLinkClass}>
                    Login
                  </NavLink>
                  <NavLink to="/register" className={navLinkClass}>
                    Register
                  </NavLink>
                </>
              )}
            </nav>
          </div>
        </div>
      </div>
    </header>
  )
}
