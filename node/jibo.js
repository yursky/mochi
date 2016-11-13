var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
// Replace mongoose promises with native promises
mongoose.Promise = global.Promise;


mongoose.connect('mongodb://root:root@ds151697.mlab.com:51697/carebot_db', function(err) {
  if(err){
    console.log(err);
  } else {
    console.log('Connected to db...');
  }
});

var routes = require('./app/routes.js');

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

