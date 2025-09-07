const express = require('express');
const router = express.Router();
const Deck = require('../models/Deck');
const auth = require('../middleware/auth');

// Health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Decks service is running ver 1' });
});

// All routes below will be protected
router.use(auth);

// Get current week deck (or create if not exists)
router.get('/current-week', async (req, res) => {
    try {
        // Calculate current week number
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const pastDaysOfYear = (now - startOfYear) / 86400000;
        const weekNumber = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
        
        // Calculate start and end of current week
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
        endOfWeek.setHours(23, 59, 59, 999);

        // Find deck created in current week
        let deck = await Deck.findOne({
            createdAt: {
                $gte: startOfWeek,
                $lte: endOfWeek
            }
        })
        .populate('creator', 'name email')
        .populate('modifier', 'name email');

        // If no deck found, create new one
        if (!deck) {
            // Get the maximum order value of existing decks
            const maxOrderDeck = await Deck.findOne().sort({ order: -1 });
            const maxOrder = maxOrderDeck ? maxOrderDeck.order + 1 : 0;

            deck = new Deck({
                name: `Week ${weekNumber}`,
                description: "Deck tạo tự động",
                order: maxOrder,
                creator: req.user._id,
                modifier: req.user._id
            });

            deck = await deck.save();
            
            // Populate creator and modifier for the newly created deck
            deck = await Deck.findById(deck._id)
                .populate('creator', 'name email')
                .populate('modifier', 'name email');
        }

        // Sort cards by order
        if (deck.cards && deck.cards.length > 0) {
            deck.cards.sort((a, b) => a.order - b.order);
        }

        res.json(deck);
    } catch (err) {
        console.error('Error getting/creating current week deck:', err);
        res.status(500).json({ message: err.message });
    }
});

// Get all decks
router.get('/', async (req, res) => {
    try {
        const decks = await Deck.find()
            .sort({ order: 1 })
            .populate('creator', 'name email')
            .populate('modifier', 'name email');
        res.json(decks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get one deck
router.get('/:id', async (req, res) => {
    try {
        const deck = await Deck.findById(req.params.id)
            .populate('creator', 'name email')
            .populate('modifier', 'name email');
        if (deck) {
            // Sort cards by order
            deck.cards.sort((a, b) => a.order - b.order);
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
    try {
        // Get the maximum order value of existing decks
        const maxOrderDeck = await Deck.findOne().sort({ order: -1 });
        const maxOrder = maxOrderDeck ? maxOrderDeck.order + 1 : 0;

        const deck = new Deck({
            name: req.body.name,
            description: req.body.description,
            order: maxOrder,
            creator: req.user._id,
            modifier: req.user._id
        });

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

        // Update basic info
        if (req.body.name) deck.name = req.body.name;
        if (req.body.description !== undefined) deck.description = req.body.description;
        if (req.body.order !== undefined) deck.order = req.body.order;

        // Update modifier info
        deck.modifier = req.user._id;

        // Update timestamps if missing
        if (!deck.createdAt) {
            deck.createdAt = new Date();
        }

        if (!deck.creator) {
            deck.creator = req.user._id;
        }

        deck.updatedAt = new Date();

        const updatedDeck = await deck.save();
        res.json(updatedDeck);
    } catch (err) {
        console.error('Error updating deck:', err);
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

        // Get the maximum order value of existing cards
        const maxOrder = deck.cards.length > 0 
            ? Math.max(...deck.cards.map(card => card.order)) + 1 
            : 0;

        deck.cards.push({
            front: req.body.front,
            back: req.body.back,
            image: req.body.image,
            pronunciation: req.body.pronunciation,
            level: 1,
            order: maxOrder
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
        if (req.body.lastReview) card.lastReview = req.body.lastReview;
        if (req.body.nextReview) card.nextReview = req.body.nextReview;
        if (req.body.order !== undefined) card.order = req.body.order;
        card.image = req.body.image;
        if (req.body.pronunciation !== undefined) card.pronunciation = req.body.pronunciation;

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

// Reorder cards in a deck
router.post('/:deckId/reorder-cards', async (req, res) => {
    try {
        const deck = await Deck.findById(req.params.deckId);
        if (!deck) {
            return res.status(404).json({ message: 'Deck not found' });
        }

        // req.body should be an array of { id, order } objects
        if (!Array.isArray(req.body)) {
            return res.status(400).json({ message: 'Invalid input: expected array of card orders' });
        }

        console.log('Reordering cards for deck:', deck._id);
        console.log('Card orders:', req.body);

        // Update order for each card
        req.body.forEach(item => {
            // Find card by both id and _id
            const card = deck.cards.find(card => 
                card._id.toString() === item.id || 
                card.id === item.id
            );
            
            if (card) {
                console.log('Updating card order:', { cardId: card._id, newOrder: item.order });
                card.order = item.order;
            } else {
                console.log('Card not found:', item.id);
            }
        });

        const updatedDeck = await deck.save();
        console.log('Deck updated successfully');
        res.json(updatedDeck);
    } catch (err) {
        console.error('Error reordering cards:', err);
        res.status(400).json({ message: err.message });
    }
});

// Reorder decks
router.post('/reorder', async (req, res) => {
    try {
        if (!Array.isArray(req.body)) {
            return res.status(400).json({ message: 'Invalid input: expected array of deck orders' });
        }

        console.log('Reorder decks request body:', req.body);

        // Update each deck's order
        const updatePromises = req.body.map(item => {
            console.log('Updating deck order:', { deckId: item.id, newOrder: item.order });
            return Deck.findByIdAndUpdate(
                item.id,
                { 
                    order: item.order,
                    updatedAt: new Date()
                },
                { new: true }
            );
        });

        const updatedDecks = await Promise.all(updatePromises);
        
        // Return all decks in their new order
        const sortedDecks = await Deck.find()
            .sort({ order: 1 })
            .populate('creator', 'name email')
            .populate('modifier', 'name email');
            
        res.json(sortedDecks);
    } catch (err) {
        console.error('Error reordering decks:', err);
        res.status(400).json({ message: err.message });
    }
});

module.exports = router; 