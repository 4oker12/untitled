import { Role } from '@/types/role'

// Define the user type
export type User = {
  id: number
  email: string
  name?: string | null
  role: Role
}

// Define the auth context type
export type AuthContextType = {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: Error | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (email: string, password: string, name?: string) => Promise<void>
  refresh: () => Promise<boolean>
}
