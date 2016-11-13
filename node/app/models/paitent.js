var mongoose = require('mongoose');

var paitentSchema = mongoose.Schema({
    name: {type: String, default: "Friend"},
    requests: [String]
});

module.exports = mongoose.model('Paitent', paitentSchema);