import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Smile, Meh, Frown, Calendar, TrendingUp, Activity } from 'lucide-react'
import api from '../utils/api'

const moods = [
  { emoji: '😄', score: 10, label: 'Great', color: 'bg-green-500' },
  { emoji: '😊', score: 8, label: 'Good', color: 'bg-lime-500' },
  { emoji: '😐', score: 6, label: 'Okay', color: 'bg-yellow-500' },
  { emoji: '😔', score: 4, label: 'Low', color: 'bg-orange-500' },
  { emoji: '😢', score: 2, label: 'Bad', color: 'bg-red-500' },
]

const activities = [
  'work', 'exercise', 'meditation', 'social', 'hobby', 'family', 'outdoor', 'learning', 'creative', 'rest'
]

const energyLevels = [1, 2, 3, 4, 5]
const stressLevels = [1, 2, 3, 4, 5]

export default function MoodTracker() {
  const [logs, setLogs] = useState([])
  const [todayLog, setTodayLog] = useState(null)
  const [trends, setTrends] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    mood: '',
    moodScore: 0,
    energyLevel: 3,
    stressLevel: 3,
    activities: [],
    notes: '',
    gratitude: ['', '', '']
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [logsRes, todayRes, trendsRes] = await Promise.all([
        api.get('/mood'),
        api.get('/mood/today'),
        api.get('/mood/trends')
      ])
      setLogs(logsRes.data)
      setTodayLog(todayRes.data)
      setTrends(trendsRes.data)
      if (todayRes.data) {
        setFormData({
          mood: todayRes.data.mood,
          moodScore: todayRes.data.moodScore,
          energyLevel: todayRes.data.energyLevel,
          stressLevel: todayRes.data.stressLevel,
          activities: todayRes.data.activities || [],
          notes: todayRes.data.notes || '',
          gratitude: todayRes.data.gratitude || ['', '', '']
        })
      }
    } catch (error) {
      console.error('Error fetching mood data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMoodSelect = (mood) => {
    setFormData({
      ...formData,
      mood: mood.emoji,
      moodScore: mood.score
    })
  }

  const handleActivityToggle = (activity) => {
    const activities = formData.activities.includes(activity)
      ? formData.activities.filter(a => a !== activity)
      : [...formData.activities, activity]
    setFormData({ ...formData, activities })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (todayLog?._id) {
        await api.put(`/mood/${todayLog._id}`, formData)
      } else {
        await api.post('/mood', formData)
      }
      setShowForm(false)
      fetchData()
    } catch (error) {
      console.error('Error saving mood:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold flex items-center gap-3">
          <Smile className="w-8 h-8 text-yellow-500" />
          Mood Tracker
        </h1>
        {!todayLog && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowForm(true)}
            className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-medium"
          >
            Log Mood
          </motion.button>
        )}
      </div>

      {/* Today's Mood */}
      {todayLog ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-heading font-semibold">Today's Mood</h3>
            <button
              onClick={() => setShowForm(true)}
              className="text-primary text-sm hover:underline"
            >
              Edit
            </button>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-6xl">{todayLog.mood}</div>
            <div>
              <div className="text-2xl font-bold">
                {moods.find(m => m.emoji === todayLog.mood)?.label}
              </div>
              <div className="text-slate-400">Score: {todayLog.moodScore}/10</div>
            </div>
          </div>
          
          {/* Energy & Stress */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-sm text-slate-400 mb-2">Energy Level</div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(level => (
                  <div
                    key={level}
                    className={`h-2 flex-1 rounded ${level <= todayLog.energyLevel ? 'bg-green-500' : 'bg-slate-700'}`}
                  />
                ))}
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-sm text-slate-400 mb-2">Stress Level</div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(level => (
                  <div
                    key={level}
                    className={`h-2 flex-1 rounded ${level <= todayLog.stressLevel ? 'bg-red-500' : 'bg-slate-700'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Activities */}
          {todayLog.activities?.length > 0 && (
            <div className="mt-4">
              <div className="text-sm text-slate-400 mb-2">Activities</div>
              <div className="flex flex-wrap gap-2">
                {todayLog.activities.map(activity => (
                  <span key={activity} className="bg-secondary/20 text-secondary px-3 py-1 rounded-full text-sm">
                    {activity}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      ) : !showForm && (
        <div className="glass-card p-8 text-center">
          <Meh className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-heading mb-2">How are you feeling today?</h3>
          <p className="text-slate-400 mb-4">Take a moment to check in with yourself</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowForm(true)}
            className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-lg font-medium"
          >
            Log Your Mood
          </motion.button>
        </div>
      )}

      {/* Mood Form Modal */}
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
            className="bg-slate-800 rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-2xl font-heading font-bold mb-6">How are you feeling?</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Mood Selection */}
              <div>
                <label className="block text-sm text-slate-400 mb-3">Select your mood</label>
                <div className="flex justify-between">
                  {moods.map(mood => (
                    <button
                      key={mood.emoji}
                      type="button"
                      onClick={() => handleMoodSelect(mood)}
                      className={`text-4xl p-3 rounded-xl transition-all ${
                        formData.mood === mood.emoji
                          ? 'bg-slate-700 scale-110'
                          : 'hover:bg-slate-700/50'
                      }`}
                    >
                      {mood.emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Energy Level */}
              <div>
                <label className="block text-sm text-slate-400 mb-3">Energy Level</label>
                <div className="flex gap-2">
                  {energyLevels.map(level => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setFormData({ ...formData, energyLevel: level })}
                      className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                        formData.energyLevel === level
                          ? 'bg-green-500 text-white'
                          : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stress Level */}
              <div>
                <label className="block text-sm text-slate-400 mb-3">Stress Level</label>
                <div className="flex gap-2">
                  {stressLevels.map(level => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setFormData({ ...formData, stressLevel: level })}
                      className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                        formData.stressLevel === level
                          ? 'bg-red-500 text-white'
                          : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Activities */}
              <div>
                <label className="block text-sm text-slate-400 mb-3">What have you been doing?</label>
                <div className="flex flex-wrap gap-2">
                  {activities.map(activity => (
                    <button
                      key={activity}
                      type="button"
                      onClick={() => handleActivityToggle(activity)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        formData.activities.includes(activity)
                          ? 'bg-secondary text-white'
                          : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                      }`}
                    >
                      {activity}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="How was your day?"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                  rows={3}
                />
              </div>

              {/* Gratitude */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">What are you grateful for?</label>
                {formData.gratitude.map((item, index) => (
                  <input
                    key={index}
                    type="text"
                    value={item}
                    onChange={e => {
                      const newGratitude = [...formData.gratitude]
                      newGratitude[index] = e.target.value
                      setFormData({ ...formData, gratitude: newGratitude })
                    }}
                    placeholder={`Gratitude ${index + 1}`}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary mb-2"
                  />
                ))}
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

      {/* Trends */}
      {trends && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-heading font-semibold">Your Mood Trends</h3>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{trends.averageMood}</div>
              <div className="text-sm text-slate-400">Avg Mood</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500">{trends.averageEnergy}</div>
              <div className="text-sm text-slate-400">Avg Energy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-500">{trends.averageStress}</div>
              <div className="text-sm text-slate-400">Avg Stress</div>
            </div>
          </div>
          
          {trends.trend && (
            <div className={`text-center py-2 rounded-lg ${
              trends.trend === 'improving' ? 'bg-green-500/20 text-green-400' :
              trends.trend === 'declining' ? 'bg-red-500/20 text-red-400' :
              'bg-slate-700 text-slate-400'
            }`}>
              Your mood is {trends.trend} over the past {trends.period} days
            </div>
          )}
        </motion.div>
      )}

      {/* Recent Logs */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-secondary" />
          <h3 className="text-lg font-heading font-semibold">Recent Moods</h3>
        </div>
        <div className="space-y-3">
          {logs.slice(0, 7).map((log, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{log.mood}</span>
                <div>
                  <div className="font-medium">{log.moodScore}/10</div>
                  <div className="text-xs text-slate-400">
                    {new Date(log.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {log.activities?.slice(0, 2).map(act => (
                  <span key={act} className="text-xs bg-slate-700 px-2 py-1 rounded">{act}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

