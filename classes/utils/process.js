var childProcess = require('child_process');
var util = require('util');
var nodeExtend = require('node.extend');

var defaults = {
	cwd: null,
};

var Process = function(appPath, argList, options) {
	var spawn = childProcess.spawn;
	var proc = null;
	var processRunning = false;
	var onStdOut = null;
	var onStdErr = null;
	var onClose = null;
	var onError = null;



	if (options) {
		options = nodeExtend(defaults, options);
	} else {
		options = defaults;
	}

	if (options.onError) {
		onError = options.onError;
		options.onError = null;
	}

	if (options.onStdOut) {
		onStdOut = options.onStdOut;
		options.onStdOut = null;
	}
	if (options.onStdErr) {
		onStdErr = options.onStdErr;
		options.onStdErr = null;
	}
	if (options.onClose) {
		onClose = options.onClose;
		options.onClose = null;
	}


	if (!util.isArray(argList)) {
		argList = [];
	}

	this.start = function() {
		proc = spawn(appPath, argList, options);
		processRunning = true;
		if (typeof onStdOut === 'function') {
			proc.stdout.on('data', function(data) {
				//console.log('stdout: ==> ' + data);
				onStdOut(data);
			});
		}

		if (typeof onStdErr === 'function') {
			proc.stderr.on('data', function(errData) {
				//console.log('stderr: ==> ' + errData);
				onStdErr(errData);
			});
		}
		if (typeof onClose === 'function') {
			proc.on('close', function(code) {
				processRunning = false;
				onClose(code);
			});

		}
		if (typeof onError === 'function') {
			proc.on('error', function(error) {
				processRunning = false;
				console.log("Error is spawning process");
				console.log(error);
				onError(error);
			});
		}
	}

	this.write = function(data) {
		if(proc && processRunning) {
         proc.stdin.write(data);
		} else {
           onError('Process is not running');
		}
	}

}

module.exports = Process;