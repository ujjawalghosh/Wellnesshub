# WellnessHub - Specification Document

## 1. Project Overview

**Project Name:** WellnessHub
**Type:** Full-stack Web Application
**Core Functionality:** A comprehensive wellness platform that provides AI-powered personalized wellness plans, habit tracking with gamification, community challenges, and daily mindfulness suggestions.
**Target Users:** Health-conscious individuals seeking personalized wellness guidance, fitness enthusiasts, and people looking to build healthy habits.

---

## 2. Tech Stack

### Frontend
- **Framework:** React 18 with Vite
- **Styling:** TailwindCSS
- **State Management:** React Context + useReducer
- **Routing:** React Router v6
- **Charts:** Recharts
- **Icons:** Lucide React
- **PDF Export:** jsPDF
- **Animations:** Framer Motion

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcryptjs
- **Validation:** express-validator

### AI Integration
- **Current:** Mock AI responses (easily swappable with OpenAI API)

---

## 3. UI/UX Specification

### Color Palette
- **Primary:** #10B981 (Emerald Green - represents wellness/nature)
- **Primary Dark:** #059669
- **Primary Light:** #34D399
- **Secondary:** #8B5CF6 (Violet - represents mindfulness/spirituality)
- **Secondary Dark:** #7C3AED
- **Accent:** #F59E0B (Amber - for rewards/achievements)
- **Background:** #0F172A (Dark slate - modern, premium feel)
- **Background Light:** #1E293B
- **Surface:** #334155
- **Text Primary:** #F8FAFC
- **Text Secondary:** #94A3B8
- **Success:** #22C55E
- **Warning:** #EAB308
- **Error:** #EF4444

### Typography
- **Headings:** "Outfit" (Google Fonts) - modern, clean, premium feel
- **Body:** "Inter" (Google Fonts) - highly readable
- **Font Sizes:**
  - H1: 3rem (48px)
  - H2: 2.25rem (36px)
  - H3: 1.5rem (24px)
  - Body: 1rem (16px)
  - Small: 0.875rem (14px)

### Layout
- **Mobile-first responsive design**
- **Breakpoints:**
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px
- **Max content width:** 1280px
- **Sidebar navigation:** Collapsible on mobile

### Visual Effects
- **Glassmorphism cards:** backdrop-blur-md with semi-transparent backgrounds
- **Gradient accents:** Subtle gradient overlays on key elements
- **Shadows:** Soft, colored shadows matching brand colors
- **Animations:** Smooth transitions (300ms ease), micro-interactions on hover
- **Border radius:** 12px for cards, 8px for buttons, full rounded for avatars

---

## 4. Feature Specification

### 4.1 User Onboarding
- **Welcome Screen:** Animated intro with app value proposition
- **Goal Selection:** Multi-select cards for goals:
  - Weight Loss
  - Stress Relief
  - Fitness Improvement
  - Better Sleep
  - Mental Clarity
  - Healthy Eating
- **Profile Setup:** Name, age, current fitness level, preferences
- **Initial Assessment:** Quick quiz to personalize the experience

### 4.2 AI-Powered Wellness Plan
- **Personalized Recommendations:**
  - Diet plan based on goals and preferences
  - Workout routine customized to fitness level
  - Meditation and mindfulness exercises
  - Sleep schedule optimization
- **Weekly Plan View:** Day-by-day breakdown
- **Progress Tracking:** Mark activities as complete
- **Plan Adjustment:** Regenerate plan based on feedback

### 4.3 Habit Tracker
- **Daily Habits:** Customizable habit list
- **Streak System:**
  - Current streak counter
  - Longest streak record
  - Streak freeze (1 per week)
- **Badges & Rewards:**
  - 7-day streak badge
  - 30-day streak badge
  - 100-day streak badge
  - Perfect week badge
  - Challenge completion badges
- **Gamification:**
  - Points system
  - Level progression (1-50)
  - Achievement unlocks

### 4.4 Daily Mindful Break
- **Break Suggestions:**
  - Stretching exercises (with instructions)
  - Breathing exercises (4-7-8 technique, box breathing)
  - Hydration reminders
  - Quick meditation (1-5 minutes)
- **Scheduled Reminders:** Customizable notification times
- **Break Library:** Collection of break activities

### 4.5 Community Challenges
- **Challenge Types:**
  - Step challenges
  - Meditation challenges
  - Water intake challenges
  - Healthy eating challenges
  - Custom challenges
- **Challenge Creation:**
  - Title, description, duration
  - Goal setting
  - Visibility (public/private)
- **Challenge Joining:** Browse and join challenges
- **Leaderboard:** Track progress within challenges

### 4.6 FairDraw Challenge Assignment
- **SHA-256 Transparent Selection:**
  - Use challenge participant list + challenge seed + timestamp
  - Generate deterministic but unpredictable winner selection
  - Display hash for transparency
  - Allow users to verify the selection process
