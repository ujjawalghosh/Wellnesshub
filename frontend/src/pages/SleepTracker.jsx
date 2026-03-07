import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Moon, Sun, Clock, Star, Bed, Calendar, TrendingUp } from 'lucide-react'
import api from '../utils/api'

const qualityLabels = {
  1: 'Very Poor',
  2: 'Poor',
  3: 'Fair',
  4: 'Good',
  5: 'Excellent'
}

export default function SleepTracker() {
  const [logs, setLogs] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    bedtime: '',
    wakeTime: '',
    quality: 3,
    notes: '',
    factors: []
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [logsRes, statsRes] = await Promise.all([
        api.get('/sleep'),
        api.get('/sleep/stats/weekly')
      ])
      setLogs(logsRes.data)
      setStats(statsRes.data)
    } catch (error) {
      console.error('Error fetching sleep data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/sleep', formData)
      setShowForm(false)
      fetchData()
      setFormData({
        bedtime: '',
        wakeTime: '',
        quality: 3,
        notes: '',
        factors: []
      })
    } catch (error) {
      console.error('Error saving sleep:', error)
    }
  }

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  const latestLog = logs[0]
  const weeklyAvg = stats?.averageHours || 0
  const weeklyQuality = stats?.averageQuality || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold flex items-center gap-3">
          <Moon className="w-8 h-8 text-indigo-500" />
          Sleep Tracker
        </h1>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowForm(true)}
          className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-medium"
        >
          Log Sleep
        </motion.button>
      </div>

      {/* Weekly Overview */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-primary" />
            <span className="text-slate-400">Weekly Average</span>
          </div>
          <div className="text-3xl font-bold">{weeklyAvg}h</div>
          <div className="text-sm text-slate-400">per night</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-amber-500" />
            <span className="text-slate-400">Avg Quality</span>
          </div>
          <div className="text-3xl font-bold">{weeklyQuality}/5</div>
          <div className="text-sm text-slate-400">{qualityLabels[Math.round(weeklyQuality)] || 'N/A'}</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <Bed className="w-5 h-5 text-indigo-500" />
            <span className="text-slate-400">Nights Tracked</span>
          </div>
          <div className="text-3xl font-bold">{logs.length}</div>
          <div className="text-sm text-slate-400">this month</div>
        </motion.div>
      </div>

      {/* Last Night's Sleep */}
      {latestLog && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-heading font-semibold mb-4">Last Night's Sleep</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-1">
                {Math.round(latestLog.duration / 60 * 10) / 10}h
              </div>
              <div className="text-slate-400 text-sm">Duration</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-amber-500 mb-1">
                {latestLog.quality}/5
              </div>
              <div className="text-slate-400 text-sm">Quality</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-500 mb-1">
                {new Date(latestLog.bedtime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-slate-400 text-sm">Bedtime</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-500 mb-1">
                {new Date(latestLog.wakeTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-slate-400 text-sm">Wake Time</div>
            </div>
          </div>
          
          {latestLog.notes && (
            <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
              <span className="text-slate-400">Notes: </span>
              <span>{latestLog.notes}</span>
            </div>
          )}
        </motion.div>
      )}

      {/* Sleep Form Modal */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowForm(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-800 rounded-xl p-6 max-w-lg w-full"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-2xl font-heading font-bold mb-6">Log Your Sleep</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Bedtime</label>
                  <input
                    type="datetime-local"
                    value={formData.bedtime}
                    onChange={e => setFormData({ ...formData, bedtime: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Wake Time</label>
                  <input
                    type="datetime-local"
                    value={formData.wakeTime}
                    onChange={e => setFormData({ ...formData, wakeTime: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-3">Sleep Quality</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(q => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setFormData({ ...formData, quality: q })}
                      className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                        formData.quality === q
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="How did you sleep?"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-medium"
                >
                  Save
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Recent Sleep History */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-secondary" />
          <h3 className="text-lg font-heading font-semibold">Sleep History</h3>
        </div>
        <div className="space-y-3">
          {logs.slice(0, 7).map((log, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <div>
                <div className="font-medium">
                  {new Date(log.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
                <div className="text-sm text-slate-400">
                  {new Date(log.bedtime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                  {new Date(log.wakeTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-primary">{formatDuration(log.duration)}</div>
                <div className="text-xs text-slate-400">
                  {['', '★', '★★', '★★★', '★★★★', '★★★★★'][log.quality]}
                </div>
              </div>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              No sleep data yet. Start tracking your sleep!
            </div>
          )}
        </div>
      </div>

      {/* Sleep Tips */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-heading font-semibold mb-4">Sleep Tips</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <Moon className="w-5 h-5 text-indigo-500 flex-shrink-0" />
            <p>Maintain a consistent sleep schedule, even on weekends</p>
          </div>
          <div className="flex items-start gap-2">
            <Sun className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <p>Get natural sunlight exposure during the day</p>
          </div>
          <div className="flex items-start gap-2">
            <Star className="w-5 h-5 text-purple-500 flex-shrink-0" />
            <p>Avoid screens 1 hour before bedtime</p>
          </div>
          <div className="flex items-start gap-2">
            <Bed className="w-5 h-5 text-green-500 flex-shrink-0" />
            <p>Keep your bedroom cool (65-68°F / 18-20°C)</p>
          </div>
        </div>
      </div>
    </div>
  )
}

