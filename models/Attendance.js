const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
 
  completed: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index để tối ưu query
attendanceSchema.index({ userId: 1, date: 1 });
attendanceSchema.index({ userId: 1, deckId: 1 });

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance; 