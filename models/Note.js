const mongoose = require('mongoose');
const { Schema } = require('mongoose');

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
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',

    },
    isApproved: {
        type: Boolean,
        default: false
    },


    createdAt: {
        type: Date,
        default: Date.now
    }


});



const Note = mongoose.models.Note || mongoose.model("Note", noteSchema);

module.exports = Note;