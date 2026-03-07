import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Dumbbell, 
  Utensils, 
  Brain, 
  Moon, 
  Download, 
  Share2, 
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Clock,
  Flame,
  Target,
  X,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { jsPDF } from 'jspdf'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'

// Goal options matching the backend
const goalOptions = [
  { id: 'weight_loss', label: 'Weight Loss' },
  { id: 'stress_relief', label: 'Stress Relief' },
  { id: 'fitness', label: 'Fitness' },
  { id: 'better_sleep', label: 'Better Sleep' },
  { id: 'mental_clarity', label: 'Mental Clarity' },
  { id: 'healthy_eating', label: 'Healthy Eating' }
]

const fitnessLevels = [
  { id: 'beginner', label: 'Beginner', description: 'Just starting out' },
  { id: 'intermediate', label: 'Intermediate', description: 'Some experience' },
  { id: 'advanced', label: 'Advanced', description: 'Very active lifestyle' }
]

export default function WellnessPlan() {
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('workout')
  const [expandedDays, setExpandedDays] = useState({})
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [selectedGoals, setSelectedGoals] = useState([])
  const [selectedFitnessLevel, setSelectedFitnessLevel] = useState('beginner')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    fetchPlan()
  }, [])

  // Set default goals from user profile when modal opens
  useEffect(() => {
    if (showGoalModal) {
      // Use existing plan goals, user profile goals, or default
      const defaultGoals = plan?.goals || user?.goals || ['healthy_eating']
      setSelectedGoals(defaultGoals)
      setSelectedFitnessLevel(user?.fitnessLevel || 'beginner')
    }
  }, [showGoalModal, plan, user])

  const fetchPlan = async () => {
    try {
      const response = await api.get('/plans/active')
      setPlan(response.data)
    } catch (error) {
      console.error('Error fetching plan:', error)
    } finally {
      setLoading(false)
    }
  }

  const regeneratePlan = async () => {
    // Open the goal selection modal
    setShowGoalModal(true)
    setError('')
    setSuccess('')
  }

  const handleGeneratePlan = async () => {
    if (selectedGoals.length === 0) {
      setError('Please select at least one goal')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      const response = await api.post('/plans/generate', {
        goals: selectedGoals,
        fitnessLevel: selectedFitnessLevel
      })
      
      setPlan(response.data.plan)
      setShowGoalModal(false)
      
      if (response.data.leveledUp) {
        setSuccess(`🎉 Congratulations! You've reached level ${response.data.newLevel}!`)
      } else {
        setSuccess('Your personalized plan has been generated!')
      }
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000)
    } catch (error) {
      console.error('Error generating plan:', error)
      setError(error.response?.data?.message || 'Failed to generate plan. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const toggleGoal = (goalId) => {
    setSelectedGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(g => g !== goalId)
        : [...prev, goalId]
    )
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    
    doc.setFontSize(24)
    doc.setTextColor(16, 185, 129)
    doc.text('WellnessHub', 20, 20)
    
    doc.setFontSize(18)
    doc.setTextColor(0, 0, 0)
    doc.text('Your Personalized Wellness Plan', 20, 35)
    
    doc.setFontSize(12)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45)
    
    let yPos = 60
    
    // Workout Section
    doc.setFontSize(16)
    doc.setTextColor(16, 185, 129)
    doc.text('Workout Schedule', 20, yPos)
    yPos += 10
    
    doc.setFontSize(11)
    doc.setTextColor(0, 0, 0)
    plan?.workout?.forEach((day, i) => {
      doc.setFontSize(12)
      doc.text(`${day.day} - ${day.focus}`, 20, yPos)
      yPos += 7
      doc.setFontSize(10)
      day.exercises?.forEach(ex => {
        doc.text(`• ${ex.name} - ${ex.sets} sets × ${ex.reps} reps (${ex.duration})`, 25, yPos)
        yPos += 5
      })
      yPos += 5
    })
    
    // Diet Section
    yPos += 10
    doc.setFontSize(16)
    doc.setTextColor(139, 92, 246)
    doc.text('Diet Plan', 20, yPos)
    yPos += 10
    
    doc.setFontSize(11)
    doc.setTextColor(0, 0, 0)
    plan?.diet?.forEach((day, i) => {
      doc.setFontSize(12)
      doc.text(`${day.day} - ${day.totalCalories} cal`, 20, yPos)
      yPos += 7
      day.meals?.forEach(meal => {
        doc.setFontSize(10)
        doc.text(`${meal.name}: ${meal.foods?.[0]}`, 25, yPos)
        yPos += 5
      })
      yPos += 5
    })
    
    doc.save('wellness-plan.pdf')
  }

  const sharePlan = () => {
    const shareText = `Check out my personalized wellness plan on WellnessHub! ${window.location.origin}/wellness-plan`
    if (navigator.share) {
      navigator.share({
        title: 'My Wellness Plan',
        text: shareText
      })
    } else {
      navigator.clipboard.writeText(shareText)
      alert('Link copied to clipboard!')
    }
  }

  const toggleDay = (dayIndex) => {
    setExpandedDays(prev => ({
      ...prev,
      [dayIndex]: !prev[dayIndex]
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Show "No Wellness Plan Yet" state
  if (!plan) {
    return (
      <div className="space-y-6">
        <div className="text-center py-20">
          <Dumbbell className="w-16 h-16 mx-auto mb-4 text-slate-600" />
          <h2 className="text-2xl font-heading font-bold mb-2">No Wellness Plan Yet</h2>
          <p className="text-slate-400 mb-6">Generate your personalized plan to get started</p>
          <button onClick={regeneratePlan} className="btn-primary">
            Generate Plan
          </button>
        </div>

        {/* Goal Selection Modal - Also show when no plan */}
        <AnimatePresence>
          {showGoalModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setShowGoalModal(false)}
              />
              
              {/* Modal Content */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-lg glass-card p-6 max-h-[90vh] overflow-y-auto"
              >
                {/* Close Button */}
                <button
                  onClick={() => setShowGoalModal(false)}
                  className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-heading font-bold">Create Your Wellness Plan</h3>
                  <p className="text-slate-400 mt-1">Select your goals and fitness level</p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-400">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{success}</span>
                  </div>
                )}

                {/* Goals Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Select your goals
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {goalOptions.map(goal => (
                      <button
                        key={goal.id}
                        onClick={() => toggleGoal(goal.id)}
                        className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                          selectedGoals.includes(goal.id)
                            ? 'border-primary bg-primary/20'
                            : 'border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <span className={`font-medium ${
                          selectedGoals.includes(goal.id) ? 'text-primary' : 'text-slate-300'
                        }`}>
                          {goal.label}
                        </span>
                      </button>
                    ))}
                  </div>
                  {selectedGoals.length === 0 && (
                    <p className="text-sm text-slate-500 mt-2">Please select at least one goal</p>
                  )}
                </div>

                {/* Fitness Level Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Your fitness level
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {fitnessLevels.map(level => (
                      <button
                        key={level.id}
                        onClick={() => setSelectedFitnessLevel(level.id)}
                        className={`p-3 rounded-lg border-2 transition-all duration-200 text-center ${
                          selectedFitnessLevel === level.id
                            ? 'border-primary bg-primary/20'
                            : 'border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <span className={`font-medium block ${
                          selectedFitnessLevel === level.id ? 'text-primary' : 'text-slate-300'
                        }`}>
                          {level.label}
                        </span>
                        <span className="text-xs text-slate-500">{level.description}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowGoalModal(false)}
                    className="flex-1 px-6 py-3 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGeneratePlan}
                    disabled={loading || selectedGoals.length === 0}
                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Target className="w-4 h-4" />
                        Generate Plan
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  const tabs = [
    { id: 'workout', icon: Dumbbell, label: 'Workout' },
    { id: 'diet', icon: Utensils, label: 'Diet' },
    { id: 'meditation', icon: Brain, label: 'Meditation' },
    { id: 'sleep', icon: Moon, label: 'Sleep' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold">Your Wellness Plan</h2>
          <p className="text-slate-400">Personalized based on your goals</p>
        </div>
        <div className="flex gap-3">
          <button onClick={sharePlan} className="btn-outline flex items-center gap-2">
            <Share2 className="w-4 h-4" /> Share
          </button>
          <button onClick={exportToPDF} className="btn-outline flex items-center gap-2">
            <Download className="w-4 h-4" /> Export PDF
          </button>
          <button onClick={regeneratePlan} className="btn-primary flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Regenerate
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-primary text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="grid gap-4">
        {activeTab === 'workout' && plan.workout?.map((day, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card overflow-hidden"
          >
            <button
              onClick={() => toggleDay(`workout-${index}`)}
              className="w-full p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">{day.day}</h3>
                  <p className="text-sm text-slate-400">{day.focus}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-slate-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{day.duration} min</span>
                </div>
                {expandedDays[`workout-${index}`] ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </div>
            </button>
            
            {expandedDays[`workout-${index}`] && (
              <div className="px-4 pb-4 border-t border-slate-700/50">
                <div className="pt-4 space-y-2">
                  {day.exercises?.map((ex, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex flex-col">
                        <span className="font-medium">{ex.name}</span>
                        <span className="text-xs text-slate-400">
                          {ex.sets} sets × {ex.reps} reps • {ex.duration}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {ex.calories && (
                          <span className="text-sm text-slate-400">
                            {ex.calories} cal
                          </span>
                        )}
                        <Flame className="w-4 h-4 text-amber-500" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ))}

        {activeTab === 'diet' && plan.diet?.map((day, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card overflow-hidden"
          >
            <button
              onClick={() => toggleDay(`diet-${index}`)}
              className="w-full p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center">
                  <Utensils className="w-5 h-5 text-secondary" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">{day.day}</h3>
                  <p className="text-sm text-slate-400">{day.totalCalories} calories</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-slate-400">
                  <span className="text-sm">💧 {day.waterIntake} glasses</span>
                </div>
                {expandedDays[`diet-${index}`] ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </div>
            </button>
            
            {expandedDays[`diet-${index}`] && (
              <div className="px-4 pb-4 border-t border-slate-700/50">
                <div className="pt-4 space-y-3">
                  {day.meals?.map((meal, i) => (
                    <div key={i} className="p-3 bg-slate-800/50 rounded-lg">
                      <div className="font-medium mb-1">{meal.name}</div>
                      <div className="text-sm text-slate-400">{meal.foods?.[0]}</div>
                      <div className="flex gap-4 mt-2 text-xs text-slate-500">
                        <span>Protein: {meal.protein}</span>
                        <span>Carbs: {meal.carbs}</span>
                        <span>Fat: {meal.fat}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ))}

        {activeTab === 'meditation' && (
          <div className="grid gap-4">
            {plan.meditation?.map((med, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                      <Brain className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{med.name}</h3>
                      <p className="text-sm text-slate-400">{med.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{med.duration} min</span>
                  </div>
                </div>
                <p className="text-sm text-slate-400">{med.instructions}</p>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'sleep' && plan.sleepSchedule && (
          <div className="glass-card p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-rose-500/20 rounded-xl flex items-center justify-center">
                <Moon className="w-6 h-6 text-rose-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Sleep Schedule</h3>
                <p className="text-slate-400">Optimized for your goals</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-4 bg-slate-800/50 rounded-lg text-center">
                <div className="text-2xl font-bold text-rose-500 mb-1">
                  {plan.sleepSchedule.bedtime}
                </div>
                <div className="text-sm text-slate-400">Bedtime</div>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-lg text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  {plan.sleepSchedule.wakeTime}
                </div>
                <div className="text-sm text-slate-400">Wake Time</div>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-lg text-center">
                <div className="text-2xl font-bold text-secondary mb-1">
                  {plan.sleepSchedule.duration}h
                </div>
                <div className="text-sm text-slate-400">Sleep Duration</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Goal Selection Modal */}
      <AnimatePresence>
        {showGoalModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowGoalModal(false)}
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg glass-card p-6 max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowGoalModal(false)}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>

              {/* Header */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-heading font-bold">Create Your Wellness Plan</h3>
                <p className="text-slate-400 mt-1">Select your goals and fitness level</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-400">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              {/* Goals Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Select your goals
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {goalOptions.map(goal => (
                    <button
                      key={goal.id}
                      onClick={() => toggleGoal(goal.id)}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                        selectedGoals.includes(goal.id)
                          ? 'border-primary bg-primary/20'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <span className={`font-medium ${
                        selectedGoals.includes(goal.id) ? 'text-primary' : 'text-slate-300'
                      }`}>
                        {goal.label}
                      </span>
                    </button>
                  ))}
                </div>
                {selectedGoals.length === 0 && (
                  <p className="text-sm text-slate-500 mt-2">Please select at least one goal</p>
                )}
              </div>

              {/* Fitness Level Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Your fitness level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {fitnessLevels.map(level => (
                    <button
                      key={level.id}
                      onClick={() => setSelectedFitnessLevel(level.id)}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 text-center ${
                        selectedFitnessLevel === level.id
                          ? 'border-primary bg-primary/20'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <span className={`font-medium block ${
                        selectedFitnessLevel === level.id ? 'text-primary' : 'text-slate-300'
                      }`}>
                        {level.label}
                      </span>
                      <span className="text-xs text-slate-500">{level.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowGoalModal(false)}
                  className="flex-1 px-6 py-3 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGeneratePlan}
                  disabled={loading || selectedGoals.length === 0}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Target className="w-4 h-4" />
                      Generate Plan
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
