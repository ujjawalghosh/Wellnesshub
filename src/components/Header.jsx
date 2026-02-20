import { useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Menu, Bell, Search, Flame } from 'lucide-react'

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/wellness-plan': 'Wellness Plan',
  '/habits': 'Habit Tracker',
  '/challenges': 'Challenges',
  '/breaks': 'Mindful Breaks',
  '/analytics': 'Analytics',
  '/achievements': 'Achievements',
  '/profile': 'Profile'
}

export default function Header({ onMenuClick }) {
  const location = useLocation()
  const { user } = useAuth()

  const pageTitle = pageTitles[location.pathname] || 'WellnessHub'

  return (
    <header className="fixed top-0 right-0 left-64 h-20 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 z-40">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left - Menu & Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-heading font-semibold">{pageTitle}</h1>
        </div>

        {/* Right - Search, Notifications, Points */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="hidden md:flex items-center gap-2 bg-slate-800/50 rounded-lg px-4 py-2">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent border-none outline-none text-sm w-40 placeholder-slate-500"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Points */}
          <Link
            to="/achievements"
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-lg px-4 py-2"
          >
            <Flame className="w-5 h-5 text-amber-500" />
            <span className="font-bold text-amber-500">{user?.points || 0}</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
