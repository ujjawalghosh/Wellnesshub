const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Set mongoose options for serverless environment
    mongoose.set('bufferCommands', false);
    
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.error('MONGODB_URI not found in environment variables');
      return false;
    }
    
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      console.log('MongoDB already connected');
      return true;
    }
    
    // Note: useNewUrlParser and useUnifiedTopology are deprecated in MongoDB Node.js Driver 4.0+
    // They have no effect now and will be removed in next major version
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    return false;
  }
};

module.exports = connectDB;

