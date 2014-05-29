var settingsController = require('../controller/settings');
var domainsDao = require('../controller/domains.js');

var Chef = require('../controller/chef.js');



module.exports.setRoutes = function(app, sessionVerificationFunc) {

	app.get('/environments/:pid', sessionVerificationFunc, function(req, res) {
		console.log(req.query.envType);

		settingsController.getChefSettings(function(settings) {
			var chef = new Chef(settings);
			chef.getHostedChefCookbooks(function(err, resp) {
				if (err) {
					res.send(500);
					return;
				}
				domainsDao.getAllDomainData(req.params.pid, function(err, domainsdata) {
					if (err) {
						res.send(500);
						return;
					}
					res.render('environments', {
						error: err,
						cookbooks: resp,
						envType: req.query.envType,
						pid: req.params.pid,
						domains: domainsdata
					});

				});

			});
		});
	});

	app.post('/environments/saveBluePrint',sessionVerificationFunc, function(req, res) {
		domainsDao.upsertEnvironmentBlueprint(req.body.pid, req.body.domainName, req.body.bluePrintName, function(err, data) {
			if (err) {
				res.send(500);
				console.log(err);
				return;
			} else {
				res.send(200);
			}
		});
	});

}