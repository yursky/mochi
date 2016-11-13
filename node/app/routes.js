var express = require('express');
var router = express.Router();
var twilio = require('twilio');

var tw = require('./twilio.js');
var Paitent = require('./models/paitent.js');
var Request = require('./models/request.js');
var Nurse = require('./models/nurse.js');

router.get('/', function(req, res) {
    res.json({response: "It's working"});
});

router.post('/api/new', function(req, res) {
    var name = req.body.name;

    Paitent.findOne({"name": name}, function(err, paitent) {
        if(err) {
            console.log(err);
        } else if(paitent) {
            console.log('User already found, sending ID');
            // console.log(paitent);
            res.json({id: paitent._id});
            //console.log(name);
        } else {
            var newPaitent = new Paitent();
            newPaitent.name = name;

            newPaitent.save(function(err) {
                if(err) {
                    res.json({err: err});
                } else {
                    res.json({id: newPaitent._id});
                    console.log('Saved new user with id: ' + newPaitent._id);
                }
            })
        }
    });

});

router.post('/api/request', function(req, res) {
    console.log(req.body);
    
    var object = req.body.object;
    var id = req.body.id;
    var resString = "On our way to get " + req.body.object;

    var request = new Request();
    request.object = object;
    request.paitent = id;
    request.save(function(err) {
        if(err) {
            res.json(err);
        } else {
            res.json({message: resString, requestID: request._id});
            tw.request(request);
        }
    });

});

router.post('/api/emergency', function(req, res) {
    console.log(req.body);
    
    var object = 'Emergency';
    var id = req.body.id;
    var resString = "All nurses have been notified";

    var request = new Request();
    request.object = object;
    request.paitent = id;
    
    tw.updatePaitent(id, request);

    request.save(function(err) {
        if(err) {
            res.json(err);
        } else {
            res.json({message: resString, requestID: request._id});
            tw.emergency(request);
        }
    });
});

router.post('/api/check', function(req, res) {
    var id = req.body.id;

    Request.findOne({"_id": id}, function(err, request) {
        if(err) {
            console.log(err);
        } else {
            if(request.serviced) {
                Nurse.findOne({"_id": request.nurse}, function(err, nurse) {
                    if(err) {
                        console.log(err);
                    } else {
                        res.json({'msg': 'Request has been serviced', 'nurse': nurse.name});
                    }
                });

            } else {
                res.json({'msg': 'Request not serviced'});
            }
        }
    })
});

//twilio incoming message 
router.post('/api/message', (req, res) => {
  var twiml = new twilio.TwimlResponse();

  var body = req.body.Body;
  var number = req.body.From;

  Nurse.findOne({"number": number}, function(err, nurse) {
        if(err) {
            console.log(err);
        } else if(nurse) {
            console.log('User already registered, handling message');
            tw.message(nurse, body, function(reply) {
                twiml.message(reply);
                res.writeHead(200, {'Content-Type': 'text/xml'});
                res.end(twiml.toString());
                console.log('Text sent: ' + reply);
            });
        } else {
            var newNurse = new Nurse();
            newNurse.number = number;
            newNurse.name = body;

            newNurse.save(function(err) {
                if(err) {
                    console.log(err);
                } else {
                    twiml.message('Thanks for signing up, ' + newNurse.name + '!');
                    res.writeHead(200, {'Content-Type': 'text/xml'});
                    res.end(twiml.toString());

                    console.log('Saved new nurse with id: ' + newNurse._id);
                }
            });
        }
    });

});

module.exports = router;