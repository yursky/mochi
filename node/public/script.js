var socket = io();

function addReqPrepend(req) {
    var reqText = '<div id="'+ req.id + '" class="col-xs-12 col-md-4 col-lg-3"><div class="panel panel-'
     + req.color + '"><div class="panel-heading"><h3 class="panel-title">' 
     + req.titleBar + '</h3></div><div class="panel-body">' + req.info
     + '</div></div></div>';

    $('#requests').prepend(reqText);
}

function addReqAppend(req) {
    var reqText = '<div id="'+ req.id + '" class="col-xs-12 col-md-4 col-lg-3"><div class="panel panel-'
     + req.color + '"><div class="panel-heading"><h3 class="panel-title">' 
     + req.titleBar + '</h3></div><div class="panel-body">' + req.info
     + '</div></div></div>';

    $('#requests').append(reqText);
}

function updateReq(req) {
    var reqText = '<div id="'+ req.id + '" class="col-xs-12 col-md-4 col-lg-3"><div class="panel panel-'
    + req.color + '"><div class="panel-heading"><h3 class="panel-title">' 
    + req.titleBar + '</h3></div><div class="panel-body">' + req.info
    + '</div></div></div>';

     var id = '#' + req.id;

     $(id).replaceWith(reqText);
}

function updateNurses(nurseCt) {
    $('#nurses-registered').text(nurseCt);
}

socket.on('join', function(requests, nurseCt) {
    console.log('Nurse count: ' + nurseCt);
    console.log(requests);

    updateNurses(nurseCt);
    requests.forEach(function(element) {
        addReqAppend(element);
    });

});

socket.on('add req', function(request) {
    console.log('Request to add an req recieved');

    addReqPrepend(request);
});

socket.on('update req', function(request) {
    console.log('Request to update a req recieved');

    updateReq(request);
});

socket.on('update nurse', function(nurseCt) {
    console.log('Request to update nurses recieved');
    
    updateNurses(nurseCt);
}) 