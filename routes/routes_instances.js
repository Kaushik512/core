var blueprintsDao = require('../classes/blueprints');
var settingsController = require('../controller/settings');
var instancesDao = require('../classes/instances');
var EC2 = require('../classes/ec2.js');
var Chef = require('../classes/chef.js');
var taskstatusDao = require('../classes/taskstatus');

module.exports.setRoutes = function(app, sessionVerificationFunc) {

	app.all('/instances/*', sessionVerificationFunc);

	app.get('/instances/:instanceId', function(req, res) {
		instancesDao.getInstanceById(req.params.instanceId, function(err, data) {
			if (err) {
				res.send(500);
				return;
			}
			
			if (data.length) {
				res.send(data[0]);
			} else {
				res.send(404);
			}
		});
	})


	app.post('/instances/:instanceId/updateRunlist', function(req, res) {
		if (!req.body.runlist) {
			res.send(400);
			return;
		}
		instancesDao.getInstanceById(req.params.instanceId, function(err, data) {
			if (err) {
				res.send(500);
				return;
			}
			if (data.length) {
				settingsController.getSettings(function(settings) {
					var chef = new Chef(settings.chef);
					chef.updateNode(data[0].chefNodeName, req.body.runlist, function(err, nodeData) {
						if (err) {
							res.send(500);
							return;
						}
						instancesDao.updateInstancesRunlist(req.params.instanceId, req.body.runlist, function(err, updateCount) {
							if (err) {
								res.send(500);
								return;
							}
							res.send(200);
						});
					});
				});
			} else {
				res.send(404);
			}
		});
	});

	app.get('/instances/:instanceId/stopInstance', function(req, res) {
		instancesDao.getInstanceById(req.params.instanceId, function(err, data) {
			if (err) {
				res.send(500);
				return;
			}
			if (data.length) {

				settingsController.getAwsSettings(function(settings) {
					var ec2 = new EC2(settings);
					ec2.stopInstance([data[0].platformId], function(err, stoppingInstances) {
						if (err) {
							res.send(500);
							return;
						}
						res.send(200, {
							instanceCurrentState: stoppingInstances[0].CurrentState.Name,
						});

						instancesDao.updateInstanceState(req.params.instanceId, stoppingInstances[0].CurrentState.Name, function(err, updateCount) {
							if (err) {
								console.log("update instance state err ==>", err);
								return;
							}
							console.log('instance state upadated');
						});
					}, function(err, state) {
						if (err) {
							return;
						}
						instancesDao.updateInstanceState(req.params.instanceId, state, function(err, updateCount) {
							if (err) {
								console.log("update instance state err ==>", err);
								return;
							}
							console.log('instance state upadated');
						});
					});

				});
			} else {
				res.send(404);
				return;
			}
		});
	});

	app.get('/instances/:instanceId/startInstance', function(req, res) {
		instancesDao.getInstanceById(req.params.instanceId, function(err, data) {
			if (err) {
				res.send(500);
				return;
			}
			if (data.length) {

				settingsController.getAwsSettings(function(settings) {
					var ec2 = new EC2(settings);
					ec2.startInstance([data[0].platformId], function(err, startingInstances) {
						if (err) {
							res.send(500);
							return;
						}
						res.send(200, {
							instanceCurrentState: startingInstances[0].CurrentState.Name,
						});

						instancesDao.updateInstanceState(req.params.instanceId, startingInstances[0].CurrentState.Name, function(err, updateCount) {
							if (err) {
								console.log("update instance state err ==>", err);
								return;
							}
							console.log('instance state upadated');
						});
					}, function(err, state) {
						if (err) {
							return;
						}
						instancesDao.updateInstanceState(req.params.instanceId, state, function(err, updateCount) {
							if (err) {
								console.log("update instance state err ==>", err);
								return;
							}
							console.log('instance state upadated');
						});
					});

				});

			} else {
				res.send(404);
				return;
			}
		});

	});

};