# WellnessHub - Your Personal Wellness Companion

A comprehensive, AI-powered wellness platform built with React, Node.js, and MongoDB.

![WellnessHub](https://img.shields.io/badge/WellnessHub-v2.0.0-green)
![React](https://img.shields.io/badge/React-18-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)

## ✨ What's New in v2.0

### Additional Features Added:
- 💧 **Water Intake Tracker** - Track daily water consumption with visual progress, streaks, and goals
- 😴 **Sleep Tracker** - Log sleep quality, duration, and get weekly insights
- 😊 **Mood Tracker** - Daily mood logging with emotions, energy levels, and trends
- ⏱️ **Pomodoro Timer** - Focus timer with presets and productivity tracking
- 💬 **Daily Affirmations** - Inspirational quotes with categories

---

## Features

### 🎯 User Onboarding
- Goal selection (weight loss, stress relief, fitness, better sleep, mental clarity, healthy eating)
- Personalized profile setup with fitness level assessment

### 🤖 AI-Powered Wellness Plans
- Personalized diet recommendations
- Customized workout routines
- Meditation and mindfulness schedules
- Optimized sleep schedules

### ✅ Habit Tracker
- Daily habit tracking with streaks
- Gamified rewards system
- Badges and achievements
- Level progression (1-50)

### 🧘 Daily Mindful Breaks
- Stretching exercises
- Breathing techniques (4-7-8, box breathing)
- Hydration reminders
- Quick meditation sessions

### 🏆 Community Challenges
- Create and join wellness challenges
- Track progress with leaderboards
- **FairDraw** - Transparent random winner selection using SHA-256 hash
- Multiple challenge types (steps, meditation, water, eating, workout)

### 💧 Water Intake Tracker (NEW!)
- Visual progress circle with percentage
- Quick add buttons (100ml, 200ml, 250ml, 500ml)
- Custom amount input
- Daily goal setting (1.5L - 3L)
- Streak tracking
- History log

### 😴 Sleep Tracker (NEW!)
- Log bedtime and wake time
- Sleep quality rating (1-5)
- Weekly average stats
- Sleep history calendar
- Sleep tips and recommendations

### 😊 Mood Tracker (NEW!)
- Emoji-based mood selection
- Energy level tracking
- Stress level tracking
- Activity logging
- Gratitude entries
- Mood trends and insights
- Calendar view

### ⏱️ Pomodoro Timer (NEW!)
- Preset modes: Work (25min), Study (45min), Quick (15min)
- Short and long break modes
- Session tracking
- Daily/weekly stats
- Productivity streaks

### 💬 Daily Affirmations (NEW!)
- Daily rotating inspiration
- 10 categories (motivation, health, self-love, success, gratitude, etc.)
- Random affirmation generator
- Share functionality
- Featured affirmations

### 📊 Analytics Dashboard
- Progress charts and visualizations
- Weekly reports with insights
- Streak calendar
- Achievement tracking

### 👥 Friends & Social (NEW!)
- Add friends
- Leaderboard competition
- Friend progress tracking

### 📱 Mobile-First Design
- Responsive layout for all devices
- Modern glassmorphism UI
- Dark theme with gradient accents

### 📤 Export Options
- PDF export for wellness plans
- Share links for plans

## Tech Stack

### Frontend
- React 18 with Vite
- TailwindCSS for styling
- Framer Motion for animations
- Recharts for data visualization
- React Router v6 for navigation
- jsPDF for PDF generation

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT authentication
- bcryptjs for password hashing
- Express-validator for validation

## 🚀 Vercel Deployment

### Quick Deploy Links
- **Frontend:** Deploy to Vercel directly from the `frontend` folder
- **Backend:** Deploy to Vercel directly from the `backend` folder

### Step 1: Deploy Backend

1. Go to [Vercel](https://vercel.com) and sign in
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Select the `backend` folder
5. Configure Environment Variables:

| Variable | Value |
|----------|-------|
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | Any random string (e.g., `wellnesshub-secret-2024`) |
| `EMAIL_USER` | Your Gmail address for OTP |
| `EMAIL_PASS` | Your Gmail App Password |
| `OPENAI_API_KEY` | Your OpenAI API key (optional) |

6. Click "Deploy"

### Step 2: Deploy Frontend

1. In Vercel, create another project for the `frontend` folder
2. Configure Environment Variables (optional):
   | Variable | Value |
   |----------|-------|
   | `VITE_API_URL` | Your backend URL (e.g., https://backend-xxx.vercel.app) |

3. The frontend will automatically route `/api/*` requests to your backend
4. Click "Deploy"

### Getting MongoDB Atlas URI

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a free cluster
4. Create a database user
5. Click "Connect" → "Connect your application"
6. Copy the connection string
7. Replace `<password>` with your database password

### Getting Gmail App Password

1. Go to your Google Account
2. Enable 2-Factor Authentication
3. Go to Security → App passwords
4. Create a new app password for "Mail"
5. Use that password in `EMAIL_PASS`

## Local Development

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```
bash
cd WellnessHub
```

2. **Install backend dependencies**
```
bash
cd backend
npm install
```

3. **Install frontend dependencies**
```
bash
cd frontend
npm install
```

4. **Configure environment variables**

Create a `.env` file in the backend directory:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/wellnesshub
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

5. **Start MongoDB**
```
bash
mongod
```

6. **Start the backend server**
```
bash
cd backend
npm run dev
```

7. **Start the frontend development server**
```
bash
cd frontend
npm run dev
```

8. **Open your browser**
Navigate to `http://localhost:5173`

## Project Structure

```
WellnessHub/
├── backend/
│   ├── config/
│   │   └── db.js           # MongoDB connection
│   ├── data/
│   │   └── affirmations.js # Daily affirmations data
│   ├── middleware/
│   │   └── auth.js         # JWT authentication
│   ├── models/
│   │   ├── User.js         # User schema
│   │   ├── WellnessPlan.js  # Wellness plan schema
│   │   ├── Habit.js        # Habit schema
│   │   ├── Challenge.js     # Challenge schema
│   │   ├── WaterIntake.js  # Water intake schema (NEW!)
│   │   ├── SleepLog.js     # Sleep log schema (NEW!)
│   │   ├── MoodLog.js      # Mood log schema (NEW!)
│   │   ├── BodyMetrics.js  # Body metrics schema (NEW!)
│   │   ├── NutritionLog.js # Nutrition log schema (NEW!)
│   │   ├── PomodoroSession.js # Pomodoro schema (NEW!)
│   │   ├── MeditationSession.js # Meditation schema (NEW!)
│   │   ├── Friend.js       # Friends schema (NEW!)
│   │   ├── ProgressPhoto.js # Progress photos schema (NEW!)
│   │   └── DailyAffirmation.js # Affirmations schema (NEW!)
│   ├── routes/
│   │   ├── auth.js         # Auth routes
│   │   ├── plans.js       # Wellness plan routes
│   │   ├── habits.js       # Habit routes
│   │   ├── challenges.js   # Challenge routes
│   │   ├── breaks.js       # Mindful break routes
│   │   ├── analytics.js    # Analytics routes
│   │   ├── water.js        # Water intake routes (NEW!)
│   │   ├── sleep.js        # Sleep routes (NEW!)
│   │   ├── mood.js         # Mood routes (NEW!)
│   │   ├── body.js         # Body metrics routes (NEW!)
│   │   ├── nutrition.js   # Nutrition routes (NEW!)
│   │   ├── pomodoro.js     # Pomodoro routes (NEW!)
│   │   ├── meditation.js   # Meditation routes (NEW!)
│   │   ├── friends.js      # Friends routes (NEW!)
│   │   └── affirmations.js # Affirmations routes (NEW!)
│   ├── utils/
│   │   ├── fairdraw.js     # FairDraw SHA-256 implementation
│   │   ├── aiPlan.js       # AI plan generation
│   │   └── email.js        # Email utilities
│   ├── server.js           # Express server
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Toast.jsx
│   │   │   └── ErrorBoundary.jsx
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── OTPLogin.jsx
│   │   │   ├── EmailVerify.jsx
│   │   │   ├── Onboarding.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── WellnessPlan.jsx
│   │   │   ├── Habits.jsx
│   │   │   ├── Challenges.jsx
│   │   │   ├── MindfulBreaks.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── Achievements.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── WaterTracker.jsx    (NEW!)
│   │   │   ├── SleepTracker.jsx     (NEW!)
│   │   │   ├── MoodTracker.jsx      (NEW!)
│   │   │   ├── PomodoroTimer.jsx    (NEW!)
│   │   │   └── DailyAffirmation.jsx (NEW!)
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── SPEC.md
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Wellness Plans
- `POST /api/plans/generate` - Generate AI wellness plan
- `GET /api/plans` - Get user's plans
- `GET /api/plans/active` - Get active plan

### Habits
- `GET /api/habits` - Get all habits
- `POST /api/habits` - Create habit
- `PUT /api/habits/:id` - Update habit
- `DELETE /api/habits/:id` - Delete habit
- `POST /api/habits/:id/complete` - Complete habit

### Challenges
- `GET /api/challenges` - Get all challenges
- `POST /api/challenges` - Create challenge
- `GET /api/challenges/:id` - Get challenge
- `POST /api/challenges/:id/join` - Join challenge
- `POST /api/challenges/:id/fairdraw` - Run FairDraw

### Water Tracking (NEW!)
- `GET /api/water/today` - Get today's water intake
- `POST /api/water/add` - Add water intake
- `PUT /api/water/goal` - Update daily goal
- `GET /api/water/history` - Get water history

### Sleep Tracking (NEW!)
- `GET /api/sleep` - Get sleep logs
- `POST /api/sleep` - Log sleep
- `GET /api/sleep/stats/weekly` - Get weekly stats

### Mood Tracking (NEW!)
- `GET /api/mood` - Get mood logs
- `POST /api/mood` - Log mood
- `GET /api/mood/trends` - Get mood trends
- `GET /api/mood/calendar` - Get calendar view

### Pomodoro (NEW!)
- `GET /api/pomodoro/today` - Get today's sessions
- `POST /api/pomodoro/start` - Start session
- `POST /api/pomodoro/end/:id` - End session
- `GET /api/pomodoro/stats/weekly` - Get weekly stats

### Affirmations (NEW!)
- `GET /api/affirmations/daily` - Get daily affirmation
- `GET /api/affirmations/random` - Get random affirmation
- `GET /api/affirmations/category/:category` - Get by category

### Friends (NEW!)
- `GET /api/friends` - Get friends list
- `POST /api/friends/request` - Send friend request
- `POST /api/friends/accept/:id` - Accept request
- `GET /api/friends/leaderboard` - Get leaderboard

### Analytics
- `GET /api/analytics/progress` - Get progress data
- `GET /api/analytics/weekly-report` - Get weekly report

## FairDraw System

The FairDraw system ensures transparent and fair random winner selection using SHA-256 hash:

1. Collect all eligible participant IDs
2. Add challenge seed (created timestamp + challenge ID)
3. Add current timestamp for unpredictability
4. Generate SHA-256 hash
5. Use hash to deterministically select winner
6. Display hash for transparency and verification

## Troubleshooting

### "Unable to connect to server" error
- Make sure MongoDB URI is set in Vercel backend environment variables
- Wait 30 seconds for the backend to restart after adding environment variables

### "Operation users.findOne() buffering timed out"
- MongoDB is not connected. Check your MONGODB_URI in Vercel

### 401 Unauthorized errors
- Clear browser localStorage and try again
- Make sure you're using the latest deployed version

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Design inspiration from modern wellness apps
- SHA-256 implementation for fair random selection
- OpenAI API ready for AI integration

---

Built with ❤️ for your wellness journey

