import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import routes from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB with error handling
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medipass';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error.message);
    console.log('Running in mock data mode - database connectivity not available');
    // The server will continue to run even if MongoDB connection fails
  });

// Use centralized routes
app.use('/api', routes);

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Medipass API is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 