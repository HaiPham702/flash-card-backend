const mongoose = require('mongoose')

const speakingTopicSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
    unique: true
  },
  part1: {
    questions: [{
      type: String,
      required: true
    }]
  },
  part2: {
    topic: {
      type: String,
      required: true
    },
    followUpQuestions: [{
      type: String,
      required: true
    }]
  },
  part3: {
    questions: [{
      type: String,
      required: true
    }]
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('SpeakingTopic', speakingTopicSchema) 