const mongoose = require('mongoose');


const urlSchema = mongoose.Schema({
    rsURLs: [],
    yuURLs: []
});

module.exports = mongoose.model('Url', urlSchema);
