require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(express.json());


// Routes
const profileRoutes = require('./routes/profile');
const mealPlanRoutes = require('./routes/mealPlan');
const progressRoutes = require('./routes/progress');
const streakRoutes = require('./routes/streak');
const authRoutes = require('./routes/auth');
const dailyLogsRoutes = require('./routes/dailyLogs');

app.use('/api/profile', profileRoutes);
app.use('/api/meal-plan', mealPlanRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/streak', streakRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/daily-logs', dailyLogsRoutes);

mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log('Connected to MongoDB');
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});


// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});