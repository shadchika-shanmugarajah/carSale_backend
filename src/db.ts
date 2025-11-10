import mongoose from 'mongoose';
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/carsale';

mongoose.set('strictQuery', true);

// Connect to MongoDB with better error handling
mongoose.connect(uri)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully');
  })
  .catch((err) => {
    console.error('⚠️  MongoDB connection error:', err.message);
    console.error('\n⚠️  WARNING: Backend is running WITHOUT database connection!');
    console.error('⚠️  Database operations will fail until MongoDB is connected.');
    console.error('\n🔧 To fix:');
    console.error('   1. Whitelist your IP on MongoDB Atlas: https://cloud.mongodb.com/');
    console.error('   2. OR switch to local MongoDB in .env file\n');
    // DON'T exit - let backend run for testing
  });

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('✅ Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  Mongoose disconnected from MongoDB');
});

export default mongoose;