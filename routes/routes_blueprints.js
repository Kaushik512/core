var blueprintsDao = require('../classes/blueprints');
var settingsController = require('../controller/settings');
var instancesDao = require('../classes/instances');
var EC2 = require('../controller/ec2.js');
var Chef = require('../controller/chef.js');


module.exports.setRoutes = function(app, sessionVerificationFunc) {

	app.all('/project/*', sessionVerificationFunc);

	app.get('/project/:projectId/env/:envId/blueprints', function(req, res) {
		blueprintsDao.getBlueprintsByProjectAndEnvId(req.params.projectId, req.params.envId, req.query.blueprintType, function(err, data) {
			if (err) {
				res.send(500);
				return;
			}
			res.send(data);
		});
	});

	app.post('/project/:projectId/env/:envId/blueprint', function(req, res) {
		var blueprintData = req.body.blueprintData;
		blueprintData.projectId = req.params.projectId;
		blueprintData.envId = req.params.envId;

		blueprintsDao.createBlueprint(blueprintData, function(err, data) {
			if (err) {
				res.send(500);
				return;
			}
			res.send(data);
		});
	});

	app.post('/project/:projectId/env/:envId/blueprint/:blueprintId/update', function(req, res) {

		var blueprintUpdateData = req.body.blueprintUpdateData;

		blueprintsDao.updateBlueprint(req.params.blueprintId, blueprintUpdateData, function(err, data) {
			if (err) {
				res.send(500);
				return;
			}

			if (!data) {
				res.send(404)
			} else {
				res.send({
					documentsUpdated: data
				});
			}

		});
	});


	app.get('/project/:projectId/env/:envId/blueprint/:blueprintId/launch', function(req, res) {

		var blueprintUpdateData = req.body.blueprintUpdateData;

		blueprintsDao.getBlueprintById(req.params.blueprintId, function(err, data) {
			if (err) {
				res.send(500);
				return;
			}
			if (data.length) {
				var blueprint = data[0];
				var version;
				for (var i = 0; i < blueprint.versionsList.length; i++) {
					if (blueprint.versionsList[i].ver === blueprint.latestVersion) {
						version = blueprint.versionsList[i];
						break;
					}
				}
				settingsController.getSettings(function(settings) {
					var ec2 = new EC2(settings.aws);
					ec2.launchInstance(null, "m1.medium", settings.aws.securityGroupId, function(err, instanceData) {
						if (err) {
							console.log(err);
							res.send(500);
							return;
						}
						console.log(version.runlist);

						var instance = {
							projectId: blueprint.projectId,
							envId: blueprint.envId,
							runlist: version.runlist,
							platformId: instanceData.InstanceId,
							instanceIP: instanceData.PublicIpAddress,
							instanceState: instanceData.State.Name,
							bootStrapStatus: 'waiting',
							bootStrapLog: {
								err: false,
								log: 'waiting',
								timestamp: new Date().getTime()
							},
							blueprintData: {
								blueprintId: blueprint._id,
								blueprintName: blueprint.name,
								templateId: blueprint.templateId,
								templateType: blueprint.templateType
							}
						}
						instancesDao.createInstance(instance, function(err, data) {
							if (err) {
								console.log(err);
								res.send(500);
								return;
							}
							instance.id = data._id;

							ec2.waitForInstanceRunnnigState(instance.platformId, function(err, instanceData) {
								if (err) {
									return;
								}
								instancesDao.updateInstanceState(instance.id, instanceData.State.Name, function(err, updateCount) {
									if (err) {
										console.log("update instance state err ==>", err);
										return;
									}
									console.log('instance state upadated');
								});
								var chef = new Chef(settings.chef);
								chef.bootstrapInstance({
									instanceIp: instanceData.PublicIpAddress,
									pemFilePath: settings.aws.pemFileLocation + settings.aws.pemFile,
									runlist: instance.runlist,
									instanceUserName: settings.aws.instanceUserName
								}, function(err, code) {

									console.log('process stopped ==> ', err, code);
									if (err) {
										console.log("knife launch err ==>", err);
										instancesDao.updateInstanceBootstrapStatus(instance.id, 'failed', function(err, updateData) {

										});
									} else {
										if (code == 0) {
											instancesDao.updateInstanceBootstrapStatus(instance.id, 'success', function(err, updateData) {
												if (err) {
													console.log("Unable to set instance bootstarp status");
												} else {
													console.log("Instance bootstrap status set to true");
												}
											});

										} else {
											instancesDao.updateInstanceBootstrapStatus(instance.id, 'failed', function(err, updateData) {
												if (err) {
													console.log("Unable to set instance bootstarp status");
												} else {
													console.log("Instance bootstrap status set to true");
												}
											});

										}
									}

								}, function(stdOutData) {
									instancesDao.updateInstanceBootstrapLog(instance.id, {
										err: false,
										log: stdOutData.toString('ascii'),
										timestamp: new Date().getTime()
									}, function(err, data) {
										if (err) {
											console.log('unable to update bootStrapLog');
											return;
										}
										console.log('bootStrapLog updated');
									});

								}, function(stdErrData) {

									instancesDao.updateInstanceBootstrapLog(instance.id, {
										err: true,
										log: stdErrData.toString('ascii'),
										timestamp: new Date().getTime()
									}, function(err, data) {
										if (err) {
											console.log('unable to update bootStrapLog');
											return;
										}
										console.log('bootStrapLog updated');
									});
								});

							});

							res.send(200);
						});


					});
				});

			} else {
				res.send(404, {
					message: "Blueprint Not Found"
				});
			}
		});
	});

};