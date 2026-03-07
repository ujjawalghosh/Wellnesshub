import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, RotateCcw, Coffee, Brain, Target, Flame, CheckCircle } from 'lucide-react'
import api from '../utils/api'

const presets = {
  work: { work: 25, shortBreak: 5, longBreak: 15 },
  study: { work: 45, shortBreak: 10, longBreak: 30 },
  quick: { work: 15, shortBreak: 3, longBreak: 10 }
}

export default function PomodoroTimer() {
  const [mode, setMode] = useState('work')
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [session, setSession] = useState(null)
  const [stats, setStats] = useState(null)
  const [preset, setPreset] = useState('work')
  const [todaySessions, setTodaySessions] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    fetchTodayStats()
    return () => clearInterval(timerRef.current)
  }, [])

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      handleTimerComplete()
    }
    return () => clearInterval(timerRef.current)
  }, [isRunning, timeLeft])

  const fetchTodayStats = async () => {
    try {
      const response = await api.get('/pomodoro/today')
      setStats(response.data)
      setTodaySessions(response.data.completedSessions || 0)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const startSession = async () => {
    try {
      const response = await api.post('/pomodoro/start', { 
        type: mode,
        settings: presets[preset]
      })
      setSession(response.data)
      setIsRunning(true)
    } catch (error) {
      console.error('Error starting session:', error)
    }
  }

  const pauseSession = () => {
    setIsRunning(false)
  }

  const resumeSession = () => {
    setIsRunning(true)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(presets[preset].work * 60)
    setSession(null)
  }

  const handleTimerComplete = async () => {
    setIsRunning(false)
    if (session) {
      try {
        await api.post(`/pomodoro/end/${session._id}`, {
          productivityRating: 3,
          breakTaken: mode === 'work'
        })
        fetchTodayStats()
      } catch (error) {
        console.error('Error ending session:', error)
      }
    }
    
    // Play notification sound or show notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('WellnessHub', {
        body: mode === 'work' ? 'Work session complete! Time for a break.' : 'Break is over! Ready to work?'
      })
    }
  }

  const changePreset = (newPreset) => {
    setPreset(newPreset)
    setMode('work')
    setTimeLeft(presets[newPreset].work * 60)
    setIsRunning(false)
    setSession(null)
  }

  const changeMode = (newMode) => {
    setMode(newMode)
    if (newMode === 'work') {
      setTimeLeft(presets[preset].work * 60)
    } else if (newMode === 'shortBreak') {
      setTimeLeft(presets[preset].shortBreak * 60)
    } else {
      setTimeLeft(presets[preset].longBreak * 60)
    }
    setIsRunning(false)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progress = mode === 'work' 
    ? ((presets[preset].work * 60 - timeLeft) / (presets[preset].work * 60)) * 100
    : mode === 'shortBreak'
    ? ((presets[preset].shortBreak * 60 - timeLeft) / (presets[preset].shortBreak * 60)) * 100
    : ((presets[preset].longBreak * 60 - timeLeft) / (presets[preset].longBreak * 60)) * 100

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold flex items-center gap-3">
          <Brain className="w-8 h-8 text-red-500" />
          Pomodoro Timer
        </h1>
      </div>

      {/* Preset Selection */}
      <div className="glass-card p-4">
        <div className="flex gap-2">
          {Object.keys(presets).map(p => (
            <button
              key={p}
              onClick={() => changePreset(p)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors capitalize ${
                preset === p
                  ? 'bg-primary text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Timer */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-12 text-center"
      >
        {/* Mode Tabs */}
        <div className="flex justify-center gap-2 mb-8">
          {['work', 'shortBreak', 'longBreak'].map(m => (
            <button
              key={m}
              onClick={() => changeMode(m)}
              className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                mode === m
                  ? m === 'work' ? 'bg-red-500 text-white' 
                  : m === 'shortBreak' ? 'bg-green-500 text-white'
                  : 'bg-blue-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {m === 'shortBreak' ? 'Short Break' : m === 'longBreak' ? 'Long Break' : 'Work'}
            </button>
          ))}
        </div>

        {/* Timer Circle */}
        <div className="relative w-64 h-64 mx-auto mb-8">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-slate-700"
            />
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={754}
              strokeDashoffset={754 - (754 * progress) / 100}
              className={`transition-all duration-1000 ${
                mode === 'work' ? 'text-red-500' : 'text-green-500'
              }`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-6xl font-bold">{formatTime(timeLeft)}</span>
            <span className="text-slate-400 mt-2">
              {isRunning ? 'Focus time!' : session ? 'Paused' : 'Ready to start'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          {!session ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startSession}
              className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-medium flex items-center gap-2"
            >
              <Play className="w-5 h-5" /> Start
            </motion.button>
          ) : isRunning ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={pauseSession}
              className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-xl font-medium flex items-center gap-2"
            >
              <Pause className="w-5 h-5" /> Pause
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resumeSession}
              className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-medium flex items-center gap-2"
            >
              <Play className="w-5 h-5" /> Resume
            </motion.button>
          )}
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetTimer}
            className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2"
          >
            <RotateCcw className="w-5 h-5" /> Reset
          </motion.button>
        </div>
      </motion.div>

      {/* Today's Stats */}
      <div className="grid grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4 text-center"
        >
          <Target className="w-8 h-8 text-primary mx-auto mb-2" />
          <div className="text-2xl font-bold">{todaySessions}</div>
          <div className="text-sm text-slate-400">Sessions Today</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-4 text-center"
        >
          <Brain className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <div className="text-2xl font-bold">{Math.round((todaySessions * presets[preset].work) / 60 * 10) / 10}h</div>
          <div className="text-sm text-slate-400">Focus Time</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-4 text-center"
        >
          <Coffee className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <div className="text-2xl font-bold">{Math.floor(todaySessions / 4)}</div>
          <div className="text-sm text-slate-400">Breaks Taken</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-4 text-center"
        >
          <Flame className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <div className="text-2xl font-bold">{stats?.streak || 0}</div>
          <div className="text-sm text-slate-400">Day Streak</div>
        </motion.div>
      </div>

      {/* Quick Tips */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-heading font-semibold mb-4">Pomodoro Technique</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-slate-400">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <p>Work for 25 minutes without interruption</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <p>Take a 5-minute short break</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <p>After 4 sessions, take a longer 15-30 min break</p>
          </div>
        </div>
      </div>
    </div>
  )
}

