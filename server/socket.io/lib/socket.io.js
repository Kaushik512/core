/*
Maintains a single instance of socket.io through out the application 
*/

var Server = require('socket.io');

var io;

function initAuth(io, authFunc) {
	// authorization
	if (typeof authFunc === 'function') {
		io.use(authFunc);
	}
}


module.exports.getInstance = function(httpOrPort, opts) {
	if (io) {
		return io;
	}
	if (httpOrPort) {
		io = Server(httpOrPort, opts);
	} else {
		io = Server(opts);
	}
	initAuth(io, opts.authFunc);
	return io;
};