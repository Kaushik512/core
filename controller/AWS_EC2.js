"use strict";
var config = require('../config/aws_config')
var aws = require('../node_modules/aws-sdk');
var ec = new aws.EC2({"accessKeyId":'AKIAI5JPZ6FOH4K3NQXQ', "secretAccessKey": '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', 
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

module.exports.runInstances = function (image_id, min, max, name,schedTerminate, callback){
	console.log();
	ec.runInstances({"ImageId" : image_id,"InstanceType":"t1.micro", "MinCount" : parseInt(min), "MaxCount" : parseInt(max)}, function(err, data){
		console.log(err);
		if(!err && data) {
			for(var i=0; i<data.Groups.length; i++) {
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