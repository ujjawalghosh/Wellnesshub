import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Leaf, 
  Target, 
  Zap, 
  Moon, 
  Brain, 
  Apple, 
  ChevronRight, 
  ChevronLeft,
  Sparkles
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import api from '../utils/api'

const goals = [
  { id: 'weight_loss', label: 'Weight Loss', icon: Target, description: 'Shed pounds and get healthier' },
  { id: 'stress_relief', label: 'Stress Relief', icon: Brain, description: 'Find peace and calm' },
  { id: 'fitness', label: 'Fitness', icon: Zap, description: 'Build strength and endurance' },
  { id: 'better_sleep', label: 'Better Sleep', icon: Moon, description: 'Improve sleep quality' },
  { id: 'mental_clarity', label: 'Mental Clarity', icon: Brain, description: 'Focus and concentrate better' },
  { id: 'healthy_eating', label: 'Healthy Eating', icon: Apple, description: 'Nourish your body right' }
]

const fitnessLevels = [
  { id: 'beginner', label: 'Beginner', description: 'Just starting out' },
  { id: 'intermediate', label: 'Intermediate', description: 'Some experience' },
  { id: 'advanced', label: 'Advanced', description: 'Very active lifestyle' }
]

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const [selectedGoals, setSelectedGoals] = useState([])
  const [fitnessLevel, setFitnessLevel] = useState('')
  const [loading, setLoading] = useState(false)
const { updateUser } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const toggleGoal = (goalId) => {
    setSelectedGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(g => g !== goalId)
        : [...prev, goalId]
    )
  }

  const handleNext = () => {
    if (step === 0 && selectedGoals.length === 0) return
    if (step === 1 && !fitnessLevel) return
    setStep(step + 1)
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const handleComplete = async () => {
    setLoading(true)
    try {
      // Update user profile
      await api.put('/auth/profile', {
        goals: selectedGoals,
        fitnessLevel
      })

      // Generate wellness plan
      await api.post('/plans/generate', {
        goals: selectedGoals,
        fitnessLevel
      })

updateUser({ goals: selectedGoals, fitnessLevel })
      toast.success('Your wellness plan has been created!')
      navigate('/dashboard')
    } catch (error) {
      console.error('Onboarding error:', error)
      toast.error(error.response?.data?.message || 'Failed to create your plan. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    {
      title: 'What are your wellness goals?',
      subtitle: 'Select all that apply'
    },
    {
      title: 'What is your fitness level?',
      subtitle: 'This helps us customize your plan'
    },
    {
      title: 'Ready to start!',
      subtitle: 'We will create your personalized wellness plan'
    }
  ]

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="fixed inset-0 hero-gradient"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-2xl"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <Leaf className="w-7 h-7 text-white" />
            </div>
            <span className="font-heading font-bold text-2xl">WellnessHub</span>
          </div>
        </div>

        {/* Progress */}
        <div className="flex justify-center gap-2 mb-8">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i <= step ? 'w-8 bg-primary' : 'w-2 bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="glass-card p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-heading font-bold text-center mb-2">
                {steps[step].title}
              </h2>
              <p className="text-slate-400 text-center mb-8">
                {steps[step].subtitle}
              </p>

              {/* Step 1: Goals */}
              {step === 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {goals.map(goal => (
                    <button
                      key={goal.id}
                      onClick={() => toggleGoal(goal.id)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                        selectedGoals.includes(goal.id)
                          ? 'border-primary bg-primary/20'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <goal.icon className={`w-8 h-8 mb-2 ${
                        selectedGoals.includes(goal.id) ? 'text-primary' : 'text-slate-400'
                      }`} />
                      <div className="font-medium">{goal.label}</div>
                      <div className="text-xs text-slate-500 mt-1">{goal.description}</div>
                    </button>
                  ))}
                </div>
              )}

              {/* Step 2: Fitness Level */}
              {step === 1 && (
                <div className="space-y-4">
                  {fitnessLevels.map(level => (
                    <button
                      key={level.id}
                      onClick={() => setFitnessLevel(level.id)}
                      className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                        fitnessLevel === level.id
                          ? 'border-primary bg-primary/20'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          fitnessLevel === level.id ? 'bg-primary' : 'bg-slate-800'
                        }`}>
                          <Zap className={`w-6 h-6 ${fitnessLevel === level.id ? 'text-white' : 'text-slate-400'}`} />
                        </div>
                        <div>
                          <div className="font-medium">{level.label}</div>
                          <div className="text-sm text-slate-400">{level.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Step 3: Complete */}
              {step === 2 && (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-heading font-semibold mb-2">
                    Your Personal Plan Awaits!
                  </h3>
                  <p className="text-slate-400 mb-6">
                    We will generate a customized wellness plan based on your goals and fitness level.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {selectedGoals.map(goalId => {
                      const goal = goals.find(g => g.id === goalId)
                      return (
                        <span key={goalId} className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">
                          {goal?.label}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handleBack}
              disabled={step === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                step === 0 
                  ? 'text-slate-600 cursor-not-allowed' 
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <ChevronLeft className="w-5 h-5" /> Back
            </button>

            {step < 2 ? (
              <button
                onClick={handleNext}
                disabled={step === 0 && selectedGoals.length === 0}
                className="btn-primary flex items-center gap-2"
              >
                Next <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={loading}
                className="btn-primary flex items-center gap-2"
              >
                {loading ? 'Creating...' : 'Get Started'} <Sparkles className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
