import { Link } from 'react-router-dom'
import type { UserDto } from '@/types/user'
import { Card } from '@/components/ui/Card'

export function UsersTable({ items }: { items: UserDto[] }) {
  return (
    <Card className="p-4">
      <div className="hidden md:block">
        <table className="w-full table-auto">
          <thead>
            <tr className="text-left text-sm text-gray-500">
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Created</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((u) => (
              <tr key={u.id} className="border-t border-gray-100">
                <td className="px-3 py-3 font-medium">{u.email}</td>
                <td className="px-3 py-3">{u.name ?? '—'}</td>
                <td className="px-3 py-3 text-sm text-gray-500">{new Date(u.createdAt).toLocaleString()}</td>
                <td className="px-3 py-3 text-right">
                  <Link className="text-blue-600 hover:underline" to={`/users/${u.id}`}>
                    Details →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {items.map((u) => (
          <Link key={u.id} to={`/users/${u.id}`} className="block rounded-xl border border-gray-200 p-3 hover:bg-gray-50">
            <div className="font-medium">{u.email}</div>
            <div className="text-sm text-gray-600">{u.name ?? '—'}</div>
            <div className="text-xs text-gray-500">{new Date(u.createdAt).toLocaleString()}</div>
          </Link>
        ))}
      </div>
    </Card>
  )
}
