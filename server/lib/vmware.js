var Client = require('node-rest-client').Client;
var SSHExec = require('./utils/sshexec');
var logger = require('_pr/logger')(module);
var waitForPort = require('wait-for-port');

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



    this.validateUser = function(servicehost, callback) {
        //to do
    }

    this.getVms = function(servicehost, callback) {
        //to do
    }

    this.getTemplates = function(servicehost, callback) {
        //to do
    }

    this.startstopVM = function(servicehost, vm_name, action, callback) {
        //to do
        client = new Client();
        var datastoresUrl = servicehost + '/' + vm_name + '/' + action + '?ip=' + options.host + '&user=' + options.username + '&passwd=' + options.password + '&dc=' + options.dc;
        console.log(datastoresUrl);
        client.registerMethod("jsonMethod", datastoresUrl, "PUT");
        var args = {};
        client.methods.jsonMethod(args, function(data, response) {
            console.log("get datastoresUrl response::" + data);
            callback(null, data);
        });

    }


    this.getDatastores = function(servicehost, callback) {
        client = new Client();
        console.log(servicehost);
        var datastoresUrl = servicehost + '/datastores?ip=' + options.host + '&user=' + options.username + '&passwd=' + options.password + '&dc=' + options.dc;
        console.log(datastoresUrl);
        client.registerMethod("jsonMethod", datastoresUrl, "GET");
        var args = {};
        client.methods.jsonMethod(args, function(data, response) {
            console.log("get datastoresUrl response::" + data);
            callback(null, data);
        });
    }

    this.getHosts = function(servicehost, callback) {
        //to do
    }

    this.getClusters = function(servicehost, callback) {
        //to do
    }

    this.createServer = function(servicehost, templatename, serverjson, callback) {
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
            headers: {
                "Content-Type": "application/json"
            }
        };
        //console.log(JSON.stringify(args));
        // callback(null,serverjson);
        client.methods.postMethod(args, function(data, response) {
            console.log("get create server response::" + data);
            try {
                data = JSON.parse(data);
            } catch (err) {
                callback(err, null);
                return;
            }
            if (data.vms_launched && data.vms_launched.length > 0) {
                serverjson["vm_name"] = data.vms_launched[0];
                callback(null, serverjson);
            } else
                callback("Error", null);

        });
    }

    this.getServerDetails = function(servicehost, servername, callback) {
        client = new Client();
        var datastoresUrl = servicehost + '/' + servername + '/info?ip=' + options.host + '&user=' + options.username + '&passwd=' + options.password + '&dc=' + options.dc;
        console.log(datastoresUrl);
        client.registerMethod("jsonMethod", datastoresUrl, "GET");
        var args = {};
        client.methods.jsonMethod(args, function(data, response) {
            data = data.toString();
            if (data.indexOf('Not Found') > 0) {
                console.log("No VM Found - Response :" + data);
                callback(null, null);
            } else {
                console.log("get getServerDetails response::" + data);
                callback(null, data);
            }
        });
    };



    this.updatedfloatingip = false;


    this.trysshoninstance = function(hostip, username, pwd, callback) {
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
        sshExec.exec(cmdString, function(err, retCode) {
            if(err) {
                callback(err,null);
                return;
            }
            if(retCode === 0) {
               callback(null,retCode);
            
            } else {
              callback({
                message:"error runnning cmd",
                code:retCode
              },null);
            }
            return;
        }, function(err, stdout) {
            console.log('Out:', stdout);
            return;
        }, function(err, stdout) {
            console.log('Error Out:', stdout);
        });

    };

    this.waitForPortOnInstance = function(hostip, callback) {
         waitForPort(hostip, 22, function(err) {
                                            if (err) {
                                                console.log(err);
                                                callback(err);
                                                return;
                                            }
                                             callback(null);
                                        });

    };
    
    this.waitforserverready = function(servicehost, servername, username, password, callback) {
        var self = this;
        console.log('Waiting for :', servername);
        var count = 0;
        var limit = 20;
        function wfsr() {
            count++;
            self.getServerDetails(servicehost, servername, function(err, data) {
                if (err) {
                    callback(err, null);
                    return;
                }
                    try {
                      data = JSON.parse(data);
                    } catch(err){
                        console.log(err);
                        logger.debug('Timeout set in catch');
                        if (count<limit) {
                             logger.debug('Timeout 4 set in catch count ==> '+count);
                             setTimeout(wfsr, 30000);
                            } else {
                              callback({
                                  message:"Instance is not responding"
                                 });
                            }
                        return;
                    }

                    console.log('Quried server:', JSON.stringify(data));
                    //response {"name":"D4D-MYVMWBP1_2015-10-21_00_12_59_159","ip":"192.168.102.154","OS":"Ubuntu Linux (64-bit)","toolsStatus":"guestToolsRunning","state":"poweredOn","cpuUsage":{"used":0,"num":1},"memory":{"avail":1024,"used":0},"uptime":1195}
                    if (data && data.toolsStatus && data.ip && data.toolsStatus == 'guestToolsRunning') {
                        self.waitForPortOnInstance(data.ip, function(err) {
                            if(err) {
                                if (count<limit) {
                              logger.debug('Timeout 4 set count ==> '+count);
                              setTimeout(wfsr, 30000);
                            } else {
                              callback({
                                  message:"Instance is not responding"
                               });
                            }
                            return;

                            }
                                logger.debug('anshul ==> calling callback');
                                callback(null, data.ip, data);
                                return;
                             
                            
                        });
                    } else {
                        if (count<limit) {
                            logger.debug('Timeout 4 set '+count);
                            setTimeout(wfsr, 30000);
                        } else {
                            callback({
                                message:"Instance is not responding"
                            });
                            return;
                        }
                    }
               
            });
        };
        console.log('Timeout 3 set');
        setTimeout(wfsr, 15000);
    }
}



module.exports = vmwareservice;