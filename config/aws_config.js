/*module.exports = {

	access_key : "AKIAI5JPZ6FOH4K3NQXQ",
	secret_key : "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",
	region : "us-east-1"
}*/

/*
module.exports = {

	access_key : "AKIAJFEXRU3MVMRJEBFA",
	secret_key : "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",
	region : "us-west-2"
}
*/

var awsSettings = {
	access_key : "AKIAI5JPZ6FOH4K3NQXQ",
	secret_key : "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",
	region : "us-east-1",
	keyPairName:"devopstest",
	securityGroupId : "sg-c00ee1a5",
	pemFileLocation : "/home/anshul/",
	pemFile:"/home/anshul/devopstest-us-west-2.pem"
}

module.exports.getAwsSettings = function() {
	return awsSettings;
}
module.exports.setAwsSettings = function(access_key,secret_key,region,keyPairName,securityGroupId,pemFile) {
   awsSettings.access_key = access_key;
   awsSettings.secret_key=secret_key;
   awsSettings.region=region;
   awsSettings.keyPairName=keyPairName;
   awsSettings.securityGroupId=securityGroupId;
   awsSettings.pemFile = pemFile;
}

