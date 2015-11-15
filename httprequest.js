// httprequest.js

module.exports = {
  httpgetrequest: httpgetrequest
}

function httpgetrequest(host, path, cb, cbparam) {
  var http = require('http');
  var options = {
    host: host,
    path: path
  };

  var request = http.request(options, function(res) {
    var str = '';
    res.on('data', function(chunk) {
      str += chunk;
    });
    res.on('end', function() {
      cb(str, cbparam);
    });
  });
  request.on('socket', function(socket) {
    socket.setTimeout(10000);
    socket.on('timeout', function() {
      request.abort();
    });
  });

  request.on('error', function(e) {
    console.log("Got error: " + e.message);
    request.abort();
    setTimeout(function(){httpgetrequest(host, path, cb, cbparam);}, 1000);
  });
  request.end();
}
