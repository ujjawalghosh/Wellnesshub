import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Trophy, 
  Users, 
  Clock, 
  Target,
  X,
  Hash,
  Shield,
  Calendar,
  ArrowRight
} from 'lucide-react'
import api from '../utils/api'

const challengeTypes = [
  { id: 'steps', label: 'Steps', icon: '👟' },
  { id: 'meditation', label: 'Meditation', icon: '🧘' },
  { id: 'water', label: 'Water Intake', icon: '💧' },
  { id: 'eating', label: 'Healthy Eating', icon: '🥗' },
  { id: 'workout', label: 'Workout', icon: '💪' },
  { id: 'custom', label: 'Custom', icon: '⭐' }
]

export default function Challenges() {
  const [challenges, setChallenges] = useState([])
  const [myChallenges, setMyChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('browse')
  const [showModal, setShowModal] = useState(false)
  const [showFairDrawModal, setShowFairDrawModal] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'steps',
    goal: 10000,
    goalUnit: 'steps',
    duration: 7,
    isPublic: true,
    prize: ''
  })

  useEffect(() => {
    fetchChallenges()
    fetchMyChallenges()
  }, [])

  const fetchChallenges = async () => {
    try {
      const response = await api.get('/challenges?status=active')
      setChallenges(response.data)
    } catch (error) {
      console.error('Error fetching challenges:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMyChallenges = async () => {
    try {
      const response = await api.get('/challenges/my')
      setMyChallenges(response.data)
    } catch (error) {
      console.error('Error fetching my challenges:', error)
    }
  }

  const handleJoin = async (challengeId) => {
    try {
      await api.post(`/challenges/${challengeId}/join`)
      fetchChallenges()
      fetchMyChallenges()
    } catch (error) {
      console.error('Error joining challenge:', error)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await api.post('/challenges', formData)
      fetchChallenges()
      fetchMyChallenges()
      setShowModal(false)
      setActiveTab('my')
    } catch (error) {
      console.error('Error creating challenge:', error)
    }
  }

  const handleFairDraw = async (challengeId) => {
    try {
      const response = await api.post(`/challenges/${challengeId}/fairdraw`)
      setShowFairDrawModal(response.data)
    } catch (error) {
      console.error('Error running FairDraw:', error)
      alert(error.response?.data?.message || 'Failed to run FairDraw')
    }
  }

  const isJoined = (challengeId) => {
    return myChallenges.some(c => c._id === challengeId)
  }

  const getChallengeProgress = (challenge) => {
    const participant = challenge.participants?.find(
      p => p.user?._id || p.user
    )
    return participant?.progress || 0
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
          <h2 className="text-2xl font-heading font-bold">Community Challenges</h2>
          <p className="text-slate-400">Join challenges and compete with the community</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" /> Create Challenge
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('browse')}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeTab === 'browse'
              ? 'bg-primary text-white'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          Browse Challenges
        </button>
        <button
          onClick={() => setActiveTab('my')}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeTab === 'my'
              ? 'bg-primary text-white'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          My Challenges
        </button>
      </div>

      {/* Challenges Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(activeTab === 'browse' ? challenges : myChallenges).map((challenge, index) => (
          <motion.div
            key={challenge._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card p-5"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center text-2xl">
                  {challengeTypes.find(t => t.id === challenge.type)?.icon || '🏆'}
                </div>
                <div>
                  <h3 className="font-semibold">{challenge.title}</h3>
                  <p className="text-xs text-slate-400">{challenge.type} challenge</p>
                </div>
              </div>
              {challenge.isCompleted && (
                <span className="px-2 py-1 bg-amber-500/20 text-amber-500 text-xs rounded-full">
                  Completed
                </span>
              )}
            </div>

            <p className="text-sm text-slate-400 mb-4 line-clamp-2">
              {challenge.description}
            </p>

            {/* Progress */}
            {isJoined(challenge._id) && (
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{getChallengeProgress(challenge)} / {challenge.goal} {challenge.goalUnit}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full"
                    style={{ width: `${Math.min((getChallengeProgress(challenge) / challenge.goal) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center justify-between text-sm text-slate-400 mb-4">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{challenge.participants?.length || 0} participants</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{challenge.duration} days</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {activeTab === 'browse' ? (
                isJoined(challenge._id) ? (
                  <button disabled className="btn-outline flex-1 opacity-50 cursor-not-allowed">
                    Joined
                  </button>
                ) : (
                  <button 
                    onClick={() => handleJoin(challenge._id)}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    Join <ArrowRight className="w-4 h-4" />
                  </button>
                )
              ) : (
                <>
                  {challenge.creator?._id === 'currentUser' && !challenge.isCompleted && (
                    <button 
                      onClick={() => handleFairDraw(challenge._id)}
                      className="btn-outline flex items-center gap-2"
                    >
                      <Shield className="w-4 h-4" /> FairDraw
                    </button>
                  )}
                  {challenge.winner && (
                    <div className="flex items-center gap-2 text-amber-500">
                      <Trophy className="w-5 h-5" />
                      <span className="text-sm font-medium">
                        {challenge.winner.name || 'Winner'}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {((activeTab === 'browse' ? challenges : myChallenges).length === 0) && (
        <div className="text-center py-16">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-slate-600" />
          <h3 className="text-xl font-semibold mb-2">
            {activeTab === 'browse' ? 'No challenges available' : 'No challenges joined yet'}
          </h3>
          <p className="text-slate-400">
            {activeTab === 'browse' ? 'Be the first to create a challenge!' : 'Browse and join challenges to get started'}
          </p>
        </div>
      )}

      {/* Create Challenge Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-heading font-bold">Create Challenge</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-200">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Challenge Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input-field"
                    placeholder="e.g., 30-Day Step Challenge"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field h-24"
                    placeholder="Describe your challenge..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Challenge Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {challengeTypes.map(type => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, type: type.id, goalUnit: type.id === 'steps' ? 'steps' : type.id === 'meditation' ? 'minutes' : 'times' })}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          formData.type === type.id
                            ? 'border-primary bg-primary/20'
                            : 'border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <div className="text-2xl mb-1">{type.icon}</div>
                        <div className="text-xs">{type.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Goal</label>
                    <input
                      type="number"
                      value={formData.goal}
                      onChange={(e) => setFormData({ ...formData, goal: parseInt(e.target.value) })}
                      className="input-field"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Duration (days)</label>
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                      className="input-field"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Prize (optional)</label>
                  <input
                    type="text"
                    value={formData.prize}
                    onChange={(e) => setFormData({ ...formData, prize: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Badge, Points, bragging rights"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                    className="w-4 h-4 rounded bg-slate-800 border-slate-600"
                  />
                  <label htmlFor="isPublic" className="text-sm">Make challenge public</label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="btn-outline flex-1">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary flex-1">
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FairDraw Result Modal */}
      <AnimatePresence>
        {showFairDrawModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowFairDrawModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-6 w-full max-w-md text-center"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-heading font-bold mb-2">FairDraw Winner!</h3>
              <p className="text-slate-400 mb-6">
                The winner was selected using a transparent SHA-256 hash algorithm
              </p>
              
              <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 text-amber-500 mb-2">
                  <Shield className="w-5 h-5" />
                  <span className="font-medium">Verification Hash</span>
                </div>
                <div className="text-xs text-slate-400 break-all font-mono">
                  {showFairDrawModal.hash}
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 mb-6">
                <img
                  src={showFairDrawModal.winner?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${showFairDrawModal.winner?.name}`}
                  alt="Winner"
                  className="w-12 h-12 rounded-full"
                />
                <div className="text-left">
                  <div className="font-semibold">{showFairDrawModal.winner?.name}</div>
                  <div className="text-sm text-slate-400">
                    {showFairDrawModal.eligibleCount} eligible participants
                  </div>
                </div>
              </div>

              <button onClick={() => setShowFairDrawModal(null)} className="btn-primary w-full">
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
