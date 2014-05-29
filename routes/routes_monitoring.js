var settingsController = require('../controller/settings');
var domainsDao = require('../controller/domains.js');
var EC2 = require('../controller/ec2.js');



module.exports.setRoutes = function(app,sessionVerificationFunc) {
  

  app.get('/monitoring/index', sessionVerificationFunc, function(req, resp) {
  console.log(req.query);
  var pid = req.query.pid;
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
      	var ec2 = new EC2(awsSettings);
        ec2.describeInstances(null, function(err, data) {
          if (err) {
            resp.render('monitoring/monitoring.ejs', {
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
            resp.render('monitoring/monitoring.ejs', {
              error: err,
              domains: domainsdata,
              pid: pid,
              unallocatedInstances: unallocatedInstances
            });
          }
        });
      });

    } else {

      resp.render('monitoring/monitoring.ejs', {
        error: err,
        domains: domainsdata,
        pid: pid,
        unallocatedInstances: null
      });
    }
  });

});



}