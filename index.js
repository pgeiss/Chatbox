var express = require('express');
var mongo = require('mongodb');
var database = require('./database.js');
var app = express();

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname));

app.get('/', function (req, res) {
	res.sendFile(req.url);
});

app.post('/', function (req, res) {
	console.log(check());
});

app.listen(app.get('port'), function () {
  console.log("Node app is running on port:" + app.get('port'));
});