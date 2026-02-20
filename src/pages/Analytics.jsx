import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  Trophy,
  Flame,
  CheckCircle,
  BarChart3
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import api from '../utils/api'

export default function Analytics() {
  const [progressData, setProgressData] = useState(null)
  const [weeklyReport, setWeeklyReport] = useState(null)
  const [calendar, setCalendar] = useState(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('week')

  useEffect(() => {
    fetchData()
  }, [period])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [progressRes, reportRes, calendarRes] = await Promise.all([
        api.get(`/analytics/progress?period=${period}`),
        api.get('/analytics/weekly-report'),
        api.get('/analytics/streak-calendar')
      ])
      setProgressData(progressRes.data)
      setWeeklyReport(reportRes.data)
      setCalendar(calendarRes.data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  const completionChartData = progressData?.completionData?.map(item => ({
    name: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
    completed: item.completed,
    rate: item.rate
  })) || []

  const pieData = [
    { name: 'Completed', value: weeklyReport?.week?.totalCompletions || 0, color: '#10B981' },
    { name: 'Remaining', value: Math.max(0, (weeklyReport?.week?.totalHabits || 7) * 7 - (weeklyReport?.week?.totalCompletions || 0)), color: '#334155' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold">Analytics</h2>
          <p className="text-slate-400">Track your progress and achievements</p>
        </div>
        <div className="flex gap-2">
          {['week', 'month', 'year'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg transition-all ${
                period === p
                  ? 'bg-primary text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Weekly Summary */}
      {weeklyReport && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-primary" />
              </div>
              <span className="text-slate-400">Completions</span>
            </div>
            <div className="text-3xl font-bold">{weeklyReport.week?.totalCompletions || 0}</div>
            <div className="text-sm text-slate-400">This week</div>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <Flame className="w-5 h-5 text-amber-500" />
              </div>
              <span className="text-slate-400">Perfect Days</span>
            </div>
            <div className="text-3xl font-bold">{weeklyReport.week?.perfectDays || 0}</div>
            <div className="text-sm text-slate-400">This week</div>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-secondary" />
              </div>
              <span className="text-slate-400">Completion Rate</span>
            </div>
            <div className="text-3xl font-bold">{weeklyReport.week?.completionRate || 0}%</div>
            <div className="text-sm text-slate-400">This week</div>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-rose-500/20 rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-rose-500" />
              </div>
              <span className="text-slate-400">Achievements</span>
            </div>
            <div className="text-3xl font-bold">{weeklyReport.achievements?.length || 0}</div>
            <div className="text-sm text-slate-400">This week</div>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Completion Chart */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-heading font-semibold mb-4">Completion Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={completionChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1E293B', 
                    border: '1px solid #334155',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ fill: '#10B981', strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Pie Chart */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-heading font-semibold mb-4">Weekly Progress</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1E293B', 
                    border: '1px solid #334155',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <span className="text-sm text-slate-400">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-700"></div>
              <span className="text-sm text-slate-400">Remaining</span>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Report */}
      {weeklyReport && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-heading font-semibold mb-4">Weekly Report</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Motivation */}
            <div className="p-4 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg">
              <h4 className="font-semibold mb-2">💪 Motivation</h4>
              <p className="text-slate-300">{weeklyReport.motivation}</p>
            </div>

            {/* Achievements */}
            <div className="p-4 bg-slate-800/50 rounded-lg">
              <h4 className="font-semibold mb-3">🏆 This Week's Achievements</h4>
              {weeklyReport.achievements?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {weeklyReport.achievements.map((achievement, i) => (
                    <span key={i} className="px-3 py-1 bg-amber-500/20 text-amber-500 rounded-full text-sm">
                      {achievement}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400">No achievements this week. Keep going!</p>
              )}
            </div>
          </div>

          {/* Daily Breakdown */}
          <div className="mt-6">
            <h4 className="font-semibold mb-3">Daily Breakdown</h4>
            <div className="flex gap-2">
              {weeklyReport.daysData?.map((count, i) => (
                <div key={i} className="flex-1 text-center">
                  <div 
                    className={`h-16 rounded-lg flex items-end justify-center mb-2 ${
                      count > 0 ? 'bg-primary/20' : 'bg-slate-800'
                    }`}
                    style={{ 
                      height: `${Math.max(20, count * 20)}px`,
                      backgroundColor: count > 0 ? `rgba(16, 185, 129, ${0.2 + count * 0.1})` : undefined
                    }}
                  >
                    <span className="text-xs text-slate-400 mb-1">{count}</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    {['S','M','T','W','T','F','S'][i]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Challenge Stats */}
      {progressData?.challenges && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-heading font-semibold mb-4">Challenge Statistics</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-800/50 rounded-lg flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{progressData.challenges.active}</div>
                <div className="text-sm text-slate-400">Active Challenges</div>
              </div>
              <Trophy className="w-8 h-8 text-amber-500" />
            </div>
            <div className="p-4 bg-slate-800/50 rounded-lg flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{progressData.challenges.completed}</div>
                <div className="text-sm text-slate-400">Completed Challenges</div>
              </div>
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
          </div>
        </div>
      )}

      {/* Habit Stats */}
      {progressData?.habits && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-heading font-semibold mb-4">Habit Statistics</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-800/50 rounded-lg text-center">
              <div className="text-2xl font-bold text-primary">{progressData.habits.total}</div>
              <div className="text-sm text-slate-400">Total Habits</div>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-lg text-center">
              <div className="text-2xl font-bold text-amber-500">{progressData.habits.totalStreak}</div>
              <div className="text-sm text-slate-400">Total Streaks</div>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-lg text-center">
              <div className="text-2xl font-bold text-rose-500">{progressData.habits.longestStreak}</div>
              <div className="text-sm text-slate-400">Best Streak</div>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-lg text-center">
              <div className="text-2xl font-bold text-secondary">{progressData.user.points}</div>
              <div className="text-sm text-slate-400">Total Points</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
