const mongoose = require('mongoose');

const FriendSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  friendId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'blocked'],
    default: 'pending'
  },
  // Who initiated the friend request
  initiatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Optional message with friend request
  message: {
    type: String,
    maxlength: 200
  },
  // For tracking mutual friends
  mutual: {
    type: Boolean,
    default: false
  },
  // Friends since
  connectedAt: {
    type: Date
  },
  // Notifications settings for this friendship
  notifications: {
    activity: {
      type: Boolean,
      default: true
    },
    achievements: {
      type: Boolean,
      default: true
    },
    challenges: {
      type: Boolean,
      default: true
    }
  },
  // Hide friend from leaderboard
  hiddenFromLeaderboard: {
    type: Boolean,
    default: false
  },
  // Custom nickname for friend
  nickname: {
    type: String,
    maxlength: 50
  },
  // Tags for categorization
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure unique friend relationships
FriendSchema.index({ userId: 1, friendId: 1 }, { unique: true });

// Static method to send friend request
FriendSchema.statics.sendRequest = async function(userId, friendId, message = '') {
  // Check if request already exists (in either direction)
  const existing = await this.findOne({
    $or: [
      { userId, friendId },
      { userId: friendId, friendId: userId }
    ]
  });
  
  if (existing) {
    if (existing.status === 'accepted') {
      throw new Error('Already friends');
    }
    if (existing.status === 'pending') {
      throw new Error('Friend request already pending');
    }
  }
  
  const friend = new this({
    userId,
    friendId,
    status: 'pending',
    initiatedBy: userId,
    message
  });
  
  return friend.save();
};

// Static method to accept friend request
FriendSchema.statics.acceptRequest = async function(userId, friendId) {
  const friend = await this.findOne({
    userId: friendId,
    friendId: userId,
    status: 'pending'
  });
  
  if (!friend) {
    throw new Error('No pending friend request found');
  }
  
  // Update existing request
  friend.status = 'accepted';
  friend.connectedAt = new Date();
  await friend.save();
  
  // Create reverse friendship
  const reverseFriend = new this({
    userId,
    friendId,
    status: 'accepted',
    initiatedBy: friendId,
    connectedAt: new Date()
  });
  await reverseFriend.save();
  
  return friend;
};

// Static method to get all friends
FriendSchema.statics.getFriends = async function(userId) {
  const friends = await this.find({
    userId,
    status: 'accepted'
  }).populate('friendId', 'name email avatar level points badges');
  
  return friends.map(f => ({
    _id: f._id,
    friend: f.friendId,
    nickname: f.nickname,
    connectedAt: f.connectedAt,
    tags: f.tags
  }));
};

// Static method to get pending requests
FriendSchema.statics.getPendingRequests = async function(userId) {
  const requests = await this.find({
    friendId: userId,
    status: 'pending'
  }).populate('userId', 'name email avatar level');
  
  return requests.map(r => ({
    _id: r._id,
    from: r.userId,
    message: r.message,
    createdAt: r.createdAt
  }));
};

// Static method to remove friend
FriendSchema.statics.removeFriend = async function(userId, friendId) {
  await this.deleteOne({ userId, friendId });
  await this.deleteOne({ userId: friendId, friendId: userId });
  return { success: true };
};

// Static method to block user
FriendSchema.statics.blockUser = async function(userId, blockedUserId) {
  // Remove any existing friendship
  await this.deleteOne({ userId, friendId: blockedUserId });
  await this.deleteOne({ userId: blockedUserId, friendId: userId });
  
  // Add block
  const block = new this({
    userId,
    friendId: blockedUserId,
    status: 'blocked'
  });
  
  return block.save();
};

// Static method to get friend stats for leaderboard
FriendSchema.statics.getFriendStats = async function(userId) {
  const friends = await this.find({
    userId,
    status: 'accepted',
    hiddenFromLeaderboard: false
  }).populate('friendId', 'name avatar level points badges streak');
  
  return friends.map(f => ({
    _id: f.friendId._id,
    name: f.friendId.name,
    avatar: f.friendId.avatar,
    level: f.friendId.level,
    points: f.friendId.points,
    badges: f.friendId.badges?.length || 0,
    streak: f.friendId.streak || 0
  }));
};

module.exports = mongoose.model('Friend', FriendSchema);

