var sys = require('sys');
var exec = require('child_process').exec;
var SSHExec = require('./utils/sshexec');
var logger = require('_pr/logger')(module);
var Process = require("./utils/process");
var Curl = require("./utils/curl.js");
var appConfig = require('_pr/config');

var path = require('path');
var fs = require('fs');
var request = require('request');
var xml = require('xml');
var xml2json = require('xml2json');

function execute(cmd, isJsonResponse, callback) {
    // logger.debug("START of executing issued command");
    // exec(cmd, function(error, stdout, stderr){ 
    //  if(error){
    //      logger.error("Error",error);
    //      callback(error,null);
    //      return
    //  }
    //  if(stderr){
    //      logger.error("Std error",stderr);
    //      callback(stderr,null);
    //      return;
    //  }

    //    if(isJsonResponse){   
    //       var json = JSON.parse(stdout);
    //       //console.log("Json:", json)
    //       callback(null,json); 
    //       return;
    //     }
    //     callback(null,stdout); 
    //    });
    var output = '';
    var options = {
        onError: function(err) {
            callback(err, null);
        },
        onClose: function(code) {
            if (code === 0) {
                if (isJsonResponse) {
                    var json = JSON.parse(output);
                    //console.log("Json:", json)
                    callback(null, json);
                    return;
                }
                callback(null, output);
            } else {
                callback({
                    code: code
                }, null)
            }
        }
    };
    options.onStdOut = function(data) {
        logger.debug('Process out :', data.toString());
        output = output + data.toString();
    };
    options.onStdErr = function(data) {
        logger.debug('Process stderr out ==> :', data.toString());
    };

    var proc = new Process(cmd, [], options);
    proc.start();


}


