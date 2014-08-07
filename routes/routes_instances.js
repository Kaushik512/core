var blueprintsDao = require('../classes/blueprints');
var settingsController = require('../controller/settings');
var instancesDao = require('../classes/instances');
var EC2 = require('../controller/ec2.js');
var Chef = require('../controller/chef.js');

module.exports.setRoutes = function(app, sessionVerificationFunc) {

	app.get('/project/:projectId/env/:envId/instances', function(req, res) {
		instancesDao.getInstancesByProjectAndEnvId(req.params.projectId, req.params.envId, req.query.instanceType, function(err, data) {
			if (err) {
				res.send(500);
				return;
			}
			res.send(data);
		});
	});

};