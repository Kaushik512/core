var Process = require("./utils/process");
var fileIo = require('./utils/fileio');
var SSH = require('./utils/sshexec');
var instancesDao = require('./instances.js');
var credentialCrpto = require('./credentialcryptography.js');


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
				        credentialCrpto.decryptCredential(instanceoptions.credentials,function(err,decrptedCredentials){
				        	if(err) {
				        		callback(err);
				        		return;
				        	}
				        	var options = {
				            host : instanceoptions.instanceIP,
				            port : '22',
				            username : decrptedCredentials.username,//'ec2-user',
				            privateKey : decrptedCredentials.pemFileLocation, //'/development/catalyst/D4DFE/D4D/config/catalyst.pem'
				            password : decrptedCredentials.password
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
				            sshConnection.exec(cmd, function(err,code){
				            	if(decrptedCredentials.pemFileLocation) {
				            	  fileIo.removeFile(decrptedCredentials.pemFileLocation,function(){
				            	  	console.log('temp file deleted');
				            	  });
	
				            	}

				            	  callback(err,code);
                                
				            }, callbackOnStdOut, callbackOnStdErr);

				        });



						
        }
    });
	}
}

module.exports = Docker;

