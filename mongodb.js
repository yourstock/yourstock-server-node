// mongodb.js

module.exports = {
  removeall: removeAll,
  remove: removeSpecific,
  insertmany: insertMany,
  findall: findAll,
  find: findSpecific,
  update: updateSpecific
}

function removeAll(collection, cb) {
  removeSpecific(collection, null, cb);
}

function removeSpecific(collection, query, cb) {
  var MongoClient = require('mongodb').MongoClient;
  var assert = require('assert');

  var url = 'mongodb://localhost:27017/sip';
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    db.collection(collection).deleteMany(query, function() {
      db.close();
      console.log("Mongodb remove success");
      cb();
    });
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

function updateSpecific(collection, query, setquery, cb) {
  var MongoClient = require('mongodb').MongoClient;
  var assert = require('assert');

  var url = 'mongodb://localhost:27017/sip';
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log("Connected correctly to server.");
    db.collection(collection).updateOne(
      query,
      setquery,
      function(err, results){
        //console.log(results);
        //setTimeout(function() {cb();}, 50);
        process.nextTick(cb);
    });
  });
}
