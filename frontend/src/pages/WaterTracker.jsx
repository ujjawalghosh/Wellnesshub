import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Droplets, Plus, Minus, Target, Flame, TrendingUp } from 'lucide-react'
import api from '../utils/api'

export default function WaterTracker() {
  const [water, setWater] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quickAmounts] = useState([100, 200, 250, 500])

  useEffect(() => {
    fetchWater()
  }, [])

  const fetchWater = async () => {
    try {
      const response = await api.get('/water/today')
      setWater(response.data)
    } catch (error) {
      console.error('Error fetching water:', error)
    } finally {
      setLoading(false)
    }
  }

  const addWater = async (amount) => {
    try {
      const response = await api.post('/water/add', { amount, unit: 'ml' })
      setWater(response.data)
    } catch (error) {
      console.error('Error adding water:', error)
    }
  }

  const updateGoal = async (goalMl) => {
    try {
      const response = await api.put('/water/goal', { goalMl })
      setWater(response.data)
    } catch (error) {
      console.error('Error updating goal:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  const percentage = Math.min(Math.round((water?.totalMl / water?.goalMl) * 100), 100)
  const remaining = Math.max(water?.goalMl - water?.totalMl, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold flex items-center gap-3">
          <Droplets className="w-8 h-8 text-blue-500" />
          Water Tracker
        </h1>
      </div>

      {/* Main Progress Circle */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 text-center"
      >
        <div className="relative w-48 h-48 mx-auto mb-6">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              className="text-slate-700"
            />
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              strokeDasharray={553}
              strokeDashoffset={553 - (553 * percentage) / 100}
              className="text-blue-500 transition-all duration-1000"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold">{water?.totalMl || 0}</span>
            <span className="text-slate-400">/ {water?.goalMl || 2000} ml</span>
          </div>
        </div>

        <div className="text-lg text-slate-300 mb-2">
          {percentage}% of daily goal
        </div>
        <div className="text-slate-400">
          {remaining > 0 ? `${remaining} ml remaining` : 'Goal achieved! 🎉'}
        </div>
      </motion.div>

      {/* Quick Add Buttons */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-heading font-semibold mb-4">Quick Add</h3>
        <div className="grid grid-cols-4 gap-3 mb-4">
          {quickAmounts.map((amount) => (
            <motion.button
              key={amount}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => addWater(amount)}
              className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 py-3 px-4 rounded-lg font-medium transition-colors"
            >
              +{amount}ml
            </motion.button>
          ))}
        </div>
        
        {/* Custom Amount */}
        <div className="flex gap-3">
          <input
            type="number"
            id="customAmount"
            placeholder="Custom amount (ml)"
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              const input = document.getElementById('customAmount')
              if (input.value) addWater(parseInt(input.value))
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Add
          </motion.button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4 text-center"
        >
          <Flame className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <div className="text-2xl font-bold">{water?.streak || 0}</div>
          <div className="text-sm text-slate-400">Day Streak</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-4 text-center"
        >
          <Droplets className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <div className="text-2xl font-bold">{water?.glasses || 0}</div>
          <div className="text-sm text-slate-400">Glasses</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-4 text-center"
        >
          <Target className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <div className="text-2xl font-bold">{water?.goalMl || 2000}</div>
          <div className="text-sm text-slate-400">Goal (ml)</div>
        </motion.div>
      </div>

      {/* Today's History */}
      {water?.history?.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-heading font-semibold mb-4">Today's History</h3>
          <div className="space-y-2">
            {[...water.history].reverse().map((entry, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <span className="text-slate-400">
                  {new Date(entry.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="font-medium text-blue-400">+{entry.amount} ml</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Goal Settings */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-heading font-semibold mb-4">Daily Goal</h3>
        <div className="flex gap-3">
          {[1500, 2000, 2500, 3000].map((goal) => (
            <button
              key={goal}
              onClick={() => updateGoal(goal)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                water?.goalMl === goal
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {goal}ml
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

