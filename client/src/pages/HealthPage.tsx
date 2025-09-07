import { useQuery } from '@tanstack/react-query'
import { getHealth } from '@/lib/api'
import { Spinner } from '@/components/ui/Spinner'
import { ErrorBanner } from '@/components/ui/ErrorBanner'
import { Card } from '@/components/ui/Card'

export function HealthPage() {
  const query = useQuery({ queryKey: ['health'], queryFn: getHealth })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Health</h1>

      {query.isLoading ? (
        <div className="py-10">
          <Spinner />
        </div>
      ) : query.isError ? (
        <ErrorBanner message={(query.error as Error).message} />
      ) : (
        <Card className="p-4">
          <pre className="text-sm text-gray-800">{JSON.stringify(query.data, null, 2)}</pre>
        </Card>
      )}
    </div>
  )
}
