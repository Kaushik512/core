var providers = require('../controller/providers.js')
var settingsController = require('../controller/settings');
var domainsDao = require('../controller/domains.js');
var EC2 = require('../controller/ec2.js');
var Chef = require('../controller/chef.js');



function getRolesListArguments(rolesArray) {

	var str = [];
	console.log('rolesArray ==> ' + rolesArray);
	for (var i = 0; i < rolesArray.length; i++) {
		var role = rolesArray[i];
		switch (role) {
			case 'JIRA':
				str.push('recipe[jira-d4d]');
				break;
			case 'Crowd':
				str.push('recipe[crowd-d4d]');
				break;
			case 'Confluence':
				str.push('recipe[confluence-d4d]');
				break;
			case 'Jenkins':
				str.push('recipe[jenkins-d4d]');
				break;
			case 'Nexus':
				str.push('recipe[nexus-d4d]');
				break;
			case 'Rundeck':
				str.push('recipe[rundeck-d4d]');
				break;
			case 'Nagios':
				str.push('recipe[nagios-d4d]');
				break;
			case 'Selenium':
				str.push('recipe[selenium-d4d]');
				break;
		}
	}
	return str;

}



module.exports.setRoutes = function(app, verifySession) {

	app.get('/', verifySession, function(req, res) {
		console.log(req.session.user);
		providers.getProviders(function(err, products) {
			res.render('index', {
				error: err,
				products: products,
				userData: req.session.user
			});
		});
	});

	app.get('/providers/:pid/roles', verifySession, function(req, res) {
		var pid = req.params.pid;
		if (pid) {
			providers.getProviderRoles(pid, function(err, data) {
				//console.log(data);  
				res.render('devopsRoles.ejs', {
					error: err,
					prod: data
				});
			});
		} else {
			res.send(404);
		}
	});

	app.post('/providers/configureRoles', verifySession, function(req, res) {

		settingsController.getChefSettings(function(settings) {
			//res.render('cookbooks');
			var chef = new Chef(settings);
			chef.getHostedChefCookbooks(function(err, resp) {
				res.render('devopsRoles-configure', {
					error: err,
					cookbooks: resp,
					prodSelected: req.body
				});
			});
		});

	});

	app.post('/providers/:pid/roles/launch', verifySession, function(req, res) {
		settingsController.getSettings(function(settings) {
			var domainName = req.body.domainName;
			var pid = req.body.pid;
			var selectedInstances = req.body.selectedInstances;
			console.log(selectedInstances);
			if (selectedInstances) {
				domainsDao.createDomainDocument(domainName, pid, function(err, data) {
					if (err) {
						res.send(500, "unable to create domain");
						return;
					}
					var keys = Object.keys(selectedInstances);

					var count = 0;
					var typesOfInstances = keys.length;
					var successInstances = [];
					var failedIntances = [];
					for (var i = 0; i < keys.length; i++) {
						(
							function(key, inst) {
								console.log("number of intances before ==> ",inst.numberOfInstances);
								inst.numberOfInstances = parseInt(inst.numberOfInstances);
								count = count + inst.numberOfInstances;
								settings.aws.region = inst.awsRegion;
								var ec2 = new EC2(settings.aws);
								console.log("number of intances ==> ",inst.numberOfInstances);
								for (var k = 0; k < inst.numberOfInstances; k++) {
									console.log("In here");
									(
										function() {
											console.log("Trying to launch Instance");
											ec2.launchInstance(null, inst.instanceType, inst.awsSecurityGroupId, function(err, instanceData) {
												count = count - 1;
												if (err) {
													failedIntances.push(inst.title);
												} else {
													successInstances.push({
														title: inst.title,
														instanceId: instanceData.InstanceId
													});


													//processing launched intance 

													//saving in database 
													var instance = {
														instanceRegion: inst.awsRegion,
														instanceId: instanceData.InstanceId,
														instanceIP: instanceData.PublicIpAddress,
														instanceRole: inst.title,
														instanceState: instanceData.State.Name,
														bootStrapLog: {
															err: false,
															log: 'waiting',
															timestamp: new Date().getTime()
														},
														bootStrapStatus: 'waiting',
														runlist: inst.runlist.split(',')
													}

													domainsDao.saveDomainInstanceDetails(domainName, [instance], function(err, data) {
														if (err) {
															console.log("Unable to store instance in DB");
															return;
														} else {
															console.log("instance stored in DB");

															//enabling scheduled termination 
															/*setTimeout(function() {
																		ec2.terminateInstance(instanceData.InstanceId, function(err, terminatedInstance) {
																			if (err) {
																				return;
																			} else {
																				domainsDao.updateInstanceStatus(domainName, terminatedInstance.InstanceId, false, function(err, data) {
																					if (err) {
																						console.log("unable to update status of terminated instance");
																					} else {
																						console.log("Instance status set to false successfully");
																					}
																				});
																			}
																		});

																	}, 3600000);*/

															//waiting for instances
															ec2.waitForInstanceRunnnigState(instanceData.InstanceId, function(err, instanceData) {
																if (err) {
																	return;
																} else {
																	//updating instance state
																	domainsDao.updateInstanceState(domainName, instanceData.InstanceId, instanceData.State.Name, function(err, updateData) {
																		if (err) {
																			console.log("update instance state err ==>", err);
																			return;
																		}
																		//bootstrapping instance


																		//genrating runlist for roles 
																		if (!inst.runlist) {
																			inst.runlist = '';
																		}
																		var rolesArg = getRolesListArguments(inst.runlist.split(','));

																		//generating runlist
																		var runlistSelected = inst.runlistSelected;
																		var runlistSelectedArg = [];
																		if (runlistSelected && runlistSelected.length) {
																			for (var k = 0; k < runlistSelected.length; k++) {
																				runlistSelectedArg.push('recipe[' + runlistSelected[k] + ']');
																			}
																		}
																		var combinedRunList = rolesArg.concat(runlistSelectedArg);



																		var chef = new Chef(settings.chef);
																		chef.bootstrapInstance({
																			instanceIp: instanceData.PublicIpAddress,
																			pemFilePath: settings.aws.pemFileLocation + settings.aws.pemFile,
																			runList: combinedRunList,
																			instanceUserName: settings.aws.instanceUserName
																		}, function(err, code) {
																			console.log('process stopped ==> ', err, code);
																			if (err) {
																				console.log("knife launch err ==>", err);
																				domainsDao.updateInstanceBootstrapStatus(domainName, instanceData.InstanceId, 'failed', function(err, updateData) {

																				});
																			} else {
																				if (code == 0) {
																					domainsDao.updateInstanceBootstrapStatus(domainName, instanceData.InstanceId, 'success', function(err, updateData) {
																						if (err) {
																							console.log("Unable to set instance bootstarp status");
																						} else {
																							console.log("Instance bootstrap status set to true");
																						}

																					});
																				} else {
																					domainsDao.updateInstanceBootstrapStatus(domainName, instanceData.InstanceId, 'failed', function(err, updateData) {
																						if (err) {
																							console.log("Unable to set instance bootstarp status");
																						} else {
																							console.log("Instance bootstrap status set to false");
																						}
																					});
																				}
																			}

																		}, function(stdOutData) {
																			domainsDao.updateInstanceBootstrapLog(domainName, instanceData.InstanceId, {
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
																			domainsDao.updateInstanceBootstrapLog(domainName, instanceData.InstanceId, {
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
																}
															});


														}
													});
												}
												if (count == 0) { //all instance are processed
													res.json({
														launchedInstances: successInstances,
														launchedFailedInstance: failedIntances
													});
												}
											});
										})();
								}

							})(keys[i], selectedInstances[keys[i]]);
					}

				});
			} else {
				res.send(400, "invalid parameters");
			}
		});
	});

	app.post('/providers/devopsRoles/stopInstance', verifySession, function(req, res) {

		domainsDao.getdDomainInstance(req.body.pid, req.body.domainName, req.body.instanceId, function(err, data) {
			if (err) {
				console.log(err);
				res.send(500);
				return;
			}
			if (data.length && data[0].domainInstances.length) {
				var instance = data[0].domainInstances[0];
				settingsController.getAwsSettings(function(settings) {
					settings.region = instance.instanceRegion;
					var ec2 = new EC2(settings);
					ec2.stopInstance([instance.instanceId], function(err, stoppingInstances) {
						if (err) {
							res.send(500);
							return;
						}

						domainsDao.updateInstanceState(req.body.domainName, instance.instanceId, stoppingInstances[0].CurrentState.Name, function(err, updateData) {
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
										domainsDao.updateInstanceState(req.body.domainName, instance.instanceId, instanceState, function(err, updateData) {
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
	app.post('/providers/devopsRoles/startInstance', verifySession, function(req, res) {

		domainsDao.getdDomainInstance(req.body.pid, req.body.domainName, req.body.instanceId, function(err, data) {
			if (err) {
				console.log(err);
				res.send(500);
				return;
			}
			if (data.length && data[0].domainInstances.length) {
				var instance = data[0].domainInstances[0];
				settingsController.getAwsSettings(function(settings) {
					settings.region = instance.instanceRegion;
					var ec2 = new EC2(settings);
					ec2.startInstance([instance.instanceId], function(err, startingInstances) {
						if (err) {
							res.send(500);
							return;domainInstances
						}

						domainsDao.updateInstanceState(req.body.domainName, instance.instanceId, startingInstances[0].CurrentState.Name, function(err, updateData) {
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
										domainsDao.updateInstanceState(req.body.domainName, instance.instanceId, instanceState, function(err, updateData) {
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
	app.post('/providers/devopsRoles/terminateInstance', verifySession, function(req, res) {

		domainsDao.getdDomainInstance(req.body.pid, req.body.domainName, req.body.instanceId, function(err, data) {
			if (err) {
				console.log(err);
				res.send(500);
				return;
			}
			if (data.length && data[0].domainInstances.length) {
				var instance = data[0].domainInstances[0];
				settingsController.getAwsSettings(function(settings) {
					settings.region = instance.instanceRegion;
					var ec2 = new EC2(settings);
					ec2.terminateInstance(instance.instanceId, function(err, terminatingInstance) {
						if (err) {
							res.send(500);
							return;
						}

						domainsDao.updateInstanceState(req.body.domainName, instance.instanceId, terminatingInstance.CurrentState.Name, function(err, updateData) {
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
										domainsDao.updateInstanceState(req.body.domainName, instance.instanceId, instanceState, function(err, updateData) {
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
	app.post('/providers/:pid/roles/terminateInstance', verifySession, function(req, res) {

	});

}