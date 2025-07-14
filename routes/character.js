const express = require('express');
const router = express.Router();
const Character = require('../models/character');

// Index
router.get('/', async (req, res) => {
  try {
    const characters = await Character.find().sort({ name: 1 });
    res.render('characters/index', { characters });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

// New
router.get('/new', (req, res) => {
  res.render('characters/new');
});

// Create
router.post('/', async (req, res) => {
  try {
    const newCharacter = await Character.create(req.body);
    res.redirect(`/characters/${newCharacter._id}`);
  } catch (err) {
    console.error(err);
    res.render('characters/new', { error: err.message });
  }
});

// Show - Show details of one character
router.get('/:id', async (req, res) => {
  try {
    const character = await Character.findById(req.params.id)
      .populate('relationships.character');
    res.render('characters/show', { character });
  } catch (err) {
    console.error(err);
    res.redirect('/characters');
  }
});

// Edit - Show form to edit character
router.get('/:id/edit', async (req, res) => {
  try {
    const character = await Character.findById(req.params.id);
    const allCharacters = await Character.find({ _id: { $ne: character._id } });
    res.render('characters/edit', { character, allCharacters });
  } catch (err) {
    console.error(err);
    res.redirect('/characters');
  }
});

// Update
router.put('/:id', async (req, res) => {
  try {
    await Character.findByIdAndUpdate(req.params.id, req.body);
    res.redirect(`/characters/${req.params.id}`);
  } catch (err) {
    console.error(err);
    res.redirect('/characters');
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    await Character.findByIdAndDelete(req.params.id);
    res.redirect('/characters');
  } catch (err) {
    console.error(err);
    res.redirect('/characters');
  }
});

// Search
router.get('/', async (req, res) => {
  try {
    const { search, role } = req.query;
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { nickname: { $regex: search, $options: 'i' } },
        { personality: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      query.storyRole = role;
    }
    
    const characters = await Character.find(query).sort({ name: 1 });
    res.render('characters/index', { 
      characters,
      searchQuery: search,
      roleFilter: role 
    });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

module.exports = router;