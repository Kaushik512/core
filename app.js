var express = require("./node_modules/express");
var app = express();
var engine = require("./node_modules/ejs");
var path = require("path");
var http = require("http");
var childProcess = require('child_process');
var io = require('socket.io');

var appConfig = require('./app_config');
var settingsController = require('./controller/settings');

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
  if (req.session && req.session.tempSession) {
    next();
  } else {
    res.redirect('/login.html');
  }
};


app.post('/signin', function(req, res) {
  console.log(req.body)
  if (req.body && req.body.username && req.body.pass) {
    if (req.body.username === 'admin' && req.body.pass === "ReleV@nce") {
      req.session.tempSession = true;
      products.getProducts(function(err, products) {
        res.render('index', {
          error: err,
          products: products
        });
      });

    } else {
      res.redirect('/login.html');
    }
  } else {
    res.redirect('/login.html');
  }

  //req.session.tempSession = true;

});

app.get('/signout', function(req, res) {
  req.session = null;
  res.redirect('/login.html');
});


var products = require('./controller/products.js')

app.get('/', verifySession, function(req, res) {

  products.getProducts(function(err, products) {
    console.log(products);
    res.render('index', {
      error: err,
      products: products
    });
  });
});

var cookbooks = require('./controller/GetRecipies');

app.post('/cookbooks', verifySession, function(req, res) {
  console.log('Returning Available Cookbooks...!!');
  console.log(req.body);
  settingsController.getChefSettings(function(settings) {
    //res.render('cookbooks');
    cookbooks.getCookbooks({
      user_name: settings.chefUserName,
      key_path: settings.chefReposLocation + settings.chefUserName + "/.chef/" + settings.chefUserPemFile,
      url: settings.hostedChefUrl
    }, function(err, resp) {
      console.log('About to Render...!! ');
      //console.log(err);
      //console.log(resp);
      res.render('cookbook', {
        error: err,
        cookbooks: resp,
        prodSelected: req.body
      });
    });
  });

});

app.get('/products/:pid', verifySession, function(req, res) {
  console.log("fetching for pid ");
  console.log(req.params);
  var pid = req.params.pid;
  if (pid) {
    products.getProductComponents(pid, function(err, data) {
      //console.log(data);  
      res.render('componentslist.ejs', {
        error: err,
        prod: data
      });
    });
  } else {
    //res.sendStatus(404);
  }
});


var ec2 = require('./controller/AWS_EC2');
app.get('/images', function(req, resp) {
  ec2.getImageNames(function(err, data) {
    //resp.render('');
    resp.end(JSON.stringify(data));
  });
});


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



