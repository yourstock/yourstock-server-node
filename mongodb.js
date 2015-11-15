// mongodb.js

module.exports = {
  removeall: removeAll,
  insertmany: insertMany,
  findall: findAll,
  find: findSpecific
}

function removeAll(collection) {
  var MongoClient = require('mongodb').MongoClient;
  var assert = require('assert');

  var url = 'mongodb://localhost:27017/sip';
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log("Connected correctly to server.");
    db.collection(collection).removeMany();
    db.close();
  });
}
 
function insertMany(collection, data) {
  var MongoClient = require('mongodb').MongoClient;
  var assert = require('assert');

  var url = 'mongodb://localhost:27017/sip';
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log("Connected correctly to server.");
    db.collection(collection).insertMany(data, function(err, result) {
      assert.equal(err, null);
      console.log("Inserted a document into the " + collection + " collection.");
      db.close();
    });
  });
}

function findAll(collection, cb) {
  findSpecific(collection, cb, null);
}

function findSpecific(collection, cb, query) {
  var MongoClient = require('mongodb').MongoClient;
  var assert = require('assert');

  var url = 'mongodb://localhost:27017/sip';
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log("Connected correctly to server.");
    db.collection(collection).find(query).toArray(function(err, results) {
      assert.equal(err, null);
      console.log("Retrieve all items in " + collection + " collection.");
      db.close();
      cb(results);
    });
  });
}
