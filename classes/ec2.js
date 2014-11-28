var ping = require('net-ping');
var aws = require('aws-sdk');

var instanceStateList = {
    RUNNING: 'running',
    STOPPED: 'stopped',
    TERMINATED: 'terminated',
    PENDING: 'pending'
}

var EC2 = function(awsSettings) {
    var ec = new aws.EC2({
        "accessKeyId": awsSettings.access_key,
        "secretAccessKey": awsSettings.secret_key,
        "region": awsSettings.region
    });

    var that = this;

    this.describeInstances = function(instanceIds, callback) {

        var options = {};
        if (instanceIds && instanceIds.length) {
            options.InstanceIds = instanceIds;
        } else {
            options.MaxResults = 1000;
        }
        ec.describeInstances(options, function(err, data) {
            callback(err, data);
        });

    };

    this.getInstanceState = function(instanceId, callback) {
        this.describeInstances([instanceId], function(err, data) {
            if (err) {
                console.log("error occured while checking instance state. instance Id ==> " + instanceId);
                callback(err, null);
                return;
            }
            if (data.Reservations.length && data.Reservations[0].Instances.length) {
                var instanceState = data.Reservations[0].Instances[0].State.Name
                console.log("instance state ==> " + instanceState);
                callback(null, instanceState);
            } else {
            	callback(true, null);
            }

        });
    };



    this.launchInstance = function(image_id, intanceType, securityGroupId, callback) {

        var that = this; //"m1.small"
        ec.runInstances({
            "ImageId": "ami-b3bf2f83",//"ami-10503820", // "ami-b3bf2f83",ami-0b06483b
            "InstanceType": intanceType, //"m1.medium",
            "MinCount": 1,
            "MaxCount": 1,
            "KeyName": awsSettings.keyPairName,
            SecurityGroupIds: [securityGroupId], // [awsSettings.securityGroupId],
            BlockDeviceMappings: [{
                DeviceName: "/dev/sda",
                Ebs: {
                    DeleteOnTermination: true
                }
            }]
        }, function(err, data) {
            if (err) {
                console.log("error occured while launching instance");
                console.log(err);
                callback(err, null);
                return;
            }
            callback(null, data.Instances[0]);
        });
    };

    this.waitForInstanceRunnnigState = function(instanceId, callback) {

        function timeoutFunc(instanceId) {
            console.log("checking state of instance ==> " + instanceId);
            var t_timeout = setTimeout(function() {
                ec.describeInstances({
                    InstanceIds: [instanceId]
                }, function(err, data) {
                    if (err) {
                        console.log("error occured while checking instance state. instance Id ==> " + instanceId);
                        callback(err, null);
                        return;
                    }
                    var instanceState = data.Reservations[0].Instances[0].State.Name
                    console.log("instance state ==> " + instanceState);
                    if (instanceState === instanceStateList.RUNNING) {
                        console.log("instance has started running ");
                        var instanceData = data.Reservations[0].Instances[0];


                        function pingTimeoutFunc(instanceIp) {
                            console.log("pinging instance");
                            var ping_timeout = setTimeout(function() {

                                var session = ping.createSession();
                                session.pingHost(instanceIp, function(pingError, target) {
                                    if (pingError) {
                                        if (pingError instanceof ping.RequestTimedOutError) {
                                            console.log(instanceIp + ": Not alive");
                                        } else {
                                            console.log(instanceIp + ": " + pingError.toString());
                                        }
                                        pingTimeoutFunc(instanceIp);
                                    } else {
                                        console.log(instanceIp + ": Alive");
                                        setTimeout(function() {
                                            callback(null, instanceData);
                                        }, 60000);
                                    }
                                });
                            }, 45000);
                        }
                        pingTimeoutFunc(instanceData.PublicIpAddress);

                    } else if (instanceState === instanceStateList.PENDING) {
                        timeoutFunc(instanceId);
                    } else if (instanceState === instanceStateList.TERMINATED) {
                        callback({
                            "err": "Instance Terminated"
                        });
                    }
                });
            }, 30000);
        }
        timeoutFunc(instanceId);
    };

    function pollInstanceState(instanceId, state, callback) {
        function checkInstanceStatus(statusToCheck, delay) {
            var timeout = setTimeout(function() {
                that.getInstanceState(instanceId, function(err, instanceState) {
                    if (err) {
                        console.log('Unable to get instance state', err);
                        callback(err, null);
                        return;
                    }
                    if (statusToCheck === instanceState) {
                        callback(null, instanceState);
                    } else {
                        checkInstanceStatus(state, 5000);
                    }
                });
            }, delay);
        }
        checkInstanceStatus(state, 1);
    }

    this.stopInstance = function(instanceIds, callback, onStateChangedCompleteCallback) {
        ec.stopInstances({
            InstanceIds: instanceIds
        }, function(err, data) {
            if (err) {
                console.log("unable to stop instance : " + instanceIds);
                console.log(err);
                callback(err, null)
                return;
            }
            console.log("number of instances stopped " + data.StoppingInstances.length);
            callback(null, data.StoppingInstances);
            pollInstanceState(instanceIds[0], instanceStateList.STOPPED, function(err, state) {
                onStateChangedCompleteCallback(err, state);
            });

        });
    }

    this.startInstance = function(instanceIds, callback, onStateChangedCompleteCallback) {
        ec.startInstances({
            InstanceIds: instanceIds
        }, function(err, data) {
            if (err) {
                console.log("unable to start instances : " + instanceIds);
                console.log(err);
                callback(err, null)
                return;
            }
            console.log("number of instances stopped " + data.StartingInstances.length);
            callback(null, data.StartingInstances);
            pollInstanceState(instanceIds[0], instanceStateList.RUNNING, function(err, state) {
                onStateChangedCompleteCallback(err, state);
            });

        });
    }

    this.rebootInstance = function(instanceIds, callback, onStateChangedCompleteCallback) {
        ec.rebootInstances({
            InstanceIds: instanceIds
        }, function(err, data) {
            if (err) {
                console.log("unable to reboot instance : " + instanceIds);
                console.log(err);
                callback(err, null)
                return;
            }
            console.log("number of instances stopped " + data.length);
            callback(null, data);
            pollInstanceState(instanceIds[0], instanceStateList.RUNNING, function(err, state) {
                onStateChangedCompleteCallback(err, state);
            });

        });
    };

    this.terminateInstance = function(instanceIds, callback, onStateChangedCompleteCallback) {
        ec.terminateInstances({
            InstanceIds: instanceIds
        }, function(err, data) {
            if (err) {
                console.log("unable to terminate instance : " + instanceId);
                console.log(err);
                callback(err, null)
                return;
            }
            callback(null, data);

            pollInstanceState(instanceIds[0], instanceStateList.TERMINATED, function(err, state) {
                onStateChangedCompleteCallback(err, state);
            });
        });
    };


    this.getSecurityGroups = function(callback) {
        ec.describeSecurityGroups({}, function(err, data) {
            if (err) {
                console.log(err);
                callback(err, null);
                return;
            }
            callback(null, data.SecurityGroups);
        });
    }


}

module.exports = EC2;