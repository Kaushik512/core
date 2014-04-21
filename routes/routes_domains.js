var domainsDao = require('../controller/domains.js');
var settingsController = require('../controller/settings');
var ec2 = require('../controller/AWS_EC2');


module.exports.setRoutes = function(app,sessionVerificationFunc) {

	app.get('/domains/:pid', sessionVerificationFunc, function(req, resp) {
		var pid = req.params.pid;
		// fetch domain details from mongo 
		domainsDao.getAllDomainData(pid, function(err, domainsdata) {
			if (err) {
				resp.render('domainDetails', {
					error: err,
					domains: domainsdata,
					pid: pid
				});
				return;
			}

			if (pid === '2') {
				settingsController.getAwsSettings(function(awsSettings) {
					ec2.describeInstances(null, awsSettings, function(err, data) {
						if (err) {
							resp.render('domainDetails', {
								error: err,
								domains: domainsdata,
								pid: pid,
								unallocatedInstances: null
							});
						} else {
							var unallocatedInstances = [];
							var allocatedInstances = [];
							for (var i = 0; i < domainsdata.length; i++) {
								allocatedInstances = allocatedInstances.concat(domainsdata[i].domainInstances);
							}

							var reservations = data.Reservations;
							for (var i = 0; i < reservations.length; i++) {
								var instances = reservations[i].Instances;
								for (var j = 0; j < instances.length; j++) {

									var found = false;
									for (var k = 0; k < allocatedInstances.length; k++) {
										if (allocatedInstances[k].instanceId == instances[j].InstanceId) {
											found = true;
											break;
										}
									}
									if (!found) {
										unallocatedInstances.push(instances[j]);
									}
								}
							}
							// console.log(unallocatedInstances);
							// console.log(unallocatedInstances.length);
							resp.render('domainDetails', {
								error: err,
								domains: domainsdata,
								pid: pid,
								unallocatedInstances: unallocatedInstances
							});
						}
					});
				});

			} else {

				resp.render('domainDetails', {
					error: err,
					domains: domainsdata,
					pid: pid,
					unallocatedInstances: null
				});
			}
		});


	});

};