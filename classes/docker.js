var Process = require("./utils/process");
var fileIo = require('./utils/fileio');
var SSH = require('./utils/sshexec');


var Docker = function(){
	var that = this;
	this.runDockerCommands = function (cmd,instanceid, callback, callbackOnStdOut, callbackOnStdErr) {
		
        console.log('reached docker cmd');
		var options = {
            host : '54.148.63.43',
            port : '22',
            username : 'ec2-user',
            privateKey : '/development/catalyst/D4DFE/D4D/config/catalyst.pem'
            
        };

		 var sshParamObj = {
                host: options.host,
                port: options.port,
                username: options.username
            };
            if (options.privateKey) {
                sshParamObj.privateKey = options.privateKey;
                if (options.passphrase) {
                    sshParamObj.passphrase = options.passphrase;
                }
            } else {
                sshParamObj.password = options.password;
            }
            var sshConnection = new SSH(sshParamObj);

            sshConnection.exec(cmd, callback, callbackOnStdOut, callbackOnStdErr);
	}
}

module.exports = Docker;

