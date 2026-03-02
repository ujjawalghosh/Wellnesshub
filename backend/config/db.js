const mongoose = require('mongoose');

const connectDB = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      let mongoURI = process.env.MONGODB_URI;
      
      console.log('=== MongoDB Connection Debug ===');
      console.log('MONGODB_URI present:', !!mongoURI);
      
      if (!mongoURI) {
        console.error('MongoDB URI not provided.');
        resolve(false);
        return;
      }

      const maskedURI = mongoURI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
      console.log('Connecting to:', maskedURI);

      if (mongoose.connection.readyState === 1) {
        console.log('Already connected to MongoDB');
        resolve(true);
        return;
      }

      const connectionTimeout = setTimeout(() => {
        console.error('Connection timeout after 10 seconds');
        resolve(false);
      }, 10000);

      mongoose.connection.on('connected', () => {
        clearTimeout(connectionTimeout);
        console.log('MongoDB Connected successfully!');
        resolve(true);
      });

      mongoose.connection.on('error', (err) => {
        clearTimeout(connectionTimeout);
        console.error('MongoDB Error:', err.message);
        resolve(false);
      });

      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected');
      });

      // Simple connection options
      const options = {
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        retryWrites: true,
        retryReads: true
      };

      console.log('Attempting MongoDB connection...');
      
      try {
        await mongoose.connect(mongoURI, options);
        console.log('Connection initiated');
      } catch (connError) {
        console.log('Standard connection failed, trying alternative method...');
        
        // Try converting mongodb+srv to mongodb:// direct connection
        if (mongoURI.startsWith('mongodb+srv://')) {
          const directURI = mongoURI.replace('mongodb+srv://', 'mongodb://');
          console.log('Trying direct connection:', directURI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));
          await mongoose.connect(directURI, options);
          console.log('Direct connection successful');
        } else {
          throw connError;
        }
      }
      
    } catch (error) {
      console.error('=== MongoDB Connection Error ===');
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      
      if (error.message.includes('ECONNREFUSED')) {
        console.error('Connection refused - check IP whitelist in MongoDB Atlas');
      }
      
      console.log('=================================');
      resolve(false);
    }
  });
};

module.exports = connectDB;
