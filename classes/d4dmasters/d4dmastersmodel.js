var mongoose = require('mongoose');
var uuid = require('node-uuid'); //used for generating unique id

var d4dMastersSchema = new mongoose.Schema({
	id: String,
	masterjson: Object
});

var d4dModel = mongoose.model('d4dMaster', d4dMastersSchema);


module.exports = d4dModel;