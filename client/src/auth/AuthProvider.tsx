import { useEffect, useState, ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getMe, postLogin, postLogout, postRefresh, postRegister } from '@/lib/api'
import { User } from './types'
import { AuthContext } from './AuthContext'

// Props for the AuthProvider component
type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const queryClient = useQueryClient()

  // Function to load the current user
  const loadMe = async (): Promise<boolean> => {
    try {
      const userData = await getMe()
      setUser(userData)
      return true
    } catch (err) {
      console.error('Failed to load user:', err)
      return false
    }
  }

  // Function to refresh the token
  const refresh = async (): Promise<boolean> => {
    try {
      await postRefresh()
      return true
    } catch (err) {
      console.error('Failed to refresh token:', err)
      setUser(null)
      return false
    }
  }

  // Function to login
  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      await postLogin({ email, password })
      await loadMe()
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Function to logout
  const logout = async (): Promise<void> => {
    setIsLoading(true)
    try {
      await postLogout()
      setUser(null)
      // Invalidate all queries to ensure fresh data after login
      queryClient.invalidateQueries()
    } catch (err) {
      console.error('Logout error:', err)
      // Still clear user even if API call fails
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Function to register
  const register = async (email: string, password: string, name?: string): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      await postRegister({ email, password, name })
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Effect to initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true)
      try {
        // Try to refresh the token first
        const refreshed = await refresh()
        if (refreshed) {
          // If refresh succeeded, load the user
          await loadMe()
        }
      } catch (err) {
        console.error('Auth initialization error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  // Create a custom fetch function that handles token refresh
  useEffect(() => {
    // Create a response interceptor for the fetch API
    const originalFetch = window.fetch
    window.fetch = async (input, init) => {
      // Call the original fetch
      let response = await originalFetch(input, init)

      // If the response is 401 Unauthorized, try to refresh the token once
      if (response.status === 401) {
        const refreshed = await refresh()
        if (refreshed) {
          // If refresh succeeded, retry the original request
          response = await originalFetch(input, init)
        }
      }

      return response
    }

    // Cleanup function to restore the original fetch
    return () => {
      window.fetch = originalFetch
    }
  }, [])

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    login,
    logout,
    register,
    refresh,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
