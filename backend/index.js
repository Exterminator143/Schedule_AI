require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { initFirebaseAdmin } = require('./services/firebaseConfig');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Firebase Admin SDK
initFirebaseAdmin();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Routes
const taskRoutes = require('./routes/taskRoutes');
app.use('/api/tasks', taskRoutes);

app.get('/', (req, res) => {
  res.send('AI Schedule Manager API is running');
});

const { startReminderJob } = require('./services/reminderService');

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  startReminderJob();
});
