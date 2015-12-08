// crawltoday.js

updatedayvalue = require('./crawler.js').updatedayvalue;
calculateminmax = require('./crawler.js').calculateminmax;
isdateexist = require('./crawler.js').isdateexist;

var today = new Date();
var today_str = today.toISOString().slice(0,10).replace(/[^0-9]/g, "");

console.log(today_str);
function doit() {
  updatedayvalue(today_str, calculateminmax);
}

isdateexist(today_str, doit);
