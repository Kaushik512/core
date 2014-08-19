var Process = require("./utils/process");
var fileIo = require('./utils/fileio');
var chefApi = require('chef');

var Chef = function(settings) {


	var chefClient = null;
	var that = this;

	function initializeChefClient(callback) {
		if (!chefClient) {
			fileIo.readFile(settings.chefReposLocation + settings.userChefRepoName + '/.chef/' + settings.chefUserPemFile, function(err, key) {
				if (err) {
					callback(err, null);
					return;
				}
				chefClient = chefApi.createClient(settings.chefUserName, key, settings.hostedChefUrl);
				callback(null, chefClient);
			});
		} else {
			callback(null, chefClient);
		}
	}


	this.getNodesDetailsForEachEnvironment = function(callback) {
		initializeChefClient(function(err, chefClient) {
			if (err) {
				callback(err, null);
				return;
			}
			chefClient.get('/nodes', function(err, chefRes, chefResBody) {
				if (err) {
					callback(err, null);
					return console.log(err);
				}
				var environmentList = {};
				var nodeNames = Object.keys(chefResBody);
				var count = 0;
				if (nodeNames.length) {
					for (var i = 0; i < nodeNames.length; i++) {
						chefClient.get('/nodes/' + nodeNames[i], function(err, chefRes, chefResBody) {
							count++;
							if (err) {
								console.log("Error getting details of node");
								return console.log(err);
							}
							if (!environmentList[chefResBody.chef_environment]) {
								environmentList[chefResBody.chef_environment] = {};
								environmentList[chefResBody.chef_environment].nodes = [];
							}
							environmentList[chefResBody.chef_environment].nodes.push(chefResBody);

							if (count === nodeNames.length - 1) {
								callback(null, environmentList);
							}

						});
					}
				} else {
					callback(null, environmentList);
				}

			});
		});

	}


}

module.exports = Chef;