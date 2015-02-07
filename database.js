var MongoDB = require('mongodb');
var Client = MongoDB.MongoClient;
var Server = MongoDB.Server;

var host = process.env.MONGOLAB_URI;

MongoClient.connect(host, function (err, db) {
	if (err)
		console.log(err);
	test.equal(null, err);
	test.ok(db != null);

	db.collection("replicaset_mongo_client_collection").update({a:1}, {b:1}, {upsert:true}, function(err, result) {
	    test.equal(null, err);
	    test.equal(1, result);

	    db.close();
	    test.done();
    });
});

exports.check = function () {
	var toReturn = '';
	MongoClient.connect(host, function (err, db) {
		if (err)
			console.log(err);

		toReturn = db.collectionNames('accounts');
		db.close();
	});
}