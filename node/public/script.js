var socket = io();

function addReqPrepend(req) {
    var reqText = '<div id="'+ req.id + '" class="col-xs-12 col-md-4 col-lg-3"><div class="panel panel-'
     + req.color + '"><div class="panel-heading"><h3 class="panel-title">' 
     + req.titleBar + '</h3></div><div class="panel-body">' + req.info
     + '</div></div></div>';

    $('#requests').html(reqText);
}

function addReqAppend(req) {
    var reqText = '<div id="'+ req.id + '" class="col-xs-12 col-md-4 col-lg-3"><div class="panel panel-'
     + req.color + '"><div class="panel-heading"><h3 class="panel-title">' 
     + req.titleBar + '</h3></div><div class="panel-body">' + req.info
     + '</div></div></div>';

    $('#requests').html(reqText);
}

function updateReq(req) {
    var reqText = '<div id="'+ req.id + '" class="col-xs-12 col-md-4 col-lg-3"><div class="panel panel-'
    + req.color + '"><div class="panel-heading"><h3 class="panel-title">' 
    + req.titleBar + '</h3></div><div class="panel-body">' + req.info
    + '</div></div></div>';

     $('#requests').html(reqText);
}

function updateNurses(nurseCt) {
    $('#nurses-registered').text(nurseCt);
}

socket.on('join', function(requests, nurseCt) {
    console.log('Nurse count: ' + nurseCt);
    console.log(requests);

    updateNurses(nurseCt);
    requests.forEach(function(element) {
        addReqPrepend(element);
    });

});

socket.on('add req', function(request) {
    console.log('Request to add an req recieved');
    console.log(request);

    addReqPrepend(request);
});

socket.on('update req', function(request) {
    console.log('Request to update a req recieved');
    console.log(request);

    updateReq(request);
});

socket.on('update nurse', function(nurseCt) {
    console.log('Request to update nurses recieved');
    
    updateNurses(nurseCt);
}) 