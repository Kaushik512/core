var mongoose = require('mongoose');
var uuid = require('node-uuid'); //used for generating unique id

var d4dMastersSchema = new mongoose.Schema({
	id: String,
	masterjson: Object
});

var d4dModel = mongoose.model('d4dMaster', d4dMastersSchema);

/*
mongoose.connection.db.collectionNames(function(error, names) {
	if (error) {
		throw new Error(error);
	} else {
		names.map(function(cname) {
			console.log(cname.name);
		});
	}
});
*/

module.exports = d4dModel;