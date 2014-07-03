var CloudFormation = require('../controller/cloudFormation.js');
var settingsController = require('../controller/settings');
var domainsDao = require('../controller/domains.js');
var https = require('https');
var Chef = require('../controller/chef.js');
var users = require('../controller/users.js');

module.exports.setRoutes = function(app, verifySession) {

	app.get('/aws/cloudformation/getTemplates', verifySession, function(req, res) {
		res.render('cloudFormation-templates.ejs');
	});

	app.post('/aws/cloudformation/configureTemplates', verifySession, function(req, res) {
		if (req.body.templateUrl && req.body.title) {
			console.log(req.body);
			console.log(req.body.templateUrl);
			var templateBody = "";
			https.get(req.body.templateUrl, function(httpRes) {
				console.log("Got response: " + httpRes.statusCode);
				httpRes.on('data', function(chunk) {
					templateBody += chunk.toString('utf-8');
				});
				httpRes.on('end', function() {
					settingsController.getChefSettings(function(settings) {
						//res.render('cookbooks');
						var chef = new Chef(settings);
						chef.getHostedChefCookbooks(function(err, resp) {
							if (err) {
								res.send(500);
							} else {
								domainsDao.getAllDomainData(parseInt(req.body.pid), function(err, domainsdata) {
									console.log(domainsdata);
									if (err) {
										res.send(500);
									} else {
										users.getUsersInGroup(req.session.user.groupId, 500, function(err, data) {
											if (err) {
												res.send(500);
												return;
											}
											var templateObj = JSON.parse(templateBody);
											res.render('cloudFormation-configure.ejs', {
												templateObj: templateObj,
												templateUrl: req.body.templateUrl,
												templateTitle: req.body.title,
												cookbooks: resp,
												domains: domainsdata,
												userData: req.session.user,
												serviceConsumers: data
											});
										});



									}
								});

							}
						});
					});


				});
			}).on('error', function(e) {
				console.log("Got error: " + e.message);
				res.send(500);
			});
		} else {
			res.send(400);
		}
	});

	app.post('/aws/cloudformation/saveBluePrint', verifySession, function(req, res) {

		if (req.body.serviceConsumers && req.body.serviceConsumers.length) {
			req.body.serviceConsumers.push(req.session.user.cn);
		} else {
			req.body.serviceConsumers = [];
			req.body.serviceConsumers.push(req.session.user.cn);
		}


		domainsDao.upsertCloudFormationBlueprint(req.body.pid, req.body.domainName, req.session.user.groupId, req.body.blueprintName, req.body.templateTitle, req.body.templateUrl, req.body.stackName, req.body.runlist, req.body.parameters, req.body.expirationDays, req.body.serviceConsumers, function(err, data) {
			if (err) {
				res.send(500);
				console.log(err);
				return;
			} else {
				res.send(data);
			}
		});
	});


	app.get('/aws/cloudformation/bluePrint/details/', verifySession, function(req, res) {
		console.log('i m here');
		console.log('query', req.query);
		domainsDao.getCloudFormationBlueprint(req.query.pid, req.query.domainName, req.query.blueprintName, req.query.ver, function(err, data) {
			if (err) {
				res.send(500);
				return;
			}
			if (data.length && data[0].bluePrintsCloudFormation && data[0].bluePrintsCloudFormation.length) {
				var blueprint = data[0].bluePrintsCloudFormation[0];
				var templateBody = "";
				https.get(blueprint.templateUrl, function(httpRes) {
					console.log("Got response: " + httpRes.statusCode);
					httpRes.on('data', function(chunk) {
						templateBody += chunk.toString('utf-8');
					});
					httpRes.on('end', function() {
						settingsController.getChefSettings(function(settings) {
							var chef = new Chef(settings);
							chef.getHostedChefCookbooks(function(err, cookbooks) {
								if (err) {
									res.send(500);
									return;
								}
								users.getUsersInGroup(req.session.user.groupId, 500, function(err, data) {
									if (err) {
										res.send(500);
										return;
									}
									var templateObj = JSON.parse(templateBody);
									res.render("cloudFormation-blueprintDetails", {
										blueprint: blueprint,
										serviceConsumers:data,
										cookbooks:cookbooks,
										templateObj:templateObj,
										pid:req.query.pid,
										domainName:req.query.domainName,
										userData:req.session.user
									});
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


	app.post('/aws/cloudformation/createStack', verifySession, function(req, res) {
		console.log(req.body);
		var domainName = req.body.domainName;
		var pid = parseInt(req.body.pid);
		domainsDao.createDomainDocument(domainName, pid, function(err, data) {
			if (err) {
				res.send(500);
				return;
			}
			settingsController.getAwsSettings(function(awsSettings) {
				var cloudFormation = new CloudFormation(awsSettings);
				cloudFormation.createStack({
					StackName: req.body.stackName,
					TemplateURL: req.body.templateUrl,
					Parameters: req.body.parameters,
				}, function(err, stackId) {
					if (err) {
						res.send(500);
					} else {
						domainsDao.saveStackDetails(domainName, [{
							stackId: stackId,
							stackName: req.body.stackName,
							templateName: req.body.templateTitle
						}], function(err, data) {
							if (err) {
								console.log(err);
								res.send(500);
							} else {
								res.send(stackId);
							}
						});
					}
				});
			});
		});
	});

	app.get('/aws/cloudformation/:pid/blueprints', verifySession, function(req, res) {
		domainsDao.getAllDomainData(req.params.pid, function(err, domainsdata) {
			if (err) {
				res.send(500);
			} else {
				res.render('cloudFormation-blueprints.ejs', {
					domains: domainsdata,
					userData: req.session.user
				});
			}
		});

	});

	app.post('/aws/cloudformation/blueprints/launch', verifySession, function(req, res) {
		console.log(req.body);
		domainsDao.getCloudFormationBlueprint(req.body.pid, req.body.domainName, req.body.blueprintName, req.body.version, function(err, data) {
			if (err) {
				res.send(500);
				return;
			}
			if (data.length && data[0].bluePrintsCloudFormation && data[0].bluePrintsCloudFormation.length) {
				var blueprint = data[0].bluePrintsCloudFormation[0];

				if (!blueprint) {
					res.send(400);
					return;
				}


				console.log(blueprint);
				settingsController.getAwsSettings(function(awsSettings) {
					var cloudFormation = new CloudFormation(awsSettings);

					var parameters = [];
					if (blueprint.stackParameters && blueprint.stackParameters.length) {
						for (var i = 0; i < blueprint.stackParameters.length; i++) {
							parameters.push({
								ParameterKey: blueprint.stackParameters[i].ParameterKey,
								ParameterValue: blueprint.stackParameters[i].ParameterValue
							});
						}
					}



					cloudFormation.createStack({
						StackName: blueprint.stackName,
						TemplateURL: blueprint.templateUrl,
						Parameters: parameters,
					}, function(err, stackId) {
						if (err) {
							console.log(err);
							res.send(500);
						} else {
							domainsDao.saveStackDetails(req.body.domainName, [{
								stackId: stackId,
								stackName: blueprint.stackName,
								templateName: blueprint.templateName
							}], function(err, data) {
								if (err) {
									console.log(err);
									res.send(500);
								} else {
									res.send(stackId);
								}
							});
						}
					});
				});


			} else {
				res.send(400);
			}
		});
	});


};