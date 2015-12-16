var logger = require('_pr/logger')(module);
var mongoose = require('mongoose');
var extend = require('extend');

var defaults = {
	host: 'localhost',
	port: '27017',
	dbName: 'test'
};

module.exports = function(options, callback) {
	var def = extend({},defaults);
	options = extend(def,options);
	logger.debug(options);
	logger.debug(defaults);
	var connectionString = 'mongodb://';

	connectionString += options.host;

	connectionString += ':' + options.port;

	connectionString += '/' + options.dbName;
	logger.debug(connectionString);
	mongoose.connect(connectionString,{auto_reconnect: true});

	mongoose.connection.on('connected', function() {
		callback(null);
	});


	mongoose.connection.on('error', function(err) {
		callback(err);
	});


};