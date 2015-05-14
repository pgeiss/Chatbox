var express = require('express');
var app = express();
var nodeServer = require('http').Server(app);
//var mongo = require('mongodb');
//var database = require('./database.js');
var io = require('socket.io').listen(nodeServer);
var clients = [];
app.set('socketPort', 39000);
app.set('port', 80);
app.use(express.static(__dirname));

app.get('/', function (req, res) {
	res.sendFile(__dirname + req.url);
});

io.on('connection', function (socket) {
	console.log('A user connected to ID ' + socket.id);
	clients.push(socket);

	socket.on('msg', function (msg) {
		console.log('Incoming message: ' + msg);
		socket.broadcast.emit('incoming message', msg);
	});

	socket.on('private msg', function (pmsg) {
		console.log('Incoming pm: ' + pmsg);
		//TODO
	})

	socket.on('disconnect', function () {
		var toRemove = clients.indexof(socket);
		if (index != -1) {
			clients.splice(index, 1);
			console.log('A user disconnected from ID ' + socket.id);
		}
	});
})

app.post('/signin', function (req, res) {
	console.log("Post request received");
	console.log("UN: " + req.username + " PW: " + req.password);
});

app.post('/register', function (req, res) {
	console.log("Post request received");
	console.log("UN: " + req.username + " PW: " + req.password);
	console.log("" + req[0]); //TODO
});

app.listen(app.get('port'), function () {
  console.log("Node app is running on port:" + app.get('port'));
});

nodeServer.listen(app.get('socketPort'), function () {
	console.log("Socket.io server is listening to port " + app.get('socketPort'));
});
