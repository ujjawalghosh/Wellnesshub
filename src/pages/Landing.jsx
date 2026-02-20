import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Leaf, 
  Target, 
  Trophy, 
  Brain, 
  Users, 
  Shield,
  ArrowRight,
  Star,
  CheckCircle
} from 'lucide-react'

const features = [
  {
    icon: Target,
    title: 'AI-Powered Plans',
    description: 'Get personalized wellness plans tailored to your goals using advanced AI technology.'
  },
  {
    icon: Brain,
    title: 'Habit Tracking',
    description: 'Build lasting habits with our intuitive tracker, streaks, and achievement system.'
  },
  {
    icon: Trophy,
    title: 'Community Challenges',
    description: 'Join challenges, compete with others, and win exciting rewards.'
  },
  {
    icon: Users,
    title: 'FairDraw System',
    description: 'Transparent and fair challenge winner selection using cryptographic verification.'
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'Your data is secure with us. We prioritize your privacy and security.'
  },
  {
    icon: Leaf,
    title: 'Holistic Wellness',
    description: 'Focus on physical, mental, and emotional health for complete wellbeing.'
  }
]

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Fitness Enthusiast',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    content: 'WellnessHub transformed my approach to health. The AI-generated plan was exactly what I needed!',
    rating: 5
  },
  {
    name: 'Michael Chen',
    role: 'Software Developer',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    content: 'The habit tracking and streak system keeps me motivated. I have not missed a day in 3 months!',
    rating: 5
  },
  {
    name: 'Emily Davis',
    role: 'Marketing Manager',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    content: 'The mindful breaks feature has reduced my work stress significantly. Highly recommended!',
    rating: 5
  }
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="font-heading font-bold text-xl">WellnessHub</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-slate-300 hover:text-white transition-colors">
              Login
            </Link>
            <Link to="/register" className="btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 hero-gradient"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <span className="inline-block px-4 py-2 bg-primary/20 text-primary rounded-full text-sm font-medium mb-6">
              🚀 Your AI-Powered Wellness Journey Starts Here
            </span>
            
            <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6 leading-tight">
              Transform Your Life with
              <span className="block text-gradient"> Smart Wellness</span>
            </h1>
            
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
              Track habits, achieve goals, join challenges, and unlock your full potential with our comprehensive wellness platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-primary text-lg px-8 py-4 inline-flex items-center justify-center gap-2">
                Start Your Journey <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/login" className="btn-outline text-lg px-8 py-4">
                Sign In
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: '50K+', label: 'Active Users' },
                { value: '1M+', label: 'Habits Tracked' },
                { value: '10K+', label: 'Challenges Created' },
                { value: '4.9', label: 'App Rating' }
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl md:text-4xl font-bold text-gradient">{stat.value}</div>
                  <div className="text-slate-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-heading font-bold mb-4">
              Everything You Need for <span className="text-gradient">Better Health</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Our comprehensive platform provides all the tools you need to transform your wellness journey.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card-hover p-6"
              >
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-heading font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-heading font-bold mb-4">
              Loved by <span className="text-gradient">Thousands</span>
            </h2>
            <p className="text-slate-400 text-lg">
              See what our community has to say about their wellness journey.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 text-amber-500 fill-amber-500" />
                  ))}
                </div>
                <p className="text-slate-300 mb-6">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <div className="font-medium">{testimonial.name}</div>
                    <div className="text-sm text-slate-400">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="card-gradient p-12 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary"></div>
            <h2 className="text-4xl font-heading font-bold mb-4">
              Ready to Transform Your Life?
            </h2>
            <p className="text-slate-400 text-lg mb-8">
              Join thousands of users who have already started their wellness journey.
            </p>
            <Link to="/register" className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2">
              Get Started for Free <ArrowRight className="w-5 h-5" />
            </Link>
            
            <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" /> No credit card required
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" /> Free forever plan
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" /> Cancel anytime
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="font-heading font-bold">WellnessHub</span>
            </div>
            <p className="text-slate-400 text-sm">
              © 2026 WellnessHub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
