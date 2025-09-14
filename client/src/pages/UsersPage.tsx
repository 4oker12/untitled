import { useState } from 'react'
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { getUsers } from '@/lib/api'
import { Spinner } from '@/components/ui/Spinner'
import { ErrorBanner } from '@/components/ui/ErrorBanner'
import { UsersTable } from '@/components/users/UsersTable'

const TAKE_OPTIONS = [10, 20]

export function UsersPage() {
  const queryClient = useQueryClient()

  const [skip, setSkip] = useState(0)
  const [take, setTake] = useState(10)

  const query = useQuery({
    queryKey: ['users', { skip, take }],
    queryFn: () => getUsers({ skip, take }),
    placeholderData: keepPreviousData(),
  })

  const total = query.data?.total ?? 0
  const count = query.data?.count ?? 0

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Users</h1>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Per page:</label>
          <select
            className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm"
            value={take}
            onChange={(e) => {
              setSkip(0)
              setTake(parseInt(e.target.value))
            }}
          >
            {TAKE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <button
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['users'] })}
          >
            Refresh
          </button>
        </div>
      </div>

      {query.isLoading ? (
        <div className="py-10">
          <Spinner />
        </div>
      ) : query.isError ? (
        <ErrorBanner message={(query.error as Error).message} />
      ) : (
        <div className="space-y-3">
          <div className="text-sm text-gray-600">
            Showing {query.data?.items.length ?? 0} of {count} (total in DB: {total})
          </div>
          <UsersTable items={query.data?.items ?? []} />
          <div className="flex items-center justify-between">
            <button
              className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm disabled:opacity-50"
              disabled={skip === 0}
              onClick={() => setSkip(Math.max(0, skip - take))}
            >
              ← Prev
            </button>
            <div className="text-sm text-gray-600">
              Page {Math.floor(skip / take) + 1}
            </div>
            <button
              className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm disabled:opacity-50"
              disabled={skip + take >= count}
              onClick={() => setSkip(skip + take)}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
