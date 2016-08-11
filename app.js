var express = require('express');
var app = express();
var path = require('path');
var port = process.env.PORT || 3000;
var mongo = require('./mongo.js');

app.use('/', express.static(path.join(__dirname, 'public')));

app.listen(port, function(err, res) {
  if (err) {
    console.log('Error happened during server startup:', err);
  }
  else {
    console.log('Server started successfully');
  }
});