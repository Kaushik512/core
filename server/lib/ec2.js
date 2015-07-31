var ping = require('net-ping');
var aws = require('aws-sdk');
var logger = require('_pr/logger')(module);


if (process.env.http_proxy) {
    aws.config.update({
        httpOptions: {
            proxy: process.env.http_proxy
        }
    });
}

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
        logger.debug('fetching instances for ==>',instanceIds);
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



    this.launchInstance = function(image_id, intanceType, securityGroupIds,subnetId,instanceName,keyPairName, callback) {
        logger.debug("SecurityGroupIds and SubnetId %s %s ",securityGroupIds,subnetId);
        var that = this; //"m1.small"
        var param = {
          ImageId: image_id, /* required */
          MaxCount: 1, /* required */
          MinCount: 1, /* required */
          InstanceType: intanceType, /* required */
          KeyName: keyPairName, /* required */
          SecurityGroupIds: securityGroupIds, /* required */
          SubnetId: subnetId /* required if use vpc*/
      };
      logger.debug("Param obj:>>>>  ",JSON.stringify(param));
        ec.runInstances(param, function(err, data) {
            if (err) {
                console.log("error occured while launching instance");
                console.log(err);
                callback(err, null);
                return;
            }
            var params = {
                Resources: [data.Instances[0].InstanceId],
                Tags: [{
                    Key: 'Name',
                    Value: instanceName
                }]
            };
            ec.createTags(params, function(err) {
                console.log("Tagging instance", err ? "failure" : "success");
            });
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
                         callback(null, instanceData);

                        // function pingTimeoutFunc(instanceIp) {
                        //     console.log("pinging instance");
                        //     var ping_timeout = setTimeout(function() {

                        //         var session = ping.createSession();
                        //         session.pingHost(instanceIp, function(pingError, target) {
                        //             if (pingError) {
                        //                 if (pingError instanceof ping.RequestTimedOutError) {
                        //                     console.log(instanceIp + ": Not alive");
                        //                 } else {
                        //                     console.log(instanceIp + ": " + pingError.toString());
                        //                 }
                        //                 pingTimeoutFunc(instanceIp);
                        //             } else {
                        //                 console.log(instanceIp + ": Alive");
                        //                 setTimeout(function() {
                        //                     callback(null, instanceData);
                        //                 }, 60000);
                        //             }
                        //         });
                        //     }, 45000);
                        // }
                        // pingTimeoutFunc(instanceData.PublicIpAddress);

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

    this.checkImageAvailability = function(imageid,callback){
        var params = {
            ImageIds: [imageid]
        };
        ec.describeImages(params,function(err,data){
            if(err){
                logger.debug("Unable to describeImages from AWS.",err);
                callback(err, null);
                return;
            }
            logger.debug("Success to Describe Images from AWS.");
            callback(null, data);
        });
    }

    this.describeKeyPairs = function(callback){
        
        ec.describeKeyPairs({},function(err,data){
            if(err){
                logger.debug("Unable to describeKeyPairs from AWS.",err);
                callback(err, null);
                return;
            }
            logger.debug("Success to Describe KeyPairs from AWS.");
            callback(null, data);
        });
    }
    this.describeVpcs = function(callback){
       
        ec.describeVpcs({},function(err,data){
            if(err){
                logger.debug("Unable to describeVpcs from AWS.",err);
                callback(err, null);
                return;
            }
            logger.debug("Success to Describe Vpcs from AWS.");
            callback(null, data);
        });
    }

    this.describeSubnets = function(vpcId,callback){
        var params = {
            Filters: [
            {
                Name: 'vpc-id',
                Values:[vpcId]
            }
                  ]
        };
        ec.describeSubnets(params,function(err,data){
            if(err){
                logger.debug("Unable to describeSubnets from AWS.",err);
                callback(err, null);
                return;
            }
            logger.debug("Success to describeSubnets from AWS.");
            callback(null, data);
        });
    }

    this.getSecurityGroupsForVPC = function(vpcId,callback) {
        var params = {
          Filters: [
          {
              Name: 'vpc-id',
              Values: [vpcId]
          }
          ]
      };
        ec.describeSecurityGroups(params, function(err, data) {
            if (err) {
                console.log(err);
                callback(err, null);
                return;
            }
            callback(null, data.SecurityGroups);
        });
    };

    this.waitForEvent = function(instanceId, eventName, callback) {
        console.log("waiting for ==> ",instanceId,eventName);
        ec.waitFor(eventName, {
            InstanceIds: [instanceId]
        }, function(err, data) {
            if (err) {
                console.log(err, err.stack); // an error occurred
                callback(err, null);
            } else {
                console.log(data);
                callback(null, data);
            } // successful response
        });
    };

}

module.exports = EC2;