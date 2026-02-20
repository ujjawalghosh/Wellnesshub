import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  CheckCircle, 
  Flame, 
  Trophy,
  Trash2,
  Edit2,
  X,
  Target
} from 'lucide-react'
import api from '../utils/api'

const habitColors = [
  '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', 
  '#3B82F6', '#EC4899', '#14B8A6', '#F97316'
]

const habitIcons = ['check', 'dumbbell', 'water', 'book', 'bed', 'apple', 'brain', 'walk']

export default function Habits() {
  const [habits, setHabits] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingHabit, setEditingHabit] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'custom',
    color: '#10B981'
  })

  useEffect(() => {
    fetchHabits()
    fetchStats()
  }, [])

  const fetchHabits = async () => {
    try {
      const response = await api.get('/habits')
      setHabits(response.data)
    } catch (error) {
      console.error('Error fetching habits:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await api.get('/habits/stats/overview')
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingHabit) {
        await api.put(`/habits/${editingHabit._id}`, formData)
      } else {
        await api.post('/habits', formData)
      }
      fetchHabits()
      fetchStats()
      closeModal()
    } catch (error) {
      console.error('Error saving habit:', error)
    }
  }

  const handleComplete = async (habitId) => {
    try {
      await api.post(`/habits/${habitId}/complete`)
      fetchHabits()
      fetchStats()
    } catch (error) {
      console.error('Error completing habit:', error)
    }
  }

  const handleDelete = async (habitId) => {
    if (!confirm('Are you sure you want to delete this habit?')) return
    try {
      await api.delete(`/habits/${habitId}`)
      fetchHabits()
      fetchStats()
    } catch (error) {
      console.error('Error deleting habit:', error)
    }
  }

  const openModal = (habit = null) => {
    if (habit) {
      setEditingHabit(habit)
      setFormData({
        name: habit.name,
        description: habit.description || '',
        category: habit.category,
        color: habit.color
      })
    } else {
      setEditingHabit(null)
      setFormData({
        name: '',
        description: '',
        category: 'custom',
        color: '#10B981'
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingHabit(null)
  }

  const isCompletedToday = (habit) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return habit.completions?.some(c => {
      const cDate = new Date(c.date)
      cDate.setHours(0, 0, 0, 0)
      return cDate.getTime() === today.getTime()
    })
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold">Habit Tracker</h2>
          <p className="text-slate-400">Build lasting habits and track your streaks</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add Habit
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.totalHabits}</div>
            <div className="text-xs text-slate-400">Total Habits</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-amber-500">{stats.completionRate}%</div>
            <div className="text-xs text-slate-400">Today's Rate</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-secondary">{stats.totalStreak}</div>
            <div className="text-xs text-slate-400">Total Streaks</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-rose-500">{stats.longestStreak}</div>
            <div className="text-xs text-slate-400">Best Streak</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold text-purple-500">{stats.todayCompleted}</div>
            <div className="text-xs text-slate-400">Completed Today</div>
          </div>
        </div>
      )}

      {/* Habits List */}
      <div className="grid gap-4">
        {habits.length > 0 ? (
          habits.map((habit, index) => (
            <motion.div
              key={habit._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`glass-card p-4 ${isCompletedToday(habit) ? 'border-primary/50' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleComplete(habit._id)}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                      isCompletedToday(habit)
                        ? 'bg-primary text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {isCompletedToday(habit) ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-slate-600" />
                    )}
                  </button>
                  
                  <div>
                    <h3 className="font-semibold text-lg">{habit.name}</h3>
                    {habit.description && (
                      <p className="text-sm text-slate-400">{habit.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Streak */}
                  <div className="flex items-center gap-1 text-amber-500">
                    <Flame className="w-5 h-5" />
                    <span className="font-bold">{habit.streak}</span>
                  </div>

                  {/* Best Streak */}
                  <div className="flex items-center gap-1 text-slate-400">
                    <Trophy className="w-4 h-4" />
                    <span className="text-sm">{habit.longestStreak}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openModal(habit)}
                      className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(habit._id)}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-16 glass-card">
            <Target className="w-16 h-16 mx-auto mb-4 text-slate-600" />
            <h3 className="text-xl font-semibold mb-2">No habits yet</h3>
            <p className="text-slate-400 mb-4">Start building healthy habits today!</p>
            <button onClick={() => openModal()} className="btn-primary">
              Create Your First Habit
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-6 w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-heading font-bold">
                  {editingHabit ? 'Edit Habit' : 'Create New Habit'}
                </h3>
                <button onClick={closeModal} className="text-slate-400 hover:text-slate-200">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Habit Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Morning workout"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description (optional)</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field"
                    placeholder="e.g., 30 minutes of exercise"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-field"
                  >
                    <option value="health">Health</option>
                    <option value="fitness">Fitness</option>
                    <option value="mindfulness">Mindfulness</option>
                    <option value="nutrition">Nutrition</option>
                    <option value="sleep">Sleep</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {habitColors.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-8 h-8 rounded-lg transition-transform ${
                          formData.color === color ? 'scale-110 ring-2 ring-white' : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={closeModal} className="btn-outline flex-1">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary flex-1">
                    {editingHabit ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
