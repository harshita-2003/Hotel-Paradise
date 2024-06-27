const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    link: String,
    type: String,
    bed: Number,
    bathroom: Number,
    balcony: Number,
    sofa: Number,
    adult: Number,
    children: Number,
    amount: Number
});

module.exports = mongoose.model('Room', roomSchema);
