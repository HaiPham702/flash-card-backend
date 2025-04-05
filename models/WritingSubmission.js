const mongoose = require('mongoose');

const writingSubmissionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  taskType: {
    type: String,
    enum: ['task1', 'task2'],
    required: true
  },
  question: {
    type: String,
    required: true
  },
  essay: {
    type: String,
    required: true
  },
  wordCount: {
    type: Number,
    required: true
  },
  aiScore: {
    taskAchievement: {
      band: Number,
      feedback: String
    },
    coherenceAndCohesion: {
      band: Number,
      feedback: String
    },
    lexicalResource: {
      band: Number,
      feedback: String
    },
    grammaticalRangeAndAccuracy: {
      band: Number,
      feedback: String
    },
    overallBand: Number
  },
  detailedFeedback: String,
  submittedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

writingSubmissionSchema.index({ userId: 1, submittedAt: -1 });

writingSubmissionSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' || error.name === 'MongoServerError') {
    console.error('MongoDB Error:', error);
    next(new Error('Database operation failed'));
  } else {
    next(error);
  }
});

const WritingSubmission = mongoose.model('WritingSubmission', writingSubmissionSchema);

module.exports = WritingSubmission; 