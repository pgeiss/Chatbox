var express = require('express');
var fs = require('fs');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.get('/', function (req, res) {
	res.send(fs.readdirSync(__dirname));
});

app.get('css/', function (req, res) {
	res.sendFile(__dirname + req.url);
});

app.listen(app.get('port'), function () {
  console.log("Node app is running on port:" + app.get('port'));
});