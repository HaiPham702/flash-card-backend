const express = require('express')
const router = express.Router()
const speakingController = require('../controllers/speakingController')

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'speaking-service',
    timestamp: new Date().toISOString()
  })
})

router.get('/today', speakingController.getTodayTopic)
router.post('/generate', speakingController.generateNewTopic)

module.exports = router 