var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var nodeServer = require('http').Server(app);
var Database = require('./database.js');
var io = require('socket.io').listen(nodeServer);
var clients = [];
app.set('socketPort', 39000);
app.set('port', 80);
//app.set('port', 8000); //DEBUG USE ONLY

// Constants
app.use(express.static(__dirname));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function (req, res) {
	res.sendFile(__dirname + req.url);
});

function GlobalMessage(msg, msgType, sender) {
	this.msg = msg;
	this.msgType = msgType;
	this.sender = sender;
}

function Notice(msg, sender) {
	this.msg = msg;
	this.msgType = 'notice';
	this.sender = sender;
}

function PrivateMessage(msg, sender, target) {
	this.msg = msg;
	this.msgType = 'other private';
	this.sender = sender;
	this.target = target;
}

io.on('connection', function (socket) {
	console.log('A user connected to ID ' + socket.id);
	clients.push({socket: socket, id: socket.id, dn: '', admin: false});
	
	socket.emit('dnCheck');

	socket.on('dnCheckReturn', function (dn) {
		var socketIndex = clients.map(function (e) { 
			return e.id; 
		}).indexOf(socket.id);

		if (dn === '') {
			clients[socketIndex].dn = '' + 
				socket.id.toString().substr(0, 10);
			socket.emit('anonDn', '' + 
				socket.id.toString().substr(0, 10));
		}
		else {
			clients[socketIndex].dn = dn;
			//clients[socketIndex].admin = //Write DB function for this 
		}

		if (!clients[socketIndex].admin) {
			socket.broadcast.emit('incoming global message', 
				new Notice('User ' + 
					clients[socketIndex].dn + ' joined the chat.', 
					'Connection'));
		}
	});

	socket.on('global message', function (Msg) {
		var socketIndex = clients.map(function (e) { 
			return e.id; 
		}).indexOf(socket.id);
		console.log('Incoming message: ' + Msg.msg + ' from ' +
			clients[socketIndex].dn);
		if (clients[socketIndex].admin) {
			socket.broadcast.emit('incoming global message', 
				new GlobalMessage(Msg.msg, 'admin', Msg.sender));
		} else {
			socket.broadcast.emit('incoming global message', 
				new GlobalMessage(Msg.msg, 'other', Msg.sender));
		}
	});

	/*socket.on('notice', function (Msg) {
		//TODO: Need DB find function
		console.log('Notice sent: ' + Msg.msg);
		socket.broadcast.emit('incoming notice', new GlobalNotice(Msg.msg));
	})*/

	socket.on('private message', function (Msg) {
		console.log('Incoming pm from ' + Msg.sender + ' to ' + Msg.target +
			': ' + Msg.msg);
		var toMessage = clients.map(function (e) { 
			return e.dn; 
		}).indexOf(Msg.target);
		if (toMessage !== -1) {
			var socketTarget = clients[toMessage].socket;
			socketTarget.emit('incoming global message', 
				new PrivateMessage(Msg.msg, Msg.sender, Msg.target));
		} else {
			socket.emit('incoming global message', 
				new Notice('The user you were trying to send the message' + 
					' to is not connected.', 'Notice'))
		}
	})

	socket.on('disconnect', function () {
		var socketIndex = clients.map(function (e) { 
			return e.id; 
		}).indexOf(socket.id);
		socket.broadcast.emit('incoming global message', 
			new Notice('User ' + 
				clients[socketIndex].dn + ' left the chat.',
				 'Disconnection'));

		clients.splice(socketIndex, 1);
		console.log('A user disconnected from ID ' + socket.id);
	});
})

app.post('/signin', function (req, res) {
	console.log('Login attempt received...');
	var User = {user: req.body.username, pw: req.body.password};
	Database.login(User, function (success, id, dn) {
		if (success === true) {
			console.log('and was successful. User ' + id + ' (' +
				User.user + ') logged in.');
			res.cookie('_id', id, {maxAge: 900000, httpOnly: true});
			res.cookie('httpUser', User.user, 
				{maxAge: 900000, httpOnly: true});
			res.cookie('user', User.user, {maxAge: 900000, httpOnly: false});
			res.cookie('dispName', dn, {maxAge: 900000, httpOnly: false});
			res.send({redirect: '/index.html'});
		} else {
			console.log('and failed');
			res.send({redirect: '/signin.html?unsuccessful=true'})
		}
	});
});

app.post('/register', function (req, res) {
	console.log("A user attempted to register...");
	var User = {user: req.body.username, pw: req.body.password,
		dn: req.body.dispName};
	if (validateUser(User)) {
		Database.register(User, function (success) {
			if (success === true) {
				console.log('successfully');
				res.send({redirect: '/index.html'});
			} else if (success === -1) {
				console.log('username taken');
				res.send({redirect: '/register.html?unsuccessful=user'});
			} else if (success === -2) {
				console.log('dn taken');
				res.send({redirect: '/register.html?unsuccessful=disp'});
			} else {
				console.log('Error occurred during registration attempt!');
				res.send({redirect: '/register.html?unsuccessful=error'});
			}
		});
	} else {
		console.log('validation failed');
		res.send({redirect: '/register.html?unsuccessful=format'});
	}
});

app.listen(app.get('port'), function () {
  console.log("Node app is running on port: " + app.get('port'));
});

nodeServer.listen(app.get('socketPort'), function () {
	console.log("Socket.io server is listening to port " + 
		app.get('socketPort'));
});

function validateUser(User) {
	return typeof User === 'object' && typeof User.user === 'string' && 
		typeof User.pw === 'string' && typeof User.dn === 'string' && 
		User.user.match(/\w{4,16}/) && User.pw.length >= 6 && 
		User.dn.match(/\w{1,20}/);
}