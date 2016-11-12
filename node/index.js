var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var routes = require('./routes.js');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', routes);

app.listen(3005, function(err) {
    if(!err) {
        console.log('Server started...');
    } else {
        console.log(err);
    }
});

