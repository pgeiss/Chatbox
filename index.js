// Requires and Globals
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const https = require('https');
const http = require('http');
const Database = require('./database.js');
const bleach = require('bleach');
const SocketIO = require('socket.io');
const fs = require('fs');
// Unfortunately, these must be global because of how callbacks work. At least it's only two globals.
var clients = [];
var channels = new Map(); // Map<String, Array<Client>>

// Constants
const httpPort = 80;
app.set('httpsPort', 443);
// const httpPort = 8000; //DEBUG USE ONLY
// app.set('httpsPort', 8443); // DEBUG USE ONLY
//app.set('socketPort', 39000);
app.use(express.static(__dirname + "/public"));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(function (req, res, next) {
	if(!req.secure) {
    		return res.redirect(['https://', req.get('Host'), req.url].join(''));
  	}
  	next();
});

const whitelist = [
  'a',
  'b',
  'i',
  'u',
  'em',
  'strong'
];

const options = {
	key: fs.readFileSync('private-key.pem'),
	cert: fs.readFileSync('public-cert.pem')
};

const nodeServer = https.createServer(options, app);
const io = SocketIO.listen(nodeServer);

const bleachOptions = {
  mode: 'white',
  list: whitelist
};

// Constructors
/* TODO: Maybe refactor this to use the new class keyword? It's technically not different and still prototypical,
	but I like the idea of at least trying out new language features. */
function Client(socket, id) {
	this.socket = socket;
	this.id = id;
	this.dn = '';
	this.admin = false;
	this.mobile = false;
	this.login = false;

	// Object Functions
	this.setDisplayName = function (dn) {
		if (this.dn === '') {
			this.dn = dn;
		} else throw 'You tried to set display name a second time!';
	}

	this.isAdmin = function () {
		return this.admin;
	}

	this.setAdmin = function (bool) {
		this.admin = bool;
	}

	this.setLogin = function (bool) {
		this.login = bool;
	}

	this.userOnMobile = function (bool) {
		this.mobile = bool;
	}
}


function GlobalMessage(msg, msgType, sender) {
	this.msg = msg;
	this.msgType = msgType;
	this.sender = sender;
}

function ChannelMessage(msg, sender, targetCh) {
	this.msg = msg;
	this.msgType = 'channel';
	this.sender = sender;
	this.targetCh = targetCh;
}

function ChannelModMessage(msg, sender, targetCh) {
	this.msg = msg;
	this.msgType = 'channelMod';
	this.sender = sender;
	this.targetCh = targetCh;
}

function ChannelOwnerMessage(msg, sender, targetCh) {
	this.msg = msg;
	this.msgType = 'channelOwner';
	this.sender = sender;
	this.targetCh = targetCh;
}

function ChannelAdminMessage(msg, sender, targetCh) {
	this.msg = msg;
	this.msgType = 'channelAdmin';
	this.sender = sender;
	this.targetCh = targetCh;
}

function Notice(msg, sender) {
	this.msg = msg;
	this.msgType = 'notice';
	if (sender === undefined) {
		this.sender = 'Notice';
	} else {
		this.sender = sender;
	}
}

function PrivateMessage(msg, sender, target) {
	this.msg = msg;
	this.msgType = 'other private';
	this.sender = sender;
	this.target = target;
}

// Server work
app.get('/', function (req, res) {
	res.sendFile(__dirname + req.url);
});

app.get('/chat', function (req, res, next) {
	var cookies = req.cookies;
	var user = cookies.httpUser;
	var User = {};

	if (user !== undefined) {
		User.user = user;
		Database.verifyUser(User, function (dn) {
			res.cookie('dispName', dn, {maxAge: 900000, httpOnly: false})
			next();
		});
	} else {
		next();
	}

}, function (req, res) {
	res.redirect('/chat.html');
});

app.get('/logout', function (req, res) {
	var cookies = req.cookies;
	for (var cookie in cookies) {
	  	if (cookies.hasOwnProperty(cookie)) {
	    	res.clearCookie(cookie);
	  	}
	}
	res.redirect('/');
});

