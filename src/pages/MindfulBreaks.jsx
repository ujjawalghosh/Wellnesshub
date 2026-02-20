import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  Clock, 
  Play, 
  CheckCircle,
  Sparkles,
  Activity,
  Droplets,
  Eye,
  Footprints,
  Heart,
  Leaf
} from 'lucide-react'
import api from '../utils/api'

const breakIcons = {
  stretch: Activity,
  breathing: Brain,
  hydration: Droplets,
  meditation: Sparkles,
  eyes: Eye,
  movement: Footprints,
  gratitude: Heart,
  walking: Footprints
}

export default function MindfulBreaks() {
  const [breaks, setBreaks] = useState([])
  const [selectedBreak, setSelectedBreak] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBreaks()
  }, [])

  const fetchBreaks = async () => {
    try {
      const response = await api.get('/breaks')
      setBreaks(response.data)
    } catch (error) {
      console.error('Error fetching breaks:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRandomBreak = async () => {
    try {
      const response = await api.get('/breaks/random')
      setSelectedBreak(response.data)
      setIsPlaying(true)
    } catch (error) {
      console.error('Error fetching random break:', error)
    }
  }

  const handleComplete = async () => {
    try {
      await api.post('/breaks/complete', {
        breakId: selectedBreak?.id,
        duration: selectedBreak?.duration
      })
      setIsPlaying(false)
    } catch (error) {
      console.error('Error completing break:', error)
    }
  }

  const startBreak = (breakItem) => {
    setSelectedBreak(breakItem)
    setIsPlaying(true)
  }

  const filterByType = async (type) => {
    try {
      const response = await api.get(`/breaks/type/${type}`)
      setBreaks(response.data)
    } catch (error) {
      console.error('Error filtering breaks:', error)
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold">Mindful Breaks</h2>
          <p className="text-slate-400">Take short breaks to refresh your mind and body</p>
        </div>
        <button onClick={getRandomBreak} className="btn-primary flex items-center gap-2">
          <Sparkles className="w-5 h-5" /> Surprise Me
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 text-center">
          <Activity className="w-8 h-8 mx-auto mb-2 text-primary" />
          <div className="text-sm text-slate-400">Stretching</div>
        </div>
        <div className="glass-card p-4 text-center">
          <Brain className="w-8 h-8 mx-auto mb-2 text-secondary" />
          <div className="text-sm text-slate-400">Breathing</div>
        </div>
        <div className="glass-card p-4 text-center">
          <Droplets className="w-8 h-8 mx-auto mb-2 text-blue-500" />
          <div className="text-sm text-slate-400">Hydration</div>
        </div>
        <div className="glass-card p-4 text-center">
          <Sparkles className="w-8 h-8 mx-auto mb-2 text-amber-500" />
          <div className="text-sm text-slate-400">Meditation</div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={fetchBreaks}
          className="px-4 py-2 rounded-lg whitespace-nowrap transition-all bg-primary text-white"
        >
          All
        </button>
        {['stretch', 'breathing', 'hydration', 'meditation', 'eyes', 'movement'].map(type => (
          <button
            key={type}
            onClick={() => filterByType(type)}
            className="px-4 py-2 rounded-lg whitespace-nowrap transition-all bg-slate-800 text-slate-400 hover:bg-slate-700 capitalize"
          >
            {type}
          </button>
        ))}
      </div>

      {/* Breaks Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {breaks.map((breakItem, index) => {
          const IconComponent = breakIcons[breakItem.type] || Brain
          return (
            <motion.div
              key={breakItem.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card p-5"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center">
                    <IconComponent className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{breakItem.title}</h3>
                    <div className="flex items-center gap-1 text-sm text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span>{breakItem.duration} min</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                {breakItem.instructions?.[0]}
              </p>

              {/* Benefits */}
              <div className="flex flex-wrap gap-2 mb-4">
                {breakItem.benefits?.slice(0, 2).map((benefit, i) => (
                  <span key={i} className="text-xs px-2 py-1 bg-slate-800 rounded-full text-slate-400">
                    {benefit}
                  </span>
                ))}
              </div>

              <button
                onClick={() => startBreak(breakItem)}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" /> Start Break
              </button>
            </motion.div>
          )
        })}
      </div>

      {/* Break Player Modal */}
      <AnimatePresence>
        {isPlaying && selectedBreak && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-8 w-full max-w-lg"
            >
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  {(() => {
                    const IconComponent = breakIcons[selectedBreak.type] || Brain
                    return <IconComponent className="w-10 h-10 text-white" />
                  })()}
                </div>
                <h3 className="text-2xl font-heading font-bold">{selectedBreak.title}</h3>
                <div className="flex items-center justify-center gap-2 text-slate-400 mt-2">
                  <Clock className="w-4 h-4" />
                  <span>{selectedBreak.duration} minutes</span>
                </div>
              </div>

              {/* Instructions */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Instructions:</h4>
                <div className="space-y-3">
                  {selectedBreak.instructions?.map((instruction, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.5 }}
                      className="flex items-start gap-3"
                    >
                      <span className="w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-sm flex-shrink-0">
                        {i + 1}
                      </span>
                      <p className="text-slate-300">{instruction}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div className="mb-6">
                <h4 className="font-semibold mb-2">Benefits:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedBreak.benefits?.map((benefit, i) => (
                    <span key={i} className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setIsPlaying(false)}
                  className="btn-outline flex-1"
                >
                  Close
                </button>
                <button
                  onClick={handleComplete}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" /> Complete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tips Section */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-heading font-semibold mb-4 flex items-center gap-2">
          <Leaf className="w-5 h-5 text-primary" />
          Daily Break Tips
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-800/50 rounded-lg">
            <h4 className="font-medium mb-2">20-20-20 Rule</h4>
            <p className="text-sm text-slate-400">
              Every 20 minutes, look at something 20 feet away for 20 seconds to reduce eye strain.
            </p>
          </div>
          <div className="p-4 bg-slate-800/50 rounded-lg">
            <h4 className="font-medium mb-2">Stay Hydrated</h4>
            <p className="text-sm text-slate-400">
              Drink a glass of water every hour to maintain optimal hydration levels.
            </p>
          </div>
          <div className="p-4 bg-slate-800/50 rounded-lg">
            <h4 className="font-medium mb-2">Micro-Movements</h4>
            <p className="text-sm text-slate-400">
              Stand up and stretch every 30-60 minutes to combat sedentary behavior.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
