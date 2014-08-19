var settingsController = require('../controller/settings');
var Chef = require('../classes/chef');

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



};