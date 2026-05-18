const mongoose = require('mongoose');
const {Schema} = require('mongoose');

const noteSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  file: {
    type: String,
    required: true
},
uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    
  }
});

module.exports = mongoose.model('Note', noteSchema);