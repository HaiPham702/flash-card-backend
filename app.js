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
const n8nRouter = require('./routes/n8n');

app.use('/api/ai', aiRouter);
app.use('/api/writing', writingRouter);
app.use('/api/n8n', n8nRouter);

module.exports = app; 