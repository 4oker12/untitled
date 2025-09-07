export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
      <div className="font-semibold">Something went wrong</div>
      <div className="text-sm opacity-80">{message}</div>
    </div>
  )
}
