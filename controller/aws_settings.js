var awsDefault = require('../config/aws_config');
var mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost/devops');

var Schema = mongoose.Schema;


var SettingsSchema = new Schema({
	name: String,
	settings: {
		access_key: String,
		secret_key: String,
		region: String,
		keyPairName: String,
		securityGroupId: String,
		pemFile: String,
		pemFileLocation:String
	}
});

var Settings = mongoose.model('settings', SettingsSchema);

module.exports.getAwsSettings = function(callback) {
	Settings.find({
		name: 'aws'
	}, function(err, data) {
		if (err) {
			console.log(err);
			callback(awsDefault);
		}
		if (data.length) {
			callback(data[0].settings);
		} else {
			callback(awsDefault);
		}

	});
}
module.exports.setAwsSettings = function(access_key, secret_key, region, keyPairName, securityGroupId, pemFile,callback) {
	var awsSettings = {};
	awsSettings.access_key = access_key;
	awsSettings.secret_key = secret_key;
	awsSettings.region = region;
	awsSettings.keyPairName = keyPairName;
	awsSettings.securityGroupId = securityGroupId;
	awsSettings.pemFile = pemFile;
	awsSettings.pemFileLocation = awsDefault.pemFileLocation
	Settings.update({
		name: 'aws'
	},{$set: {"settings":awsSettings}},{upsert:true},function(err,data){

    if(err){
      callback(err,null);
      return;
    } 
    callback(null,data);

  });
}