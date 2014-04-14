var providers = require('./controller/providers.js')

module.exports.setRoutes = function(app, verificationFunc) {

	app.get('/', verificationFunc, function(req, res) {
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
				res.render('componentslist.ejs', {
					error: err,
					prod: data
				});
			});
		} else {
			res.send(404);
		}
	});

	


}