var mongoose = require('mongoose');

var paitentSchema = mongoose.Schema({
    name: String,
    requests: [String]
});

module.exports = mongoose.model('Paitent', paitentSchema);