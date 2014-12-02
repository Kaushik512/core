var Process = require("./utils/process");
var fileIo = require('./utils/fileio');
var SSH = require('./utils/sshexec');
var instancesDao = require('./instances.js');


var Docker = function(){
	var that = this;
	this.runDockerCommands = function (cmd,instanceid, callback, callbackOnStdOut, callbackOnStdErr) {
		console.log(instanceid);
		  instancesDao.getInstanceById(instanceid, function(err, data) {
            if (err) {
                res.send(500);
                return;
            }
            if (data.length) {
            			console.log(data[0]);
				        console.log('reached docker cmd');
				        var instanceoptions = data[0];
						var options = {
				            host : instanceoptions.instanceIP,
				            port : '22',
				            username : instanceoptions.credentials.username,//'ec2-user',
				            privateKey : instanceoptions.credentials.pemFileLocation, //'/development/catalyst/D4DFE/D4D/config/catalyst.pem'
				            password : instanceoptions.credentials.password
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
    });
	}
}

module.exports = Docker;

