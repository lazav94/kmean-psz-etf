const mongoose = require('mongoose');

const albumSchema = mongoose.Schema({
    artists: {
        type: Array,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    released: String,
    genre: [],
    style: [],
    tracks: [],
    // durations: [],
    credits: {},
    format: String,
    url: {
        type: String,
        required: true
    },
    versions: {
        type: Number,
        default: 0
    },
    token: {
        type: Object,
        default: {
            style: 0,
            genre: 0
        }
    }
});

module.exports = mongoose.model('Album', albumSchema);