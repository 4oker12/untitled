import { z } from 'zod'
import type { UserDto } from '@/types/user'

export const API_URL: string = (import.meta as any).env?.VITE_API_URL ?? (globalThis as any).import_meta_env?.VITE_API_URL ?? 'http://localhost:4001'

async function json<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      'Accept': 'application/json',
    },
    ...init,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`)
  }
  return res.json() as Promise<T>
}

// Optional zod schemas to validate responses (kept minimal)
const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string().nullable().optional(),
  createdAt: z.string(),
})

const UsersListSchema = z.object({
  items: z.array(UserSchema),
  total: z.number(),
  count: z.number(),
  skip: z.number(),
  take: z.number(),
})

export type UsersListResponse = z.infer<typeof UsersListSchema>

export async function getUsers(params?: { skip?: number; take?: number; search?: string; order?: string }): Promise<UsersListResponse> {
  const url = new URL('/users', API_URL)
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v))
    }
  }
  const data = await json<unknown>(url.pathname + (url.search || ''))
  const parsed = UsersListSchema.safeParse(data)
  if (parsed.success) return parsed.data
  // Fallback to loose typing if schema fails (do not hard crash UI)
  return data as any
}

export async function getUser(id: number): Promise<UserDto | null> {
  const data = await json<unknown>(`/users/${id}`)
  const parsed = UserSchema.safeParse(data)
  if (parsed.success) return parsed.data
  // If backend returns 200 but shape is different, attempt best-effort cast
  return (data as any) ?? null
}

export async function getHealth(): Promise<any> {
  return json<any>('/health')
}

export async function getDebug(): Promise<any> {
  return json<any>('/debug')
}

export { json }
