import { NavLink } from 'react-router-dom'
import { LayoutDashboard, MapPin, MessageSquare, FileText, Info } from 'lucide-react'
import clsx from 'clsx'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/neighborhoods', label: 'Neighborhoods', icon: MapPin },
  { to: '/feedback', label: 'Feedback', icon: MessageSquare },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/about', label: 'About', icon: Info },
]

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-lt-dark text-white flex flex-col z-50">
      <div className="p-6 border-b border-white/10">
        <h1 className="font-serif text-xl tracking-tight">LemonTree</h1>
        <p className="text-xs text-white/50 mt-1">Food Access Insights</p>
      </div>
      <nav className="flex-1 py-4">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-6 py-3 text-sm transition-colors',
              isActive
                ? 'bg-white/10 text-white border-r-2 border-lt-green-light'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            )}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-6 border-t border-white/10 text-xs text-white/40">
        Morgan Stanley
        <br />Code to Give 2026
      </div>
    </aside>
  )
}
