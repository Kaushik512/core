/*
Copyright [2016] [Gobinda Das]

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

var exec = require('child_process').exec;
var SSHExec = require('./utils/sshexec');
var logger = require('_pr/logger')(module);
var Process = require("./utils/process");
var Curl = require("./utils/curl.js");
var appConfig = require('_pr/config');

var path = require('path');
var fs = require('fs');
var request = require('request');

var waitForPort = require('wait-for-port');
var adal = require('adal-node');



var ARM = function(options) {

	/*var options = {
	    subscriptionId: "f2c53cd4-5d0f-4c6d-880b-6af801de9b21",
	    certLocation: "/Office/Work/Azure/certs/management.pem",
	    keyLocation: "/Office/Work/Azure/certs/management.key"
	};*/

	var clientId = '53114209-b33b-497c-be26-6e282cad85ef' //'4c7921bf-0f41-453d-a79e-59d4af1f8a3e';
	var clientSecret = '+1c3YrAq4DbGnRxdnlU84IyYhPtI7UC5F7s2joNmwBI=' //'opCdluv+n2FVFA2bBsDHonvnKArxyfEhgDEzl4PsjCA='
	var tenant = '5a96ecbd-b05f-4363-a243-713dc2588bea';

	var token = options.token;


	function getToken(callback) {
		if (!token) {

			var authorityHostUrl = 'https://login.windows.net';

			var resource = 'https://management.azure.com/';
			var authorityUrl = authorityHostUrl + '/' + tenant;

			logger.debug("authorityUrl: ", authorityUrl);

			var AuthenticationContext = adal.AuthenticationContext;

			var context = new AuthenticationContext(authorityUrl);

			context.acquireTokenWithClientCredentials(resource, clientId,
				clientSecret,
				function(err, tokenResponse) {
					if (err) {
						callback(err, null);
						return;
					} else {
						logger.debug('token ==> ', tokenResponse);
						token = tokenResponse.accessToken;
						callback(null, tokenResponse.accessToken);
					}
				});

		} else {
			process.nextTick(function() {
				callback(null, token);
			});
		}
	}



	this.getResourceGroups = function(callback) {

		getToken(function(err, token) {
			if (err) {
				callback(err, null);
				return;
			}

			logger.debug('subscrition ID ==>' + options.subscriptionId);

			var opts = {
				uri: 'https://management.azure.com/subscriptions/' + options.subscriptionId +
					'/resourcegroups?api-version=2015-01-01',
				headers: {
					"Content-Type": "application/json",
					"Authorization": "Bearer " + token
				}
			}

			request.get(opts, function(err, response, body) {

				if (err) {
					//logger.debug("Error...",err);
					callback(err, null);
					return;
				}

				logger.debug("response.statusCode: ", response.statusCode);

				if (response.statusCode == '200') {
					callback(null, body);
					return;
				} else {
					callback({
						messgae: "Invalid res code"
					}, null);
					return;
				}

			});
		});


	};

	this.createResourceGroup = function(name, callback) {

		getToken(function(err, token) {
			if (err) {
				callback(err, null);
				return;
			}

			var opts = {
				uri: 'https://management.azure.com/subscriptions/' + options.subscriptionId +
					'/resourcegroups/' + name + '?api-version=2015-01-01',
				headers: {
					"Content-Type": "application/json",
					"Authorization": "Bearer " + token
				},
				body: {
					"location": "West US",
					"tags": {
						"tagname1": "tagvalue1"
					}
				},
				json: true
			}

			request.put(opts, function(err, response, body) {

				if (err) {
					//logger.debug("Error...",err);
					callback(err, null);
					return;
				}

				logger.debug("response.statusCode: ", response.statusCode);

				if (response.statusCode == '201' || response.statusCode ==
					'200') {

					callback(null, body);
					return;
				} else {
					callback({
						message: "Invalid Response Code : " + response.statusCode
					}, null);
					return;
				}

			});
		});

	};

	this.deployTemplate = function(deployParams, callback) {
		getToken(function(err, token) {
			if (err) {
				callback(err, null);
				return;
			}

			var opts = {
				uri: 'https://management.azure.com/subscriptions/' + options.subscriptionId +
					'/resourcegroups/' + deployParams.resourceGroup +
					'/providers/microsoft.resources/deployments/' +
					deployParams.name + '?api-version=2015-01-01',
				headers: {
					"Content-Type": "application/json",
					"Authorization": "Bearer " + token
				},
				body: {
					"properties": {
						"mode": "Incremental",
						"template": deployParams.template,
						"parameters": deployParams.parameters
					}
				},
				json: true
			};

			request.put(opts, function(err, response, body) {

				if (err) {
					callback(err, null);
					return;
				}

				logger.debug("response.statusCode: ", response.statusCode);

				if (response.statusCode == '200' || response.statusCode ==
					'201') {
					callback(null, body);
					return;
				} else {
					callback({
						message: "Invalid Response Code : " + response.statusCode
					}, null);
					return;
				}

			});



		});
	};

	this.getDeployedTemplate = function(deployParams, callback) {
		getToken(function(err, token) {
			if (err) {
				callback(err, null);
				return;
			}

			var opts = {
				uri: 'https://management.azure.com/subscriptions/' + options.subscriptionId +
					'/resourcegroups/' + deployParams.resourceGroup +
					'/providers/microsoft.resources/deployments/' +
					deployParams.name + '?api-version=2015-01-01',
				headers: {
					"Content-Type": "application/json",
					"Authorization": "Bearer " + token
				},
			};

			request.get(opts, function(err, response, body) {

				if (err) {
					//logger.debug("Error...",err);
					callback(err, null);
					return;
				}

				logger.debug("response.statusCode: ", response.statusCode);

				if (response.statusCode == '200' || response.statusCode ==
					'201') {
					if (typeof body === 'string') {
						body = JSON.parse(body)
					}
					callback(null, body);
					return;
				} else {
					callback({
						message: "Invalid Response Code : " + response.statusCode
					}, null);
					return;
				}

			});
		});
	};

	this.deleteDeployedTemplate = function(deployParams, callback) {
		getToken(function(err, token) {
			if (err) {
				callback(err, null);
				return;
			}

			var opts = {
				uri: 'https://management.azure.com/subscriptions/' + options.subscriptionId +
					'/resourcegroups/' + deployParams.resourceGroup +
					'/providers/microsoft.resources/deployments/' +
					deployParams.name + '?api-version=2015-01-01',
				headers: {
					"Content-Type": "application/json",
					"Authorization": "Bearer " + token
				},
			};

			request.del(opts, function(err, response, body) {

				if (err) {
					//logger.debug("Error...",err);
					callback(err, null);
					return;
				}

				logger.debug("response.statusCode: ", response.statusCode);

				if (response.statusCode == '200' || response.statusCode ==
					'202') {
					callback(null, null);
					return;
				} else {
					callback({
						message: "Invalid Response Code : " + response.statusCode
					}, null);
					return;
				}

			});
		});
	};

	this.waitForDeploymentCompleteStatus = function(deployParams, callback) {
		var self = this;
		logger.debug('Checking status ==>');
		this.getDeployedTemplate(deployParams, function(err, deployedTemplate) {
			if (err) {
				callback(err, null);
				return;
			}
			logger.debug('status ==>', deployedTemplate.properties.provisioningState);
			switch (deployedTemplate.properties.provisioningState) {
				case 'Succeeded':
					callback(null, deployedTemplate);
					break;
				case 'Failed':
					callback({
						status: deployedTemplate.properties.provisioningState
					}, null);
					break;
				case 'Canceled':
					callback({
						status: deployedTemplate.properties.provisioningState
					}, null);
					break;
				case 'Deleted':
					callback({
						status: deployedTemplate.properties.provisioningState
					}, null);
					break;
				default:
					setTimeout(function() {
						self.waitForDeploymentCompleteStatus(deployParams,
							callback);
					}, 3000);
					return;
			}

		});
	};

	this.getDeploymentVMData = function(deployParams, callback) {

		getToken(function(err, token) {
			if (err) {
				callback(err, null);
				return;
			}

			var uri = 'https://management.azure.com/subscriptions/' + options
				.subscriptionId + '/resourceGroups/' + deployParams.resourceGroup +
				'/providers/Microsoft.Compute/virtualMachines/' + deployParams.name;
			if (deployParams.instanceView) {
				uri = uri + '/InstanceView';
			}
			uri = uri + '?api-version=2015-06-15';


			var opts = {
				uri: uri,
				headers: {
					"Content-Type": "application/json",
					"Authorization": "Bearer " + token
				},
			};

			request.get(opts, function(err, response, body) {

				if (err) {
					//logger.debug("Error...",err);
					callback(err, null);
					return;
				}



				if (response.statusCode == '200' || response.statusCode ==
					'201') {
					if (typeof body === 'string') {
						body = JSON.parse(body)
					}
					callback(null, body);
					return;
				} else {
					callback({
						message: "Invalid Response Code : " + response.statusCode
					}, null);
					return;
				}

			});
		});

	};

	this.getNetworkInterface = function(deployParams, callback) {
		getToken(function(err, token) {
			if (err) {
				callback(err, null);
				return;
			}

			var uri;
			if (deployParams.id) {
				uri = 'https://management.azure.com' + deployParams.id +
					'?api-version=2015-06-15';
			} else {
				uri = 'https://management.azure.com/subscriptions/' + options.subscriptionId +
					'/resourceGroups/' + deployParams.resourceGroup +
					'/providers/Microsoft.Network/networkInterfaces/' +
					deployParams.name + '?api-version=2015-06-15';
			}

			var opts = {
				uri: uri,
				headers: {
					"Content-Type": "application/json",
					"Authorization": "Bearer " + token
				},
			};

			request.get(opts, function(err, response, body) {

				if (err) {
					//logger.debug("Error...",err);
					callback(err, null);
					return;
				}

				logger.debug("response.statusCode: ", response.statusCode,
					body);

				if (response.statusCode == '200' || response.statusCode ==
					'201') {
					if (typeof body === 'string') {
						body = JSON.parse(body)
					}
					callback(null, body);
					return;
				} else {
					callback({
						message: "Invalid Response Code : " + response.statusCode
					}, null);
					return;
				}

			});
		});

	};

	this.getPublicIpAddress = function(deployParams, callback) {
		getToken(function(err, token) {
			if (err) {
				callback(err, null);
				return;
			}
			var uri;
			if (deployParams.id) {
				uri = 'https://management.azure.com' + deployParams.id +
					'?api-version=2015-06-15';

			} else {
				uri = 'https://management.azure.com/subscriptions/' + options.subscriptionId +
					'/resourceGroups/' + deployParams.resourceGroup +
					'/providers/Microsoft.Network/publicIPAddresses/' +
					deployParams.name + '?api-version=2015-06-15';

			}



			var opts = {
				uri: uri,
				headers: {
					"Content-Type": "application/json",
					"Authorization": "Bearer " + token
				},
			};

			request.get(opts, function(err, response, body) {

				if (err) {
					//logger.debug("Error...",err);
					callback(err, null);
					return;
				}

				logger.debug("response.statusCode: ", response.statusCode,
					body);

				if (response.statusCode == '200' || response.statusCode ==
					'201') {
					if (typeof body === 'string') {
						body = JSON.parse(body)
					}
					callback(null, body);
					return;
				} else {
					callback({
						message: "Invalid Response Code : " + response.statusCode
					}, null);
					return;
				}

			});
		});

	};

	this.startVM = function(deployParams, callback, callbackOnComplete) {
		getToken(function(err, token) {
			if (err) {
				callback(err, null);
				return;
			}
			var uri;
			if (deployParams.id) {
				uri = 'https://management.azure.com' + deployParams.id +
					'?api-version=2015-06-15';

			} else {

				uri = 'https://management.azure.com/subscriptions/' + options.subscriptionId +
					'/resourceGroups/' + deployParams.resourceGroup +
					'/providers/Microsoft.Compute/virtualMachines/' +
					deployParams.name + '/start?api-version=2015-06-15';

			}

			var opts = {
				uri: uri,
				headers: {
					"Content-Type": "application/json",
					"Authorization": "Bearer " + token
				},
			};

			request.post(opts, function(err, response, body) {

				if (err) {
					//logger.debug("Error...",err);
					callback(err, null);
					return;
				}

				logger.debug("response.statusCode: ", response.statusCode,
					body);

				if (response.statusCode == '200' || response.statusCode ==
					'201') {
					if (typeof body === 'string') {
						body = JSON.parse(body)
					}
					callback(null, body);
					return;
				} else {
					callback({
						message: "Invalid Response Code : " + response.statusCode
					}, null);
					return;
				}

			});
		});
	};

	this.stopVM = function(deployParams, callback, callbackOnComplete) {
		var self = this;
		getToken(function(err, token) {
			if (err) {
				callback(err, null);
				return;
			}
			var uri;
			if (deployParams.id) {
				uri = 'https://management.azure.com' + deployParams.id +
					'?api-version=2015-06-15';

			} else {

				uri = 'https://management.azure.com/subscriptions/' + options.subscriptionId +
					'/resourceGroups/' + deployParams.resourceGroup +
					'/providers/Microsoft.Compute/virtualMachines/' +
					deployParams.name + '/stop?api-version=2015-06-15';

			}


			var opts = {
				uri: uri,
				headers: {
					"Content-Type": "application/json",
					"Authorization": "Bearer " + token
				},
			};

			request.post(opts, function(err, response, body) {
				logger.error("Error...", err);

				if (err) {
					//logger.debug("Error...",err);
					callback(err, null);
					return;
				}

				logger.debug("response.statusCode: ", response.statusCode,
					body);

				if (response.statusCode == '200' || response.statusCode ==
					'201') {

					if (typeof body === 'string') {
						body = JSON.parse(body)
					}
					callback(null, body);

					function pollForStatusComplete() {

						self.getDeploymentVMData(deployParams, function(err, vmBody) {

							if (err) {

							} else {
								setTimeout(function() {
									pollForStatusComplete();
								}, 3000);
							}
						});
					}

					return;
				} else {
					callback({
						message: "Invalid Response Code : " + response.statusCode
					}, null);
					return;
				}

			});
		});
	};


}


module.exports = ARM;