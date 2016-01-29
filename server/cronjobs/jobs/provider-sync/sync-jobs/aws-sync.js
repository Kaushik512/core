var logger = require('_pr/logger')(module);
var AWSProvider = require('_pr/model/classes/masters/cloudprovider/awsCloudProvider.js');
var MasterUtils = require('_pr/lib/utils/masterUtil.js');
var appConfig = require('_pr/config');
var Cryptography = require('_pr/lib/utils/cryptography');



function sync() {
	var orgs = MasterUtils.getAllActiveOrg(function(err, orgs) {
		if (err) {
			logger.error('Unable to fetch orgs ==>', err);
			return;
		}
		if (!(orgs && orgs.length)) {
			logger.warn('No org found');
			return;
		}
		logger.debug('orgs ==> ', JSON.stringify(orgs));
		for (var i = 0; i < orgs.length; i++) {
			AWSProvider.getAWSProvidersByOrgId(orgs[i]._id, function(err, providers) {
				for (var j = 0; j < providers.length; j++) {
					(function(provider) {
						var cryptoConfig = appConfig.cryptoSettings;
						var cryptography = new Cryptography(cryptoConfig.algorithm, cryptoConfig.password);
						var keys = [];
						keys.push(aProvider.accessKey);
						keys.push(aProvider.secretKey);
						cryptography.decryptMultipleText(keys, cryptoConfig.decryptionEncoding, cryptoConfig.encryptionEncoding, function(err, decryptedKeys) {
							if (err) {
								logger.error('unable to decrypt keys', err);
								return;
							}

							var regions = appConfig.aws.regions;
							for (var k = 0; k < regions.length; k++) {
								var ec2 = new EC2({
									"access_key": decryptedKeys[0],
									"secret_key": decryptedKeys[1],
									"region": regions[k].region
								});

								ec2.describeInstances(null, function(err, awsRes) {
									if (err) {
										logger.error("Unable to fetch instances from aws", err);
										return;
									}
									var reservations = awsRes.Reservations;
									for (var l = 0; l < reservations.length; l++) {

										if (reservations[l].Instances && reservations[l].Instances.length) {
											//instances = reservations[k].Instances;
											var awsInstances = reservations[l].Instances;
											for (var m = 0; m < awsInstances.length; m++) {

												

											}

										}

									}

								});
							}



						});
					})(providers[j]);
				}

			});
		}
	});
}


module.exports = sync;