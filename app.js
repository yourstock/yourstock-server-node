// app.js

var express = require('express');
var app = express();
var mongodb = require('./mongodb.js');

app.get('/codes', function(req, res) {
  mongodb.findall('codes', function(codes) {
    for (i in codes) {
      delete codes[i]._id;
    }
    res.json(codes);
  });
});

app.get('/history', function(req, res) {
  var range = parseInt(req.query.range);
  var code = req.query.code;
  var date_begin = new Date();
  var resultObject = {};
  var highest = 0;
  /* TODO: fix lowest value */
  var lowest = 999999999999;
  date_begin.setDate(date_begin.getDate() - range);
  mongodb.find('price_history', {code: code, date: {$gte: date_begin}}, function(history) {
    for (i in history) {
      delete history[i]._id;
      delete history[i].date;
      history[i].hg_pr = parseInt(history[i].hg_pr)
      history[i].lw_pr = parseInt(history[i].lw_pr)
      if (highest < history[i].hg_pr) {
        highest = history[i].hg_pr;
      }
      if (lowest > history[i].lw_pr) {
        lowest = history[i].lw_pr;
      }
    }
    resultObject.history = history;
    resultObject.highest = highest;
    resultObject.lowest = lowest;
    res.json(resultObject);
  });
});

app.get('/history_all', function(req, res) {
  mongodb.findall('history_min_max', function(history) {
    for (i in history) {
      delete history[i]._id;
    }
    res.json(history);
  });
});

app.listen(3000);
