import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Mail, 
  Lock, 
  Bell, 
  Shield, 
  LogOut,
  Camera,
  Save,
  Star,
  Flame,
  Trophy
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

const goals = [
  { id: 'weight_loss', label: 'Weight Loss' },
  { id: 'stress_relief', label: 'Stress Relief' },
  { id: 'fitness', label: 'Fitness' },
  { id: 'better_sleep', label: 'Better Sleep' },
  { id: 'mental_clarity', label: 'Mental Clarity' },
  { id: 'healthy_eating', label: 'Healthy Eating' }
]

const fitnessLevels = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' }
]

export default function Profile() {
  const { user, updateUser, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [avatarLoading, setAvatarLoading] = useState(false)
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    goals: user?.goals || [],
    fitnessLevel: user?.fitnessLevel || 'beginner'
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Handle avatar change
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage('Please select an image file')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setMessage('Image size must be less than 2MB')
      return
    }

    setAvatarLoading(true)
    setMessage('')

    try {
      // Convert image to base64 data URL
      const reader = new FileReader()
      reader.onload = async () => {
        const base64Image = reader.result
        
        // Call the API to update avatar
        const response = await api.put('/auth/avatar', { avatar: base64Image })
        
        // Update user in context with new avatar
        updateUser({ avatar: response.avatar })
        
        setMessage('Profile photo updated successfully!')
        setAvatarLoading(false)
      }
      
      reader.onerror = () => {
        setMessage('Failed to read image file')
        setAvatarLoading(false)
      }
      
      reader.readAsDataURL(file)
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to update profile photo')
      setAvatarLoading(false)
    }
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    
    try {
      await api.put('/auth/profile', profileData)
      updateUser(profileData)
      setMessage('Profile updated successfully!')
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const toggleGoal = (goalId) => {
    setProfileData(prev => ({
      ...prev,
      goals: prev.goals.includes(goalId)
        ? prev.goals.filter(g => g !== goalId)
        : [...prev.goals, goalId]
    }))
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'goals', label: 'Goals', icon: Star },
    { id: 'password', label: 'Password', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold">Profile Settings</h2>
          <p className="text-slate-400">Manage your account and preferences</p>
        </div>
        <button
          onClick={logout}
          className="btn-outline flex items-center gap-2 text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
        >
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 text-center">
            <div className="relative inline-block mb-4">
              <img
                src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                alt={user?.name}
                className="w-24 h-24 rounded-full mx-auto"
              />
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-primary/80 transition-colors">
                {avatarLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  disabled={avatarLoading}
                />
              </label>
            </div>
            <h3 className="text-xl font-semibold">{user?.name}</h3>
            <p className="text-slate-400 text-sm mb-4">{user?.email}</p>
            
            <div className="flex justify-center gap-4 pt-4 border-t border-slate-700">
              <div className="text-center">
                <div className="flex items-center gap-1 text-amber-500">
                  <Flame className="w-4 h-4" />
                  <span className="font-bold">{user?.points || 0}</span>
                </div>
                <span className="text-xs text-slate-400">Points</span>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 text-primary">
                  <Trophy className="w-4 h-4" />
                  <span className="font-bold">{user?.level || 1}</span>
                </div>
                <span className="text-xs text-slate-400">Level</span>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 text-secondary">
                  <Star className="w-4 h-4" />
                  <span className="font-bold">{user?.badges?.length || 0}</span>
                </div>
                <span className="text-xs text-slate-400">Badges</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-4 space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {message && (
            <div className={`mb-4 p-4 rounded-lg ${
              message.includes('success') 
                ? 'bg-primary/20 text-primary' 
                : 'bg-red-500/20 text-red-400'
            }`}>
              {message}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="glass-card p-6">
              <h3 className="text-lg font-heading font-semibold mb-6">Profile Information</h3>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="input-field pl-11"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="input-field pl-11 opacity-60 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Fitness Level</label>
                  <select
                    value={profileData.fitnessLevel}
                    onChange={(e) => setProfileData({ ...profileData, fitnessLevel: e.target.value })}
                    className="input-field"
                  >
                    {fitnessLevels.map(level => (
                      <option key={level.id} value={level.id}>{level.label}</option>
                    ))}
                  </select>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Goals Tab */}
          {activeTab === 'goals' && (
            <div className="glass-card p-6">
              <h3 className="text-lg font-heading font-semibold mb-2">Wellness Goals</h3>
              <p className="text-slate-400 mb-6">Select your wellness goals to personalize your experience</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {goals.map(goal => (
                  <button
                    key={goal.id}
                    onClick={() => toggleGoal(goal.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      profileData.goals.includes(goal.id)
                        ? 'border-primary bg-primary/20'
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <Star className={`w-6 h-6 mx-auto mb-2 ${
                      profileData.goals.includes(goal.id) ? 'text-primary' : 'text-slate-500'
                    }`} />
                    <span className={profileData.goals.includes(goal.id) ? 'text-primary' : ''}>
                      {goal.label}
                    </span>
                  </button>
                ))}
              </div>

              <button
                onClick={handleProfileUpdate}
                disabled={loading}
                className="btn-primary flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                {loading ? 'Saving...' : 'Save Goals'}
              </button>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div className="glass-card p-6">
              <h3 className="text-lg font-heading font-semibold mb-6">Change Password</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="input-field pl-11"
                      placeholder="Enter current password"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="input-field pl-11"
                      placeholder="Enter new password"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="input-field pl-11"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button type="button" className="btn-primary">
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="glass-card p-6">
              <h3 className="text-lg font-heading font-semibold mb-6">Notification Settings</h3>
              
              <div className="space-y-4">
                {[
                  { id: 'daily_reminder', label: 'Daily Reminder', description: 'Get reminded to complete your habits' },
                  { id: 'challenge_update', label: 'Challenge Updates', description: 'Notifications about challenge progress' },
                  { id: 'weekly_report', label: 'Weekly Report', description: 'Receive your weekly progress report' },
                  { id: 'achievement', label: 'Achievements', description: 'Get notified when you earn badges' },
                  { id: 'break_reminder', label: 'Break Reminders', description: 'Periodic mindful break suggestions' }
                ].map(setting => (
                  <div key={setting.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                    <div>
                      <div className="font-medium">{setting.label}</div>
                      <div className="text-sm text-slate-400">{setting.description}</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
