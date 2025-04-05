const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const aiRouter = require('./routes/ai');
const writingRouter = require('./routes/writing');

app.use('/api/ai', aiRouter);
app.use('/api/writing', writingRouter);

module.exports = app; 