var settingsController = require('../controller/settings');
var Chef = require('../classes/chef');
var instancesDao = require('../classes/instances');
var environmentsDao = require('../classes/d4dmasters/environments.js');

module.exports.setRoutes = function(app, verificationFunc) {

	app.all('/chef/*', verificationFunc);

	app.get('/chef/nodes', function(req, res) {
		settingsController.getChefSettings(function(settings) {
			var chef = new Chef(settings);
			chef.getNodesDetailsForEachEnvironment(function(err, environmentList) {
				if (err) {
					res.send(500);
					return;
				} else {
					res.send(environmentList);
				}
			});
		});
	});


	app.post('/chef/sync/nodes', function(req, res) {
		var reqBody = req.body;
		var projectId = reqBody.projectId;
		var orgId = reqBody.orgId;
		var count = 0;

		var insertNodeInMongo = function(node) {

			var instance = {
				projectId: projectId,
				envId: node.env,
				chefNodeName: node.nodeName,
				runlist: node.runlist,
				platformId: '',
				instanceIP: node.ip,
				instanceState: 'unknown',
				bootStrapStatus: 'success',
				bootStrapLog: {
					err: false,
					log: 'success',
					timestamp: new Date().getTime()
				},
				blueprintData: {
					blueprintName: "chef import",
					templateId: "chef_import"
				}

			}

			instancesDao.createInstance(instance, function(err, data) {
				if (err) {
					console.log(err, 'occured in inserting node in mongo');
					return;
				}
			});
		}

		function createEnv(node) {
			console.log('creating env ==>', node.env);
			console.log('orgId ==>', orgId);
			environmentsDao.createEnv(node.env, orgId, function(err, data) {
				count++;
				if (err) {
					console.log(err, 'occured in creating environment in mongo');
					return;
				}

				insertNodeInMongo(node);
				if (count === reqBody.selectedNodes.length - 1) {
					res.send(200);
				} else {
					createEnv(reqBody.selectedNodes[count]);
				}
			})
		}

		if (reqBody.selectedNodes.length) {
			createEnv(reqBody.selectedNodes[count]);
		}



	});

	app.post('/chef/environments/create', function(req, res) {

		settingsController.getChefSettings(function(settings) {
			var chef = new Chef(settings);
			chef.createEnvironment(req.body.envName, function(err, envName) {
				if (err) {
					res.send(500);
					return;
				} else {
					res.send(envName);
				}
			});
		});
	});

	app.get('/chef/cookbooks', function(req, res) {
		settingsController.getChefSettings(function(settings) {
			var chef = new Chef(settings);
			chef.getCookbooksList(function(err, cookbooks) {
				if (err) {
					res.send(500);
					return;
				} else {
					res.send(cookbooks);
				}
			});
		});
	});



};