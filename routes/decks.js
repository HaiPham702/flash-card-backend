const express = require('express');
const router = express.Router();
const Deck = require('../models/Deck');

// Get all decks
router.get('/', async (req, res) => {
    try {
        const decks = await Deck.find();
        res.json(decks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get one deck
router.get('/:id', async (req, res) => {
    try {
        const deck = await Deck.findById(req.params.id);
        if (deck) {
            res.json(deck);
        } else {
            res.status(404).json({ message: 'Deck not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create deck
router.post('/', async (req, res) => {
    const deck = new Deck({
        name: req.body.name,
        description: req.body.description
    });

    try {
        const newDeck = await deck.save();
        res.status(201).json(newDeck);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update deck
router.patch('/:id', async (req, res) => {
    try {
        const deck = await Deck.findById(req.params.id);
        if (!deck) {
            return res.status(404).json({ message: 'Deck not found' });
        }

        if (req.body.name) deck.name = req.body.name;
        if (req.body.description) deck.description = req.body.description;

        const updatedDeck = await deck.save();
        res.json(updatedDeck);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete deck
router.delete('/:id', async (req, res) => {
    try {
        const deck = await Deck.findById(req.params.id);
        if (!deck) {
            return res.status(404).json({ message: 'Deck not found' });
        }
        await deck.deleteOne();
        res.json({ message: 'Deck deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add card to deck
router.post('/:id/cards', async (req, res) => {
    try {
        const deck = await Deck.findById(req.params.id);
        if (!deck) {
            return res.status(404).json({ message: 'Deck not found' });
        }

        deck.cards.push({
            front: req.body.front,
            back: req.body.back,
            image: req.body.image,
            level: 1
        });

        const updatedDeck = await deck.save();
        res.status(201).json(updatedDeck);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update card
router.patch('/:deckId/cards/:cardId', async (req, res) => {
    try {
        const deck = await Deck.findById(req.params.deckId);
        if (!deck) {
            return res.status(404).json({ message: 'Deck not found' });
        }

        const card = deck.cards.id(req.params.cardId);
        if (!card) {
            return res.status(404).json({ message: 'Card not found' });
        }

        if (req.body.front) card.front = req.body.front;
        if (req.body.back) card.back = req.body.back;
        if (req.body.level) card.level = req.body.level;
        if (req.body.image) card.image = req.body.image;
        if (req.body.lastReview) card.lastReview = req.body.lastReview;
        if (req.body.nextReview) card.nextReview = req.body.nextReview;

        const updatedDeck = await deck.save();
        res.json(updatedDeck);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete card
router.delete('/:deckId/cards/:cardId', async (req, res) => {
    try {
        const deck = await Deck.findById(req.params.deckId);
        if (!deck) {
            return res.status(404).json({ message: 'Deck not found' });
        }

        deck.cards = deck.cards.filter(card => card.id !== req.params.cardId);
        const updatedDeck = await deck.save();
        res.json(updatedDeck);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router; 