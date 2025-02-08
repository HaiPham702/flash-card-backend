const mongoose = require("mongoose");

// Định nghĩa Schema cho User
const CardSchema = new mongoose.Schema({
    frontTitle: { type: String },
    backTitle: { type: String },
    frontImg: { type: String }, 
    backImg: { type: String },
});

// Tạo model User từ schema
const Card = mongoose.model("Card", CardSchema);

module.exports = Card;
