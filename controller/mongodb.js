var mongoose = require('mongoose');
var extend = require('node.extend');

var defaults = {
	host: 'localhost',
	port: '27017',
	dbName: 'test'
};

module.exports = function(options, callback) {
	options = extend(defaults, options);
	var connectionString = 'mongodb://';

	connectionString += options.host;

	connectionString += ':' + options.port;

	connectionString += '/' + options.dbName;
	console.log(connectionString);
	mongoose.connect(connectionString);

	mongoose.connection.on('connected', function() {
		callback(null);
	});


	mongoose.connection.on('error', function(err) {
		callback(err);
	});


};