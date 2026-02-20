const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['steps', 'meditation', 'water', 'eating', 'workout', 'custom'],
    required: true
  },
  goal: {
    type: Number,
    required: true
  },
  goalUnit: {
    type: String,
    default: 'points'
  },
  duration: {
    type: Number, // in days
    required: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    progress: {
      type: Number,
      default: 0
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    completed: {
      type: Boolean,
      default: false
    }
  }],
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  drawHash: {
    type: String,
    default: null
  },
  drawTimestamp: {
    type: Date,
    default: null
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  prize: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for searching
challengeSchema.index({ type: 1, isPublic: 1 });
challengeSchema.index({ participants: 1 });

module.exports = mongoose.model('Challenge', challengeSchema);
