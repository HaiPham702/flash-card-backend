const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY || '')

const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        service: 'AI API',
        timestamp: new Date().toISOString()
    });
});

// Endpoint to generate AI response
router.post('/generate', async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        res.json({ response });
    } catch (error) {
        console.error('Error generating AI response:', error);
        res.status(500).json({ error: 'Failed to generate AI response' });
    }
});

module.exports = router; 