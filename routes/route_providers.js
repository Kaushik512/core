var providers = require('../controller/providers.js')
var settingsController = require('../controller/settings');
var domainsDao = require('../controller/domains.js');
var EC2 = require('../controller/ec2.js');



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
		providers.getProviders(function(err, products) {
			res.render('index', {
				error: err,
				products: products
			});
		});
	});

	app.get('/providers/:pid/roles', verifySession, function(req, res) {
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
					} else {
						var keys = Object.keys(selectedInstances);
						var ec2 = new EC2(settings.aws);
						var count = keys.length;
						var successInstances = [];
						var failedIntances = [];
						for (var i = 0; i < keys.length; i++) {
							(
								function(key, inst) {
									ec2.launchInstance(null, function(err, instanceData) {
										count = count - 1;
										if (err) {
											failedIntances.push(inst.title);
										} else {
											successInstances.push({
												key: inst.type,
												instance: instanceData.InstanceId
											});
											if (count == 0) { //all instance are processed
												res.json({
													launchedInstances: successInstances,
													launchedFailedInstance: failedIntances
												});
											}

											//processing launched intance 

											//saving in database 
											var instanceData = {
												instanceId: instanceData.InstanceId,
												instanceIP: instanceData.PublicIpAddress,
												instanceRole: inst.title,
												instanceActive: true,
												instanceState: instanceData.State.Name,
												bootStrapLog: 'waiting'
												bootStrapStatus: false,
												runlist: inst.runlist.split(',')
											}

											domainsDao.saveDomainInstanceDetails(domainName, [instance], function(err, data) {
												if (err) {
													console.log("Unable to store instance in DB");
													return;
												} else {
													console.log("instance stored in DB");

													//enabling scheduled termination 
													setTimeout(function() {
														ec2.terminateInstances(instanceData.InstanceId, function(err, data) {
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

													}, 3600000);

													//waiting for instances
													ec2.waitForInstanceRunnnigState(instanceData.InstanceId, function(err, instanceData) {
														if (err) {
															return;
														} else {
															//updating instance state
															domainsDao.updateInstanceState(domainName, instanceData.InstanceId, data.State.Name, function(err, updateData) {
																if (err) {
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
																chef.bootstarpInstance({
																	instanceIp: instanceData.PublicIpAddress,
																	pemFilePath: settings.aws.pemFileLocation + settings.aws.pemFile,
																	runList: combinedRunList,
																	instanceUserName: settings.aws.instanceUserName
																}, function(err, code) {
																	if (err) {
																		domainsDao.updateInstanceBootstrapStatus(domainName, instanceData.InstanceId, false, function(err, updateData) {

																		});
																	} else {
																		if (code == 0) {
																			domainsDao.updateInstanceBootstrapStatus(domainName, instanceData.InstanceId, true, function(err, updateData) {
																				if (err) {
																					console.log("Unable to set instance bootstarp status");
																				} else {
																					console.log("Instance bootstrap status set to true");
																				}

																			});
																		} else {
																			domainsDao.updateInstanceBootstrapStatus(domainName, instanceData.InstanceId, false, function(err, updateData) {
																				if (err) {
																					console.log("Unable to set instance bootstarp status");
																				} else {
																					console.log("Instance bootstrap status set to false");
																				}
																			});
																		}
																	}

																}, function(stdOutData) {

																}, function(stdErrData) {

																});


															});
														}
													});


												}
											});
										}
									});
								})(keys[i], selectedInstances[keys[i]]);
						}
					}
				});
			} else {
				res.send(400, "invalid parameters");
			}
		});
	});
}