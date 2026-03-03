const mongoose = require('mongoose');

const ProgressPhotoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  // Photo URL (stored in cloud storage like Cloudinary/S3)
  photoUrl: {
    type: String,
    required: true
  },
  // Thumbnail for quick display
  thumbnailUrl: String,
  // Photo category
  category: {
    type: String,
    enum: ['front', 'side', 'back', 'flex', 'progress', 'milestone', 'other'],
    default: 'progress'
  },
  // Body pose
  pose: {
    type: String,
    enum: ['standing', 'relaxed', 'flexed', 'sitting', 'other'],
    default: 'standing'
  },
  // Visibility
  visibility: {
    type: String,
    enum: ['private', 'friends', 'public'],
    default: 'private'
  },
  // Weight at time of photo (optional)
  weight: {
    value: Number,
    unit: {
      type: String,
      enum: ['kg', 'lbs'],
      default: 'kg'
    }
  },
  // Notes about this photo
  notes: {
    type: String,
    maxlength: 1000
  },
  // How user felt
  mood: {
    type: String,
    enum: ['😄', '😊', '😐', '😔', '😢', '😡', '🥳', '😌', '🤔', '😴']
  },
  // Tags for organization
  tags: [String],
  // Measurement at time of photo
  measurements: {
    chest: Number,
    waist: Number,
    hips: Number,
    biceps: Number,
    thighs: Number
  },
  // Camera/device info
  device: {
    make: String,
    model: String
  },
  // Location
  location: {
    type: String,
    maxlength: 100
  },
  // Comparison with previous photo
  comparison: {
    previousPhotoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProgressPhoto'
    },
    changes: {
      weight: Number,
      notes: String
    }
  },
  // Weekly summary association
  weekOf: {
    type: Date
  },
  // Album/category grouping
  album: {
    type: String,
    default: 'Default'
  },
  // Processing status
  processed: {
    type: Boolean,
    default: false
  },
  // AI-generated description
  aiDescription: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
ProgressPhotoSchema.index({ userId: 1, date: -1 });
ProgressPhotoSchema.index({ userId: 1, album: 1 });
ProgressPhotoSchema.index({ userId: 1, category: 1 });

// Virtual for weight change since first photo
ProgressPhotoSchema.virtual('weightChange').get(function() {
  // This will be calculated in queries
  return null;
});

// Static method to get photo timeline
ProgressPhotoSchema.statics.getTimeline = async function(userId, options = {}) {
  const { limit = 30, category, album, startDate, endDate } = options;
  
  const query = { userId };
  if (category) query.category = category;
  if (album) query.album = album;
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = startDate;
    if (endDate) query.date.$lte = endDate;
  }
  
  const photos = await this.find(query)
    .sort({ date: -1 })
    .limit(limit);
  
  return photos;
};

// Static method to get comparison photos
ProgressPhotoSchema.statics.getComparison = async function(userId, photoId1, photoId2) {
  const photo1 = await this.findById(photoId1);
  const photo2 = await this.findById(photo2);
  
  if (!photo1 || !photo2) {
    throw new Error('Photos not found');
  }
  
  let weightDiff = 0;
  if (photo1.weight && photo2.weight) {
    const w1 = photo1.weight.unit === 'lbs' ? photo1.weight.value * 0.453592 : photo1.weight.value;
    const w2 = photo2.weight.unit === 'lbs' ? photo2.weight.value * 0.453592 : photo2.weight.value;
    weightDiff = Math.round((w2 - w1) * 10) / 10;
  }
  
  return {
    before: photo1,
    after: photo2,
    weightDiff,
    daysDiff: Math.round((photo2.date - photo1.date) / (1000 * 60 * 60 * 24))
  };
};

// Static method to get progress summary
ProgressPhotoSchema.statics.getProgressSummary = async function(userId) {
  const firstPhoto = await this.findOne({ userId }).sort({ date: 1 });
  const latestPhoto = await this.findOne({ userId }).sort({ date: -1 });
  
  if (!firstPhoto || !latestPhoto) {
    return null;
  }
  
  const totalPhotos = await this.countDocuments({ userId });
  const byCategory = await this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);
  
  const byAlbum = await this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    { $group: { _id: '$album', count: { $sum: 1 } } }
  ]);
  
  // Calculate weight change
  let weightDiff = 0;
  if (firstPhoto.weight && latestPhoto.weight) {
    const w1 = firstPhoto.weight.unit === 'lbs' ? firstPhoto.weight.value * 0.453592 : firstPhoto.weight.value;
    const w2 = latestPhoto.weight.unit === 'lbs' ? latestPhoto.weight.value * 0.453592 : latestPhoto.weight.value;
    weightDiff = Math.round((w2 - w1) * 10) / 10;
  }
  
  return {
    firstPhoto: {
      date: firstPhoto.date,
      photoUrl: firstPhoto.photoUrl,
      weight: firstPhoto.weight
    },
    latestPhoto: {
      date: latestPhoto.date,
      photoUrl: latestPhoto.photoUrl,
      weight: latestPhoto.weight
    },
    totalPhotos,
    byCategory: byCategory.reduce((acc, c) => ({ ...acc, [c._id]: c.count }), {}),
    byAlbum: byAlbum.reduce((acc, a) => ({ ...acc, [a._id]: a.count }), {}),
    weightDiff,
    timeSpan: Math.round((latestPhoto.date - firstPhoto.date) / (1000 * 60 * 60 * 24))
  };
};

module.exports = mongoose.model('ProgressPhoto', ProgressPhotoSchema);

