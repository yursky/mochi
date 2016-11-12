var express = require('express');
var router = express.Router();

var tw = require('./twilio.js');


router.post('/api/request', function(req, res) {
    //console.log(req);
    var string = "On our way to get " + req.body.object;
    res.json({response: string});
});

module.exports = router;