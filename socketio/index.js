var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);;
var codes = require('./codes');
var theObj = [];
var minMaxData = [];

function emit(object) {
	theObj = object;
}

function emitHistory(hist) {
	minMaxData = hist;
}

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('get codes', function(msg){
	codes.emit(emit);
	socket.emit('codes', theObj);

  });
  socket.on('history', function(msg) {
	codes.emitHistory(emitHistory);
	socket.emit('historydata', minMaxData)
  });
  socket.on('register', function(object) {
	codes.deviceRegister(object);
	});
});

http.listen(9999, function(){
  console.log('listening on *:9999');
});
