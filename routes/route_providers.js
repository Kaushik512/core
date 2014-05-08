var providers = require('../controller/providers.js')
var settingsController = require('../controller/settings');
var domainsDao = require('../controller/domains.js');
var EC2 = require('../controller/ec2.js');


module.exports.setRoutes = function(app, verifySession) {

	app.get('/', verifySession, function(req, res) {
		providers.getProviders(function(err, products) {
			console.log(products);
			res.render('index', {
				error: err,
				products: products
			});
		});
	});

	app.get('/providers/:pid/roles', verifySession, function(req, res) {
		console.log("fetching for pid ");
		console.log(req.params);
		var pid = req.params.pid;
		if (pid) {
			providers.getProviderRoles(pid, function(err, data) {
				//console.log(data);  
				res.render('providerRoles.ejs', {
					error: err,
					prod: data
				});
			});
		} else {
			res.send(404);
		}
	});

	/*app.post('/providers/:pid/roles/launch', verifySession, function(req, res) {
		settingsController.getSettings(function(settings) {
			var domainName = req.body.domainName;
			var pid = req.body.pid;
			var selectedInstances = req.body.selectedInstances;
			console.log(selectedInstances);
			if (selectedInstances) {
				domainsDao.createDomainDocument(domainName, pid, function(err, data) {
					if (err) {
						res.send(500, "unable to create domain");
					} else {
						var keys = Object.keys(selectedInstances);
						var ec2 = new EC2(settings.aws);
						var count = keys.length;
						for (var i = 0; i < keys.length; i++) {
							(
							function(inst) {
                               

							})(selectedInstances[keys[i]);
						}
					}
				});
			} else {
				res.send(400, "invalid parameters");
			}
		});
	});*/
}