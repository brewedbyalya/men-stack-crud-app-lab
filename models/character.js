const mongoose = require('mongoose');

const characterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nickname: String,
  age: Number,
  gender: String,
  species: String,
  occupation: String,
  appearance: String,
  personality: String,
  backstory: String,
  motivations: String,
  relationships: [{
    character: { type: mongoose.Schema.Types.ObjectId, ref: 'Character' },
    relationshipType: String,
    description: String
  }],
  skills: [String],
  weaknesses: [String],
  quotes: [String],
  storyRole: String,
  notes: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

characterSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Character', characterSchema);