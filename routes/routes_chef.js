var settingsController = require('../controller/settings');
var fileIo = require('../controller/fileio');
var Chef = require('../controller/chef');

module.exports.setRoutes = function(app, verificationFunc) {



	app.post('/chef/hosted/cookbooks', verificationFunc, function(req, res) {
		console.log('Returning Available Cookbooks...!!');
		console.log(req.body);
		settingsController.getChefSettings(function(settings) {
			//res.render('cookbooks');
			var chef = new Chef(settings);
			chef.getHostedChefCookbooks(function(err, resp) {
				res.render('cookbook', {
					error: err,
					cookbooks: resp,
					prodSelected: req.body
				});
			});
		});

	});



	app.get('/chef/workstation/cookbooks/', verificationFunc, function(req, res) {
		var path = req.query.path;
		settingsController.getChefSettings(function(settings) {
			//res.render('cookbooks');
			var chef = new Chef(settings);

			function getCookbookData() {
				chef.getCookbookData(path, function(err, data) {
					if (err) {
						res.send(500);
					} else {
						res.json(data);
					}
				});
			}
			if (!(path) || path === '/') {
				chef.downloadCookbooks(function(err, code) {
					if (err || code != 0) {
						res.send(500);
					} else {
						getCookbookData();
					}

				});
			} else {
				getCookbookData();
			}
		});
	});

	app.post('/chef/workstation/cookbooks/', verificationFunc, function(req, res) {
		var path = req.body.filePath;
		var fileContent = req.body.fileContent;
		settingsController.getChefSettings(function(settings) {
			var chef = new Chef(settings);
			chef.saveCookbookFile(path,fileContent,function(err){
				if(err) {
					console.log(err);
					res.send(500);
				} else {
					res.send(200);
				}
			});
		});
	});



};