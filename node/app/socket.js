var EventEmitter = require('events');

var Paitent = require('./models/paitent.js');
var Request = require('./models/request.js');
var Nurse = require('./models/nurse.js');

var requestArr = [];
var nurseCt;

class myEmitter extends EventEmitter {}
const msgsEmitter = new myEmitter();

function findNurseCt() {
    Nurse.find().count(function(err, count) {
        if(err) { console.log(err); }
        nurseCt = count;
        //console.log('Number of nurses ' + count);
    });
}

function findReqs() {

     Request.find().limit(30).exec(function(err, requests) {
            if(err) { console.log(err); }

            for(let i = 0; i < requests.length; i++) {
                var titleBar;
                var info;
                var color;

                if(requests[i].object == 'Emergency') {
                    info = 'Emergency reported by ' + requests[i].paitent;
                    if(requests[i].serviced) {
                        titleBar = 'Emergency - Serviced';
                        color = 'success';
                    } else {
                        titleBar = 'Emergency';
                        color = 'danger';
                    }
                } else {
                    info = 'Request of ' + requests[i].object;
                    if(requests[i].serviced) {
                        titleBar = 'Request - Serviced';
                        color = 'success';
                    } else {
                        titleBar = 'Request';
                        color = 'primary';
                    }
                }
                requestArr.push({id: requests[i]._id, titleBar: titleBar, info: info, color: color});
            }

        });
}



module.exports = function(http) {

    findReqs();
    findNurseCt();

    var io = require('socket.io')(http);

    io.on('connection', function(socket){
        console.log('User connected');

        socket.emit('join', requestArr, nurseCt);

        msgsEmitter.on('nurseUpdate', (newCt)=> {
            io.emit('update nurse', newCt);
        });

        msgsEmitter.on('reqUpdate', (req) => {
            io.emit('update req', req);
        });

        msgsEmitter.on('reqAdd', (req) => {
            io.emit('add req', req);
        });

    });
}

module.exports.updateNurseCt = function() {
        newCt = 1 + nurseCt;
        findNurseCt();

        msgsEmitter.emit('nurseUpdate', newCt);
        
    }

module.exports.addReq = function(request) {
        findReqs();
        
        if(request.object == 'Emergency') {
            info = 'Emergency reported by ' + request.paitent;
            if(request.serviced) {
                titleBar = 'Emergency - Serviced';
                color = 'success';
            } else {
                titleBar = 'Emergency';
                color = 'danger';
            }
        } else {
            info = 'Request of ' + request.object;
            if(request.serviced) {
                titleBar = 'Request - Serviced';
                color = 'success';
            } else {
                titleBar = 'Request';
                color = 'primary';
            }
        }

        var req = {
            id: request._id,
            titleBar: titleBar,
            info: info,
            color: color
        };

        msgsEmitter.emit('reqAdd', req);
    }

module.exports.updateReq = function(request) {
        console.log('Updating socket request ' + request._id);

        findReqs();
        
        if(request.object == 'Emergency') {
            info = 'Emergency reported by ' + request.paitent;
            if(request.serviced) {
                titleBar = 'Emergency - Serviced';
                color = 'success';
            }
        } else {
            info = 'Request of ' + request.object;
            if(request.serviced) {
                titleBar = 'Request - Serviced';
                color = 'success';
            } else {
                titleBar = 'Request';
                color = 'primary';
            }
        }

        var req = {
            id: request._id,
            titleBar: titleBar,
            info: info,
            color: color
        };

        msgsEmitter.emit('reqUpdate', req);

    }

