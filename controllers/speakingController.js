const speakingService = require('../services/speakingService')

const speakingController = {
  async getTodayTopic(req, res) {
    try {
      const topic = await speakingService.getTodayTopic()
      res.json(topic)
    } catch (error) {
      console.error('Error in getTodayTopic:', error)
      res.status(500).json({ error: 'Failed to get today topic' })
    }
  },

  async generateNewTopic(req, res) {
    try {
      const topic = await speakingService.generateNewTopic()
      res.json(topic)
    } catch (error) {
      console.error('Error in generateNewTopic:', error)
      res.status(500).json({ error: 'Failed to generate new topic' })
    }
  }
}

module.exports = speakingController 