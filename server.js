require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const decksRouter = require('./routes/decks');
const authRouter = require('./routes/auth');
const aiRouter = require('./routes/ai');
const speakingRoutes = require('./routes/speakingRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB:', err));

// Routes
app.use('/api/decks', decksRouter);
app.use('/api/auth', authRouter);
app.use('/api/ai', aiRouter);
app.use('/api/speaking', speakingRoutes);

// Start server
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 