
var path = require('path-extra');

var currentDirectory = __dirname;
console.log("aws ==> ",currentDirectory);

var awsSettings = {
	access_key : "AKIAI6TVFFD23LMBJUPA",
	secret_key : "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",
	region : "us-west-2",
	keyPairName:"catalyst",
	securityGroupId : "sg-c00ee1a5",
	pemFileLocation : currentDirectory+'/',
	pemFile:"catalyst.pem",
	instanceUserName:"ec2-user"
}


module.exports = awsSettings;


