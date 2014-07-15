var settingsController = require('../controller/settings');
var Chef = require('../controller/chef.js');

module.exports.setRoutes = function(app, verifySession) {

	app.get('/docker', verifySession, function(req, res) {
		res.render('docker');
	});

	app.post('/docker/configureTemplate', verifySession, function(req, res) {
		settingsController.getChefSettings(function(settings) {
			//res.render('cookbooks');
			var chef = new Chef(settings);
			chef.getHostedChefCookbooks(function(err, resp) {
				res.render('docker-configureTemplate.ejs',{
					cookbooks:resp,
					selectedItems:req.body.selectedItems
				});
			});
		});
	});

};