// Load environment variables first
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const decksRouter = require('./routes/decks');
const authRouter = require('./routes/auth');
const aiRouter = require('./routes/ai');
const speakingRoutes = require('./routes/speakingRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({
    origin: '*',
    methods: 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization, x-auth-token',
}));
app.use(express.json());

// Routes
app.use('/api/decks', decksRouter);
app.use('/api/auth', authRouter);
app.use('/api/ai', aiRouter);
app.use('/api/speaking', speakingRoutes);
app.use('/api/attendance', attendanceRoutes);
const writingRouter = require('./routes/writing');
app.use('/api/writing', writingRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 