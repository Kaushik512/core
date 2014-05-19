var AWS = require('aws-sdk');
var nodeExtend = require('node.extend');


var CloudFormation = function(awsSettings) {
	var awsCloudFormation = new AWS.CloudFormation({
		"accessKeyId": awsSettings.access_key,
		"secretAccessKey": awsSettings.secret_key,
		"region": awsSettings.region
	});


	this.createStack = function(options,callback) {
		/*var defaults = {
             StackName: null,
             DisableRollback: false,
             OnFailure:'DELETE',
		};
		options = nodeExtend(defaults, options);
        */
        if(!options.StackName) {
          callback("stack name is reqiured",null);
          return;
        } 
        

        awsCloudFormation.createStack(options,function(err,data){
             if(err) {
             	console.log('err=>>',err);
             	callback(err,null);
             	return;
             } 
             callback(null,data.StackId);  
        });
	}
}

module.exports = CloudFormation;