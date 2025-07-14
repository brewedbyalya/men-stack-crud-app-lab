require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const methodOverride = require('method-override');

const app = express();

// Middleware
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('public'));
app.use(morgan('dev'));

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Connection error:', err));

// Routes
app.get('/', (req, res) => {
  res.redirect('/characters');
});

const characterRoutes = require('./routes/characters');
app.use('/characters', characterRoutes);

// error handler cuz im losing my mind trying to figure out what the problem is
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// Server
app.listen(3000, () => {
  console.log('Listening on port 3000');
});
