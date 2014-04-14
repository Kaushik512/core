var cookbooks = require('./controller/GetRecipies');
var settingsController = require('./controller/settings');
var fileIo = require('./controller/fileio');

module.exports.setRoutes = function(app, verificationFunc) {



	app.post('/cookbooks', verificationFunc, function(req, res) {
		console.log('Returning Available Cookbooks...!!');
		console.log(req.body);
		settingsController.getChefSettings(function(settings) {
			//res.render('cookbooks');
			cookbooks.getCookbooks({
				user_name: settings.chefUserName,
				key_path: settings.chefReposLocation + settings.chefUserName + "/.chef/" + settings.chefUserPemFile,
				url: settings.hostedChefUrl
			}, function(err, resp) {
				res.render('cookbook', {
					error: err,
					cookbooks: resp,
					prodSelected: req.body
				});
			});
		});

	});




	app.get('/cookbooks/userCookbooks/', verifySession, function(req, resp) {
		var path = req.query.path;
		console.log(path);
		if (path) {
			if (path[0] == '/') {
				path = path.slice(1);
			}
			if (path.length && path.length >= 2) {
				if (path[path.length - 1] == '/') {
					path = path.slice(0, path.length - 1);
					console.log('after slicing');
					console.log(path);
				}
			} else {
				if (path[0] == '/') {
					path = path.slice(1);
				}
			}
		} else {
			path = '';
		}

		function getCookbooksData(rootDir, chefSettings) {

			console.log("full path");
			console.log(rootDir + path);

			fileIo.isDir(rootDir + path, function(err, dir) {
				if (err) {
					console.log(err);
					resp.send(404);
					return;
				}
				if (dir) {
					fileIo.readDir(rootDir, path, function(err, dirList, filesList) {
						if (err) {
							resp.send(500);
							return;
						}
						var chefUserName;
						if (chefSettings) {
							chefUserName = chefSettings.chefUserName
						}
						resp.json({
							resType: 'dir',
							files: filesList,
							dirs: dirList,
							chefUserName: chefUserName
						});

					});

				} else { // this is a file
					fileIo.readFile(rootDir + path, function(err, fileData) {
						if (err) {
							resp.send(500);
							return;
						}
						resp.json({
							resType: "file",
							fileData: fileData.toString('utf-8')
						});
					})
				}

			});
		}

		settingsController.getChefSettings(function(chefSettings) {

			if (path === '') {
				var spawn = childProcess.spawn;
				var knifeProcess;
				knifeProcess = spawn('knife', ['download', 'cookbooks'], {
					cwd: chefSettings.chefReposLocation + chefSettings.userChefRepoName
				});

				knifeProcess.stdout.on('data', function(data) {
					console.log('cookbook download : stdout: ==> ' + data);
				});
				knifeProcess.stderr.on('data', function(data) {
					console.log('cookbook download : stderr: ==> ' + data);
				});

				knifeProcess.on('close', function(code) {
					if (code == 0) {
						getCookbooksData(chefSettings.chefReposLocation + chefSettings.userChefRepoName + '/cookbooks/', chefSettings);
					} else {
						resp.send(500);
						/*resp.json({
          msg: "cookbook upload failed"
        });*/
					}
				});

				knifeProcess.on('error', function(error) {
					console.log("Error is spawning process");
					console.log(error);
					resp.send(500);
				});
			} else {
				getCookbooksData(chefSettings.chefReposLocation + chefSettings.userChefRepoName + '/cookbooks/');
			}

		});

	});



};