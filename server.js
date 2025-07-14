require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan')
const methodOverride = require('method-override');
const Character = require('./models/character');

const app = express();

// Middleware
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('public'));

app.use(morgan('dev')) 

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Connection error:', err));

// Routes
app.get('/', (req, res) => {
  res.redirect('/characters');
});

// Character routes
const characterRoutes = require('./routes/characters');
app.use('/characters', characterRoutes);

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});