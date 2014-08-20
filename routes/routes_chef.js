var settingsController = require('../controller/settings');
var Chef = require('../classes/chef');
var instancesDao = require('../classes/instances');

module.exports.setRoutes = function(app, verificationFunc) {

	app.get('/chef/nodes', verificationFunc, function(req, res) {
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


	app.post('/chef/sync/nodes', verificationFunc, function(req, res) {
		var reqBody = req.body;
		var projectId = reqBody.projectId;
		var count = 0;
		for (var i = 0; i < reqBody.selectedNodes.length; i++) {
			var node = reqBody.selectedNodes[i];
			var instance = {
				projectId: projectId,
				envId: node.env,
				runlist: node.runlist,
				platformId: node.nodeName,
				instanceIP: node.ip,
				instanceState: 'running',
				bootStrapStatus: 'success',
				bootStrapLog: {
					err: false,
					log: 'success',
					timestamp: new Date().getTime()
				},
				blueprintData: {
					blueprintName: "chef import",
				}

			}

			instancesDao.createInstance(instance, function(err, data) {
				count++;
				if (err) {
					return;
				}
				if (count === reqBody.selectedNodes.length - 1) {
					res.send(200);
				}
			});
		}

	});



};