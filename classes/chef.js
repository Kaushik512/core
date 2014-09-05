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

							if (count === nodeNames.length) {
								callback(null, environmentList);
							}

						});
					}
				} else {
					callback(null, environmentList);
				}

			});
		});

	};

	this.getCookbooksList = function(callback) {

		initializeChefClient(function(err, chefClient) {
			if (err) {
				callback(err, null);
				return;
			}
			chefClient.get('/cookbooks', function(err, chefRes, chefResBody) {
				if (err) {
					callback(err, null);
					return;
				}
				console.log("chef status ", chefRes.statusCode);
				if (chefRes.statusCode === 200) {
					callback(null, chefResBody);
				} else {
					callback(true, null);
				}

			});

		});
	}

	this.createEnvironment = function(envName, callback) {
		initializeChefClient(function(err, chefClient) {
			if (err) {
				callback(err, null);
				return;
			}
			chefClient.post('/environments', {
				"name": envName,
				"json_class": "Chef::Environment",
				"description": "",
				"chef_type": "environment"
			}, function(err, chefRes, chefResBody) {
				if (err) {
					callback(err, null);
					return;
				}
				console.log("chef status create==> ", chefRes.statusCode);
				if (chefRes.statusCode === 201) {
					callback(null, envName);
				} else {
					callback(true, null);
				}

			});

		});

	}

	this.getEnvironment = function(envName, callback) {
		initializeChefClient(function(err, chefClient) {
			if (err) {
				callback(err, null);
				return;
			}
			chefClient.get('/environments/' + envName, function(err, chefRes, chefResBody) {
				if (err) {
					callback(err, null);
					return;
				}
				console.log("chef status ==> ", chefRes.statusCode);
				if (chefRes.statusCode === 404) {
					callback(null, null);
				} else if (chefRes.statusCode === 200) {
					callback(null, chefResBody);
				} else {
					callback(true, null);
				}


			});

		});

	};

	this.updateNode = function(nodeName, updateData, callback) {
		initializeChefClient(function(err, chefClient) {
			if (err) {
				callback(err, null);
				return;
			}
			console.log('nodeName == >', nodeName);
			chefClient.put('/nodes/' + nodeName, updateData, function(err, chefRes, chefResBody) {
				if (err) {
					callback(err, null);
					return;
				}
				console.log("chef status ==> ", chefRes.statusCode);
				if (chefRes.statusCode === 200) {
					callback(null, chefResBody);
				} else {
					callback(true, null);
				}
			});
		});
	};

	this.bootstrapInstance = function(params, callback, callbackOnStdOut, callbackOnStdErr) {
		var options = {
			cwd: settings.chefReposLocation + settings.userChefRepoName,
			onError: function(err) {
				callback(err, null);
			},
			onClose: function(code) {
				callback(null, code);
			}
		};
		if (typeof callbackOnStdOut === 'function') {
			options.onStdOut = function(data) {
				callbackOnStdOut(data);
			}
		}

		if (typeof callbackOnStdErr === 'function') {
			options.onStdErr = function(data) {
				callbackOnStdErr(data);
			}
		}
		if ((!(params.runlist) || !params.runlist.length)) {
			params.runlist = [' '];

		}

		var proc = new Process('knife', ['bootstrap', params.instanceIp, '-i' + params.pemFilePath, '-r' + params.runlist.join(), '-x' + params.instanceUserName, '-N' + params.nodeName, '-E' + params.environment], options);
		proc.start();
	};

	this.updateAndRunNodeRunlist = function(nodeName,params, callback, callbackOnStdOut, callbackOnStdErr) {
		var options = {
			cwd: settings.chefReposLocation + settings.userChefRepoName,
			onError: function(err) {
				callback(err, null);
			},
			onClose: function(code) {
				callback(null, code);
			}
		};
		if (typeof callbackOnStdOut === 'function') {
			options.onStdOut = function(data) {
				callbackOnStdOut(data);
			}
		}

		if (typeof callbackOnStdErr === 'function') {
			options.onStdErr = function(data) {
				callbackOnStdErr(data);
			}
		}
		if ((!(params.runlist) || !params.runlist.length)) {
			params.runlist = [' '];

		}
//      knife ssh 'name:<node_name>' 'chef-client -r "recipe[a]"' -x root -P pass

		var proc = new Process('knife', ['ssh', 'name:'+nodeName,'chef-client -r "'+params.runlist.join()+'"', '-i' + params.pemFilePath, '-x' + params.instanceUserName,'-a'+params.instancePublicIp], options);
		proc.start();
	};



}

module.exports = Chef;