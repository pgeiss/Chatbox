var MongoDB = require('mongodb');
var Client = require('mongodb').MongoClient;
var Server = require('mongodb').Server;

var host = process.env.MONGOLAB_URI;

MongoClient.connect(host, function (err, db) {
	test.equal(null, err);
	test.ok(db != null);

	db.collection("replicaset_mongo_client_collection").update({a:1}, {b:1}, {upsert:true}, function(err, result) {
	    test.equal(null, err);
	    test.equal(1, result);

	    db.close();
	    test.done();
    });
});

exports.check() {
	var toReturn = '';
	MongoClient.connect(host, function (err, db) {
		toReturn = db.collectionNames('accounts');
		db.close();
	});
}