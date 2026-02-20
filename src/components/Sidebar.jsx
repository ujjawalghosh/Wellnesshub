import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard,
  Dumbbell,
  CheckSquare,
  Trophy,
  Brain,
  BarChart3,
  Award,
  User,
  LogOut,
  Leaf
} from 'lucide-react'

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/wellness-plan', icon: Dumbbell, label: 'Wellness Plan' },
  { path: '/habits', icon: CheckSquare, label: 'Habits' },
  { path: '/challenges', icon: Trophy, label: 'Challenges' },
  { path: '/breaks', icon: Brain, label: 'Mindful Breaks' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/achievements', icon: Award, label: 'Achievements' },
  { path: '/profile', icon: User, label: 'Profile' }
]

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user, logout } = useAuth()

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 z-50 transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Logo */}
      <div className="h-20 flex items-center px-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          {isOpen && (
            <span className="font-heading font-bold text-xl text-gradient">
              WellnessHub
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {isOpen && <span className="font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700/50">
        <div className={`flex items-center gap-3 ${!isOpen && 'justify-center'}`}>
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
            alt={user?.name}
            className="w-10 h-10 rounded-full bg-slate-700"
          />
          {isOpen && (
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{user?.name}</p>
              <p className="text-xs text-slate-400">Level {user?.level || 1}</p>
            </div>
          )}
          {isOpen && (
            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
