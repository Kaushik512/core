var settingsController = require('../controller/settings');
var domainsDao = require('../controller/domains.js');
var EC2 = require('../controller/ec2.js');
var Chef = require('../controller/chef.js');

module.exports.setRoutes = function(app, verifySession) {

	app.get('/app_factory/:pid', verifySession, function(req, res) {
		settingsController.getChefSettings(function(settings) {
			//res.render('cookbooks');
			var chef = new Chef(settings);
			chef.getHostedChefCookbooks(function(err, cookbooks) {
				if (err) {
					res.send(500);
					return;
				}

				domainsDao.getAllDomainData(req.params.pid, function(err, domainsdata) {
					if (err) {
						res.send(500);
						return;
					}

					res.render('appFactory', {
						error: err,
						cookbooks: cookbooks,
						pid: req.params.pid,
						domains: domainsdata
					});
				});
			});
		});
	});

	app.post('/app_factory/saveBluePrint', verifySession, function(req, res) {
		domainsDao.upsertAppFactoryBlueprint(req.body.pid, req.body.domainName, req.body.bluePrintName, req.body.instanceType, req.body.numberOfInstance, req.body.os, req.body.runlist, req.body.selectedHtmlString, function(err, data) {
			if (err) {
				res.send(500);
				console.log(err);
				return;
			} else {
				res.send(200);
			}
		});
	});


	app.get('/app_factory/:pid/bluePrint', verifySession, function(req, res) {
		domainsDao.getAllDomainData(req.params.pid, function(err, domainsdata) {
			if (err) {
				res.send(500);
			} else {
				res.render('appFactory_blueprints.ejs', {
					domains: domainsdata
				});
			}
		});

	});

	app.post('/app_factory/bluePrint/launch', verifySession, function(req, res) {
        console.log(req.body);
		domainsDao.getAppFactoryBlueprint(req.body.pid, req.body.domainName, req.body.blueprintName, function(err, data) {
			console.log(data);
			if (data.length && data[0].blueprintsAppFactory && data[0].blueprintsAppFactory.length) {

				var blueprint = data[0].blueprintsAppFactory[0];
				settingsController.getSettings(function(settings) {
					var ec2 = new EC2(settings.aws);
					ec2.launchInstance(null, function(err, instanceData) {
						if (err) {
							console.log(err);
							res.send(500);
							return;
						}
						//saving in database 
						var instance = {
							instanceId: instanceData.InstanceId,
							instanceIP: instanceData.PublicIpAddress,
							instanceName: req.body.blueprintName,
							instanceActive: true,
							instanceState: instanceData.State.Name,
							bootStrapLog: {
								err: false,
								log: 'waiting',
								timestamp: new Date().getTime()
							},
							bootStrapStatus: 'waiting',
							runlist: blueprint.runlist
						}

						//enabling scheduled termination 
						setTimeout(function() {
							ec2.terminateInstance(instanceData.InstanceId, function(err, data) {
								if (err) {
									return;
								} else {
									domainsDao.updateAppFactoryInstanceStatus(req.body.domainName, terminatedInstance.InstanceId, false, function(err, data) {
										if (err) {
											console.log("unable to update status of terminated instance");
										} else {
											console.log("Instance status set to false successfully");
										}
									});
								}
							});

						}, 3600000);

						domainsDao.saveAppFactoryInstanceDetails(domainName, [instance], function(err, data) {
							if (err) {
								console.log("Unable to store instance in DB");
								return;
							} else {
								console.log("instance stored in DB");
								//waiting for instances
								ec2.waitForInstanceRunnnigState(instanceData.InstanceId, function(err, instanceData) {
									if (err) {
										return;
									} else {

										domainsDao.updateAppFactoryInstanceState(domainName, instanceData.InstanceId, instanceData.State.Name, function(err, updateData) {
											if (err) {
												console.log("update instance state err ==>", err);
												return;
											}
										});

										//bootstrapping instance
										var chef = new Chef(settings.chef);
										chef.bootstrapInstance({
											instanceIp: instanceData.PublicIpAddress,
											pemFilePath: settings.aws.pemFileLocation + settings.aws.pemFile,
											runList: blueprint.runlist,
											instanceUserName: settings.aws.instanceUserName
										}, function(err, code) {
											console.log('process stopped ==> ', err, code);
											if (err) {
												console.log("knife launch err ==>", err);
												domainsDao.updateAppFactoryInstanceBootstrapStatus(domainName, instanceData.InstanceId, 'failed', function(err, updateData) {

												});
											} else {
												if (code == 0) {
													domainsDao.updateAppFactoryInstanceBootstrapStatus(domainName, instanceData.InstanceId, 'success', function(err, updateData) {
														if (err) {
															console.log("Unable to set instance bootstarp status");
														} else {
															console.log("Instance bootstrap status set to true");
														}

													});
												} else {
													domainsDao.updateAppFactoryInstanceBootstrapStatus(domainName, instanceData.InstanceId, 'failed', function(err, updateData) {
														if (err) {
															console.log("Unable to set instance bootstarp status");
														} else {
															console.log("Instance bootstrap status set to false");
														}
													});
												}
											}

										}, function(stdOutData) {
											domainsDao.updateAppFactoryInstanceBootstrapLog(domainName, instanceData.InstanceId, {
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
											domainsDao.updateAppFactoryInstanceBootstrapLog(domainName, instanceData.InstanceId, {
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


									}

								});

							}
						});

						res.send({
							instanceId: instanceData.InstanceId
						});

					});

				});
			} else {
				res.send(400);
			}

		});

	});


};