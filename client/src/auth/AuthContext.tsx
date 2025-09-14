import { createContext } from 'react'
import { AuthContextType } from './types'

// Create the auth context with a default value
export const AuthContext = createContext<AuthContextType | null>(null)
