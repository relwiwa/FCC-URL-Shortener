var express = require('express');
var app = express();
var path = require('path');
var port = process.env.PORT || 3000;
var validator = require('validator');
var mongo = require('./mongo.js');
var us = require('./url-shortener.js');

app.use('/', express.static(path.join(__dirname, 'public')));

/*  Following MongoDB's suggested practice for connection pooling:
    - create DB connection during startup
    - put app.listen after DB connection is established
    http://blog.mlab.com/2013/11/deep-dive-into-connection-pooling */
mongo.initDB().then(function(db) {
  console.log('Connection to database successfully established');
  app.listen(port, function(err, res) {
    if (err) {
      console.log('Error happened during server startup:', err);
    }
    else {
      console.log('Server started successfully');
    }
  });
}, function(err) {
  console.log('Connection to database could not be established', err);
});

/*  /new/URL route:
    1. Checks if URL is in proper format.
    2. If not, sends JSON error object, otherwise checks if URL is
       already in DB:
        - if so, returns existing information
        - if not, created shorter url and returns information */
app.get('/new/*', function(req, res) {
  var url = {
    'originalUrl': req.path.substr(5)
  };
  if (validator.isURL(url.originalUrl)) {
    us.getUrl(url).then(function(result) {
      if (result !== null) {
        res.json(result);
      }
      else {
        us.addUrl(url.originalUrl).then(function(result) {
          res.json(result);
        }, function(err) {
          res.json({
            'error': 'An error happened while trying to create a shorter URL'
          });
        });
      }
    }, function(err) {
      res.json({
        'error': 'An error happened while processing your URL.'
      });
    });
  }
  else {
    res.json({
      'error': 'This was not a proper URL. Please insert URLs in a correct format.'
    });
  }
});