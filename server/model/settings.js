var awsDefault = require('../config/aws_config');
var chefDefault = require('../config/chef_config');
var mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost/devops');

var Schema = mongoose.Schema;


var SettingsSchema = new Schema({
	name: String,
	settings: {
		//aws settings
		access_key: String,
		secret_key: String,
		region: String,
		keyPairName: String,
		securityGroupId: String,
		pemFile: String,
		pemFileLocation: String,
		instanceUserName: String,

		//chef settings
		chefReposLocation: String,
		userChefRepoName: String,
		chefUserName: String,
		chefUserPemFile: String,
		chefValidationPemFile: String,
		hostedChefUrl: String
	}
});

var Settings = mongoose.model('settings', SettingsSchema);


function getSettings(settingsName, callback) {
	var query = {};
	/*if(settingsName) {
		query.name = settingsName;
	}*/
	Settings.find(query, function(err, data) {

		if (err) {
			console.log(err);
			callback({
				aws: awsDefault,
				chef: chefDefault
			});
		}
		var awsSettings;
		var chefSettings;
		if (data.length) {
			data.forEach(function(item) {
				if (item.name == 'aws') {
					awsSettings = item.settings;
				} 

				if (item.name == 'chef') {
					chefSettings = item.settings;
				} 
				console.log(item);
			});

			if(!awsSettings) {
              awsSettings = awsDefault;
			}
			if(!chefSettings) {
              chefSettings = chefDefault;
			}

			//callback(data[0].settings);
		} else {
			awsSettings = awsDefault;
			chefSettings = chefDefault;
		}

		if (settingsName) {
			switch (settingsName) {
				case 'aws':
					callback(awsSettings);
					return;
				case 'chef':
					callback(chefSettings);
					return;
			}
		} else {
			callback({
				aws: awsSettings,
				chef: chefSettings
			});
		}

	});
}


module.exports.getAwsSettings = function(callback) {
	getSettings('aws', callback);
}

module.exports.getChefSettings = function(callback) {
	getSettings('chef', callback);
}
module.exports.getSettings = function(callback) {
	getSettings(null, callback);
}

module.exports.setAwsSettings = function(access_key, secret_key, region, keyPairName, securityGroupId, pemFile, callback) {
	var awsSettings = {};
	awsSettings.access_key = access_key;
	awsSettings.secret_key = secret_key;
	awsSettings.region = region;
	awsSettings.keyPairName = keyPairName;
	awsSettings.securityGroupId = securityGroupId;
	awsSettings.pemFile = pemFile;
	awsSettings.pemFileLocation = awsDefault.pemFileLocation
	awsSettings.instanceUserName = awsDefault.instanceUserName;
	Settings.update({
		name: 'aws'
	}, {
		$set: {
			"settings": awsSettings
		}
	}, {
		upsert: true
	}, function(err, data) {

		if (err) {
			callback(err, null);
			return;
		}
		callback(null, data);

	});
}

module.exports.setChefSettings = function(userChefRepoName, chefUserName, chefUserPemFile, chefValidationPemFile, hostedChefUrl, callback) {
	var chefSettings = {};
	chefSettings.chefReposLocation = chefDefault.chefReposLocation;
	chefSettings.userChefRepoName = userChefRepoName;
	chefSettings.chefUserName = chefUserName;
	chefSettings.chefUserPemFile = chefUserPemFile;
	chefSettings.chefValidationPemFile = chefValidationPemFile;
	chefSettings.hostedChefUrl = hostedChefUrl;



	Settings.update({
		name: 'chef'
	}, {
		$set: {
			"settings": chefSettings
		}
	}, {
		upsert: true
	}, function(err, data) {

		if (err) {
			callback(err, null);
			return;
		}
		callback(null, data);

	});
}