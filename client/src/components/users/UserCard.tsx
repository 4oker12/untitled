import type { UserDto } from '@/types/user'
import { Card } from '@/components/ui/Card'

export function UserCard({ user }: { user: UserDto }) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-lg font-semibold">{user.email}</div>
          <div className="text-sm text-gray-600">Name: {user.name ?? '—'}</div>
          <div className="text-sm text-gray-600">Created: {new Date(user.createdAt).toLocaleString()}</div>
        </div>
        <div className="text-xs text-gray-500">ID: {user.id}</div>
      </div>
    </Card>
  )
}
