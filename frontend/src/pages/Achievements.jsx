import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Award, 
  Trophy, 
  Flame, 
  Star, 
  Medal, 
  Crown,
  Target,
  Zap,
  Heart,
  Shield,
  CheckCircle,
  Lock
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const badgeData = [
  { id: 'streak_7', name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: Flame, tier: 'bronze', requirement: 7 },
  { id: 'streak_30', name: 'Month Master', description: 'Maintain a 30-day streak', icon: Trophy, tier: 'silver', requirement: 30 },
  { id: 'streak_100', name: 'Century Champion', description: 'Maintain a 100-day streak', icon: Crown, tier: 'gold', requirement: 100 },
  { id: 'first_habit', name: 'Getting Started', description: 'Create your first habit', icon: Target, tier: 'bronze', requirement: 1 },
  { id: 'first_challenge', name: 'Challenger', description: 'Join your first challenge', icon: Zap, tier: 'bronze', requirement: 1 },
  { id: 'perfect_week', name: 'Perfect Week', description: 'Complete all habits for a week', icon: Star, tier: 'silver', requirement: 7 },
  { id: 'level_5', name: 'Rising Star', description: 'Reach level 5', icon: Award, tier: 'bronze', requirement: 5 },
  { id: 'level_10', name: 'Wellness Warrior', description: 'Reach level 10', icon: Medal, tier: 'silver', requirement: 10 },
  { id: 'level_25', name: 'Elite', description: 'Reach level 25', icon: Crown, tier: 'gold', requirement: 25 },
  { id: 'first_break', name: 'Mindful Moment', description: 'Complete your first mindful break', icon: Heart, tier: 'bronze', requirement: 1 },
  { id: 'challenge_winner', name: 'Champion', description: 'Win a community challenge', icon: Trophy, tier: 'gold', requirement: 1 },
  { id: 'points_1000', name: 'Point Collector', description: 'Earn 1000 points', icon: Star, tier: 'bronze', requirement: 1000 },
  { id: 'points_5000', name: 'Point Master', description: 'Earn 5000 points', icon: Medal, tier: 'silver', requirement: 5000 },
  { id: 'points_10000', name: 'Point Legend', description: 'Earn 10000 points', icon: Crown, tier: 'gold', requirement: 10000 },
]

const tierColors = {
  bronze: { bg: 'bg-amber-900/30', border: 'border-amber-700', icon: 'text-amber-500', glow: 'shadow-amber-500/20' },
  silver: { bg: 'bg-slate-400/20', border: 'border-slate-400', icon: 'text-slate-300', glow: 'shadow-slate-400/20' },
  gold: { bg: 'bg-yellow-500/20', border: 'border-yellow-500', icon: 'text-yellow-400', glow: 'shadow-yellow-500/30' }
}

export default function Achievements() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)

  // Calculate user progress
  const getProgress = (badge) => {
    switch (badge.id) {
      case 'streak_7':
      case 'streak_30':
      case 'streak_100':
        return { current: user?.points || 0, max: badge.requirement }
      case 'level_5':
      case 'level_10':
      case 'level_25':
        return { current: user?.level || 1, max: badge.requirement }
      case 'points_1000':
      case 'points_5000':
      case 'points_10000':
        return { current: user?.points || 0, max: badge.requirement }
      default:
        return { current: 0, max: badge.requirement }
    }
  }

  const isUnlocked = (badgeId) => {
    return user?.badges?.includes(badgeId) || false
  }

  const unlockedCount = badgeData.filter(b => isUnlocked(b.id)).length
  const totalCount = badgeData.length
  const progressPercent = Math.round((unlockedCount / totalCount) * 100)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold">Achievements</h2>
          <p className="text-slate-400">Track your badges and rewards</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-primary" />
            </div>
            <span className="text-slate-400">Badges Earned</span>
          </div>
          <div className="text-3xl font-bold">{unlockedCount}/{totalCount}</div>
          <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <Flame className="w-5 h-5 text-amber-500" />
            </div>
            <span className="text-slate-400">Total Points</span>
          </div>
          <div className="text-3xl font-bold">{user?.points || 0}</div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-secondary" />
            </div>
            <span className="text-slate-400">Current Level</span>
          </div>
          <div className="text-3xl font-bold">{user?.level || 1}</div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-rose-500/20 rounded-lg flex items-center justify-center">
              <Trophy className="w-5 h-5 text-rose-500" />
            </div>
            <span className="text-slate-400">Badges Remaining</span>
          </div>
          <div className="text-3xl font-bold">{totalCount - unlockedCount}</div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {badgeData.map((badge, index) => {
          const unlocked = isUnlocked(badge.id)
          const progress = getProgress(badge)
          const tierStyle = tierColors[badge.tier]
          const progressPercent = Math.min(100, Math.round((progress.current / progress.max) * 100))

          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`relative p-5 rounded-xl border-2 transition-all duration-300 ${
                unlocked 
                  ? `${tierStyle.bg} ${tierStyle.border} ${tierStyle.glow} shadow-lg` 
                  : 'bg-slate-800/50 border-slate-700'
              }`}
            >
              {/* Badge Icon */}
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
                unlocked ? 'bg-gradient-to-br from-primary/30 to-secondary/30' : 'bg-slate-800'
              }`}>
                {unlocked ? (
                  <badge.icon className={`w-8 h-8 ${tierStyle.icon}`} />
                ) : (
                  <Lock className="w-8 h-8 text-slate-600" />
                )}
              </div>

              {/* Badge Info */}
              <h3 className={`font-semibold mb-1 ${unlocked ? 'text-white' : 'text-slate-400'}`}>
                {badge.name}
              </h3>
              <p className="text-sm text-slate-500 mb-3">{badge.description}</p>

              {/* Progress Bar */}
              {!unlocked && (
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>{progress.current}</span>
                    <span>{progress.max}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div 
                      className="bg-slate-500 h-1.5 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Unlocked Indicator */}
              {unlocked && (
                <div className="absolute top-3 right-3">
                  <CheckCircle className={`w-5 h-5 ${tierStyle.icon}`} />
                </div>
              )}

              {/* Tier Badge */}
              <div className={`absolute bottom-3 right-3 px-2 py-0.5 rounded-full text-xs font-medium ${
                badge.tier === 'gold' ? 'bg-yellow-500/20 text-yellow-400' :
                badge.tier === 'silver' ? 'bg-slate-400/20 text-slate-300' :
                'bg-amber-700/20 text-amber-500'
              }`}>
                {badge.tier}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Level Progress */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-heading font-semibold">Level Progress</h3>
          <span className="text-primary font-bold">Level {user?.level || 1}</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-4 mb-2">
          <div 
            className="bg-gradient-to-r from-primary to-secondary h-4 rounded-full transition-all duration-500"
            style={{ width: `${(user?.points || 0) % 1000 / 10}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-slate-400">
          <span>{user?.points || 0} points</span>
          <span>{((user?.level || 1) * 1000)} points to next level</span>
        </div>
      </div>

      {/* Points Breakdown */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-heading font-semibold mb-4">How to Earn Points</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { action: 'Complete a habit', points: 5 },
            { action: 'Create a habit', points: 10 },
            { action: 'Join a challenge', points: 15 },
            { action: 'Create a challenge', points: 25 },
            { action: 'Generate wellness plan', points: 50 },
            { action: 'Complete mindful break', points: 5 },
            { action: 'Win a challenge', points: 100 },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <span className="text-slate-300">{item.action}</span>
              <span className="text-primary font-bold">+{item.points}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
