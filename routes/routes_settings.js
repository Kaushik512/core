var settingsController = require('../controller/settings');
var fileIo = require('../controller/fileio');
module.exports.setRoutes = function(app, verificationFunc) {

	app.post('/settings/aws', verificationFunc, function(req, resp) {
		if (req.body.aws_accessKey && req.body.aws_secretKey && req.body.aws_region && req.body.aws_keyPair && req.body.aws_securityGroupId && req.files.awsPemFile.size) {
			var fileName = req.files.awsPemFile.name;
			//console.log(req.files);
			fileIo.readFile(req.files.awsPemFile.path, function(err, data) {
				console.log("reading file");
				settingsController.getAwsSettings(function(settings) {
					console.log("I m here");
					fileIo.writeFile(settings.pemFileLocation + fileName, data, null, function(err) {
						console.log("file writing callback");
						if (err) {
							resp.send(500);
							return;
						}
						settingsController.setAwsSettings(req.body.aws_accessKey, req.body.aws_secretKey, req.body.aws_region, req.body.aws_keyPair, req.body.aws_securityGroupId, fileName, function(err) {
							console.log("aws settings callback");
							if (err) {
								resp.send(500);
								return;
							}
							resp.send("ok");
						});
					});
				});
			});
		} else {
			resp.send(400);
		}
	});



	app.post('/settings/chef', verificationFunc, function(req, resp) {
		if (req.body.chefUserName && req.body.hostedChefUrl && req.files.chefUserPemFile.size && req.files.chefValidationPemFile.size && req.files.chefKnifeConfigFile.size) {
			//getting chef settings
			settingsController.getChefSettings(function(settings) {
				//checking whether user chef-repo directory is created 
				var chefRepoPath = settings.chefReposLocation + req.body.chefUserName

					function storeUploadedFiles() {
						var filesNames = Object.keys(req.files);
						var count = filesNames.length;

						filesNames.forEach(function(item) {
							console.log(item);
							fileIo.readFile(req.files[item].path, function(err, data) {
								fileIo.writeFile(chefRepoPath + '/.chef/' + req.files[item].name, data, null, function(err) {
									count--;
									if (count === 0) { // all files uploaded
										// savings in setting 
										settingsController.setChefSettings(req.body.chefUserName, req.body.chefUserName, req.files.chefUserPemFile.name, req.files.chefValidationPemFile.name, req.body.hostedChefUrl, function(err) {
											console.log("chef settings callback");
											if (err) {
												resp.send(500);
												return;
											}
											resp.send("ok");
										});
									}
								});
							});

						});
					}

				fileIo.exists(chefRepoPath, function(exists) {
					if (!exists) { // does not exist
						//creating chef repo
						fileIo.mkdir(chefRepoPath, function(err) {
							if (err) {
								resp.send(500);
								return;
							}
							//creating .chef dir 
							fileIo.mkdir(chefRepoPath + '/.chef', function(err) {
								if (err) {
									resp.send(500);
									return;
								}
								storeUploadedFiles();
							});
						});
					} else {
						storeUploadedFiles();
					}
				})
			});
		} else {
			resp.send(400);
		}
	});


}