//"use strict";
var ping = require('net-ping');
var config = require('../config/aws_config');
var aws = require('../node_modules/aws-sdk');
var ec = new aws.EC2({"accessKeyId":config.access_key, "secretAccessKey": config.secret_key, 
	"region": config.region});

console.log("Started...!!!")



var getInstances = function(req, resp, callback){
	ec.describeInstances({}, function(err, data){
		callback(err, data);
	});
};


var getImages = function(req, resp, callback){
	ec.describeImages({"Owners" : ['self']}, function(err, data){
		callback(err, data);
	});
};




module.exports.getImageNames = function (callback){
	getImages(null, null, function(err, data){
		var images = [];
		if(!err){
			var image = data.Images;
			for(var i=0; i < image.length; i++)
				images.push({"image_id" : image[i].ImageId, "image_name" : image[i].name});
			callback(null, images);
		}else{
			callback(err, null);
		}
	});
};

module.exports.describeInstances = function(instanceIds,awsSettings,callback){
    var ec = new aws.EC2({"accessKeyId":awsSettings.access_key, "secretAccessKey": awsSettings.secret_key, 
    "region": awsSettings.region});
    var options = {};
    if(instanceIds) {
      options.InstanceIds = instanceIds;
    }
    options.MaxResults = 1000;
    ec.describeInstances(options,function(err,data){
       callback(err,data);
    });

}

module.exports.launchInstance = function(image_id,awsSettings,schedTerminate,callback,instancePendingStateCallback,instanceRunningStateCallback,instanceTerminateCallback) {
  
  var that = this;//"m1.small"
  var ec = new aws.EC2({"accessKeyId":awsSettings.access_key, "secretAccessKey": awsSettings.secret_key, 
  "region": awsSettings.region});

  //ami-eb6b0182
  //m1.medium
  ec.runInstances({"ImageId" : "ami-b3bf2f83","InstanceType":"t1.micro", "MinCount" : 1, "MaxCount" : 1,"KeyName":awsSettings.keyPairName,SecurityGroupIds:[awsSettings.securityGroupId],BlockDeviceMappings:[{DeviceName:"/dev/sda",Ebs:{DeleteOnTermination:true}}]}, function(err, data){
		if(err) {
			console.log("error occured while launching instance");
			console.log(err);
			callback(err,data);
			return;
		}
    //console.log(data);
		for(var i=0; i<data.Instances.length; i++) {
              console.log("Launched Instance Named : " + data.Instances[i].InstanceId);
              
               // for terminating instance after some delay
              if(schedTerminate && schedTerminate.terminate && schedTerminate.delay) {
              	if(typeof schedTerminate.delay === 'number') {
              		var instanceId = data.Instances[i].InstanceId;
              		console.log("Enabling scheduled termination of node "+instanceId+" after "+schedTerminate.delay+" milliseconds" );
              	    setTimeout(function() {
                     ec.terminateInstances({InstanceIds:[instanceId]},function(err,data){
                      if(err) {
                        console.log("unable to terminate instance : "+instanceId);
                        console.log(err);
                        if(instanceTerminateCallback) {
                         instanceTerminateCallback(null,err);
                        }
                        return;
                      }	
                      
                      for(var j=0;j<data.TerminatingInstances.length;j++) {
                      	console.log("instance "+ data.TerminatingInstances[j].InstanceId+" terminated with state : "+data.TerminatingInstances[j].CurrentState.Name+"");
                      }
                      if(instanceTerminateCallback) {
                       instanceTerminateCallback(data.TerminatingInstances[0]);
                      }
                    
                     });   

              	    }, schedTerminate.delay);
              	}
              }

              // starting timer for checking instance state         
              var checkInstanceId = data.Instances[i].InstanceId;
              function timeoutFunc(instanceId) {
              	console.log("checking state of instance ==> "+instanceId);
                var t_timeout = setTimeout(function(){
                ec.describeInstances({InstanceIds:[instanceId]},function(err,data){
              	   if(err) {
              	   	console.log("error occured while checking instance state. instance Id ==> "+instanceId);
              	   	return;
              	   }
              	   var instanceState =data.Reservations[0].Instances[0].State.Name
                   console.log("instance state ==> "+instanceState);
                   if(instanceState === 'running') {
                    console.log("instance has started running "); 
                    var instanceData = data.Reservations[0].Instances[0];
                    
                    
                     function pingTimeoutFunc(instanceIp) {
                      console.log("pinging instance");
                      var ping_timeout = setTimeout(function(){

                        var session = ping.createSession ();
                        session.pingHost(instanceIp, function (pingError, target) {
                        if (pingError) {
                          if (pingError instanceof ping.RequestTimedOutError) {
                            console.log (instanceIp + ": Not alive");
                          }
                          else {
                            console.log (instanceIp + ": " + pingError.toString());
                          }
                          pingTimeoutFunc(instanceIp);
                        } else {
                          console.log (instanceIp + ": Alive");
                          setTimeout(function(){
                           instanceRunningStateCallback(instanceData);
                         },60000);
                        }
                       });
                      },45000);                     
                     }
                     pingTimeoutFunc(instanceData.PublicIpAddress);

                   } else if(instanceState === 'pending'){
                   	instancePendingStateCallback(instanceId);
                    timeoutFunc(instanceId);
                   } else if(instanceState === 'terminated') {
                      if(instanceTerminateCallback) {
                       instanceTerminateCallback(instanceData);
                      }
                   }
                });
               },30000);            		
              }
              timeoutFunc(checkInstanceId);  
			} 
		   callback(err, data);
	});
}

module.exports.runInstances = function (image_id, min, max, name,KeyName,schedTerminate, callback){
	ec.runInstances({"ImageId" : "ami-eb6b0182","InstanceType":"m1.small", "MinCount" : parseInt(min), "MaxCount" : parseInt(max),"KeyName":KeyName}, function(err, data){
		console.log(err);
		if(!err && data) {
			for(var i=0; i<data.Instances.length; i++) {
              console.log("Launched Instance Named : " + data.Instances[i].InstanceId);
              
               // for terminating instance after some delay
              if(schedTerminate && schedTerminate.terminate && schedTerminate.delay) {
              	if(typeof schedTerminate.delay === 'number') {
              		var instanceId = data.Instances[i].InstanceId;
              		console.log("Enabling scheduled termination of node "+instanceId+" after "+schedTerminate.delay+" milliseconds" );
              	    setTimeout(function() {
                     ec.terminateInstances({InstanceIds:[instanceId]},function(err,data){
                      if(err) {
                        console.log("unable to terminate instance : "+instanceId);
                        console.log(err);
                        return;
                      }	
                      
                      for(var j=0;j<data.TerminatingInstances.length;j++) {
                      	console.log("instance "+ data.TerminatingInstances[j].InstanceId+" terminated with state : "+data.TerminatingInstances[j].CurrentState.Name+"");
                      }
                    
                     });   

              	    }, schedTerminate.delay);
              	}
              } 
			}
        } 
		callback(err, data);
	});
}