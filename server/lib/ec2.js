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
            if(err){
                logger.debug("Got instanceState info with error: ",err);
                callback(err,null);
            }
            logger.debug("Got instanceState info: ",JSON.stringify(data));
            callback(null, data);
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



    this.launchInstance = function(image_id, intanceType, securityGroupIds,subnetId,instanceName,keyPairName,instanceCount, callback) {
        logger.debug("SecurityGroupIds and SubnetId %s %s ",securityGroupIds,subnetId);
        var that = this; //"m1.small"
        var param = {
          ImageId: image_id, /* required */
          MaxCount: parseInt(instanceCount), /* required */
          MinCount: 1, /* required */
          InstanceType: intanceType, /* required */
          KeyName: keyPairName, /* required */
          SecurityGroupIds: securityGroupIds, /* required */
          SubnetId: subnetId /* required if use vpc*/
      };
      logger.debug("Param obj:>>>>  ",JSON.stringify(param));
     
        // var data = {"ReservationId":"r-d9fdb910","OwnerId":"549974527830","Groups":[],"Instances":[{"InstanceId":"i-8fd77354","ImageId":"ami-3d50120d","State":{"Code":0,"Name":"pending"},"PrivateDnsName":"ip-172-31-12-248.us-west-2.compute.internal","PublicDnsName":"","StateTransitionReason":"","KeyName":"cat_instances","AmiLaunchIndex":1,"ProductCodes":[],"InstanceType":"t2.micro","LaunchTime":"2015-08-12T05:33:45.000Z","Placement":{"AvailabilityZone":"us-west-2c","GroupName":"","Tenancy":"default"},"Monitoring":{"State":"disabled"},"SubnetId":"subnet-aed68ce8","VpcId":"vpc-b1f3ecd3","PrivateIpAddress":"172.31.12.248","StateReason":{"Code":"pending","Message":"pending"},"Architecture":"x86_64","RootDeviceType":"ebs","RootDeviceName":"/dev/sda1","BlockDeviceMappings":[],"VirtualizationType":"hvm","ClientToken":"","Tags":[],"SecurityGroups":[{"GroupName":"all_open","GroupId":"sg-c00ee1a5"}],"SourceDestCheck":true,"Hypervisor":"xen","NetworkInterfaces":[{"NetworkInterfaceId":"eni-3273ba69","SubnetId":"subnet-aed68ce8","VpcId":"vpc-b1f3ecd3","Description":"","OwnerId":"549974527830","Status":"in-use","MacAddress":"0a:c0:e3:ea:d4:b7","PrivateIpAddress":"172.31.12.248","PrivateDnsName":"ip-172-31-12-248.us-west-2.compute.internal","SourceDestCheck":true,"Groups":[{"GroupName":"all_open","GroupId":"sg-c00ee1a5"}],"Attachment":{"AttachmentId":"eni-attach-74c8e654","DeviceIndex":0,"Status":"attaching","AttachTime":"2015-08-12T05:33:45.000Z","DeleteOnTermination":true},"PrivateIpAddresses":[{"PrivateIpAddress":"172.31.12.248","PrivateDnsName":"ip-172-31-12-248.us-west-2.compute.internal","Primary":true}]}],"EbsOptimized":false},{"InstanceId":"i-8ed77355","ImageId":"ami-3d50120d","State":{"Code":0,"Name":"pending"},"PrivateDnsName":"ip-172-31-12-247.us-west-2.compute.internal","PublicDnsName":"","StateTransitionReason":"","KeyName":"cat_instances","AmiLaunchIndex":0,"ProductCodes":[],"InstanceType":"t2.micro","LaunchTime":"2015-08-12T05:33:45.000Z","Placement":{"AvailabilityZone":"us-west-2c","GroupName":"","Tenancy":"default"},"Monitoring":{"State":"disabled"},"SubnetId":"subnet-aed68ce8","VpcId":"vpc-b1f3ecd3","PrivateIpAddress":"172.31.12.247","StateReason":{"Code":"pending","Message":"pending"},"Architecture":"x86_64","RootDeviceType":"ebs","RootDeviceName":"/dev/sda1","BlockDeviceMappings":[],"VirtualizationType":"hvm","ClientToken":"","Tags":[],"SecurityGroups":[{"GroupName":"all_open","GroupId":"sg-c00ee1a5"}],"SourceDestCheck":true,"Hypervisor":"xen","NetworkInterfaces":[{"NetworkInterfaceId":"eni-3373ba68","SubnetId":"subnet-aed68ce8","VpcId":"vpc-b1f3ecd3","Description":"","OwnerId":"549974527830","Status":"in-use","MacAddress":"0a:99:31:96:73:9f","PrivateIpAddress":"172.31.12.247","PrivateDnsName":"ip-172-31-12-247.us-west-2.compute.internal","SourceDestCheck":true,"Groups":[{"GroupName":"all_open","GroupId":"sg-c00ee1a5"}],"Attachment":{"AttachmentId":"eni-attach-75c8e655","DeviceIndex":0,"Status":"attaching","AttachTime":"2015-08-12T05:33:45.000Z","DeleteOnTermination":true},"PrivateIpAddresses":[{"PrivateIpAddress":"172.31.12.247","PrivateDnsName":"ip-172-31-12-247.us-west-2.compute.internal","Primary":true}]}],"EbsOptimized":false}]};
        // callback(null,data.Instances);
        // return;
        ec.runInstances(param, function(err, data) {
            if (err) {
                console.log("error occured while launching instance");
                console.log(err);
                callback(err, null);
                return;
            }
            logger.debug('>>>>>>>>>runInstances : data');
            logger.debug(JSON.stringify(data));


            for(var j = 0; j < data.Instances.length; j++)
            {
                var params = {
                    Resources: [data.Instances[j].InstanceId],
                    Tags: [{
                        Key: 'Name',
                        Value: instanceName
                    }]
                };
                ec.createTags(params, function(err) {
                    console.log("Tagging instance", err ? "failure" : "success");
                });
                if(j >= data.Instances.length - 1)
                    callback(null, data.Instances);
            }

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

    this.listInstances = function(callback){
        ec.describeInstances(function(err,instances){
            if(err){
                logger.debug("Error occurred for listing aws instances: ",err);
                callback(err,null);
            }else{
                logger.debug("Able to list all aws instances: ");
                callback(null,instances);
            }
        });
    };

}

module.exports = EC2;