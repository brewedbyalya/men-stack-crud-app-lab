const express = require('express');
const router = express.Router();
const Character = require('../models/character');

// Process character form data
function processCharacterData(body) {
  const data = { ...body };

  ['skills', 'weaknesses'].forEach(field => {
    if (typeof data[field] === 'string') {
      data[field] = data[field]
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    } else {
      data[field] = [];
    }
  });

  if (typeof data.quotes === 'string') {
    data.quotes = data.quotes
      .split('\n')
      .map(q => q.trim())
      .filter(Boolean);
  } else {
    data.quotes = [];
  }

  data.relationships = [];
  if (body.relationships) {
    const relationshipsArray = Array.isArray(body.relationships) 
      ? body.relationships 
      : Object.keys(body.relationships).map(key => body.relationships[key]);
    
    relationshipsArray.forEach(rel => {
      if (rel && rel.character) {
        data.relationships.push({
          character: rel.character,
          relationshipType: rel.relationshipType || '',
          description: rel.description || ''
        });
      }
    });
  }

  return data;
}

// Index + Search
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
      title: 'Character Dictionary',
      characters,
      searchQuery: search || '',
      roleFilter: role || ''
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error: Failed to load characters');
  }
});

// New 
router.get('/new', (req, res) => {
  res.render('characters/new', {
    title: 'Create New Character'
  });
});

// Create 
router.post('/', async (req, res) => {
  try {
    const data = processCharacterData(req.body);
    const newCharacter = await Character.create(data);
    res.redirect(`/characters/${newCharacter._id}`);
  } catch (err) {
    console.error(err);
    res.status(500).render('characters/new', {
      title: 'Create New Character',
      error: err.message
    });
  }
});

// Show 
router.get('/:id', async (req, res) => {
  try {
    const character = await Character.findById(req.params.id)
      .populate('relationships.character');
    if (!character) throw new Error('Character not found');
    res.render('characters/show', {
      title: character.name,
      character
    });
  } catch (err) {
    console.error(err);
    res.status(404).send('Character not found');
  }
});

// Edit
router.get('/:id/edit', async (req, res) => {
  try {
    const character = await Character.findById(req.params.id);
    if (!character) throw new Error('Character not found');

    const allCharacters = await Character.find({ _id: { $ne: character._id } });
    res.render('characters/edit', {
      title: `Edit ${character.name}`,
      character,
      allCharacters
    });
  } catch (err) {
    console.error(err);
    res.status(404).send('Character not found');
  }
});

// Update 
router.put('/:id', async (req, res) => {
  try {
    const updatedData = processCharacterData(req.body);
    await Character.findByIdAndUpdate(req.params.id, updatedData);
    res.redirect(`/characters/${req.params.id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to update character');
  }
});

// Delete 
router.delete('/:id', async (req, res) => {
  try {
    await Character.findByIdAndDelete(req.params.id);
    res.redirect('/characters');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to delete character');
  }
});

module.exports = router;