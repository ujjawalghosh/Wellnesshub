import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, RefreshCw, Heart, Share2, Bookmark, Star } from 'lucide-react'
import api from '../utils/api'

const categories = [
  { name: 'motivation', icon: '🚀', color: 'text-orange-500' },
  { name: 'health', icon: '💪', color: 'text-green-500' },
  { name: 'self-love', icon: '❤️', color: 'text-pink-500' },
  { name: 'success', icon: '🏆', color: 'text-yellow-500' },
  { name: 'gratitude', icon: '🙏', color: 'text-purple-500' },
  { name: 'mindfulness', icon: '🧘', color: 'text-indigo-500' },
  { name: 'confidence', icon: '💫', color: 'text-blue-500' },
  { name: 'productivity', icon: '⚡', color: 'text-amber-500' },
  { name: 'relationships', icon: '🤝', color: 'text-rose-500' },
  { name: 'spiritual', icon: '✨', color: 'text-cyan-500' }
]

export default function DailyAffirmation() {
  const [affirmation, setAffirmation] = useState(null)
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [category, setCategory] = useState(null)

  useEffect(() => {
    fetchAffirmation()
    fetchFeatured()
  }, [])

  const fetchAffirmation = async () => {
    try {
      setLoading(true)
      const url = category 
        ? `/affirmations/random?category=${category}`
        : '/affirmations/daily'
      const response = await api.get(url)
      setAffirmation(response.data)
      setSaved(false)
    } catch (error) {
      console.error('Error fetching affirmation:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFeatured = async () => {
    try {
      const response = await api.get('/affirmations/featured')
      setFeatured(response.data)
    } catch (error) {
      console.error('Error fetching featured:', error)
    }
  }

  const handleShare = () => {
    if (navigator.share && affirmation) {
      navigator.share({
        title: 'Daily Affirmation',
        text: `"${affirmation.text}" - ${affirmation.author || 'WellnessHub'}`
      })
    } else {
      navigator.clipboard.writeText(`"${affirmation.text}" - ${affirmation.author || 'WellnessHub'}`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-amber-500" />
          Daily Affirmations
        </h1>
      </div>

      {/* Main Affirmation Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm text-slate-400">Today's Inspiration</span>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={fetchAffirmation}
              className="p-2 bg-slate-800 rounded-full hover:bg-slate-700"
            >
              <RefreshCw className="w-5 h-5 text-slate-400" />
            </motion.button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={affirmation?._id || 'new'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <div className="text-6xl mb-6">✨</div>
                <blockquote className="text-2xl md:text-3xl font-heading font-medium leading-relaxed mb-6">
                  "{affirmation?.text}"
                </blockquote>
                {affirmation?.author && (
                  <p className="text-slate-400">— {affirmation.author}</p>
                )}
              </motion.div>
            </AnimatePresence>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSaved(!saved)}
              className={`p-3 rounded-full ${
                saved 
                  ? 'bg-pink-500 text-white' 
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <Heart className={`w-6 h-6 ${saved ? 'fill-current' : ''}`} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className="p-3 bg-slate-800 text-slate-400 hover:bg-slate-700 rounded-full"
            >
              <Share2 className="w-6 h-6" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Category Selection */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-heading font-semibold mb-4">Browse by Category</h3>
        <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
          <button
            onClick={() => { setCategory(null); fetchAffirmation(); }}
            className={`p-3 rounded-lg text-center transition-colors ${
              !category ? 'bg-primary text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <div className="text-xl">🌟</div>
            <div className="text-xs mt-1">All</div>
          </button>
          {categories.map(cat => (
            <button
              key={cat.name}
              onClick={() => { setCategory(cat.name); fetchAffirmation(); }}
              className={`p-3 rounded-lg text-center transition-colors ${
                category === cat.name 
                  ? 'bg-primary text-white' 
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <div className="text-xl">{cat.icon}</div>
              <div className="text-xs mt-1 capitalize">{cat.name.slice(0, 3)}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Featured Affirmations */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-5 h-5 text-amber-500" />
          <h3 className="text-lg font-heading font-semibold">Featured Affirmations</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {(featured.length > 0 ? featured : [
            { text: "I am worthy of love, success, and happiness.", category: "self-love" },
            { text: "Every day I am getting stronger, healthier, and happier.", category: "health" },
            { text: "I have the power to create positive change in my life.", category: "motivation" },
            { text: "I am grateful for this moment and all the blessings in my life.", category: "gratitude" }
          ]).slice(0, 4).map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              onClick={() => {
                setAffirmation(item)
                setCategory(item.category)
              }}
            >
              <p className="text-sm mb-2">"{item.text}"</p>
              <span className={`text-xs ${
                categories.find(c => c.name === item.category)?.color || 'text-slate-400'
              }`}>
                {categories.find(c => c.name === item.category)?.icon} {item.category}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quote of the Day */}
      <div className="glass-card p-6 bg-gradient-to-r from-primary/10 to-secondary/10">
        <h3 className="text-lg font-heading font-semibold mb-4">Why Affirmations Work</h3>
        <div className="space-y-3 text-slate-400 text-sm">
          <p>✓ They help rewire negative thought patterns</p>
          <p>✓ They increase self-confidence and self-worth</p>
          <p>✓ They create a positive mindset for the day</p>
          <p>✓ They help manifest your goals and dreams</p>
        </div>
      </div>
    </div>
  )
}

