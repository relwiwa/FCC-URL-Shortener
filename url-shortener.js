var mongo = require('./mongo.js');

module.exports = {
  'getUrl': getUrl,
  'addUrl': addUrl
}

/*  Expects object with either originalUrl or shortUrl key-value pair.
    If url is in DB, returns proper object, otherwise null */
function getUrl(url) {
  var promise = new Promise(function(resolve, reject) {
    mongo.getColl('urls').then(function(coll) {
      coll.find(url).toArray().then(function(result) {
        if (result.length > 0) {
          console.log('This URL is already in the DB, so returning existing information');
          resolve({
            'originalUrl': result[0].originalUrl,
            'shortUrl': result[0].shortUrl
          });
        }
        else {
          console.log('This URL is not in the DB, returning null');
          resolve(null);
        }
      }, function(err) {
        console.log('An error happened when trying to find URL in urls collection');
        reject(err);
      });
    }, function(err) {
      console.log('An error happened when trying to access urls collection');
      reject(err);
    });
  });
  return promise;
}

/*  addUrl:
    - Expects url string, adds url to DB creating shortUrl and returns
      proper object
    - Does not check whether URL is already in DB */
function addUrl(url) {
  var promise = new Promise(function(resolve, reject) {
    createShortUrl().then(function(shortUrl) {
      mongo.getColl('urls').then(function(coll) {
        coll.insertOne({
          'originalUrl': url,
          'shortUrl': shortUrl
        }).then(function(result) {
          console.log('New URL info was successfully added to DB');
          resolve({
            'originalUrl': result.ops[0].originalUrl,
            'shortUrl': result.ops[0].shortUrl
          });
        }, function(err) {
          console.log('Error happened while trying to add new URL info into DB');
          reject(err);
        });
      })
    }, function(err) {
      console.log('Error happened while trying to create shorter URL');
      reject(err);
    });
  });
  return promise;
}

/*  createShortUrl
    - Creates unique short url of 8 digits length
    - Should short url already exist, recursively calls itself */
function createShortUrl() {
  var promise = new Promise(function(resolve, reject) {
    var alphabet = "abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var shortUrl = "";
    for (var i = 0; i < 8; i++) {
      shortUrl += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    getUrl({
      'shortUrl': shortUrl
    }).then(function(result) {
      if (result === null) {
        resolve(shortUrl);
      }
      else {
        createShortUrl();
      }
    }, function(error) {
      reject(err);
    });
  });
  return promise;
}