var mongoose = require('mongoose');
var random = require('mongoose-random');

var nurseSchema = mongoose.Schema({
    name: String,
    number: String,
    curReq: String,
    requests: [String]
});

nurseSchema.plugin(random);

module.exports = mongoose.model('Nurse', nurseSchema);