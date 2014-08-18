var settingsController = require('../controller/settings');
var fileIo = require('../controller/fileio');
var Chef = require('../controller/chef');

var chefApi = require('chef');

module.exports.setRoutes = function(app, verificationFunc) {


	app.get('/chef/workstation/cookbooks/', verificationFunc, function(req, res) {
		var path = req.query.path;
		settingsController.getChefSettings(function(settings) {
			//res.render('cookbooks');
			var chef = new Chef(settings);

			function getCookbookData() {
				chef.getCookbookData(path, function(err, data) {
					if (err) {
						res.send(500);
					} else {
						res.json(data);
					}
				});
			}
			if (!(path) || path === '/') {
				chef.downloadCookbooks(function(err, code) {
					if (err || code != 0) {
						res.send(500);
					} else {
						getCookbookData();
					}

				});
			} else {
				getCookbookData();
			}
		});
	});

	app.post('/chef/workstation/cookbooks/', verificationFunc, function(req, res) {
		var path = req.body.filePath;
		var fileContent = req.body.fileContent;
		settingsController.getChefSettings(function(settings) {
			var chef = new Chef(settings);
			chef.saveCookbookFile(path, fileContent, function(err) {
				if (err) {
					console.log(err);
					res.send(500);
				} else {
					res.send(200);
				}
			});
		});
	});

	app.get('/chef/workstation/roles/', verificationFunc, function(req, res) {
		var path = req.query.path;
		settingsController.getChefSettings(function(settings) {
			//res.render('cookbooks');
			var chef = new Chef(settings);

			function getRolesData() {
				chef.getRoleData(path, function(err, data) {
					if (err) {
						res.send(500);
					} else {
						res.json(data);
					}
				});
			}
			if (!(path) || path === '/') {
				chef.downloadRoles(function(err, code) {
					if (err || code != 0) {
						res.send(500);
					} else {
						getRolesData();
					}

				});
			} else {
				getRolesData();
			}
		});
	});

	app.post('/chef/workstation/roles/', verificationFunc, function(req, res) {
		var path = req.body.filePath;
		var fileContent = req.body.fileContent;
		settingsController.getChefSettings(function(settings) {
			var chef = new Chef(settings);
			chef.saveRoleFile(path, fileContent, function(err) {
				if (err) {
					console.log(err);
					res.send(500);
				} else {
					res.send(200);
				}
			});
		});
	});

	app.get('/chef/sync', verificationFunc, function(req, res) {
		settingsController.getChefSettings(function(settings) {
			fileIo.readFile(settings.chefReposLocation + settings.userChefRepoName + '/.chef/' + settings.chefUserPemFile, function(err, key) {
				chefClient = chefApi.createClient(settings.chefUserName, key, settings.hostedChefUrl);
				var environmentList = {}
				chefClient.get('/nodes', function(err, chefRes, chefResBody) {
					if (err) {
						res.send(500);
						return console.log(err);
					}
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
									res.send(environmentList);
								}

							});
						}
					} else {
						res.send({});
					}

				});

			});
		});
	});



};