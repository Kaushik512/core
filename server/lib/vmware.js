var Client = require('node-rest-client').Client;
var SSHExec = require('./utils/sshexec');

function getAuthToken(host, username, password, tenantName, callback) {
    console.log("START:: getAuthToken");
    var args = {
        data: {
            "auth": {
                "tenantName": tenantName,
                "passwordCredentials": {
                    "username": username,
                    "password": password
                }
            }
        },
        headers: {
            "Content-Type": "application/json"
        }
    };

    client = new Client();
    var authUrl = host + 'tokens';
    console.log('authUrl', authUrl);
    client.registerMethod("postMethod", authUrl, "POST");
    client.methods.postMethod(args, function(data, response) {
        //console.log('Auth Response:',response);
        if (data.access) {
            console.log("Auth Token: " + data.access.token.id);
            console.log("END:: getAuthToken");
            callback(null, data.access.token.id);
            return;
        } else {
            console.log("Error in getAuthToken");
            callback(data, null);
        }
    });

}

var vmwareservice = function(options) {

   

    this.validateUser = function(servicehost,callback){
        //to do
    }

    this.getVms = function(servicehost,callback){
            //to do
    }

    this.getTemplates = function(servicehost,callback){
        //to do
    }

    this.getDatastores = function(servicehost,callback){
        client = new Client();
        var datastoresUrl = servicehost + '/datastores?ip=' + options.host + '&user=' + options.username + '&passwd=' + options.password + '&dc=' + options.dc;
        console.log(datastoresUrl);
        client.registerMethod("jsonMethod", datastoresUrl, "GET");
        var args = {};
        client.methods.jsonMethod(args, function(data, response) {
            console.log("get datastoresUrl response::" + data);
            callback(null,data);
        });
    }

    this.getHosts = function(servicehost,callback){
            //to do
    }

    this.getClusters = function(servicehost,callback){
            //to do
    }

    this.createServer = function(servicehost,templatename,serverjson,callback){
        /*sample serverjson
        var serverjson = {"vm_name" : " ",
        "ds" : " ",
        "no_of_vm" : " "
        } */
        client = new Client();
        var datastoresUrl = servicehost + '/' + templatename + '/?ip=' + options.host + '&user=' + options.username + '&passwd=' + options.password + '&dc=' + options.dc;
        console.log(datastoresUrl);
        client.registerMethod("jsonMethod", datastoresUrl, "GET");
        var args = {
            data: serverjson
        };
        client.methods.jsonMethod(args, function(data, response) {
            console.log("get datastoresUrl response::" + data);
            callback(null,data);
        });
    }


    

    this.updatedfloatingip = false;


    this.trysshoninstance = function(instanceData, callback) {
        var opts = {
            privateKey: instanceData.credentials.pemFilePath,
            username: instanceData.credentials.username,
            host: instanceData.floatingipdata.floatingip.floating_ip_address,
            instanceOS: 'linux',
            port: 22,
            cmds: ["ls -al"],
            cmdswin: ["del "]
        }
        var cmdString = opts.cmds.join(' && ');
        console.log(JSON.stringify(opts));
        var sshExec = new SSHExec(opts);
        sshExec.exec(cmdString, function(err, stdout) {
            console.log(stdout);
            callback(stdout);
            return;
        }, function(err, stdout) {
            console.log('Out:', stdout); //assuming that receiving something out would be a goog sign :)
            callback('ok');
            return;
        }, function(err, stdout) {
            console.log('Error Out:', stdout);
        });

    }
    this.timeouts = [];
    this.callbackdone = false;

    this.waitforserverready = function(tenantId, instanceData, callback) {
        var self = this;
        console.log('instanceData received:', JSON.stringify(instanceData));
        var wfsr = function() {
            self.getServerById(tenantId, instanceData.server.id, function(err, data) {
                if (err) {
                    callback(err, null);
                    return;
                }
                if (!err) {
                    console.log('Quried server:', JSON.stringify(data));
                    if (data.server.status == 'ACTIVE') {
                        //set the floating ip to instance
                        if (instanceData.floatingipdata.floatingip.floating_ip_address && !self.updatedfloatingip)
                            self.updatefloatingip(tenantId, instanceData.floatingipdata.floatingip.floating_ip_address, instanceData.server.id, function(err, data) {
                                if (!err) {
                                    self.updatedfloatingip = true;
                                    console.log('Updated with floating ip');
                                }
                            });
                    }
                    if (self.updatedfloatingip) {
                        self.trysshoninstance(instanceData, function(cdata) {
                            console.log('End trysshoninstance:', cdata);
                            if (cdata == 'ok') {
                                //Clearing all timeouts
                                console.log('Time outs found :', self.timeouts.length);
                                for (var i = 0; i < self.timeouts.length; i++) {
                                    console.log('Clearing timeout : ', self.timeouts[i]);
                                    clearTimeout(self.timeouts[i]);
                                }
                                self.timeouts = [];
                                if (!self.callbackdone) {
                                    self.callbackdone = true;
                                    callback(null, instanceData);
                                }

                                return;
                            } else {
                                console.log('Timeout 1 set');
                                if (!self.callbackdone)
                                    self.timeouts.push(setTimeout(wfsr, 30000));
                            }
                        });
                    } else {
                        console.log('Timeout 2 set');
                        if (!self.callbackdone)
                            self.timeouts.push(setTimeout(wfsr, 30000));
                    }

                }
            });
        };
        console.log('Timeout 3 set');
        self.timeouts.push(setTimeout(wfsr, 15000));
    }
}



// this.waitforserverready1 = function(tenantId,serverId,callback){
// 	var self = this;
// 	var checkifserverready = function(){
// 		 self.getServerById(tenantId,serverId,function(err,data){
// 	                if (err) {
// 	                	callback(err, null);
// 	                	return;
// 	            	}
// 	                if(!err){
// 	                        var networks = Object.keys(data.server.addresses);
// 	                        if(networks.length > 0){

// 	                        }
// 	                        else{

// 	                        }
// 	                }
// 	        });
// 	}
// }


module.exports = vmwareservice;