const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Challenge = require('../models/Challenge');
const User = require('../models/User');
const { performFairDraw } = require('../utils/fairdraw');

// Get all public challenges
router.get('/', auth, async (req, res) => {
  try {
    const { type, status } = req.query;
    const query = { isPublic: true };

    if (type) query.type = type;
    if (status === 'active') {
      query.endDate = { $gte: new Date() };
      query.isCompleted = false;
    } else if (status === 'completed') {
      query.isCompleted = true;
    }

    const challenges = await Challenge.find(query)
      .populate('creator', 'name avatar')
      .populate('participants.user', 'name avatar')
      .sort({ createdAt: -1 });

    res.json(challenges);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's challenges
router.get('/my', auth, async (req, res) => {
  try {
    const challenges = await Challenge.find({
      'participants.user': req.user._id
    })
      .populate('creator', 'name avatar')
      .populate('participants.user', 'name avatar')
      .sort({ createdAt: -1 });

    res.json(challenges);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new challenge
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, type, goal, goalUnit, duration, isPublic, prize } = req.body;

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + duration);

    const challenge = new Challenge({
      title,
      description,
      type,
      goal,
      goalUnit,
      duration,
      creator: req.user._id,
      participants: [{
        user: req.user._id,
        progress: 0,
        joinedAt: new Date()
      }],
      startDate,
      endDate,
      isPublic: isPublic !== false,
      prize
    });

    await challenge.save();
    await challenge.populate('creator', 'name avatar');

    // Award points
    await User.findByIdAndUpdate(req.user._id, { $inc: { points: 25 } });

    res.status(201).json(challenge);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get challenge by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
      .populate('creator', 'name avatar')
      .populate('participants.user', 'name avatar level points');

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    res.json(challenge);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Join challenge
router.post('/:id/join', auth, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    // Check if already joined
    const alreadyJoined = challenge.participants.some(
      p => p.user.toString() === req.user._id.toString()
    );

    if (alreadyJoined) {
      return res.status(400).json({ message: 'Already joined this challenge' });
    }

    // Check if challenge is still active
    if (new Date() > challenge.endDate) {
      return res.status(400).json({ message: 'Challenge has ended' });
    }

    challenge.participants.push({
      user: req.user._id,
      progress: 0,
      joinedAt: new Date()
    });

    await challenge.save();

    // Award points
    await User.findByIdAndUpdate(req.user._id, { $inc: { points: 15 } });

    await challenge.populate('creator', 'name avatar');
    await challenge.populate('participants.user', 'name avatar');

    res.json(challenge);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update progress
router.post('/:id/progress', auth, async (req, res) => {
  try {
    const { progress } = req.body;
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    const participantIndex = challenge.participants.findIndex(
      p => p.user.toString() === req.user._id.toString()
    );

    if (participantIndex === -1) {
      return res.status(400).json({ message: 'Not joined this challenge' });
    }

    challenge.participants[participantIndex].progress = progress;

    // Check if goal reached
    if (progress >= challenge.goal) {
      challenge.participants[participantIndex].completed = true;
    }

    await challenge.save();

    res.json(challenge);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// FairDraw - Select winner transparently
router.post('/:id/fairdraw', auth, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    // Only creator or admin can trigger FairDraw
    if (challenge.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only challenge creator can trigger FairDraw' });
    }

    // Check if challenge has ended
    if (new Date() < challenge.endDate) {
      return res.status(400).json({ message: 'Challenge has not ended yet' });
    }

    // Check if winner already selected
    if (challenge.winner) {
      return res.status(400).json({ message: 'Winner already selected' });
    }

    // Get eligible participants (those who completed the challenge)
    const eligibleParticipants = challenge.participants.filter(p => p.completed);
    
    if (eligibleParticipants.length === 0) {
      return res.status(400).json({ message: 'No eligible participants' });
    }

    // Perform FairDraw
    const { winner, hash } = performFairDraw(
      eligibleParticipants.map(p => p.user.toString()),
      challenge._id.toString(),
      challenge.endDate.toISOString()
    );

    challenge.winner = winner;
    challenge.drawHash = hash;
    challenge.drawTimestamp = new Date();
    challenge.isCompleted = true;

    await challenge.save();

    // Award points to winner
    await User.findByIdAndUpdate(winner, { $inc: { points: 100 } });

    await challenge.populate('winner', 'name avatar');
    await challenge.populate('participants.user', 'name avatar');

    res.json({
      challenge,
      winner: challenge.winner,
      hash,
      eligibleCount: eligibleParticipants.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete challenge
router.delete('/:id', auth, async (req, res) => {
  try {
    const challenge = await Challenge.findOne({
      _id: req.params.id,
      creator: req.user._id
    });

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found or not authorized' });
    }

    await Challenge.findByIdAndDelete(req.params.id);

    res.json({ message: 'Challenge deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
