const mongoose = require('mongoose');

const statschema = mongoose.Schema({
    tables: {
        genre: [], //a)
        style: [], //b)
        topVersions: [], //c)
        allCredits: [], //d)
        vocalsCredits: [], //d)
        waCredist: [], //d)
        topSongs: [] //e)
    },
    decade: {},
    genre: {},
    genreCount: {},
    duration: {},
    cyrillic: {}
});

module.exports = mongoose.model('Stats', statschema);