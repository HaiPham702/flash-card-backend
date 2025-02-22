const mongoose = require("mongoose");
const { create } = require("./User");

// Định nghĩa Schema cho User
const CardSchema = new mongoose.Schema({
    frontTitle: { type: String },
    backTitle: { type: String },
    frontImg: { type: String }, 
    backImg: { type: String },
    createdAt: { type: Date, default: Date.now },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
});

// Tạo model User từ schema
const Card = mongoose.model("Card", CardSchema);

module.exports = Card;
