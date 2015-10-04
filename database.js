var MongoDB = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var Backend = require('./databaseBackend.js');

var host = Backend.uri;


/* Some ideas for how the DB connection might work. I left the actual
	functions out for security purposes. */
/* MongoClient.connect(host, function (err, db) {
	mongoFind(db, 'chatbox', {"a":"b"}, function (data) {
		db.close();
	})
});

function mongoFind(db, collectionName, data, cb) {
    var collection = db.collection(collectionName);
    var stream = collection.find(data).stream();
	stream.on("data", function(item) {console.log(item.a)});
	stream.on("end", function() {cb();});
} */

exports.register = function (user, pw, cb) {
	MongoClient.connect(host, function (err, db) {
		if (err) {
			console.log(err);
		}
		else {
			Backend.registerUser(user, pw, db, cb);
		}
	});
}