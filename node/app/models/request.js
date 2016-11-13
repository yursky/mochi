var mongoose = require('mongoose');

var requestSchema = mongoose.Schema({
    id: String,
    object: String,
    paitent: String,
    nurse: String,
    serviced: {type: Boolean, default: false}
});

module.exports = mongoose.model('Request', requestSchema);