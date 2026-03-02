const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
}, { _id: false });

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['fitness', 'mental', 'nutrition', 'social', 'learning', 'other'],
    default: 'other'
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
    type: Number,
    required: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [participantSchema],
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  prize: {
    type: String,
    trim: true
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  drawHash: {
    type: String
  },
  drawTimestamp: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for better query performance
challengeSchema.index({ creator: 1 });
challengeSchema.index({ participants: 1 });
challengeSchema.index({ endDate: 1 });
challengeSchema.index({ isPublic: 1, isCompleted: 1 });

const Challenge = mongoose.model('Challenge', challengeSchema);

module.exports = Challenge;
