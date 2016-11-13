var express = require('express');
var router = express.Router();
var twilio = require('twilio');
var path = require('path');

var tw = require('./twilio.js');
var Paitent = require('./models/paitent.js');
var Request = require('./models/request.js');
var Nurse = require('./models/nurse.js');

var socket = require('./socket.js');

var ObjectId = require('mongoose').Types.ObjectId; 

var mailSender = null;
var mailMessage = null;

router.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, './index.html'));
});

router.post('/api/new', function(req, res) {
    var name = req.body.name;
    tw.clearAll();

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
    console.log('checking ' + req.body.id);

    Request.findOne({"_id": new ObjectId(id)}, function(err, request) {
        console.log('Made db request...');
        if(err) {
            console.log(err);
        } else if(request) {
            console.log('Request status: ' + request.serviced);
            if(request.serviced) {
                Nurse.findOne({"_id": request.nurse}, function(err, nurse) {
                    if(err) {
                        console.log(err);
                    } else {
                        res.json({'msg': 'Request has been serviced', 'nurse': nurse.name, 'status': true});
                    }
                });

            } else {
                res.json({'msg': 'Request not serviced', 'status': false});
            }
        } else {
            console.log('No request found');
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
            //console.log('User already registered, handling message');
            tw.message(nurse, body, function(reply) {
                twiml.message(reply);
                res.writeHead(200, {'Content-Type': 'text/xml'});
                res.end(twiml.toString());
                console.log('Message sent: ' + reply);
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

                    socket.updateNurseCt();

                    console.log('Saved new nurse with id: ' + newNurse._id);
                }
            });
        }
    });

});

router.post('/api/mail', function(req, res) {
    console.log('Mail get!');
    //console.log(req.body[0].msys.relay_message);
    console.log('Message from ' + req.body[0].msys.relay_message.msg_from + ', text:');
    //console.log(req.body[0].msys.relay_message.content.text);
    res.sendStatus(200);

    mailSender = req.body[0].msys.relay_message.msg_from;
    mailMessage = req.body[0].msys.relay_message.content.text;

    while(mailMessage.includes('\n')) {
        mailMessage = mailMessage.replace('\n', '');
    }
    
    while(mailMessage.includes('\r')) {
        mailMessage = mailMessage.replace('\r', '');
    }

    console.log(mailMessage);

});

router.get('/api/mail/check', function(req, res) {
    console.log('Mail checked...');
    
    if(mailMessage) {
        res.json({sender: mailSender, message: mailMessage});
    } else {
        res.json({sender: '', message: ''});
    }

    mailSender = null;
    mailMessage = null;
})



var SparkPost = require('sparkpost');
var client = new SparkPost(sparkpost);


router.post('/api/mail/send', function(req, res) {
client.transmissions.send({
    content: {
      from: 'messages@pedelen.com',
      subject: 'A message from your family member',
      text:'Your family member is thinking about you. Maybe reply?'
    },
    recipients: [
      {address: 'patrickedelen@gmail.com'}
    ]
  })
  .then(data => {
    console.log('Message sent:');
    console.log(data);
    res.json({message: 'Message sent'});
  })
  .catch(err => {
    console.log('Something went wrong');
    console.log(err);
  });
});

module.exports = router;