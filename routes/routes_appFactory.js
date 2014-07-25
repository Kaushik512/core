var settingsController = require('../controller/settings');
var domainsDao = require('../controller/domains.js');
var EC2 = require('../controller/ec2.js');
var Chef = require('../controller/chef.js');
var users = require('../controller/users.js');

module.exports.setRoutes = function(app, verifySession) {

	app.get('/app_factory/:pid', verifySession, function(req, res) {
		res.render('appFactory', {
			pid: req.params.pid
		});
	});

	app.post('/app_factory/configureTemplate', verifySession, function(req, res) {



		settingsController.getChefSettings(function(settings) {
			//res.render('cookbooks');
			var chef = new Chef(settings);
			chef.getHostedChefCookbooks(function(err, cookbooks) {
				if (err) {
					res.send(500);
					return;
				}

				domainsDao.getAllDomainData(req.params.pid, function(err, domainsData) {
					if (err) {
						res.send(500);
						return;
					}

					users.getUsersInGroup(req.session.user.groupId, 500, function(err, data) {
						if (err) {
							res.send(500);
							return;
						}
						res.render('appFactory-configure', {
							templateName: req.body.templateName,
							thumbnailHtmlString: req.body.thumbnailHtmlString,
							pid: req.body.pid,
							error: err,
							cookbooks: cookbooks,
							domains: domainsData,
							userData: req.session.user,
							serviceConsumers: data
						});
					});


				});
			});
		});
	});


	app.post('/app_factory/saveBluePrint', verifySession, function(req, res) {
		console.log(req.body);
		if (req.body.serviceConsumers && req.body.serviceConsumers.length) {
			req.body.serviceConsumers.push(req.session.user.cn);
		} else {
			req.body.serviceConsumers = [];
			req.body.serviceConsumers.push(req.session.user.cn);
		}
		domainsDao.upsertAppFactoryBlueprint(req.body.pid, req.body.domainName, req.session.user.groupId, req.body.blueprintName, req.body.awsRegion, req.body.awsSecurityGroup, req.body.instanceType, req.body.numberOfInstance, req.body.os, req.body.runlist, req.body.selectedHtmlString, req.body.expirationDays, req.body.templateName, req.body.serviceConsumers, function(err, data) {
			if (err) {
				res.send(500);
				console.log(err);
				return;
			} else {
				console.log(data);
				res.send(data);
			}
		});
	});


	app.get('/app_factory/:pid/bluePrint', verifySession, function(req, res) {
		domainsDao.getAllDomainData(req.params.pid, function(err, domainsdata) {
			if (err) {
				res.send(500);
			} else {
				res.render('appFactory_blueprints.ejs', {
					domains: domainsdata,
					userData: req.session.user
				});
			}
		});

	});

	app.get('/app_factory/bluePrint/details/', verifySession, function(req, res) {
		console.log('i m here');
		console.log('query', req.query);
		domainsDao.getAppFactoryBlueprint(req.query.pid, req.query.domainName, req.query.blueprintName, req.query.ver, function(err, data) {
			if (err) {
				res.send(500);
				return;
			}
			if (data.length && data[0].blueprintsAppFactory && data[0].blueprintsAppFactory.length) {
				var blueprint = data[0].blueprintsAppFactory[0];
				settingsController.getSettings(function(settings) {
					var chef = new Chef(settings.chef);
					chef.getHostedChefCookbooks(function(err, cookbooks) {
						if (err) {
							res.send(500);
							return;
						}
						var ec2 = new EC2({
							access_key: settings.aws.access_key,
							secret_key: settings.aws.secret_key,
							region: blueprint.awsRegion
						});

						ec2.getSecurityGroups(function(err, awsSecurityGroups) {
							if (err) {
								res.send(500);
								return;
							}


							users.getUsersInGroup(req.session.user.groupId, 500, function(err, data) {
								res.render("appFactory-blueprintDetails", {
									blueprint: blueprint,
									cookbooks: cookbooks,
									domainName: req.query.domainName,
									pid: req.query.pid,
									blueprintName: req.query.blueprintName,
									blueprintVersion: req.query.ver,
									serviceConsumers: data,
									userData: req.session.user,
									awsSecurityGroups: awsSecurityGroups
								});
							});

						});



					});
				});
			} else {
				res.send(404);
				return;
			}
		});

	});

	app.post('/app_factory/bluePrint/launch', verifySession, function(req, res) {
		console.log(req.body);
		domainsDao.getAppFactoryBlueprint(req.body.pid, req.body.domainName, req.body.blueprintName, req.body.ver, function(err, data) {
			console.log(data);
			if (data.length && data[0].blueprintsAppFactory && data[0].blueprintsAppFactory.length) {

				var blueprint = data[0].blueprintsAppFactory[0];

				if (!blueprint) {
					res.send(400);
					return;
				}

				console.log('blueprint == >', blueprint);

				settingsController.getSettings(function(settings) {
					settings.aws.region = blueprint.awsRegion;
					var ec2 = new EC2(settings.aws);


					var instanceIdsLaunched = [];
					var count = blueprint.numberOfInstance;

					for (var i = 0; i < blueprint.numberOfInstance; i++) {
						(function(instanceNo) {

							ec2.launchInstance(null, blueprint.instanceType, blueprint.awsSecurityGroup.id, function(err, instanceData) {
								count--;
								if (err) {
									console.log(err);
									res.send(500);
									return;
								}
								//saving in database 
								instanceIdsLaunched.push(instanceData.InstanceId)
								var instance = {
									instanceRegion: blueprint.awsRegion,
									instanceId: instanceData.InstanceId,
									instanceIP: instanceData.PublicIpAddress,
									instanceName: blueprint.templateName,
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
								/*setTimeout(function() {
									ec2.terminateInstance(instanceData.InstanceId, function(err, terminatedInstance) {
										if (err) {
											return;
										} else {
											domainsDao.updateAppFactoryInstanceState(req.body.domainName,req.body.pid, terminatedInstance.InstanceId,'terminated', function(err, data) {
												if (err) {
													console.log("unable to update status of terminated instance");
												} else {
													console.log("Instance status set to false successfully");
												}
											});
										}
									});

								}, 3600000);*/

								domainsDao.saveAppFactoryInstanceDetails(req.body.domainName, [instance], function(err, data) {
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

												domainsDao.updateAppFactoryInstanceState(req.body.domainName, req.body.pid, instanceData.InstanceId, instanceData.State.Name, function(err, updateData) {
													if (err) {
														console.log("update instance state err ==>", err);
														return;
													}
													console.log('instance state upadated');
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
														domainsDao.updateAppFactoryInstanceBootstrapStatus(req.body.domainName, instanceData.InstanceId, 'failed', function(err, updateData) {

														});
													} else {
														if (code == 0) {
															domainsDao.updateAppFactoryInstanceBootstrapStatus(req.body.domainName, instanceData.InstanceId, 'success', function(err, updateData) {
																if (err) {
																	console.log("Unable to set instance bootstarp status");
																} else {
																	console.log("Instance bootstrap status set to true");
																}

															});
														} else {
															domainsDao.updateAppFactoryInstanceBootstrapStatus(req.body.domainName, instanceData.InstanceId, 'failed', function(err, updateData) {
																if (err) {
																	console.log("Unable to set instance bootstarp status");
																} else {
																	console.log("Instance bootstrap status set to false");
																}
															});
														}
													}

												}, function(stdOutData) {
													domainsDao.updateAppFactoryInstanceBootstrapLog(req.body.domainName, instanceData.InstanceId, {
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
													domainsDao.updateAppFactoryInstanceBootstrapLog(req.body.domainName, instanceData.InstanceId, {
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
								if (count == 0) {
									res.send({
										instanceIds: instanceIdsLaunched
									});
								}

							});


						})(i);
					}


				});
			} else {
				res.send(400);
			}

		});

	});


	app.post('/app_factory/stopInstance', verifySession, function(req, res) {

		domainsDao.getAppFactoryInstance(req.body.pid, req.body.domainName, req.body.instanceId, function(err, data) {
			if (err) {
				console.log(err);
				res.send(500);
				return;
			}
			if (data.length && data[0].appFactoryInstances.length) {
				var instance = data[0].appFactoryInstances[0];
				settingsController.getAwsSettings(function(settings) {
					settings.region = instance.instanceRegion;
					var ec2 = new EC2(settings);
					ec2.stopInstance([instance.instanceId], function(err, stoppingInstances) {
						if (err) {
							res.send(500);
							return;
						}

						domainsDao.updateAppFactoryInstanceState(req.body.domainName, req.body.pid, instance.instanceId, stoppingInstances[0].CurrentState.Name, function(err, updateData) {
							if (err) {
								console.log("update instance state err ==>", err);
								return;
							}
							console.log('instance state upadated');
						});

						function checkInstanceStatus(statusToCheck, delay) {
							var timeout = setTimeout(function() {
								ec2.getInstanceState(instance.instanceId, function(err, instanceState) {
									if (err) {
										console.log('Unable to get instance state', err);
										return;
									}
									if (statusToCheck === instanceState) {
										domainsDao.updateAppFactoryInstanceState(req.body.domainName, req.body.pid, instance.instanceId, instanceState, function(err, updateData) {
											if (err) {
												console.log("update instance state err ==>", err);
												return;
											}
											console.log('instance state upadated to ' + instanceState);
										});
									} else {
										checkInstanceStatus('stopped', 5000);
									}
								});
							}, delay);
						}
						checkInstanceStatus('stopped', 1);


						res.send(stoppingInstances[0].CurrentState.Name)

					});
				});



			} else {
				res.send(404);
			}

		});
	});


	app.post('/app_factory/startInstance', verifySession, function(req, res) {
		domainsDao.getAppFactoryInstance(req.body.pid, req.body.domainName, req.body.instanceId, function(err, data) {
			if (err) {
				console.log(err);
				res.send(500);
				return;
			}
			if (data.length && data[0].appFactoryInstances.length) {
				var instance = data[0].appFactoryInstances[0];
				settingsController.getAwsSettings(function(settings) {
					settings.region = instance.instanceRegion;
					var ec2 = new EC2(settings);
					ec2.startInstance([instance.instanceId], function(err, startingInstances) {
						if (err) {
							res.send(500);
							return;
						}

						domainsDao.updateAppFactoryInstanceState(req.body.domainName, req.body.pid, instance.instanceId, startingInstances[0].CurrentState.Name, function(err, updateData) {
							if (err) {
								console.log("update instance state err ==>", err);
								return;
							}
							console.log('instance state upadated');
						});

						function checkInstanceStatus(statusToCheck, delay) {
							var timeout = setTimeout(function() {
								ec2.getInstanceState(instance.instanceId, function(err, instanceState) {
									if (err) {
										console.log('Unable to get instance state', err);
										return;
									}
									if (statusToCheck === instanceState) {
										domainsDao.updateAppFactoryInstanceState(req.body.domainName, req.body.pid, instance.instanceId, instanceState, function(err, updateData) {
											if (err) {
												console.log("update instance state err ==>", err);
												return;
											}
											console.log('instance state upadated to ' + instanceState);
										});
									} else {
										checkInstanceStatus(statusToCheck, 5000);
									}
								});
							}, delay);
						}
						checkInstanceStatus('running', 1);
						res.send(startingInstances[0].CurrentState.Name)
					});
				});

			} else {
				res.send(404);
			}

		});
	});

	app.post('/app_factory/terminateInstance', verifySession, function(req, res) {
		domainsDao.getAppFactoryInstance(req.body.pid, req.body.domainName, req.body.instanceId, function(err, data) {
			if (err) {
				console.log(err);
				res.send(500);
				return;
			}
			if (data.length && data[0].appFactoryInstances.length) {
				var instance = data[0].appFactoryInstances[0];
				settingsController.getAwsSettings(function(settings) {
					settings.region = instance.instanceRegion;
					var ec2 = new EC2(settings);
					ec2.terminateInstance(instance.instanceId, function(err, terminatingInstance) {
						if (err) {
							res.send(500);
							return;
						}

						domainsDao.updateAppFactoryInstanceState(req.body.domainName, req.body.pid, instance.instanceId, terminatingInstance.CurrentState.Name, function(err, updateData) {
							if (err) {
								console.log("update instance state err ==>", err);
								return;
							}
							console.log('instance state upadated');
						});

						function checkInstanceStatus(statusToCheck, delay) {
							var timeout = setTimeout(function() {
								ec2.getInstanceState(instance.instanceId, function(err, instanceState) {
									if (err) {
										console.log('Unable to get instance state', err);
										return;
									}
									if (statusToCheck === instanceState) {
										domainsDao.updateAppFactoryInstanceState(req.body.domainName, req.body.pid, instance.instanceId, instanceState, function(err, updateData) {
											if (err) {
												console.log("update instance state err ==>", err);
												return;
											}
											console.log('instance state upadated to ' + instanceState);
										});
									} else {
										checkInstanceStatus(statusToCheck, 5000);
									}
								});
							}, delay);
						}
						checkInstanceStatus('terminated', 1);
						res.send(terminatingInstance.CurrentState.Name)
					});
				});

			} else {
				res.send(404);
			}

		});
	});

	app.post('/app_factory/:pid/rebootInstance', verifySession, function(req, res) {

		settingsController.getSettings(function(settings) {
			var ec2 = new EC2(settings.aws);
			ec2.rebootInstance([req.body.instanceId], function(err, data) {
				if (err) {
					res.send(500);
					return;
				}

				res.send('ok');

			});
		});

	});



};