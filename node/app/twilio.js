var client = require('twilio')('AC34b59a78bd9613d32af7167691a04471', '65b1926b19c8dd65e3a9e9523db46799');

var Paitent = require('./models/paitent.js');
var Request = require('./models/request.js');
var Nurse = require('./models/nurse.js');

function clearReqs(requestID) {
    Nurse.find({"curReq": requestID}, function(err, nurses) {
        if(err) {
            console.log(err);
        } else {
            nurses.forEach(function(nurse) {
                nurse.curReq = null;

                nurse.save(function(err) {
                    if(err) {
                        console.log(err);
                    }
                });

                sendText(nurse.number, 'Request has been handled');
            });
        }
    });
}

function sendText(number, message) {
    client.sendMessage({

        to: number,
        from: '+12028997754',
        body: message

    }, function(err, responseData) { 

        if (err) { 
            console.log(err);
        } else {
            console.log('Message sent to ' + number);
        }
    });
}
 

module.exports.request = function(request) {

    Nurse.findRandom().limit(4).exec(function(err, nurses) {
        if(err) {
            console.log(err);
        } else {
            nurses.forEach(function(nurse) {
                nurse.curReq = request._id;

                nurse.save(function(err) {
                    if(err) { console.log(err); }
                });

                var msgStr = 'A paitent needs ' + request.object + ", reply with 'ok' to accept";
                sendText(nurse.number, msgStr);
            });
        }
    });
}

module.exports.updatePaitent = function(paitentID, request) {
    Paitent.findOne({"_id": paitentID}, function(err, paitent) {
        if(err) {
            console.log(err);
        } else {
            paitent.requests.push(request._id);

            paitent.save(function(err) { if(err){ console.log(err); } });
        }
    });
}

module.exports.emergency = function(request) {
    var msgStr = "Emergency help is needed, reply 'ok' to accept!";

    Nurse.find({"curReq": null},function(err, nurses) {
        nurses.forEach(function(nurse) {
            nurse.curReq = request._id;
            nurse.save(function(err) { if(err) {console.log(err); } });

            sendText(nurse.number, msgStr);
        });

        console.log('HELP NEEDED, texting all open nurses');
    });
}

module.exports.message = function(nurse, body, cb) {
    body.toLowerCase();

    if(!nurse.curReq){
        cb('You have no current requests');
    } else if(body === 'ok') {
        Request.findOne({"_id": nurse.curReq}, function(err, request) {
            if(err) {
                console.log(err);
            } else {
                //console.log(request);

                request.serviced = true;
                request.nurse = nurse._id;

                nurse.curReq = null;
                nurse.requests.push(request._id);
                nurse.save(function(err) { if(err) { console.log(err); } });

                request.save(function(err) {
                    if(err) {
                        console.log(err);
                    }
                    cb('Thanks ' + nurse.name + '!');
                    clearReqs(request._id);
                });
            }
        });
    } else {
        cb('Unknown response, ' + body);
        console.log('Unknown response recieved: ' + body);
    }
    
}