// Socket.io work
io.on('connection', function (socket) {
	console.log('A user connected to ID ' + socket.id);
	clients.push(new Client(socket, socket.id));

	socket.emit('app check');

	socket.on('app check return', function (isMobile) {
		var socketIndex = clients.map(function (e) { 
			return e.id; 
		}).indexOf(socket.id);

		if (isMobile) {
			clients[socketIndex].userOnMobile(true);
		}

		socket.emit('dnCheck');
	});

	socket.on('dnCheckReturn', function (dn) {
		var socketIndex = clients.map(function (e) { 
			return e.id; 
		}).indexOf(socket.id);

		if (dn === '') {
			var randomName = socket.id.toString().substr(0, 10)
			clients[socketIndex].setDisplayName(randomName);
			socket.emit('anonDn', randomName);
		}
		else {
			clients[socketIndex].setDisplayName(dn);
			var user = {};
			user.dn = dn;
			Database.checkAdmin(user, function (bool) {
				if (bool)
					clients[socketIndex].setAdmin(true);
			});
		}

		if (!clients[socketIndex].isAdmin()) {
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
		var san = bleach.sanitize(Msg.msg, bleachOptions);
		if (clients[socketIndex].isAdmin()) {
			socket.broadcast.emit('incoming global message', 
				new GlobalMessage(san, 'admin', Msg.sender));
		} else {
			socket.broadcast.emit('incoming global message', 
				new GlobalMessage(san, 'other', Msg.sender));
		}
	});

	socket.on('channel message', function (Msg) {
		var usersToSendTo = channels.get(Msg.channel); // Array<Client>
		socket.emit('incoming notice', new Notice('Not ready yet.', 'Err'));
	})

	socket.on('notice', function (Msg) {
		var socketIndex = clients.map(function (e) { 
			return e.id; 
		}).indexOf(socket.id);
		if (clients[socketIndex].isAdmin()) {
			console.log('Notice sent: ' + Msg.msg);
			socket.emit('incoming notice', 
				new Notice(Msg.msg, Msg.sender));
			socket.broadcast.emit('incoming notice', 
				new Notice(Msg.msg, Msg.sender));
		} else {
			socket.emit('incoming notice', new Notice('Only admins can'
			+ ' do that.', 'Err'));
		}
	});

	socket.on('private message', function (Msg) {
		console.log('Incoming pm from ' + Msg.sender + ' to ' + 
			Msg.target + ': ' + Msg.msg);
		var toMessage = clients.map(function (e) { 
			return e.dn; 
		}).indexOf(Msg.target);
		if (toMessage !== -1) {
			var socketTarget = clients[toMessage].socket;
			var san = bleach.sanitize(Msg.msg, bleachOptions);
			socketTarget.emit('incoming private message', 
				new PrivateMessage(san, Msg.sender, Msg.target));
		} else {
			socket.emit('incoming notice', 
				new Notice('The user you were trying to send the message' + 
					' to is not connected.', 'Err'))
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

// Login/Registration system
app.post('/signin', function (req, res) {
	console.log('Login attempt received...');
	var User = {user: req.body.username, pw: req.body.password};
	Database.login(User, function (success, id, dn) {
		if (success) {
			console.log('and was successful. User ' + id + ' (' +
				User.user + ') logged in.');
			res.cookie('_id', id, {maxAge: 900000, httpOnly: true});
			res.cookie('httpUser', User.user, 
				{maxAge: 900000, httpOnly: true});
			res.cookie('user', User.user, 
				{maxAge: 900000, httpOnly: false});
			res.send({redirect: '/index.html'});
		} else {
			console.log('and failed user/pw validation.');
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
			if (success) {
				console.log('successfully');
				res.send({redirect: '/index.html'});
			} else if (success === -1) {
				console.log('but username taken');
				res.send({redirect: '/register.html?unsuccessful=user'});
			} else if (success === -2) {
				console.log('but dn taken');
				res.send({redirect: '/register.html?unsuccessful=disp'});
			} else {
				console.log('Error occurred during registration attempt!');
				res.send({redirect: '/register.html?unsuccessful=error'});
			}
		});
	} else {
		console.log('Registration validation failed');
		res.send({redirect: '/register.html?unsuccessful=format'});
	}
});

// Start the server
nodeServer.listen(app.get('httpsPort'), function () {
	console.log('App and Socket.io are HTTPS secured and listening to port '
		+ app.get('httpsPort'));
});

// Redirect stubborn http users
http.createServer(function (req, res) {
    res.writeHead(301, { "Location": "https://" + 
    	req.headers['host'] + req.url });
    res.end();
}).listen(httpPort);

/* To prevent malicious users from editing JS at the web page level 
	to submit bad accounts. */
function validateUser(User) {
	return typeof User === 'object' && typeof User.user === 'string' && 
		typeof User.pw === 'string' && typeof User.dn === 'string' && 
		User.user.match(/\w{4,16}/) && User.pw.length >= 6 && 
		User.dn.match(/\w{1,20}/);
}
