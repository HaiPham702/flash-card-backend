const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
    front: {
        type: String,
        required: true
    },
    back: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: false
    },
    level: {
        type: Number,
        default: 1
    },
    lastReview: Date,
    nextReview: Date
}, { timestamps: true });

const deckSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    cards: [cardSchema]
}, { timestamps: true });

module.exports = mongoose.model('Deck', deckSchema); 