app.get('/domainDetails/:pid', verifySession, function(req, resp) {
  var pid = req.params.pid;
  // fetch domain details from mongo 


  domainsDao.getAllDomainData(pid, function(err, domainsdata) {
    if(err) {
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
              unallocatedInstances : null
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
                for(var k=0;k<allocatedInstances.length;k++) {
                   if(allocatedInstances[k].instanceId ==instances[j].InstanceId) {
                    found = true;
                    break;
                   } 
                }
                if(!found) {
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
             unallocatedInstances : unallocatedInstances
           });
          }
        });
      });

    } else {

      resp.render('domainDetails', {
        error: err,
        domains: domainsdata,
        pid: pid,
         unallocatedInstances : null
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

app.get('/userCookbooks/', verifySession, function(req, resp) {



  var path = req.query.path;
  console.log(path);
  if (path) {
    if (path[0] == '/') {
      path = path.slice(1);
    }
    if (path.length && path.length >= 2) {
      if (path[path.length - 1] == '/') {
        path = path.slice(0, path.length - 1);
        console.log('after slicing');
        console.log(path);
      }
    } else {
      if (path[0] == '/') {
        path = path.slice(1);
      }
    }
  } else {
    path = '';
  }

  function getCookbooksData(rootDir, chefSettings) {

    console.log("full path");
    console.log(rootDir + path);

    fileIo.isDir(rootDir + path, function(err, dir) {
      if (err) {
        console.log(err);
        resp.send(404);
        return;
      }
      if (dir) {
        fileIo.readDir(rootDir, path, function(err, dirList, filesList) {
          if (err) {
            resp.send(500);
            return;
          }
          var chefUserName;
          if (chefSettings) {
            chefUserName = chefSettings.chefUserName
          }
          resp.json({
            resType: 'dir',
            files: filesList,
            dirs: dirList,
            chefUserName: chefUserName
          });

        });

      } else { // this is a file
        fileIo.readFile(rootDir + path, function(err, fileData) {
          if (err) {
            resp.send(500);
            return;
          }
          resp.json({
            resType: "file",
            fileData: fileData.toString('utf-8')
          });
        })
      }

    });
  }

  settingsController.getChefSettings(function(chefSettings) {

    if (path === '') {
      var spawn = childProcess.spawn;
      var knifeProcess;
      knifeProcess = spawn('knife', ['download', 'cookbooks'], {
        cwd: chefSettings.chefReposLocation + chefSettings.userChefRepoName
      });

      knifeProcess.stdout.on('data', function(data) {
        console.log('cookbook download : stdout: ==> ' + data);
      });
      knifeProcess.stderr.on('data', function(data) {
        console.log('cookbook download : stderr: ==> ' + data);
      });

      knifeProcess.on('close', function(code) {
        if (code == 0) {
          getCookbooksData(chefSettings.chefReposLocation + chefSettings.userChefRepoName + '/cookbooks/', chefSettings);
        } else {
          resp.send(500);
          /*resp.json({
          msg: "cookbook upload failed"
        });*/
        }
      });

      knifeProcess.on('error', function(error) {
        console.log("Error is spawning process");
        console.log(error);
        resp.send(500);
      });
    } else {
      getCookbooksData(chefSettings.chefReposLocation + chefSettings.userChefRepoName + '/cookbooks/');
    }

  });

});

app.post('/userCookbooks/save', verifySession, function(req, resp) {
  var path = req.body.filePath;
  var fileContent = req.body.fileContent;

  if (path) {
    if (path[0] == '/') {
      path = path.slice(1);
    }
    if (path.length && path.length >= 2) {
      if (path[path.length - 1] == '/') {
        path = path.slice(0, path.length - 1);
        console.log('after slicing');
        console.log(path);
      }
    } else {
      if (path[0] == '/') {
        path = path.slice(1);
      }
    }
  } else {
    path = '';
  }

  settingsController.getChefSettings(function(chefSettings) {
    fileIo.writeFile(chefSettings.chefReposLocation + chefSettings.userChefRepoName + '/cookbooks/' + path, fileContent, 'utf-8', function(err) {
      if (err) {
        resp.send(500);
        return;
      }
      //extracting cookbook name;
      var cookbookName = '';

      var indexOfSlash = path.indexOf('/');
      if (indexOfSlash != -1) {
        cookbookName = path.substring(0, indexOfSlash);
      }

      if (cookbookName) {
        var spawn = childProcess.spawn;
        var knifeProcess;
        knifeProcess = spawn('knife', ['cookbook', 'upload', cookbookName], {
          cwd: chefSettings.chefReposLocation + chefSettings.userChefRepoName
        });

        knifeProcess.stdout.on('data', function(data) {
          console.log('cookbook upload : stdout: ==> ' + data);
        });
        knifeProcess.stderr.on('data', function(data) {
          console.log('cookbook upload : stderr: ==> ' + data);
        });

        knifeProcess.on('close', function(code) {
          if (code == 0) {
            resp.json({
              msg: "success"
            });
          } else {
            resp.send(500);
            /*resp.json({
          msg: "cookbook upload failed"
        });*/
          }
        });

        knifeProcess.on('error', function(error) {
          console.log("Error is spawning process");
          console.log(error);
          resp.send(500);
        });
      } else {
        resp.json({
          msg: "success"
        });
      }


    });
  });



})


app.get('/userRoles/', verifySession, function(req, resp) {



  var path = req.query.path;
  console.log(path);
  if (path) {
    if (path[0] == '/') {
      path = path.slice(1);
    }
    if (path.length && path.length >= 2) {
      if (path[path.length - 1] == '/') {
        path = path.slice(0, path.length - 1);
        console.log('after slicing');
        console.log(path);
      }
    } else {
      if (path[0] == '/') {
        path = path.slice(1);
      }
    }
  } else {
    path = '';
  }

  function getCookbooksData(rootDir, chefSettings) {

    console.log("full path");
    console.log(rootDir + path);

    fileIo.isDir(rootDir + path, function(err, dir) {
      if (err) {
        console.log(err);
        resp.send(404);
        return;
      }
      if (dir) {
        fileIo.readDir(rootDir, path, function(err, dirList, filesList) {
          if (err) {
            resp.send(500);
            return;
          }
          var chefUserName;
          if (chefSettings) {
            chefUserName = chefSettings.chefUserName
          }
          resp.json({
            resType: 'dir',
            files: filesList,
            dirs: dirList,
            chefUserName: chefUserName
          });

        });

      } else { // this is a file
        fileIo.readFile(rootDir + path, function(err, fileData) {
          if (err) {
            resp.send(500);
            return;
          }
          resp.json({
            resType: "file",
            fileData: fileData.toString('utf-8')
          });
        })
      }

    });
  }

  settingsController.getChefSettings(function(chefSettings) {

    if (path === '') {
      var spawn = childProcess.spawn;
      var knifeProcess;
      knifeProcess = spawn('knife', ['download', 'roles'], {
        cwd: chefSettings.chefReposLocation + chefSettings.userChefRepoName
      });

      knifeProcess.stdout.on('data', function(data) {
        console.log('cookbook download : stdout: ==> ' + data);
      });
      knifeProcess.stderr.on('data', function(data) {
        console.log('cookbook download : stderr: ==> ' + data);
      });

      knifeProcess.on('close', function(code) {
        if (code == 0) {
          getCookbooksData(chefSettings.chefReposLocation + chefSettings.userChefRepoName + '/roles/', chefSettings);
        } else {
          resp.send(500);
          /*resp.json({
          msg: "cookbook upload failed"
        });*/
        }
      });

      knifeProcess.on('error', function(error) {
        console.log("Error is spawning process");
        console.log(error);
        resp.send(500);
      });
    } else {
      getCookbooksData(chefSettings.chefReposLocation + chefSettings.userChefRepoName + '/roles/');
    }

  });

});

app.post('/userRoles/save', verifySession, function(req, resp) {
  var path = req.body.filePath;
  var fileContent = req.body.fileContent;

  if (path) {
    if (path[0] == '/') {
      path = path.slice(1);
    }
    if (path.length && path.length >= 2) {
      if (path[path.length - 1] == '/') {
        path = path.slice(0, path.length - 1);
        console.log('after slicing');
        console.log(path);
      }
    } else {
      if (path[0] == '/') {
        path = path.slice(1);
      }
    }
  } else {
    path = '';
  }

  settingsController.getChefSettings(function(chefSettings) {
    fileIo.writeFile(chefSettings.chefReposLocation + chefSettings.userChefRepoName + '/roles/' + path, fileContent, 'utf-8', function(err) {
      if (err) {
        resp.send(500);
        return;
      }
      //extracting cookbook name;
      var cookbookName = '';

      var indexOfSlash = path.indexOf('/');
      if (indexOfSlash != -1) {
        cookbookName = path.substring(0, indexOfSlash);
      }
      console.log(cookbookName);
      console.log(path);
      if(!cookbookName) {
        cookbookName = path;
      } 
      console.log('cookbookname ==> ' +cookbookName);
      if (cookbookName) {
        var spawn = childProcess.spawn;
        var knifeProcess;
        knifeProcess = spawn('knife', ['upload', 'roles'], {
          cwd: chefSettings.chefReposLocation + chefSettings.userChefRepoName
        });

        knifeProcess.stdout.on('data', function(data) {
          console.log('role upload : stdout: ==> ' + data);
        });
        knifeProcess.stderr.on('data', function(data) {
          console.log('role upload : stderr: ==> ' + data);
        });

        knifeProcess.on('close', function(code) {
          if (code == 0) {
            resp.json({
              msg: "success"
            });
          } else {
            resp.send(500);
            /*resp.json({
          msg: "cookbook upload failed"
        });*/
          }
        });

        knifeProcess.on('error', function(error) {
          console.log("Error is spawning process");
          console.log(error);
          resp.send(500);
        });
      } else {
        resp.json({
          msg: "success"
        });
      }


    });
  });



})




/// settings 
app.post('/settings/aws', verifySession, function(req, resp) {
  if (req.body.aws_accessKey && req.body.aws_secretKey && req.body.aws_region && req.body.aws_keyPair && req.body.aws_securityGroupId && req.files.awsPemFile.size) {
    var fileName = req.files.awsPemFile.name;
    //console.log(req.files);
    fileIo.readFile(req.files.awsPemFile.path, function(err, data) {
      console.log("reading file");
      settingsController.getAwsSettings(function(settings) {
        console.log("I m here");
        fileIo.writeFile(settings.pemFileLocation + fileName, data, null, function(err) {
          console.log("file writing callback");
          if (err) {
            resp.send(500);
            return;
          }
          settingsController.setAwsSettings(req.body.aws_accessKey, req.body.aws_secretKey, req.body.aws_region, req.body.aws_keyPair, req.body.aws_securityGroupId, fileName, function(err) {
            console.log("aws settings callback");
            if (err) {
              resp.send(500);
              return;
            }
            resp.send("ok");
          });
        });
      });
    });
  } else {
    resp.send(400);
  }
});

app.post('/settings/chef', verifySession, function(req, resp) {
  if (req.body.chefUserName && req.body.hostedChefUrl && req.files.chefUserPemFile.size && req.files.chefValidationPemFile.size && req.files.chefKnifeConfigFile.size) {
    //getting chef settings
    settingsController.getChefSettings(function(settings) {
      //checking whether user chef-repo directory is created 
      var chefRepoPath = settings.chefReposLocation + req.body.chefUserName

        function storeUploadedFiles() {
          var filesNames = Object.keys(req.files);
          var count = filesNames.length;

          filesNames.forEach(function(item) {
            console.log(item);
            fileIo.readFile(req.files[item].path, function(err, data) {
              fileIo.writeFile(chefRepoPath + '/.chef/' + req.files[item].name, data, null, function(err) {
                count--;
                if (count === 0) { // all files uploaded
                  // savings in setting 
                  settingsController.setChefSettings(req.body.chefUserName, req.body.chefUserName, req.files.chefUserPemFile.name, req.files.chefValidationPemFile.name, req.body.hostedChefUrl, function(err) {
                    console.log("chef settings callback");
                    if (err) {
                      resp.send(500);
                      return;
                    }
                    resp.send("ok");
                  });
                }
              });
            });

          });
        }

      fileIo.exists(chefRepoPath, function(exists) {
        if (!exists) { // does not exist
          //creating chef repo
          fileIo.mkdir(chefRepoPath, function(err) {
            if (err) {
              resp.send(500);
              return;
            }
            //creating .chef dir 
            fileIo.mkdir(chefRepoPath + '/.chef', function(err) {
              if (err) {
                resp.send(500);
                return;
              }
              storeUploadedFiles();
            });
          });
        } else {
          storeUploadedFiles();
        }
      })


    });
  } else {
    resp.send(400);
  }
});

app.get('/hiddenSettings', verifySession, function(req, resp) {
  products.getProducts(function(err, products) {
    console.log(products);
    resp.render('hiddensettings', {
      error: err,
      products: products
    });
  });
});

app.post('/hiddenSettings', verifySession, function(req, resp) {
  console.log(req.body);
  products.setProductStatus(req.body.prd, function(err, data) {
    if (err) {
      resp.send(500);
      return;
    } else {
      resp.send("success");
    }
  });
});


app.get('/monitoring/index',verifySession,function(req,resp) {
  console.log(req.query);
  var pid = req.query.pid;
  domainsDao.getAllDomainData(pid, function(err, domainsdata) {
    if(err) {
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
              unallocatedInstances : null
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
                for(var k=0;k<allocatedInstances.length;k++) {
                   if(allocatedInstances[k].instanceId ==instances[j].InstanceId) {
                    found = true;
                    break;
                   } 
                }
                if(!found) {
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
             unallocatedInstances : unallocatedInstances
           });
          }
        });
      });

    } else {

      resp.render('monitoring/monitoring.ejs', {
        error: err,
        domains: domainsdata,
        pid: pid,
         unallocatedInstances : null
      });
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