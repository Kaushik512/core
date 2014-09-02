var blueprintsDao = require('../classes/blueprints');
var settingsController = require('../controller/settings');
var instancesDao = require('../classes/instances');
var EC2 = require('../classes/ec2.js');
var Chef = require('../classes/chef.js');


module.exports.setRoutes = function(app, sessionVerificationFunc) {

	app.all('/blueprints/*', sessionVerificationFunc);



	app.post('/blueprints/:blueprintId/update', function(req, res) {

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
					version: data.version
				});
			}

		});
	});

	app.get('/blueprints/:blueprintId/versions/:version', function(req, res) {

		blueprintsDao.getBlueprintVersionData(req.params.blueprintId, req.params.version, function(err, data) {
			if (err) {
				res.send(500);
				return;
			}

			if (!data.length) {
				res.send(404);
				return;
			}
			res.send(data[0]);


		});
	});


	app.get('/blueprints/:blueprintId/launch', function(req, res) {

		
		blueprintsDao.getBlueprintById(req.params.blueprintId, function(err, data) {
			if (err) {
				res.send(500);
				return;
			}
			if (data.length) {
				var blueprint = data[0];
				var launchVersionNumber = blueprint.latestVersion;
				if (req.query.version) {
					launchVersionNumber = req.query.version;
				}
				var version;
				for (var i = 0; i < blueprint.versionsList.length; i++) {
					if (blueprint.versionsList[i].ver === blueprint.latestVersion) {
						version = blueprint.versionsList[i];
						break;
					}
				}
				if(!version) {
                  res.send(404);
                  return;
				}
				settingsController.getSettings(function(settings) {
					var chef = new Chef(settings.chef);

					function launchInstance() {


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
								chefNodeName: instanceData.InstanceId,
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
									templateType: blueprint.templateType,
									templateComponents: blueprint.templateComponents
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

									chef.bootstrapInstance({
										instanceIp: instanceData.PublicIpAddress,
										pemFilePath: settings.aws.pemFileLocation + settings.aws.pemFile,
										runlist: instance.runlist,
										instanceUserName: settings.aws.instanceUserName,
										nodeName: instanceData.InstanceId,
										environment: blueprint.envId
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
														console.log("Instance bootstrap status set to success");
													}
												});

											} else {
												instancesDao.updateInstanceBootstrapStatus(instance.id, 'failed', function(err, updateData) {
													if (err) {
														console.log("Unable to set instance bootstarp status");
													} else {
														console.log("Instance bootstrap status set to failed");
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

								res.send(200, {
									"id": instance.id,
									"message": "instance launch success"
								});
							});


						});


					}

					chef.getEnvironment(blueprint.envId, function(err, env) {
						if (err) {
							res.send(500);
							return;
						}

						if (!env) {
							console.log(blueprint.envId);
							chef.createEnvironment(blueprint.envId, function(err, envName) {
								if (err) {
									res.send(500);
									return;
								}
								launchInstance();

							});
						} else {
							launchInstance();
						}

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