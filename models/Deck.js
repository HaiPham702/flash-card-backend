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
    pronunciation: {
        type: String,
        required: false
    },
    level: {
        type: Number,
        default: 1
    },
    order: {
        type: Number,
        default: 0
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
        required: false
    },
    order: {
        type: Number,
        default: 0
    },
    cards: [cardSchema],
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    modifier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Update the updatedAt timestamp before saving
deckSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('Deck', deckSchema); 