function constructXmlInputBody(params) {

    logger.debug("START:: constructXmlInputBody for VM creation:: ");

    /*var createVMcmd = "azure vm create " +  + " " +  + " " +  + " " +  + " -z \"" +  + "\" -l \"" + params.location + "\" " + params.remoteCon + " " + params.port + " -w " +  + " -b " + params.subnet;
    
    /*Defining configuration sets template*/
    var configurationSets = {};
    configurationSets.ConfigurationSets = [];

    /*Defining Network Configuration Template*/
    var networkConfigurationTemplate = {
        ConfigurationSet: [{
            ConfigurationSetType: ""
        }, {
            InputEndpoints: []
        }]
    };

    networkConfigurationTemplate.ConfigurationSet[0].ConfigurationSetType = "NetworkConfiguration";

    if (params.os === "windows") {

        /*start of template for windows type machines configuration */
        var windowsProvisioningConfigurationTemplate = {
            ConfigurationSet: [{
                _attr: ""
            }, {
                ConfigurationSetType: ""
            }, {
                ComputerName: ""
            }, {
                AdminPassword: ""
            }, {
                AdminUsername: ""
            }]
        };

        windowsProvisioningConfigurationTemplate.ConfigurationSet[0]._attr = {
            "i:type": 'WindowsProvisioningConfigurationSet'
        };
        windowsProvisioningConfigurationTemplate.ConfigurationSet[1].ConfigurationSetType = "WindowsProvisioningConfiguration";
        windowsProvisioningConfigurationTemplate.ConfigurationSet[2].ComputerName = params.VMName;
        windowsProvisioningConfigurationTemplate.ConfigurationSet[3].AdminPassword = params.password;
        windowsProvisioningConfigurationTemplate.ConfigurationSet[4].AdminUsername = params.username;
        /*end of template for windows type machines configuration */

        configurationSets.ConfigurationSets.push(windowsProvisioningConfigurationTemplate);

        /*start of template for windows 5985 port creation */
        var inputEndpointsTemplate = {
            InputEndpoint: [{
                LocalPort: ""
            }, {
                Name: ""
            }, {
                Port: ""
            }, {
                Protocol: ""
            }]
        };
        inputEndpointsTemplate.InputEndpoint[0].LocalPort = "5985";
        inputEndpointsTemplate.InputEndpoint[1].Name = "winRM";
        inputEndpointsTemplate.InputEndpoint[2].Port = "5985";
        inputEndpointsTemplate.InputEndpoint[3].Protocol = "tcp";
        /*end of template for windows 5985 port creation */

        networkConfigurationTemplate.ConfigurationSet[1].InputEndpoints.push(inputEndpointsTemplate);

        /*start of template for windows rdp port creation */
        var inputEndpointsTemplate1 = {
            InputEndpoint: [{
                LocalPort: ""
            }, {
                Name: ""
            }, {
                Port: ""
            }, {
                Protocol: ""
            }]
        };
        inputEndpointsTemplate1.InputEndpoint[0].LocalPort = "3389";
        inputEndpointsTemplate1.InputEndpoint[1].Name = "rdp";
        inputEndpointsTemplate1.InputEndpoint[2].Port = "3389";
        inputEndpointsTemplate1.InputEndpoint[3].Protocol = "tcp";
        /*end of template for windows rdp port creation */

        networkConfigurationTemplate.ConfigurationSet[1].InputEndpoints.push(inputEndpointsTemplate1);

    } else {
        /*start of template for linux type machines configuration */
        var linuxProvisioningConfigurationTemplate = {
            ConfigurationSet: [{
                _attr: {
                    "i:type": 'LinuxProvisioningConfigurationSet'
                }
            }, {
                ConfigurationSetType: "LinuxProvisioningConfigurationSet"
            }, {
                HostName: params.VMName
            }, {
                UserName: params.username
            }, {
                UserPassword: params.password
            }, {
                DisableSshPasswordAuthentication: "false"
            }]
        };

        /*end of template for linux type machines configuration */

        configurationSets.ConfigurationSets.push(linuxProvisioningConfigurationTemplate);

        /*start of default endpoint template for ssh port*/
        var inputEndpointsTemplate = {
            InputEndpoint: [{
                LocalPort: ""
            }, {
                Name: ""
            }, {
                Port: ""
            }, {
                Protocol: ""
            }]
        };
        inputEndpointsTemplate.InputEndpoint[0].LocalPort = "22";
        inputEndpointsTemplate.InputEndpoint[1].Name = "ssh";
        inputEndpointsTemplate.InputEndpoint[2].Port = "22";
        inputEndpointsTemplate.InputEndpoint[3].Protocol = "tcp";
        /*end of default endpoint template for ssh port*/

        networkConfigurationTemplate.ConfigurationSet[1].InputEndpoints.push(inputEndpointsTemplate);
    }

    var endpointsPorts = params.endpoints;

    logger.debug("endpointsPorts >>", endpointsPorts);

    var port = endpointsPorts.split(',')[0];

    logger.debug('Creating endpoint CatEndpoint template', port);

    if (port != "22" && port != "5985" && port != "3389") {
        var inputEndpointsTemplate = {
            InputEndpoint: [{
                LocalPort: ""
            }, {
                Name: ""
            }, {
                Port: ""
            }, {
                Protocol: ""
            }]
        };
        inputEndpointsTemplate.InputEndpoint[0].LocalPort = port;
        inputEndpointsTemplate.InputEndpoint[1].Name = "catEndpoint";
        inputEndpointsTemplate.InputEndpoint[2].Port = port;
        inputEndpointsTemplate.InputEndpoint[3].Protocol = "tcp";

        networkConfigurationTemplate.ConfigurationSet[1].InputEndpoints.push(inputEndpointsTemplate);
    }

    configurationSets.ConfigurationSets.push(networkConfigurationTemplate);

    /*start of template for vm role definition */
    var roleTemplate = {
        Role: [{
                RoleName: ""
            }, {
                RoleType: ""
            },
            configurationSets, {
                VMImageName: ""
            }, {
                RoleSize: ""
            }
        ]
    };
    roleTemplate.Role[0].RoleName = params.VMName;
    roleTemplate.Role[1].RoleType = "PersistentVMRole";
    roleTemplate.Role[3].VMImageName = params.imageName;
    roleTemplate.Role[4].RoleSize = params.size;
    /*start of template for vm role definition */

    var roleListTemplate = {
        RoleList: [roleTemplate]
    };

    /*start of template for deployment definition */
    var deploymentTemplate = {
        Deployment: [{
            _attr: {
                xmlns: "http://schemas.microsoft.com/windowsazure",
                "xmlns:i": "http://www.w3.org/2001/XMLSchema-instance"
            }
        }, {
            Name: params.VMName
        }, {
            DeploymentSlot: "Production"
        }, {
            Label: params.VMName
        }, {
            RoleList: [roleTemplate]
        }, {
            VirtualNetworkName: params.vnet
        }]
    };
    /*end of template for deployment definition */

    var xmlString = xml(deploymentTemplate);

    logger.debug("constructXmlInputBody output:", xmlString);
    logger.debug("END:: constructXmlInputBody for VM creation:: ");

    return xmlString;

}

