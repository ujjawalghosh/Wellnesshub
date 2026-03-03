const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Friend = require('../models/Friend');
const User = require('../models/User');

// Get all friends
router.get('/', auth, async (req, res) => {
  try {
    const friends = await Friend.getFriends(req.user.id);
    res.json(friends);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get pending friend requests
router.get('/requests', auth, async (req, res) => {
  try {
    const requests = await Friend.getPendingRequests(req.user.id);
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send friend request
router.post('/request', auth, async (req, res) => {
  try {
    const { friendId, message } = req.body;
    
    // Check if user exists
    const friend = await User.findById(friendId);
    if (!friend) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if trying to add self
    if (friendId === req.user.id) {
      return res.status(400).json({ message: 'Cannot add yourself as friend' });
    }
    
    const friendRequest = await Friend.sendRequest(req.user.id, friendId, message);
    res.status(201).json(friendRequest);
  } catch (error) {
    if (error.message === 'Already friends') {
      return res.status(400).json({ message: 'Already friends' });
    }
    if (error.message === 'Friend request already pending') {
      return res.status(400).json({ message: 'Friend request already pending' });
    }
    res.status(500).json({ message: error.message });
  }
});

// Accept friend request
router.post('/accept/:id', auth, async (req, res) => {
  try {
    const friendRequest = await Friend.findById(req.params.id).populate('userId');
    
    if (!friendRequest) {
      return res.status(404).json({ message: 'Friend request not found' });
    }
    
    if (friendRequest.friendId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await Friend.acceptRequest(req.user.id, friendRequest.userId._id);
    res.json({ message: 'Friend request accepted' });
  } catch (error) {
    if (error.message === 'No pending friend request found') {
      return res.status(400).json({ message: 'No pending friend request found' });
    }
    res.status(500).json({ message: error.message });
  }
});

// Decline friend request
router.delete('/decline/:id', auth, async (req, res) => {
  try {
    const friendRequest = await Friend.findById(req.params.id);
    
    if (!friendRequest) {
      return res.status(404).json({ message: 'Friend request not found' });
    }
    
    if (friendRequest.friendId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await friendRequest.deleteOne();
    res.json({ message: 'Friend request declined' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove friend
router.delete('/:friendId', auth, async (req, res) => {
  try {
    await Friend.removeFriend(req.user.id, req.params.friendId);
    res.json({ message: 'Friend removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Block user
router.post('/block/:userId', auth, async (req, res) => {
  try {
    await Friend.blockUser(req.user.id, req.params.userId);
    res.json({ message: 'User blocked' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update friend settings
router.put('/settings/:friendId', auth, async (req, res) => {
  try {
    const { notifications, hiddenFromLeaderboard, nickname, tags } = req.body;
    
    const friend = await Friend.findOne({
      userId: req.user.id,
      friendId: req.params.friendId
    });
    
    if (!friend) {
      return res.status(404).json({ message: 'Friend not found' });
    }
    
    if (notifications) friend.notifications = notifications;
    if (hiddenFromLeaderboard !== undefined) friend.hiddenFromLeaderboard = hiddenFromLeaderboard;
    if (nickname) friend.nickname = nickname;
    if (tags) friend.tags = tags;
    
    await friend.save();
    res.json(friend);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get leaderboard
router.get('/leaderboard', auth, async (req, res) => {
  try {
    const { type = 'points' } = req.query;
    
    // Get friends with their stats
    const friends = await Friend.getFriendStats(req.user.id);
    
    // Add current user to the list
    const currentUser = await User.findById(req.user.id);
    const leaderboard = [
      {
        _id: currentUser._id,
        name: currentUser.name,
        avatar: currentUser.avatar,
        level: currentUser.level,
        points: currentUser.points,
        badges: currentUser.badges?.length || 0,
        streak: currentUser.streak || 0,
        isCurrentUser: true
      },
      ...friends.map(f => ({
        ...f,
        isCurrentUser: false
      }))
    ];
    
    // Sort by the requested type
    leaderboard.sort((a, b) => b[type] - a[type]);
    
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search users to add
router.get('/search', auth, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json([]);
    }
    
    // Search by name or email
    const users = await User.find({
      $and: [
        { _id: { $ne: req.user.id } },
        {
          $or: [
            { name: { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } }
          ]
        }
      ]
    }).select('name email avatar level').limit(10);
    
    // Filter out existing friends
    const friends = await Friend.find({
      userId: req.user.id,
      status: 'accepted'
    });
    
    const friendIds = friends.map(f => f.friendId.toString());
    const filteredUsers = users.filter(u => !friendIds.includes(u._id.toString()));
    
    res.json(filteredUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

