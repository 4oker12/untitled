import { NavLink } from 'react-router-dom'

export function Header() {
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`

  return (
    <header className="bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-10">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="flex h-14 items-center justify-between">
          <div className="text-lg font-semibold">Your App</div>
          <nav className="flex items-center gap-2">
            <NavLink to="/users" className={navLinkClass}>
              Users
            </NavLink>
            <NavLink to="/health" className={navLinkClass}>
              Health
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  )
}
