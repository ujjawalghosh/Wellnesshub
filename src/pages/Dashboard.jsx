import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Target, 
  Flame, 
  Trophy, 
  TrendingUp, 
  CheckCircle,
  ArrowRight,
  Droplets,
  Brain,
  Dumbbell,
  Calendar
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      console.log('Fetching dashboard data...')
      const response = await api.get('/analytics/dashboard')
      console.log('Dashboard data received:', response.data)
      setData(response.data)
    } catch (error) {
      console.error('Error fetching dashboard:', error)
      console.error('Error response:', error.response)
      console.error('Error message:', error.message)
      
      // Check if it's a 401 error (unauthorized)
      if (error.response?.status === 401) {
        console.error('Unauthorized - token might be invalid')
      }
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    { icon: Target, label: 'View Plan', path: '/wellness-plan', color: 'bg-primary' },
    { icon: CheckCircle, label: 'Track Habits', path: '/habits', color: 'bg-secondary' },
    { icon: Trophy, label: 'Join Challenge', path: '/challenges', color: 'bg-amber-500' },
    { icon: Brain, label: 'Take a Break', path: '/breaks', color: 'bg-rose-500' }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-gradient p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-heading font-bold mb-2">
            Welcome back, {user?.name}! 👋
          </h2>
          <p className="text-slate-400 mb-4">
            Here's your wellness overview for today
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-4 py-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <span className="font-bold">{user?.points || 0}</span>
              <span className="text-slate-400">points</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-4 py-2">
              <Trophy className="w-5 h-5 text-purple-500" />
              <span className="font-bold">Level {user?.level || 1}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link
              to={action.path}
              className="glass-card-hover p-4 flex flex-col items-center text-center"
            >
              <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mb-3`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <span className="font-medium">{action.label}</span>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's Habits */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-heading font-semibold">Today's Habits</h3>
            <Link to="/habits" className="text-primary text-sm flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="space-y-3">
            {data?.habits?.list?.length > 0 ? (
              data.habits.list.map((habit, i) => (
                <motion.div
                  key={habit._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: habit.color || '#10B981' }}
                    />
                    <span>{habit.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-400">
                      🔥 {habit.streak}
                    </span>
                    {habit.completedToday ? (
                      <CheckCircle className="w-5 h-5 text-primary" />
                    ) : (
                      <Link 
                        to="/habits" 
                        className="w-5 h-5 rounded-full border-2 border-slate-600 hover:border-primary"
                      />
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400">
                <p>No habits yet</p>
                <Link to="/habits" className="text-primary text-sm mt-2 inline-block">
                  Create your first habit
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Active Challenges */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-heading font-semibold">Active Challenges</h3>
            <Link to="/challenges" className="text-primary text-sm flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="space-y-3">
            {data?.challenges?.list?.length > 0 ? (
              data.challenges.list.map((challenge, i) => (
                <motion.div
                  key={challenge._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-3 bg-slate-800/50 rounded-lg"
                >
                  <h4 className="font-medium mb-2">{challenge.title}</h4>
                  <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
                    <div 
                      className="bg-primary h-2 rounded-full"
                      style={{ 
                        width: `${Math.min((challenge.participants[0]?.progress / challenge.goal) * 100, 100)}%` 
                      }}
                    />
                  </div>
                  <p className="text-xs text-slate-400">
                    {challenge.participants[0]?.progress || 0} / {challenge.goal} {challenge.goalUnit}
                  </p>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No active challenges</p>
                <Link to="/challenges" className="text-primary text-sm mt-2 inline-block">
                  Join a challenge
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Wellness Plan Preview */}
      {data?.plan && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-heading font-semibold">Your Wellness Plan</h3>
            <Link to="/wellness-plan" className="text-primary text-sm flex items-center gap-1">
              View Full Plan <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-800/50 rounded-lg">
              <Dumbbell className="w-8 h-8 text-primary mb-2" />
              <h4 className="font-medium mb-1">Workout</h4>
              <p className="text-sm text-slate-400">{data.plan.workout?.length || 0} exercises</p>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-lg">
              <Calendar className="w-8 h-8 text-secondary mb-2" />
              <h4 className="font-medium mb-1">Diet</h4>
              <p className="text-sm text-slate-400">{data.plan.diet?.length || 0} days</p>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-lg">
              <Brain className="w-8 h-8 text-amber-500 mb-2" />
              <h4 className="font-medium mb-1">Meditation</h4>
              <p className="text-sm text-slate-400">{data.plan.meditation?.length || 0} sessions</p>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-lg">
              <TrendingUp className="w-8 h-8 text-rose-500 mb-2" />
              <h4 className="font-medium mb-1">Sleep</h4>
              <p className="text-sm text-slate-400">{data.plan.sleepSchedule?.duration || 8}h/night</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-4 text-center"
        >
          <div className="text-3xl font-bold text-primary mb-1">
            {data?.habits?.todayCompleted || 0}/{data?.habits?.total || 0}
          </div>
          <div className="text-sm text-slate-400">Today's Progress</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4 text-center"
        >
          <div className="text-3xl font-bold text-amber-500 mb-1">
            {data?.challenges?.active || 0}
          </div>
          <div className="text-sm text-slate-400">Active Challenges</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-4 text-center"
        >
          <div className="text-3xl font-bold text-purple-500 mb-1">
            {user?.badges?.length || 0}
          </div>
          <div className="text-sm text-slate-400">Badges Earned</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-4 text-center"
        >
          <div className="text-3xl font-bold text-rose-500 mb-1">
            {user?.level || 1}
          </div>
          <div className="text-sm text-slate-400">Current Level</div>
        </motion.div>
      </div>
    </div>
  )
}
