const mongoose = require("mongoose");

// Định nghĩa Schema cho User
const CourseSchema = new mongoose.Schema({
    coursename: { type: String, },
    description: { type: String, },
    createdAt: { type: Date, default: Date.now },
});

// Tạo model User từ schema
const Course = mongoose.model("Course", CourseSchema);

module.exports = Course;
