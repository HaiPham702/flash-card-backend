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
const messengerRouter = require('./routes/messenger');
const telegramRouter = require('./routes/telegram');

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

// Health check endpoint
app.get('/health', (req, res) => {
    const healthCheck = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        memory: process.memoryUsage(),
        database: 'connected' // Assuming MongoDB connection is successful
    };
    
    res.status(200).json(healthCheck);
});

// Routes
app.use('/api/decks', decksRouter);
app.use('/api/auth', authRouter);
app.use('/api/ai', aiRouter);
app.use('/api/speaking', speakingRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/messenger', messengerRouter);
app.use('/api/telegram', telegramRouter);
const writingRouter = require('./routes/writing');
const n8nRouter = require('./routes/n8n');
app.use('/api/writing', writingRouter);
app.use('/api/n8n', n8nRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 4000;

// Start server
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    
    // Initialize Telegram scheduler
    const schedulerService = require('./services/schedulerService');
    schedulerService.init();
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    
    // Cleanup scheduler
    const schedulerService = require('./services/schedulerService');
    schedulerService.destroy();
    
    server.close(() => {
        console.log('Process terminated');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    
    // Cleanup scheduler
    const schedulerService = require('./services/schedulerService');
    schedulerService.destroy();
    
    server.close(() => {
        console.log('Process terminated');
        process.exit(0);
    });
}); 