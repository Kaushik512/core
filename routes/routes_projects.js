var blueprintsDao = require('../classes/blueprints');
var settingsController = require('../controller/settings');
var instancesDao = require('../classes/instances');

module.exports.setRoutes = function(app, sessionVerificationFunc) {

	app.all('/projects/*', sessionVerificationFunc);

	app.get('/projects/:projectId/environments/:envId/blueprints', function(req, res) {
		blueprintsDao.getBlueprintsByProjectAndEnvId(req.params.projectId, req.params.envId, req.query.blueprintType, function(err, data) {
			if (err) {
				res.send(500);
				return;
			}
			res.send(data);
		});
	});

	app.post('/projects/:projectId/environments/:envId/blueprints', function(req, res) {
		var blueprintData = req.body.blueprintData;
		blueprintData.projectId = req.params.projectId;
		blueprintData.envId = req.params.envId;
		if(!blueprintData.runlist) {
			blueprintData.runlist = [];
		}
		//blueprintData.runlist.splice(0, 0, 'recipe[ohai]');

		blueprintsDao.createBlueprint(blueprintData, function(err, data) {
			if (err) {
				res.send(500);
				return;
			}
			res.send(data);
		});
	});

	app.get('/projects/:projectId/environments/:envId/instances', function(req, res) {
		instancesDao.getInstancesByProjectAndEnvId(req.params.projectId, req.params.envId, req.query.instanceType, function(err, data) {
			if (err) {
				res.send(500);
				return;
			}
			res.send(data);
		});
	});


};