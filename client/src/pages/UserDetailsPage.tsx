import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getUser } from '@/lib/api'
import { Spinner } from '@/components/ui/Spinner'
import { ErrorBanner } from '@/components/ui/ErrorBanner'
import { UserCard } from '@/components/users/UserCard'

export function UserDetailsPage() {
  const params = useParams()
  const id = Number(params.id)

  const query = useQuery({
    queryKey: ['user', id],
    queryFn: () => getUser(id),
    enabled: Number.isFinite(id),
  })

  if (!Number.isFinite(id)) {
    return <ErrorBanner message="Invalid user id" />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">User Details</h1>
        <Link className="text-sm text-blue-600 hover:underline" to="/users">
          ← Back to list
        </Link>
      </div>

      {query.isLoading ? (
        <div className="py-10">
          <Spinner />
        </div>
      ) : query.isError ? (
        <ErrorBanner message={(query.error as Error).message} />
      ) : !query.data ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-gray-600">Not found</div>
      ) : (
        <UserCard user={query.data} />
      )}
    </div>
  )
}
