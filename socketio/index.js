var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var codes = require('./codes');

function emit(object) {
	io.emit('chat message', object);
}

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
  	console.log('user disconnected');
  });
  socket.on('chat message', function(msg){
//	io.emit('chat message', msg);
	codes.emit(emit);
  });
});

http.listen(9999, function(){
  console.log('listening on *:9999');
});