- **Fairness Features:**
  - Equal chance for all eligible participants
  - Verifiable random selection

### 4.7 Dashboard & Analytics
- **Progress Charts:**
  - Weekly/Monthly progress visualization
  - Habit completion rates
  - Weight/goal tracking
- **Weekly Reports:**
  - Summary of achievements
  - Areas for improvement
  - Motivational insights
- **Streak Statistics:** Visual streak calendar

### 4.8 Export Options
- **PDF Export:**
  - Downloadable wellness plan
  - Progress reports
  - Achievement certificates
- **Share Link:**
  - Generate shareable link for plans
  - Social media sharing

---

## 5. Page Structure

### Pages
1. **Landing Page** - Marketing page for non-authenticated users
2. **Auth Pages** - Login, Register, Forgot Password
3. **Onboarding** - Goal selection and profile setup
4. **Dashboard** - Main hub with progress overview
5. **Wellness Plan** - AI-generated personalized plan
6. **Habit Tracker** - Daily habits and streaks
7. **Challenges** - Browse, create, and join challenges
8. **Mindful Breaks** - Break suggestions and reminders
9. **Analytics** - Detailed progress charts and reports
10. **Profile** - User settings and preferences
11. **Achievements** - Badges and rewards gallery

---

## 6. API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Wellness Plans
- `POST /api/plans/generate` - Generate AI wellness plan
- `GET /api/plans` - Get user's wellness plans
- `GET /api/plans/:id` - Get specific plan
- `PUT /api/plans/:id` - Update plan
- `DELETE /api/plans/:id` - Delete plan

### Habits
- `GET /api/habits` - Get user's habits
- `POST /api/habits` - Create new habit
- `PUT /api/habits/:id` - Update habit
- `DELETE /api/habits/:id` - Delete habit
- `POST /api/habits/:id/complete` - Mark habit as complete

### Challenges
- `GET /api/challenges` - Get all challenges
- `POST /api/challenges` - Create challenge
- `GET /api/challenges/:id` - Get challenge details
- `POST /api/challenges/:id/join` - Join challenge
- `POST /api/challenges/:id/fairdraw` - Run FairDraw selection

### Mindful Breaks
- `GET /api/breaks` - Get break suggestions
- `POST /api/breaks/complete` - Mark break as completed

### Analytics
- `GET /api/analytics/progress` - Get progress data
- `GET /api/analytics/weekly-report` - Get weekly report

---

## 7. Database Schema

### User
```
{
  _id: ObjectId,
  email: String,
  password: String (hashed),
  name: String,
  avatar: String,
  goals: [String],
  fitnessLevel: String,
  points: Number,
  level: Number,
  badges: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### WellnessPlan
```
{
  _id: ObjectId,
  userId: ObjectId,
  goals: [String],
  diet: [{
    day: String,
    meals: [String]
  }],
  workout: [{
    day: String,
    exercises: [String]
  }],
  meditation: [String],
  createdAt: Date
}
```

### Habit
```
{
  _id: ObjectId,
  userId: ObjectId,
  name: String,
  frequency: String,
  streak: Number,
  longestStreak: Number,
  completions: [{
    date: Date,
    completed: Boolean
  }],
  createdAt: Date
}
```

### Challenge
```
{
  _id: ObjectId,
  title: String,
  description: String,
  type: String,
  goal: Number,
  duration: Number,
  creator: ObjectId,
  participants: [ObjectId],
  startDate: Date,
  endDate: Date,
  isPublic: Boolean,
  winner: ObjectId,
  drawHash: String,
  createdAt: Date
}
```

---

## 8. Acceptance Criteria

### Core Functionality
- [ ] User can register and login securely
- [ ] User can select wellness goals during onboarding
- [ ] User receives AI-generated personalized wellness plan
- [ ] User can track daily habits and maintain streaks
- [ ] User can earn badges and rewards for achievements
- [ ] User receives daily mindful break suggestions
- [ ] User can create and join community challenges
- [ ] FairDraw system works transparently with SHA-256
- [ ] Dashboard shows progress analytics and charts
- [ ] User can export plans as PDF

### UI/UX
- [ ] Mobile-first responsive design works on all devices
- [ ] Modern, premium look with glassmorphism effects
- [ ] Smooth animations and transitions
- [ ] Intuitive navigation with sidebar
- [ ] Dark theme with accent colors

### Technical
- [ ] Clean, modular codebase
- [ ] SEO-friendly structure
- [ ] JWT authentication working
- [ ] MongoDB integration functional
- [ ] API endpoints properly structured
- [ ] Error handling implemented

---

## 9. Project Structure

```
WellnessHub/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── WellnessPlan.js
│   │   ├── Habit.js
│   │   └── Challenge.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── plans.js
│   │   ├── habits.js
│   │   ├── challenges.js
│   │   ├── breaks.js
│   │   └── analytics.js
│   ├── utils/
│   │   ├── fairdraw.js
│   │   └── aiPlan.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
└── README.md