function constructCloudServiceReqBody(cloudService, location) {
    logger.debug("START:: constructCloudServiceReqBody");

    //var base64_encode = require('base64').encode;
    //var Buffer = require('buffer').Buffer;

    var base64_label = new Buffer(cloudService).toString('base64');

    logger.debug('Construct base64 without base64 module:', base64_label);

    //var base64_label = base64_encode(buf);

    var cloudServiceTemplate = {
        CreateHostedService: [{
            _attr: {
                xmlns: "http://schemas.microsoft.com/windowsazure"
            }
        }, {
            ServiceName: cloudService
        }, {
            Label: base64_label
        }, {
            Description: "Catalyst cloud service"
        }, {
            Location: location
        }]
    }

    var xmlString = xml(cloudServiceTemplate);

    logger.debug("constructCloudServiceReqBody output:", xmlString);
    logger.debug("END:: constructCloudServiceReqBody");

    return xmlString;
}

var AzureCloud = function(options) {

    /*var options = {
        subscriptionId: "f2c53cd4-5d0f-4c6d-880b-6af801de9b21",
        certLocation: "/Office/Work/Azure/certs/management.pem",
        keyLocation: "/Office/Work/Azure/certs/management.key"
    };*/

    var certFile = path.resolve(__dirname, options.certLocation);
    var keyFile = path.resolve(__dirname, options.keyLocation);

    this.setSubscriptionById = function(id, callback) {
        var setSubscriptionCmd = "azure account set " + id;

        execute(setSubscriptionCmd, false, function(err, data) {
            if (err) {
                logger.error("Error in setting subscription:", err);
                callback(err, null);
                return;
            }

            logger.debug("Set SubscriptionById is success", data);
            callback(null, data);
            return;
        });
    }

    this.setStorageByName = function(name, callback) {
        var setStorageCmd = "azure storage account set " + name;

        execute(setStorageCmd, false, function(err, data) {
            if (err) {
                logger.error("Error in setting storage by name:", err);
                callback(err, null);
                return;
            }

            logger.debug("Set StorageByName is success", data);
            callback(null, data);
            return;
        });
    }

    this.listVM = function(callback) {
        execute("azure vm list --json", true, function(err, data) {
            if (err) {
                logger.error("Error in listing VM's:", err);
                callback(err, null);
                return;
            }

            logger.debug("Number of VM's:", data.length);
            callback(null, data);
            return;
        });
    }

    this.getLocations = function(callback) {
        /*execute("azure vm location list --json", true, function(err, data) {
            if (err) {
                logger.error("Error in listing locations:", err);
                callback(err, null);
                return;
            }

            logger.debug("Number of locations:", data.length);
            callback(null, data);
            return;
        });*/
        logger.debug("START:: getLocations");
        fs.readFile(certFile, function(err, certData) {
            if (err) {
                logger.error("Error reading certFile..", err);
                return;
            }
            logger.debug("certFile loaded");
            fs.readFile(keyFile, function(err, keyData) {
                if (err) {
                    logger.error("Error reading keyFile..", err);
                    return;
                }
                logger.debug("keyFile loaded");
                var opts = {
                    url: "https://management.core.windows.net/" + options.subscriptionId + "/locations",
                    agentOptions: {
                        cert: certData,
                        key: keyData,
                    },
                    headers: {
                        "x-ms-version": "2015-04-01"
                    }
                }

                request.get(opts, function(err, response, body) {

                    logger.debug("getLocations response.statusCode: ", response.statusCode);

                    if (err) {
                        logger.error("Error...", err);
                        callback(err, null);
                        return;
                    }

                    if (response.statusCode == '200') {
                        logger.debug("END:: getLocations");
                        callback(null, body);
                        return;
                    } else {
                        callback(body, null);
                        return;
                    }

                });

            });

        });

    }

    this.getNetworks = function(callback) {
        /*execute("azure network vnet list --json", true, function(err, data) {
            if (err) {
                logger.error("Error in listing networks:", err);
                callback(err, null);
                return;
            }

            logger.debug("Number of Virtual networks:", data.length);
            callback(null, data);
            return;
        });*/
        logger.debug("START:: getNetworks");
        fs.readFile(certFile, function(err, certData) {
            if (err) {
                logger.error("Error reading certFile..", err);
                return;
            }
            logger.debug("certFile loaded");
            fs.readFile(keyFile, function(err, keyData) {
                if (err) {
                    logger.error("Error reading keyFile..", err);
                    return;
                }
                logger.debug("keyFile loaded");

                var opts = {
                    url: "https://management.core.windows.net/" + options.subscriptionId + "/services/networking/virtualnetwork",
                    agentOptions: {
                        cert: certData,
                        key: keyData,
                    },
                    headers: {
                        "x-ms-version": "2015-04-01"
                    }
                }

                request.get(opts, function(err, response, body) {

                    logger.debug("getNetworks response.statusCode: ", response.statusCode);

                    if (err) {
                        logger.error("Error...", err);
                        callback(err, null);
                        return;
                    }

                    if (response.statusCode == '200') {
                        logger.debug("END:: getNetworks");
                        callback(null, body);
                        return;
                    } else {
                        callback(body, null);
                        return;
                    }

                });

            });
        });

    }

    this.createVirtualMachine = function(cloudService, reqBody, callback) {
        logger.debug("START:: createVirtualMachine");
        fs.readFile(certFile, function(err, certData) {
            if (err) {
                logger.error("Error reading certFile..", err);
                return;
            }
            logger.debug("certFile loaded");

            fs.readFile(keyFile, function(err, keyData) {
                if (err) {
                    logger.error("Error reading keyFile..", err);
                    return;
                }
                logger.debug("keyFile loaded");

                var opts = {
                    url: "https://management.core.windows.net/" + options.subscriptionId + "/services/hostedservices/" + cloudService + "/deployments",
                    agentOptions: {
                        cert: certData,
                        key: keyData,
                    },
                    headers: {
                        "x-ms-version": "2015-04-01",
                        "Content-Type": "text/xml"
                    },
                    body: reqBody
                }

                request.post(opts, function(err, response, body) {

                    console.log("response.statusCode: ", response.statusCode);

                    if (err) {
                        //console.log("Error...",err);
                        callback(err, null);
                        return;
                    }

                    if (response.statusCode == '202') {
                        logger.debug("END:: createVirtualMachine");
                        callback(null, "Created Virtual Machine Successfully");
                        return;
                    } else {
                        callback(body, null);
                        return;
                    }
                });
            });
        });

    }

    this.createCloudService = function(reqBody, callback) {
        logger.debug("START:: createCloudService");
        fs.readFile(certFile, function(err, certData) {
            if (err) {
                logger.error("Error reading certFile..", err);
                return;
            }
            logger.debug("certFile loaded");
            fs.readFile(keyFile, function(err, keyData) {
                if (err) {
                    logger.error("Error reading keyFile..", err);
                    return;
                }
                logger.debug("keyFile loaded");

                var opts = {
                    url: "https://management.core.windows.net/" + options.subscriptionId + "/services/hostedservices",
                    agentOptions: {
                        cert: certData,
                        key: keyData,
                    },
                    headers: {
                        "x-ms-version": "2015-04-01",
                        "Content-Type": "text/xml"
                    },
                    body: reqBody
                }

                request.post(opts, function(err, response, body) {

                    console.log("response.statusCode: ", response.statusCode);

                    if (err) {
                        console.log("Error in Cloud Service creation", err);
                        callback(err, null);
                        return;
                    }

                    if (response.statusCode == '201') {
                        logger.debug("END:: createCloudService");
                        callback(null, "Created Cloud Service Successfully");
                        return;
                    } else {
                        console.log("Error in Cloud Service creation:", body);
                        callback(body, null);
                        return;
                    }
                });
            });
        });

    }

    this.createServer = function(params, callback) {

        //cloudServiceName,imageName,userName,password,vmName,size,sshPort
        //var createVMcmd = "azure vm create "+ params.VMName +" "+ params.imageName +" "+ params.userName +" "+params.password+" -z \""+params.size+" -l \""+params.location+"\" -e "+ params.sshPort +"-w " + params.vnet + " -b " + params.subnet;

        if (params.os === 'windows') {
            params.remoteCon = '-r';
            params.port = '3389';
        } else {
            params.remoteCon = '-e';
            params.port = '22';
        }

        logger.debug("Azure server Launch params >>>", params);

        /*var createVMcmd = "azure vm create " + params.VMName + " " + params.imageName + " " + params.username + " " + params.password + " -z \"" + params.size + "\" -l \"" + params.location + "\" " + params.remoteCon + " " + params.port + " -w " + params.vnet + " -b " + params.subnet;

        logger.debug("Create VM command:", createVMcmd);
        var self = this;

        execute(createVMcmd, false, function(err, data) {
            if (err) {
                logger.error("Error in VM creation:", err);
                callback(err, null);
                return;
            }
            logger.debug("Create VM response:", data);

            var endpointsPorts = params.endpoints;

            logger.debug("endpointsPorts >>", endpointsPorts);

            var port = endpointsPorts.split(',')[0];

            logger.debug('Creating endpoint CatEndpoint with port:', port);

            if (params.os === 'windows') {
                self.createEndPoint(params.VMName, "default", '5985', function() {
                    self.createEndPoint(params.VMName, "CatEndpoint", port, function() {

                    });
                });
            } else {
                self.createEndPoint(params.VMName, "CatEndpoint", port, function() {});
            }

            callback(null, data);

        });*/

        var cloudServiceName = params.VMName;

        var cloudServiceReqBody = constructCloudServiceReqBody(cloudServiceName, params.location);
        logger.debug("Received cloudServiceReqBody:", cloudServiceReqBody);

        var vmReqBody = constructXmlInputBody(params);
        logger.debug("Received VM creation request body:", vmReqBody);

        var self = this;

        self.createCloudService(cloudServiceReqBody, function(err, res) {

            if (!err) {
                logger.debug("createCloudService response:", res);

                self.createVirtualMachine(cloudServiceName, vmReqBody, function(err, data) {
                    if (!err) {
                        logger.debug("createVirtualMachine response:", data);
                        callback(null, data);
                        return;
                    }
                    logger.error("Error in createVirtualMachine:", err);
                    callback(err, null);
                });
            } else {
                logger.error("Error in createCloudService:", err);
                callback(err, null);
            }
        });

    }

    this.createEndPoint = function(serverName, name, port, callback) {
        var createEndPoint = "azure vm endpoint create " + serverName + " " + port + " -n " + name;

        execute(createEndPoint, false, function(err, data) {
            if (err) {
                logger.error("Error in endpoint creation:", err);
                callback(err, null);
                return;
            }

            logger.debug("endpoint creation response:", data);
            callback(null, data);
        });
    }

    this.getServerByName = function(serverName, callback) {

        /*var showVMcmd = "azure vm show --json " + serverName;

        execute(showVMcmd, true, function(err, data) {
            if (err) {
                logger.error("Error in VM show:", err);
                callback(err, null);
                return;
            }

            logger.debug("Show VM response:", data);
            callback(null, data);
        });*/
        logger.debug("START:: getServerByName");
        fs.readFile(certFile, function(err, certData) {
            if (err) {
                logger.error("Error reading certFile..", err);
                return;
            }
            logger.debug("certFile loaded");

            fs.readFile(keyFile, function(err, keyData) {
                if (err) {
                    logger.error("Error reading keyFile..", err);
                    return;
                }
                logger.debug("keyFile loaded");

                var opts = {
                    uri: "https://management.core.windows.net/" + options.subscriptionId + "/services/hostedservices/" + serverName + "/deploymentslots/Production",
                    agentOptions: {
                        cert: fs.readFileSync(certFile),
                        key: fs.readFileSync(keyFile),
                    },
                    headers: {
                        "x-ms-version": "2015-04-01"
                    }
                }

                request.get(opts, function(err, response, body) {

                    if (err) {
                        //console.log("Error...",err);
                        callback(err, null);
                        return;
                    }

                    console.log("response.statusCode: ", response.statusCode);

                    if (response.statusCode == '200') {
                        logger.debug("END:: getServerByName");
                        callback(null, body);
                        return;
                    } else {
                        callback(body, null);
                        return;
                    }

                });
            });
        });

    }

    this.updatedfloatingip = false;


    this.trysshoninstance = function(ostype, ip_address, username, pwd, callback) {
        logger.debug('In trysshoninstance1');
        var opts = {
            //privateKey: instanceData.credentials.pemFilePath,
            password: pwd,
            username: username,
            host: ip_address,
            instanceOS: 'linux',
            port: 22,
            cmds: ["ls -al"],
            cmdswin: ["knife wsman test"]
            //interactiveKeyboard: true
        }

        var cmdString = '';
        if (ostype == "Windows") {
            curl = new Curl();
            cmdString = opts.cmdswin[0] + ' ' + opts.host + ' -m';
            logger.debug("cmdString >>>", cmdString);
            curl.executecurl(cmdString, function(err, stdout) {
                logger.debug('stdout:', stdout, err);

                if (stdout && stdout.indexOf('Connected successfully') >= 0) {
                    callback('ok');
                    return;
                }
                if (err) {
                    logger.debug('in error', err);
                    callback('Error ', null);
                    return;
                }

            });

        } else {
            cmdString = opts.cmds.join(' && ');
            //console.log(JSON.stringify(opts));
            logger.debug("cmdString >>>", cmdString);
            var sshExec = new SSHExec(opts);
            sshExec.exec(cmdString, function(err, stdout) {
                logger.debug(stdout);
                callback(stdout);
                return;
            }, function(err, stdout) {
                logger.debug('Out:', stdout); //assuming that receiving something out would be a goog sign :)
                callback('ok');
                return;
            }, function(err, stdout) {
                logger.error('Error Out:', stdout);
            });
        }
    }

    this.trysshoninstance1 = function(ostype, ip_address, username, pwd, callback) {
        var opts = {
            //privateKey: instanceData.credentials.pemFilePath,
            password: pwd,
            username: username,
            host: ip_address,
            instanceOS: 'linux',
            port: 22,
            cmds: ["ls -al"],
            cmdswin: ["knife wsman test"],
            interactiveKeyboard: true
        }

        var cmdString = '';
        if (ostype == "Windows") {
            curl = new curl();
            cmdString = opts.cmdswin[0] + ' ' + opts.host + ' -m';
            logger.debug("cmdString >>>", cmdString);
            curl.executecurl(cmdString, function(err, stdout) {
                logger.debug(stdout);
                if (stdout.indexOf('Connected successfully') >= 0) {
                    callback('ok');
                    return;
                }
            });

        } else {
            cmdString = opts.cmds.join(' && ');
            //console.log(JSON.stringify(opts));
            var sshExec = new SSHExec(opts);
            sshExec.exec(cmdString, function(err, stdout) {
                logger.debug(stdout);
                callback(stdout);
                return;
            }, function(err, stdout) {
                logger.debug('Out:', stdout); //assuming that receiving something out would be a goog sign :)
                callback('ok');
                return;
            }, function(err, stdout) {
                logger.error('Error Out:', stdout);
            });
        }
    }

    this.timeouts = [];
    this.callbackdone = false;

    this.waitforserverready = function(instanceName, username, pwd, callback) {
        var self = this;
        logger.debug('instanceName received:', JSON.stringify(instanceName));
        var wfsr = function() {
            self.getServerByName(instanceName, function(err, data) {
                if (err) {
                    logger.error("Error", err);
                    callback(err, null);
                    return;
                }
                if (!err) {
                    data = xml2json.toJson(data);
                    logger.debug('Quried server:', data);

                    data = JSON.parse(data);
                    var ip_address = '';

                    var virtualIp = data.Deployment.VirtualIPs.VirtualIP;

                    if (virtualIp) {

                        ip_address = virtualIp.Address;

                        /*if (data.Network.Endpoints.length > 0)
                        ip_address = data.Network.Endpoints[0].virtualIPAddress;
                    else
                        ip_address = data.VirtualIPAddresses.address;*/

                        // var ip_address = data.Network.Endpoints[0].virtualIPAddress;
                        logger.debug('Azure VM ip address:', ip_address);

                        var status = data.Deployment.RoleInstanceList.RoleInstance.InstanceStatus;

                        //var status = data.InstanceStatus;

                        if (status == 'ReadyRole') {
                            //set the floating ip to instance
                            if (ip_address)
                                if (!err) {
                                    self.updatedfloatingip = true;
                                    logger.debug('Updated with floating ip');
                                }
                        }
                    } else {
                        logger.debug('Timeout 2 set for Ip');
                        if (!self.callbackdone) {
                            self.timeouts.push(setTimeout(wfsr, 30000));
                        }
                    }

                    if (self.updatedfloatingip) {

                        //var os = data.OSDisk.operatingSystem;

                        var os = data.Deployment.RoleList.Role.OSVirtualHardDisk.OS;

                        logger.debug("data.OSDisk.operatingSystem >>>>", os);

                        /*if(!data.OSDisk.operatingSystem === "Windows"){ 
                         
                         logger.debug("try ssh oninstance..");*/

                        self.trysshoninstance(os, ip_address, username, pwd, function(cdata) {
                            logger.debug('End trysshoninstance:', cdata);
                            if (cdata == 'ok') {
                                //Clearing all timeouts
                                for (var i = 0; i < self.timeouts.length; i++) {
                                    logger.debug('Clearing timeout : ', self.timeouts[i]);
                                    clearTimeout(self.timeouts[i]);
                                }
                                self.timeouts = [];
                                if (!self.callbackdone) {
                                    self.callbackdone = true;
                                    callback(null, ip_address);
                                }

                                return;
                            } else {
                                logger.debug('Timeout 1 set');
                                if (!self.callbackdone) {
                                    self.timeouts.push(setTimeout(wfsr, 30000));
                                }
                            }
                        });

                        /* } else{
                        logger.debug("Windows instance..");
                        callback(null, ip_address);
                      }*/

                    } else {
                        logger.debug('Timeout 2 set');
                        if (!self.callbackdone) {
                            self.timeouts.push(setTimeout(wfsr, 60000));
                        }
                    }

                }
            });
        };
        logger.debug('Timeout 3 set');
        self.timeouts.push(setTimeout(wfsr, 15000));
    }

}


module.exports = AzureCloud;