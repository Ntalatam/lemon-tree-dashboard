import { NavLink } from 'react-router-dom'
import { LayoutDashboard, MapPin, MessageSquare, FileText, Info, Menu, X, GitCompare } from 'lucide-react'
import clsx from 'clsx'
import { useState } from 'react'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/neighborhoods', label: 'Neighborhoods', icon: MapPin },
  { to: '/boroughs', label: 'Borough Comparison', icon: GitCompare },
  { to: '/feedback', label: 'Feedback', icon: MessageSquare },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/about', label: 'About', icon: Info },
]

export default function Sidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-lt-dark text-white p-2 rounded-md"
        aria-label="Open navigation"
      >
        <Menu size={20} />
      </button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        'fixed left-0 top-0 h-screen w-60 bg-lt-dark text-white flex flex-col z-50 transition-transform duration-200',
        'lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-xl tracking-tight">LemonTree</h1>
            <p className="text-xs text-white/50 mt-1">Food Access Insights</p>
          </div>
          <button onClick={() => setOpen(false)} className="lg:hidden text-white/50 hover:text-white" aria-label="Close navigation">
            <X size={18} />
          </button>
        </div>
        <nav className="flex-1 py-4">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setOpen(false)}
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
    </>
  )
}
