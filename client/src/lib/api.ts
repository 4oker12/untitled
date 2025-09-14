import { z } from 'zod'
import { graphqlRequest, LOGIN_MUTATION, ME_QUERY, USERS_QUERY } from './graphql'

export const API_URL: string = import.meta.env.VITE_API_URL ?? "http://localhost:4001"

// Helper to get the current access token from memory
let accessToken: string | null = null
export const setAccessToken = (token: string | null) => { accessToken = token }
export const getAccessToken = () => accessToken

// User types
export interface User {
  id: number;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
}

// Typed fetch helper with credentials and auth header
async function fetchWithAuth<T>(
  path: string,
  init?: RequestInit,
  skipAuth: boolean = false
): Promise<T> {
  const headers: HeadersInit = {
    'Accept': 'application/json',
    ...(init?.headers || {}),
  }

  // Add Authorization header if we have an access token and skipAuth is false
  if (accessToken && !skipAuth) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  const res = await fetch(`${API_URL}${path}`, {
    credentials: 'include', // Always include credentials for cookies
    headers,
    ...init,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`)
  }

  return res.json() as Promise<T>
}

// Legacy json function for backward compatibility
async function json<T>(path: string, init?: RequestInit): Promise<T> {
  return fetchWithAuth<T>(path, init)
}

// No user or health schemas needed anymore

export async function getDebug(): Promise<any> {
  return json<any>('/debug')
}

// Authentication API functions

// Register a new user
export async function postRegister(data: {
  email: string;
  password: string;
  name?: string
}): Promise<void | { message?: string }> {
  return fetchWithAuth<void | { message?: string }>('/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }, true) // Skip auth for registration
}

// Login a user
export async function postLogin(data: {
  email: string;
  password: string
}): Promise<{ accessToken: string, refreshToken: string, user: User }> {
  try {
    // Use GraphQL login mutation
    const { login } = await graphqlRequest<{ login: { accessToken: string, refreshToken: string, user: User } }>(
      LOGIN_MUTATION,
      { email: data.email, password: data.password },
      true, // Skip auth for login
      null // No token needed for login
    );

    // Store the access token in memory
    if (login.accessToken) {
      setAccessToken(login.accessToken);
    }

    return login;
  } catch (error) {
    console.error('GraphQL login error:', error);
    throw error;
  }
}

// Logout a user
export async function postLogout(): Promise<void> {
  await fetchWithAuth<void>('/auth/logout', {
    method: 'POST',
  })

  // Clear the access token from memory
  setAccessToken(null)
}

// Refresh the access token
export async function postRefresh(): Promise<{ accessToken: string }> {
  try {
    const response = await fetchWithAuth<{ accessToken: string }>('/auth/refresh', {
      method: 'POST',
    }, true) // Skip auth for refresh

    // Store the new access token in memory
    if (response.accessToken) {
      setAccessToken(response.accessToken)
    }

    return response
  } catch (error) {
    // Clear the access token if refresh fails
    setAccessToken(null)
    throw error
  }
}

import { Role } from '@/types/role'

// Get the current user
export async function getMe(): Promise<{ id: number; email: string; name?: string | null; role: Role }> {
  try {
    // Check if we have an access token before making the request
    if (!accessToken) {
      throw new Error('No access token available. Please log in again.');
    }

    // Use GraphQL me query
    const { me } = await graphqlRequest<{ me: { id: number; email: string; name?: string | null; role: Role } }>(
      ME_QUERY,
      {}, // No variables
      false, // Don't skip auth
      accessToken // Pass the current access token
    );
    return me;
  } catch (error) {
    console.error('GraphQL me query error:', error);
    throw error;
  }
}

// Get users (admin only)
export async function getUsers(params?: {
  skip?: number;
  take?: number;
  search?: string;
  order?: string;
}): Promise<{
  items: User[];
  total: number;
  count: number;
  skip: number;
  take: number;
}> {
  try {
    // Use GraphQL usersQuery
    const { usersQuery } = await graphqlRequest<{ usersQuery: User[] }>(
      USERS_QUERY,
      {}, // No variables
      false, // Don't skip auth
      accessToken // Pass the current access token
    );

    // Since the GraphQL query doesn't support pagination yet, we'll handle it client-side
    const skip = params?.skip || 0;
    const take = params?.take || 10;

    // Filter and sort if needed (basic implementation)
    let filteredUsers = [...usersQuery];

    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      filteredUsers = filteredUsers.filter(user =>
        user.email.toLowerCase().includes(searchLower) ||
        (user.name && user.name.toLowerCase().includes(searchLower))
      );
    }

    // Sort if needed
    if (params?.order) {
      const [field, direction] = params.order.split(':');
      filteredUsers.sort((a: any, b: any) => {
        const aValue = a[field];
        const bValue = b[field];
        const modifier = direction === 'desc' ? -1 : 1;

        if (aValue < bValue) return -1 * modifier;
        if (aValue > bValue) return 1 * modifier;
        return 0;
      });
    }

    const total = filteredUsers.length;
    const items = filteredUsers.slice(skip, skip + take);

    return {
      items,
      total,
      count: total,
      skip,
      take
    };
  } catch (error) {
    console.error('GraphQL users query error:', error);
    throw error;
  }
}

export { json }
