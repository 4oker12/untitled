import { Navigate, Route, Routes } from 'react-router-dom'
import { Header } from '@/components/ui/Header'
import { UsersPage } from '@/pages/UsersPage'
import { UserDetailsPage } from '@/pages/UserDetailsPage'
import { HealthPage } from '@/pages/HealthPage'

export default function App() {
  return (
    <div className="min-h-dvh">
      <Header />
      <main className="container mx-auto max-w-6xl px-4 py-6">
        <Routes>
          <Route path="/" element={<Navigate to="/users" replace />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/users/:id" element={<UserDetailsPage />} />
          <Route path="/health" element={<HealthPage />} />
        </Routes>
      </main>
    </div>
  )
}
