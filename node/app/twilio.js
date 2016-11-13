var client = require('twilio')('AC34b59a78bd9613d32af7167691a04471', '65b1926b19c8dd65e3a9e9523db46799');

var Paitent = require('./models/paitent.js');
var Request = require('./models/request.js');
var Nurse = require('./models/nurse.js');

var socket = require('./socket.js');

var ObjectId = require('mongoose').Types.ObjectId; 

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
 
module.exports.clearAll = function() {
    console.log('Clearing all current requests...');
    Nurse.find(function(err, nurses) {
        nurses.forEach(function(nurse) {
            nurse.curReq = null;
            nurse.save(function(err) { if(err) {console.log(err); } });
        });
    });
}

module.exports.request = function(request) {

    socket.addReq(request);

    Paitent.findOne({"_id": request.paitent}, function(err, paitent) {
        if(err) {
            console.log(err);
        } else {
            Nurse.findRandom().limit(4).exec(function(err, nurses) {

                if(err) {
                    console.log(err);
                } else {
                    nurses.forEach(function(nurse) {
                        nurse.curReq = request._id;

                        nurse.save(function(err) {
                            if(err) { console.log(err); }
                        });

                        var msgStr = 'Paitent ' + paitent.name + ' needs ' + request.object + ", reply with 'ok' to accept";
                        sendText(nurse.number, msgStr);
                    });
                }
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

    socket.addReq(request);

    console.log('HELP NEEDED, texting all open nurses');

    Paitent.findOne({"_id": request.paitent}, function(err, paitent) {
        if(err) {
            console.log(err);
        } else {
            Nurse.find({"curReq": null}, function(err, nurses) {

                if(err) {
                    console.log(err);
                } else {
                    nurses.forEach(function(nurse) {
                        nurse.curReq = request._id;

                        nurse.save(function(err) {
                            if(err) { console.log(err); }
                        });

                        var msgStr = 'Emergency help is needed! ' + paitent.name + " needs help, reply with 'ok' to accept";
                        sendText(nurse.number, msgStr);
                    });
                }
            });
        }
    });
}

module.exports.message = function(nurse, body, cb) {
    body.toLowerCase();

    if(!nurse.curReq){
        cb('You have no current requests');
    } else if(body == 'ok' || body == 'Ok') {
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

                    socket.updateReq(request);
                });
            }
        });
    } else {
        cb('Unknown response, ' + body);
        console.log('Unknown response recieved: ' + body);
    }
    
}
