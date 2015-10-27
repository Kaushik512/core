var Client = require('node-rest-client').Client;
var SSHExec = require('./utils/sshexec');
var logger = require('_pr/logger')(module);

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
            client = new Client();
            var vmlisturl = servicehost + '/vms?ip=' + options.host + '&user=' + options.username + '&passwd=' + options.password + '&dc=' + options.dc;
            console.log(vmlisturl);
            client.registerMethod("jsonMethod", vmlisturl, "GET");
            var args = {};
            client.methods.jsonMethod(args, function(data, response) {
                console.log("get vmlisturl response::" + data + ' :: end of data');
                callback(null,data);
            });
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
            console.log("get datastoresUrl response::" + data + ' :: end of data');
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
        var datastoresUrl = servicehost + '/' + templatename + '/clone?ip=' + options.host + '&user=' + options.username + '&passwd=' + options.password + '&dc=' + options.dc;
        console.log(datastoresUrl);

        client.registerMethod("postMethod", datastoresUrl, "POST");
        var args = {
            data: JSON.stringify(serverjson),
            headers:{"Content-Type": "application/json"} 
        };
        //console.log(JSON.stringify(args));
        //callback(null,serverjson);
        client.methods.postMethod(args, function(data, response) {
            //response format expected  {"vms_launched":["D4D-MYVMWBP1_2015-10-20_23_46_21_817"]}
            console.log("get createServer response::" + data);
            //if(data.indexOf('Completed') >= 0){
            data = JSON.parse(data);
            if(data.vms_launched && data.vms_launched.length > 0){
                serverjson["vm_name"] = data.vms_launched[0];
                callback(null,serverjson);    
            }
            else
                callback("Error",null);
            
        });
    }

    this.getServerDetails = function(servicehost,servername,callback){
            client = new Client();
        var datastoresUrl = servicehost + '/' + servername + '/info?ip=' + options.host + '&user=' + options.username + '&passwd=' + options.password + '&dc=' + options.dc;
        console.log(datastoresUrl);
        client.registerMethod("jsonMethod", datastoresUrl, "GET");
        var args = {};
        client.methods.jsonMethod(args, function(data, response) {
            data = data.toString();
            if(data.indexOf('Not Found') > 0)
            {
                console.log("No VM Found - Response :" + data);
                callback(null,null);
            }else{
                console.log("get getServerDetails response::" + data);
                callback(null,data);
            }
        });
    };

    

    this.updatedfloatingip = false;


    this.trysshoninstance = function(hostip,username,pwd, callback) {
        var opts = {
            password: pwd,
            username: username,
            host: hostip,
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

    this.waitforserverready = function(servicehost, servername,username,password, callback) {
        var self = this;
        console.log('Waiting for :', servername);
        var wfsr = function() {
            self.getServerDetails(servicehost, servername, function(err, data) {
                if (err) {
                    callback(err, null);
                    return;
                }
                if (!err && data != null) {
                    data = JSON.parse(data);
                    console.log('Quried server:', JSON.stringify(data));
                    //response {"name":"D4D-MYVMWBP1_2015-10-21_00_12_59_159","ip":"192.168.102.154","OS":"Ubuntu Linux (64-bit)","toolsStatus":"guestToolsRunning","state":"poweredOn","cpuUsage":{"used":0,"num":1},"memory":{"avail":1024,"used":0},"uptime":1195}
                    if(data.toolsStatus && data.ip && data.toolsStatus == 'guestToolsRunning'){

                        self.trysshoninstance(data.ip,username,password,function(cdata){
                            if(cdata == 'ok'){
                                for (var i = 0; i < self.timeouts.length; i++) {
                                    logger.debug('Clearing timeout : ', self.timeouts[i]);
                                    clearTimeout(self.timeouts[i]);
                                }
                                self.timeouts = [];
                                if (!self.callbackdone) {
                                    self.callbackdone = true;
                                    callback(null, data.ip);
                                    return;
                                }
                                else{
                                    logger.debug('Timeout 1 set');
                                    if (!self.callbackdone) {
                                        self.timeouts.push(setTimeout(wfsr, 30000));
                                    }
                                }
                            }
                        });
                    }
                    else{
                        if (!self.callbackdone)
                        {
                            logger.debug('Timeout 4 set');
                            self.timeouts.push(setTimeout(wfsr, 30000));
                        }
                    }
                }
                 else{
                        
                        if (!self.callbackdone) {
                            logger.debug('Timeout 2 set');
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