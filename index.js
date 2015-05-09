var express = require('express');
var app = express();
var nodeServer = require('http').Server(app);
//var mongo = require('mongodb');
//var database = require('./database.js');
var io = require('socket.io').listen(nodeServer);
var socketPort = 3000;
app.set('socketPort', 80);
app.set('port', process.env.PORT || 5000);
app.use(express.static(__dirname));

app.get('/', function (req, res) {
	res.sendFile(__dirname + req.url);
});

io.on('connection', function (socket) {
	console.log("Someone connected.");
	socket.on('msg', function (msg) {
		console.log('Incoming message: ' + msg);
		socket.broadcast.emit('incoming message', msg);
	});
	socket.on('disconnect', function () {
		console.log('Someone disconnected.');
	});
})

/*app.post('/', function (req, res) {
	console.log("Post request received");
});*/

app.listen(app.get('port'), function () {
  console.log("Node app is running on port:" + app.get('port'));
});

nodeServer.listen(app.get('socketPort'), function () {
	console.log("Socket.io server is listening to port " + app.get('socketPort'));
});