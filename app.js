var express = require("./node_modules/express");
var app = express();
var engine = require("./node_modules/ejs");
var path = require("path");
var http = require("http");
var childProcess = require('child_process');
var io = require('socket.io');

var appConfig = require('./app_config');
var settingsController = require('./controller/settings');



var mongoDbConnect = require('./controller/mongodb');
mongoDbConnect({
  host: process.env.DB_PORT_27017_TCP_ADDR,
  port: process.env.DB_PORT_27017_TCP_PORT,
  dbName: 'devops'
}, function(err) {
  if (err) {
    throw new Error(err);
  } else {
    console.log('connected to mongodb');
  }
});

app.set('port', process.env.PORT || appConfig.app_run_port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.cookieParser());
app.use(express.cookieSession({
  secret: 'sessionSekret'
}));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'views')));

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var verifySession = function(req, res, next) {
  if (req.session && req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
};


var routes = require('./routes/routes.js');
routes.setRoutes(app);


var ec2 = require('./controller/AWS_EC2');

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



var domainsDao = require('./controller/domains.js');
var knifeConfig;


var instancesStatus = {};



app.post('/start', verifySession, function(req, resp) {
  //console.log(req.body);
  settingsController.getSettings(function(settings) {
    var domainName = req.body.domainName;
    var pid = req.body.pid;
    var selectedInstances = req.body.selectedInstances;
    console.log(selectedInstances);
    if (selectedInstances) {

      //creating domain document
      domainsDao.createDomainDocument(domainName, pid, function(err, data) {
        if (err) {
          resp.json({
            error: "Unable to create domain"
          });
        } else {

          var launchedInstances = [];
          var launchedFailedInstance = [];
          var keys = Object.keys(selectedInstances);
          var count = keys.length;
          var launchedInstanceIds = [];

          for (var i = 0; i < keys.length; i++) {
            (function(inst) {
              ec2.launchInstance(inst.amiid, settings.aws, {
                terminate: true,
                delay: 3600000
              }, function(err, data) {
                if (err) {
                  launchedFailedInstance.push({
                    instanceId: null,
                    title: inst.title
                  });
                } else {
                  //instance launch is successful ... now preparing for bootstrapping
                  console.log("Instance launced success");
                  launchedInstances.push({
                    instanceId: data.Instances[0].InstanceId,
                    title: inst.title
                  });
                  instancesStatus[data.Instances[0].InstanceId] = {
                    status: "Waiting for instance.",
                    instanceId: data.Instances[0].InstanceId,
                    event_name: "instance-starting"
                  };
                }

                if (count > 1) {
                  count--;
                } else {
                  resp.json({
                    launchedInstances: launchedInstances,
                    launchedFailedInstance: launchedFailedInstance
                  });
                }

              }, function(instanceId) {
                if (instancesStatus[instanceId]) {
                  instancesStatus[instanceId] = {
                    status: "Waiting for instance.",
                    instanceId: instanceId,
                    event_name: "instance-starting"
                  };
                  //instancesStatus[instanceId].socket.emit('instance-starting',{status:"Waiting for instance.",instanceId:instanceId});
                }
              }, function(instanceData) {


                console.log("instance is now in running state");
                console.log("bootstapping the instance");

                //instancesStatus[instanceData.InstanceId].statusText = "Bootstraping the instance.";
                if (instancesStatus[instanceData.InstanceId]) {
                  //instancesStatus[instanceData.InstanceId] = {status:"Bootstrapping the instance.",instanceId:instanceData.InstanceId,event_name:"instance-start-bootstrapping"};
                  // instancesStatus[instanceData.InstanceId].socket.emit('instance-start-bootstrapping',{status:"Bootstrapping the instance.",instanceId:instanceData.InstanceId});
                }
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

                console.log(rolesArg);
                console.log(runlistSelectedArg);

                var combinedRunList = rolesArg.concat(runlistSelectedArg);
                console.log(combinedRunList);
                var spawn = childProcess.spawn;
                var knifeProcess;
                if (combinedRunList && combinedRunList.length) {
                  knifeProcess = spawn('knife', ['bootstrap', instanceData.PublicIpAddress, '-i' + settings.aws.pemFileLocation + settings.aws.pemFile, '-r' + combinedRunList.join(), '-x' + settings.aws.instanceUserName], {
                    cwd: settings.chef.chefReposLocation + settings.chef.userChefRepoName
                  });
                } else {
                  knifeProcess = spawn('knife', ['bootstrap', instanceData.PublicIpAddress, '-i' + settings.aws.pemFileLocation + settings.aws.pemFile, '-x' + settings.aws.instanceUserName], {
                    cwd: settings.chef.chefReposLocation + settings.chef.userChefRepoName
                  });
                }

                knifeProcess.stdout.on('data', function(data) {
                  console.log('stdout: ==> ' + data);
                  if (instancesStatus[instanceData.InstanceId]) {
                    var date = new Date();
                    instancesStatus[instanceData.InstanceId] = {
                      status: data.toString('ascii'),
                      instanceId: instanceData.InstanceId,
                      event_name: "instance-start-bootstrapping",
                      lastTime: date.getTime()
                    };
                    //instancesStatus[instanceData.InstanceId].socket.emit('instance-bootstrapping',{status:data.toString('ascii'),instanceId:instanceData.InstanceId});
                  }
                });
                knifeProcess.stderr.on('data', function(data) {
                  console.log('stderr: ==> ' + data);
                  if (instancesStatus[instanceData.InstanceId]) {
                    var date = new Date();
                    instancesStatus[instanceData.InstanceId] = {
                      status: data.toString('ascii'),
                      instanceId: instanceData.InstanceId,
                      event_name: "instance-start-bootstrapping",
                      lastTime: date.getTime(),
                      error: true
                    };

                    //instancesStatus[instanceData.InstanceId].socket.emit('instance-bootstrapping-error',{status:data.toString('ascii'),instanceId:instanceData.InstanceId});
                  }
                });

                /////

                knifeProcess.on('close', function(code) {
                  var instance = {
                    instanceId: instanceData.InstanceId,
                    instanceIP: instanceData.PublicIpAddress,
                    instanceRole: inst.title,
                    instanceActive: true,
                    bootStrapStatus: false,
                    runlist: inst.runlist.split(',')
                  }
                  if (code === 0) {
                    if (instancesStatus[instanceData.InstanceId]) {
                      instancesStatus[instanceData.InstanceId] = {
                        status: "Instance Successfully Bootstrapped.",
                        instanceId: instanceData.InstanceId,
                        code: code,
                        event_name: "instance-bootstrapped"
                      }
                      //instancesStatus[instanceData.InstanceId].socket.emit('instance-bootstrapped',{status:"Instance Successfully Bootstrapped.",instanceId:instanceData.InstanceId,code:code});
                    }
                    instance.bootStrapStatus = true;

                  } else {
                    if (instancesStatus[instanceData.InstanceId]) {
                      instancesStatus[instanceData.InstanceId] = {
                        status: "Instance Bootstrapping failed.",
                        instanceId: instanceData.InstanceId,
                        code: code,
                        event_name: "instance-bootstrapped"
                      }

                      //instancesStatus[instanceData.InstanceId].socket.emit('instance-bootstrapped',{status:"Instance Bootstrapping failed.",instanceId:instanceData.InstanceId,code:code});
                    }
                    instance.bootStrapStatus = false;
                  }
                  domainsDao.saveDomainInstanceDetails(domainName, [instance], function(err, data) {
                    if (err) {
                      console.log("Unable to store instance in DB");
                    } else {
                      console.log("instance stored in DB");
                    }
                  });

                  console.log('child process exited with code ' + code);
                });

                knifeProcess.on('error', function(error) {
                  console.log("Error is spawning process");
                  console.log(error);
                });

              }, function(terminatedInstance, err) {
                if (err) {
                  return;
                }
                if (instancesStatus[terminatedInstance.InstanceId]) {
                  console.log('Removin instance from list ' + terminatedInstance.InstanceId);
                  console.log('before');
                  console.log(instancesStatus);
                  delete instancesStatus[terminatedInstance.InstanceId];

                } else {
                  console.log("instance not present");
                }
                domainsDao.updateInstanceStatus(domainName, terminatedInstance.InstanceId, false, function(err, data) {
                  if (err) {
                    console.log("unable to update status of terminated instance");
                  } else {
                    console.log("Instance status set to false successfully");
                  }
                });

              }); //ends here;
            })(selectedInstances[keys[i]]);
          }

        }
      });
    } else {
      resp.json({
        error: "Invalid input parameters"
      });
    }
  });
});



app.get('/instanceStatus/:instanceId', verifySession, function(req, resp) {
  var instId = req.params.instanceId;
  // fetch domain details from mongo 
  //console.log(instancesStatus[instId]);
  resp.json(instancesStatus[instId]);

});

var fileIo = require('./controller/fileio');



/// settings 



app.get('/monitoring/index', verifySession, function(req, resp) {
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
        ec2.describeInstances(null, awsSettings, function(err, data) {
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

var domainsDao = require('./controller/domains.js');

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

app.post('/app_factory/saveBluePrint', function(req, res) {
  domainsDao.upsertAppFactoryBlueprint(req.body.pid, req.body.domainName, req.body.bluePrintName, req.body.selectedHtmlString, function(err, data) {
    if (err) {
      res.send(500);
      console.log(err);
      return;
    } else {
      res.send(200);
    }
  });
});


var Chef = require('./controller/chef');

app.get('/environments/:pid', verifySession, function(req, res) {
  console.log(req.query.envType);

  settingsController.getChefSettings(function(settings) {
    var chef = new Chef(settings);
    chef.getHostedChefCookbooks(function(err, resp) {
      if (err) {
        res.send(500);
        return;
      }
      domainsDao.getAllDomainData(req.params.pid, function(err, domainsdata) {
        if (err) {
          res.send(500);
          return;
        }
        res.render('environments', {
          error: err,
          cookbooks: resp,
          envType: req.query.envType,
          pid: req.params.pid,
          domains: domainsdata
        });

      });

    });
  });

});

app.post('/environments/saveBluePrint', function(req, res) {
  domainsDao.upsertEnvironmentBlueprint(req.body.pid, req.body.domainName, req.body.bluePrintName, function(err, data) {
    if (err) {
      res.send(500);
      console.log(err);
      return;
    } else {
      res.send(200);
    }
  });
});

var server = http.createServer(app);
io = io.listen(server, {
  log: false
});

server.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});