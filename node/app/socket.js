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


                Paitent.findOne({"_id": requests[i].paitent}, function(err, paitent) {
                    if(err) { console.log(err); }

                    if(requests[i].object == 'Emergency') {
                        info = 'Emergency reported for ' + paitent.name;
                        if(requests[i].serviced) {
                            Nurse.findOne({"_id": requests[i].nurse}, function(err, nurse) {
                                if(err) { console.log(err); }
                                titleBar = 'Emergency - Serviced by ' + nurse.name;
                                color = 'success';
                                requestArr.push({id: requests[i]._id, titleBar: titleBar, info: info, color: color});
                            });
                            
                        } else {
                            titleBar = 'Emergency';
                            color = 'danger';
                            requestArr.push({id: requests[i]._id, titleBar: titleBar, info: info, color: color});
                        }
                    } else {
                        info = 'Request of ' + requests[i].object + ' for ' + paitent.name;
                        if(requests[i].serviced) {
                            Nurse.findOne({"_id": requests[i].nurse}, function(err, nurse) {
                                if(err) { console.log(err); }
                                if(nurse) {
                                    var ns = nurse.name;
                                } else {
                                    ns = requests[i].nurse;
                                }
                                titleBar = 'Request - Serviced by ' + ns;
                                color = 'success';
                                requestArr.push({id: requests[i]._id, titleBar: titleBar, info: info, color: color});
                            });
                        } else {
                            titleBar = 'Request';
                            color = 'primary';
                            requestArr.push({id: requests[i]._id, titleBar: titleBar, info: info, color: color});
                        }
                    }
                    

                });
            }

        });
}



module.exports.setup = function(http) {

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
            console.log('Update request ' + req.titleBar);
            io.emit('update req', req);
        });

        msgsEmitter.on('reqAdd', (req) => {
            console.log('Add request ' + req.titleBar);
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
    console.log('Entered addReq fn');
        findReqs();
        
        Request.findOne(function(err, request) {
            console.log('Found one');
            if(err) { console.log(err); }

            var titleBar;
            var info;
            var color;


            Paitent.findOne({"_id": request.paitent}, function(err, paitent) {
                if(err) { console.log(err); }

                if(request.object == 'Emergency') {
                    info = 'Emergency reported for ' + paitent.name;
                    if(request.serviced) {
                        Nurse.findOne({"_id": request.nurse}, function(err, nurse) {
                            if(err) { console.log(err); }
                            titleBar = 'Emergency - Serviced by ' + nurse.name;
                            color = 'success';

                            var req = {
                                id: request._id,
                                titleBar: titleBar,
                                info: info,
                                color: color
                            };

                            msgsEmitter.emit('reqAdd', req);
                        });
                        
                    } else {
                        titleBar = 'Emergency';
                        color = 'danger';

                        var req = {
                            id: request._id,
                            titleBar: titleBar,
                            info: info,
                            color: color
                        };

                        msgsEmitter.emit('reqAdd', req);
                    }
                } else {
                    info = 'Request of ' + request.object + ' for ' + paitent.name;
                    if(request.serviced) {
                        Nurse.findOne({"_id": request.nurse}, function(err, nurse) {
                            if(err) { console.log(err); }
                            if(nurse) {
                                var ns = nurse.name;
                            } else {
                                var ns = request.nurse;
                            }
                            titleBar = 'Request - Serviced by ' + ns;
                            color = 'success';

                            var req = {
                                id: request._id,
                                titleBar: titleBar,
                                info: info,
                                color: color
                            };

                            msgsEmitter.emit('reqAdd', req);
                        });
                    } else {
                        titleBar = 'Request';
                        color = 'primary';

                        var req = {
                            id: request._id,
                            titleBar: titleBar,
                            info: info,
                            color: color
                        };

                        msgsEmitter.emit('reqAdd', req);
                    }
                }
                

            });

        });


    }

module.exports.updateReq = function(request) {
    console.log('Entered updateReq fn');
        console.log('Updating socket request ' + request._id);

        findReqs();
        
        Request.findOne(function(err, request) {
            if(err) { console.log(err); }

                var titleBar = '';
                var info = '';
                var color = '';

                request.serviced = true;

                request.save(function(err){ if(err){console.log(err);}});


                Paitent.findOne({"_id": request.paitent}, function(err, paitent) {
                    if(err) { console.log(err); }

                    if(request.object == 'Emergency') {
                        info = 'Emergency reported for ' + paitent.name;
                        if(request.serviced) {
                            Nurse.findOne({"_id": request.nurse}, function(err, nurse) {
                                if(err) { console.log(err); }
                                titleBar = 'Emergency - Serviced by ' + nurse.name;
                                color = 'success';

                                var req = {
                                    id: request._id,
                                    titleBar: titleBar,
                                    info: info,
                                    color: color
                                };

                                msgsEmitter.emit('reqUpdate', req);
                            });
                            
                        } else {
                            titleBar = 'Emergency';
                            color = 'danger';

                            var req = {
                                id: request._id,
                                titleBar: titleBar,
                                info: info,
                                color: color
                            };

                            msgsEmitter.emit('reqUpdate', req);
                        }
                    } else {
                        info = 'Request of ' + request.object + ' for ' + paitent.name;
                        if(request.serviced) {
                            Nurse.findOne({"_id": request.nurse}, function(err, nurse) {
                                if(err) { console.log(err); }
                                var ns = nurse.name || request.nurse;
                                titleBar = 'Request - Serviced by ' + ns;
                                color = 'success';

                                var req = {
                                    id: request._id,
                                    titleBar: titleBar,
                                    info: info,
                                    color: color
                                };

                                msgsEmitter.emit('reqUpdate', req);
                            });
                        } else {
                            titleBar = 'Request';
                            color = 'primary';

                            var req = {
                                id: request._id,
                                titleBar: titleBar,
                                info: info,
                                color: color
                            };

                            msgsEmitter.emit('reqUpdate', req);
                        }
                    }
                    

                });

        });

    }

