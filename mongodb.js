// mongodb.js

module.exports = {
  removeall: removeAll,
  remove: removeSpecific,
  insertmany: insertMany,
  findall: findAll,
  find: findSpecific
}

function removeAll(collection) {
  removeSpecific(collection, null);
}

function removeSpecific(collection, query) {
  var MongoClient = require('mongodb').MongoClient;
  var assert = require('assert');

  var url = 'mongodb://localhost:27017/sip';
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    db.collection(collection).deleteMany(query);
    db.close();
    console.log("Mongodb remove success");
  });
}
 
function insertMany(collection, data) {
  var MongoClient = require('mongodb').MongoClient;
  var assert = require('assert');

  var url = 'mongodb://localhost:27017/sip';
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    db.collection(collection).insertMany(data, function(err, result) {
      assert.equal(err, null);
      console.log("Inserted a document into the " + collection + " collection.");
      db.close();
    });
  });
}

function findAll(collection, cb) {
  findSpecific(collection, null, cb);
}

function findSpecific(collection, query, cb) {
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
