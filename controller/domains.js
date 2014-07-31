var mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost/devops');

var Schema = mongoose.Schema;

var DomainsSchema = new Schema({
  domainName: String,
  domainPid: Number,
  domainInstances: [{
    instanceRegion:String,
    instanceId: String,
    instanceIP: String,
    instanceRole: String,
    instanceState: String,
    bootStrapStatus: String,
    bootStrapLog: {
      err: Boolean,
      log: String,
      timestamp: Number
    },
    runlist: [String]
  }],
  stacks: [{
    stackId: String,
    stackName: String,
    templateName: String
  }],
  appFactoryInstances: [{
    instanceRegion:String,
    instanceId: String,
    instanceIP: String,
    instanceName: String,
    instanceState: String,
    bootStrapStatus: String,
    bootStrapLog: {
      err: Boolean,
      log: String,
      timestamp: Number
    },
    runlist: [String]
  }],
  blueprintsAppFactory: [{
    blueprintName: String,
    groupId: Number,
    version: String,
    os: String,
    awsRegion: String,
    awsSecurityGroup: {
      name: String,
      id: String
    },
    instanceType: String,
    numberOfInstance: Number,
    runlist: [String],
    expirationDays: Number,
    templateName: String,
    blueprintInstancesString: String,
    serviceConsumers: [String]
  }],
  blueprintsEnvironment: [String],
  bluePrintsCloudFormation: [{
    blueprintName: String,
    stackName: String,
    groupId: Number,
    version: String,
    runlist: [String],
    expirationDays: Number,
    stackParameters: [{
      ParameterKey: String,
      ParameterValue: String
    }],
    templateUrl: String,
    templateName: String,
    serviceConsumers: [String]

  }],
});


var Domains = mongoose.model('domains', DomainsSchema);


function generateBlueprintVersionNumber(prevVersion) {
  if (!prevVersion) {
    return "0.1";
  }

  var parts = prevVersion.split('.');
  var major = parseInt(parts[0]);
  var minor = parseInt(parts[1]);
  minor++;

  if (minor === 10) {
    major++;
    minor = 0;
  }

  return major + '.' + minor;
}

function sortBlueprintsArray(bluePrints) {
  bluePrints.sort(function(a, b) {
    var x = parseFloat(a.version);
    var y = parseFloat(b.version);
    if (x < y) {
      return -1;
    } else if (x > y) {
      return 1;
    } else {
      return 0;
    }
  });
  console.log(bluePrints);
}


module.exports.createDomainDocument = function(domainName, pid, callback) {
  var obj = {
    domainName: domainName,
    domainPid: pid
  };
  console.log(obj);
  Domains.find({
    domainName: domainName,
    domainPid: pid
  }, function(err, data) {
    if (err) {
      callback(err, null);
      return;
    }
    if (data.length) {
      console.log("domain name already present");
      callback(null, data);
      console.log(data);
    } else {
      console.log("domain name does not exist creating a new one");
      var domain = new Domains({
        domainName: domainName,
        domainPid: pid
      });
      domain.save(function(err, data) {
        if (err) {
          callback(err, null);
          return;
        }
        console.log("Domain Document Created");
        callback(null, data);
      });
    }
  });

}

module.exports.getDomainData = function(domainName, callback) {
  Domains.find({
    domainName: domainName
  }, function(err, data) {
    if (err) {
      callback(err, null);
      return;
    }
    callback(null, data);
  });

};

module.exports.getAllDomainData = function(pid, callback) {
  var queryObj = {};
  if (pid) {
    queryObj.domainPid = pid;
  }
  Domains.find(queryObj, function(err, data) {
    if (err) {
      callback(err, null);
      return;
    }
    callback(null, data);
  });
}


module.exports.saveDomainInstanceDetails = function(domainName, instanceList, callback) {

  Domains.update({
    domainName: domainName
  }, {
    $pushAll: {
      domainInstances: instanceList
    }
  }, {
    upsert: true
  }, function(err, data) {

    if (err) {
      callback(err, null);
      return;
    }
    callback(null, data);

  });

};

module.exports.saveAppFactoryInstanceDetails = function(domainName, instanceList, callback) {

  Domains.update({
    domainName: domainName
  }, {
    $pushAll: {
      appFactoryInstances: instanceList
    }
  }, {
    upsert: true
  }, function(err, data) {

    if (err) {
      callback(err, null);
      return;
    }
    callback(null, data);

  });

};


module.exports.updateInstanceStatus = function(domainName, instanceId, status, callback) {
  Domains.update({
    domainName: domainName,
    "domainInstances.instanceId": instanceId
  }, {
    $set: {
      "domainInstances.$.instanceActive": status
    }
  }, {
    upsert: false
  }, function(err, data) {

    if (err) {
      callback(err, null);
      return;
    }
    callback(null, data);
  });
}

/*
module.exports.updateAppFactoryInstanceStatus = function(domainName, instanceId, status, callback) {
  Domains.update({
    domainName: domainName,
    "appFactoryInstances.instanceId": instanceId
  }, {
    $set: {
      "appFactoryInstances.$.instanceActive": status
    }
  }, {
    upsert: false
  }, function(err, data) {

    if (err) {
      callback(err, null);
      return;
    }
    callback(null, data);
  });
}
*/


module.exports.updateInstanceState = function(domainName, instanceId, instanceState, callback) {
  Domains.update({
    domainName: domainName,
    "domainInstances.instanceId": instanceId
  }, {
    $set: {
      "domainInstances.$.instanceState": instanceState
    }
  }, {
    upsert: false
  }, function(err, data) {

    if (err) {
      callback(err, null);
      return;
    }
    callback(null, data);

  });
}

module.exports.getdDomainInstance = function(pid, domainName, instanceId, callback) {
  var queryObj = {
    domainName: domainName,
    domainPid: pid,
    "domainInstances.instanceId": instanceId,
  };

  console.log('query == > ', queryObj);


  Domains.find(queryObj, {
    domainInstances: {
      $elemMatch: {
        instanceId: instanceId
      }
    }
  }, function(err, data) {
    if (err) {
      console.log(err);
      callback(err, null);
    } else {
      callback(null, data);
    }
  });
}


module.exports.getAppFactoryInstance = function(pid, domainName, instanceId, callback) {
  var queryObj = {
    domainName: domainName,
    domainPid: pid,
    "appFactoryInstances.instanceId": instanceId,
  };

  console.log('query == > ', queryObj);


  Domains.find(queryObj, {
    appFactoryInstances: {
      $elemMatch: {
        instanceId: instanceId
      }
    }
  }, function(err, data) {
    if (err) {
      console.log(err);
      callback(err, null);
    } else {
      callback(null, data);
    }
  });
}

module.exports.updateAppFactoryInstanceState = function(domainName, pid, instanceId, instanceState, callback) {
  console.log(domainName,pid,instanceId,instanceState);
  Domains.update({
    domainPid:pid,
    domainName: domainName,
    "appFactoryInstances.instanceId": instanceId
  }, {
    $set: {
      "appFactoryInstances.$.instanceState": instanceState
    }
  }, {
    upsert: false
  }, function(err, data) {

    if (err) {
      callback(err, null);
      return;
    }
    callback(null, data);

  });
}



module.exports.updateInstanceBootstrapStatus = function(domainName, instanceId, bootStrapStatus, callback) {
  Domains.update({
    domainName: domainName,
    "domainInstances.instanceId": instanceId
  }, {
    $set: {
      "domainInstances.$.bootStrapStatus": bootStrapStatus
    }
  }, {
    upsert: false
  }, function(err, data) {

    if (err) {
      callback(err, null);
      return;
    }
    callback(null, data);

  });
}

module.exports.updateAppFactoryInstanceBootstrapStatus = function(domainName, instanceId, bootStrapStatus, callback) {
  Domains.update({
    domainName: domainName,
    "appFactoryInstances.instanceId": instanceId
  }, {
    $set: {
      "appFactoryInstances.$.bootStrapStatus": bootStrapStatus
    }
  }, {
    upsert: false
  }, function(err, data) {

    if (err) {
      callback(err, null);
      return;
    }
    callback(null, data);

  });
}



module.exports.updateInstanceBootstrapLog = function(domainName, instanceId, bootStrapLog, callback) {
  Domains.update({
    domainName: domainName,
    "domainInstances.instanceId": instanceId
  }, {
    $set: {
      "domainInstances.$.bootStrapLog": bootStrapLog
    }
  }, {
    upsert: false
  }, function(err, data) {

    if (err) {
      callback(err, null);
      return;
    }
    callback(null, data);

  });
}

module.exports.updateAppFactoryInstanceBootstrapLog = function(domainName, instanceId, bootStrapLog, callback) {
  Domains.update({
    domainName: domainName,
    "appFactoryInstances.instanceId": instanceId
  }, {
    $set: {
      "appFactoryInstances.$.bootStrapLog": bootStrapLog
    }
  }, {
    upsert: false
  }, function(err, data) {

    if (err) {
      callback(err, null);
      return;
    }
    callback(null, data);

  });
}


module.exports.deleteDomains = function(pid, domainName, callback) {
  Domains.remove({
    domainName: domainName,
    domainPid: pid
  }, function(err, data) {

    if (err) {
      callback(err, null);
      return;
    }
    callback(null, data);

  });
}

module.exports.upsertAppFactoryBlueprint = function(pid, domainName, groupId, blueprintName, awsRegion, awsSecurityGroup, intanceType, numberOfInstance, os, runlist, blueprintInstanceString, expirationDays, templateName, serviceConsumers, callback) {
  if (!runlist) {
    runlist = [];
  }
  if (!serviceConsumers) {
    serviceConsumers = [];
  }
  console.log('groupId == >', groupId);
  var createVersion = generateBlueprintVersionNumber(null);
  console.log(domainName, pid);
  Domains.find({
    domainName: domainName,
    domainPid: pid
  }, function(err, domainData) {
    if (err) {
      callback(err, null);
      return;
    }
    var newBluePrints = [];
    if (domainData && domainData.length) {
      var domain = domainData[0];
      var bluePrints = domain.blueprintsAppFactory;

      if (bluePrints && bluePrints.length) {
        sortBlueprintsArray(bluePrints);
        var found = false;
        for (var i = bluePrints.length - 1; i >= 0; i--) {
          if (bluePrints[i].blueprintName === blueprintName && bluePrints[i].groupId === groupId) {

            var newVersion = generateBlueprintVersionNumber(bluePrints[i].version);
            console.log('old version ==>', bluePrints[i].version);
            console.log('new version ==>', newVersion);
            createVersion = newVersion;
            bluePrints.splice(i, 0, {
              blueprintName: blueprintName,
              groupId: groupId,
              os: os,
              awsRegion: awsRegion,
              awsSecurityGroup: {
                name: awsSecurityGroup.name,
                id: awsSecurityGroup.id
              },
              expirationDays: expirationDays,
              version: newVersion,
              instanceType: intanceType,
              numberOfInstance: numberOfInstance,
              templateName: templateName,
              runlist: runlist,
              blueprintInstancesString: blueprintInstanceString,
              serviceConsumers: serviceConsumers
            });
            found = true;
            break;
          }
        }
        if (!found) {
          bluePrints.push({
            blueprintName: blueprintName,
            groupId: groupId,
            os: os,
            awsRegion: awsRegion,
            awsSecurityGroup: {
              name: awsSecurityGroup.name,
              id: awsSecurityGroup.id
            },
            expirationDays: expirationDays,
            version: generateBlueprintVersionNumber(null),
            instanceType: intanceType,
            numberOfInstance: numberOfInstance,
            templateName: templateName,
            runlist: runlist,
            serviceConsumers: serviceConsumers,
            blueprintInstancesString: blueprintInstanceString
          });

        }
        newBluePrints = bluePrints;

      } else {
        newBluePrints.push({
          blueprintName: blueprintName,
          groupId: groupId,
          os: os,
          awsRegion: awsRegion,
          awsSecurityGroup: {
            name: awsSecurityGroup.name,
            id: awsSecurityGroup.id
          },
          expirationDays: expirationDays,
          version: generateBlueprintVersionNumber(null),
          instanceType: intanceType,
          numberOfInstance: numberOfInstance,
          templateName: templateName,
          runlist: runlist,
          serviceConsumers: serviceConsumers,
          blueprintInstancesString: blueprintInstanceString
        });
      }
      //console.log(newBluePrints);
      Domains.update({
        domainName: domainName,
        domainPid: pid
      }, {
        $set: {
          blueprintsAppFactory: newBluePrints
        }
      }, {
        upsert: false
      }, function(err, data) {
        if (err) {
          callback(err, null);
          return;
        }
        callback(null, createVersion);
      });
    } else {
      // create new 
      newBluePrints.push({
        blueprintName: blueprintName,
        groupId: groupId,
        os: os,
        awsRegion: awsRegion,
        awsSecurityGroup: {
          name: awsSecurityGroup.name,
          id: awsSecurityGroup.id
        },
        expirationDays: expirationDays,
        version: generateBlueprintVersionNumber(null),
        instanceType: intanceType,
        numberOfInstance: numberOfInstance,
        runlist: runlist,
        templateName: templateName,
        serviceConsumers: serviceConsumers,
        blueprintInstancesString: blueprintInstanceString
      });

      var domain = new Domains({
        domainName: domainName,
        domainPid: pid,
        blueprintsAppFactory: newBluePrints
      });

      domain.save(function(err, data) {
        if (err) {
          callback(err, null);
          return;
        }
        console.log("Domain Document Created");
        callback(null, createVersion);
      });
    }


  });
}

module.exports.upsertEnvironmentBlueprint = function(pid, domainName, blueprintName, callback) {
  console.log(domainName, pid);
  Domains.find({
    domainName: domainName,
    domainPid: pid
  }, function(err, domainData) {
    if (err) {
      callback(err, null);
      return;
    }
    if (domainData && domainData.length) {
      var domain = domainData[0];
      var bluePrints = domain.blueprintsEnvironment;
      var newBluePrints = [];
      if (bluePrints && bluePrints.length) {
        for (var i = 0; i < bluePrints.length; i++) {
          if (bluePrints[i] === blueprintName) {
            newBluePrints.push(blueprintName);
          } else {
            newBluePrints.push(bluePrints[i]);
          }
        }
      } else {
        newBluePrints.push(blueprintName);
      }

      Domains.update({
        domainName: domainName,
        domainPid: pid
      }, {
        $set: {
          blueprintsEnvironment: newBluePrints
        }
      }, {
        upsert: false
      }, function(err, data) {
        if (err) {
          callback(err, null);
          return;
        }
        callback(null, data);
      });
    } else {
      // create new 

      var domain = new Domains({
        domainName: domainName,
        domainPid: pid,
        blueprintsEnvironment: newBluePrints
      });

      domain.save(function(err, data) {
        if (err) {
          callback(err, null);
          return;
        }
        console.log("Domain Document Created");
        callback(null, data);
      });
    }


  });
}


module.exports.upsertCloudFormationBlueprint = function(pid, domainName, groupId, blueprintName, templateName, templateUrl, stackName, runlist, stackParameters, expirationDays, serviceConsumers, callback) {
  if (!runlist) {
    runlist = [];
  }
  if (!serviceConsumers) {
    serviceConsumers = [];
  }
  var createVersion = generateBlueprintVersionNumber(null);
  console.log(domainName, pid, groupId);
  Domains.find({
    domainName: domainName,
    domainPid: pid
  }, function(err, domainData) {
    if (err) {
      callback(err, null);
      return;
    }
    var newBluePrints = [];
    if (domainData && domainData.length) {
      var domain = domainData[0];
      var bluePrints = domain.bluePrintsCloudFormation;

      if (bluePrints && bluePrints.length) {
        sortBlueprintsArray(bluePrints);
        var found = false;
        for (var i = bluePrints.length - 1; i >= 0; i--) {
          if (bluePrints[i].blueprintName === blueprintName && bluePrints[i].groupId === groupId) {
            var newVersion = generateBlueprintVersionNumber(bluePrints[i].version);
            console.log('new version ==>', newVersion);
            createVersion = newVersion;
            bluePrints.splice(i, 0, {
              blueprintName: blueprintName,
              groupId: groupId,
              version: newVersion,
              expirationDays: expirationDays,
              stackName: stackName,
              runlist: runlist,
              stackParameters: stackParameters,
              templateUrl: templateUrl,
              serviceConsumers: serviceConsumers,
              templateName: templateName
            });
            found = true;
            break;
          }
        }
        if (!found) {
          bluePrints.push({
            blueprintName: blueprintName,
            groupId: groupId,
            version: generateBlueprintVersionNumber(null),
            stackName: stackName,
            expirationDays: expirationDays,
            runlist: runlist,
            stackParameters: stackParameters,
            templateUrl: templateUrl,
            serviceConsumers: serviceConsumers,
            templateName: templateName
          });
        }
        newBluePrints = bluePrints;
      } else {
        newBluePrints.push({
          blueprintName: blueprintName,
          groupId: groupId,
          version: generateBlueprintVersionNumber(null),
          stackName: stackName,
          expirationDays: expirationDays,
          runlist: runlist,
          stackParameters: stackParameters,
          templateUrl: templateUrl,
          serviceConsumers: serviceConsumers,
          templateName: templateName
        });
      }
      console.log(newBluePrints);
      Domains.update({
        domainName: domainName,
        domainPid: pid
      }, {
        $set: {
          bluePrintsCloudFormation: newBluePrints
        }
      }, {
        upsert: false
      }, function(err, data) {
        if (err) {
          callback(err, null);
          return;
        }
        callback(null, createVersion);
      });
    } else {
      // create new 
      newBluePrints.push({
        blueprintName: blueprintName,
        groupId: groupId,
        version: generateBlueprintVersionNumber(null),
        expirationDays: expirationDays,
        stackName: stackName,
        runlist: runlist,
        stackParameters: stackParameters,
        templateUrl: templateUrl,
        serviceConsumers: serviceConsumers,
        templateName: templateName
      });

      var domain = new Domains({
        domainName: domainName,
        domainPid: pid,
        bluePrintsCloudFormation: newBluePrints
      });

      domain.save(function(err, data) {
        if (err) {
          callback(err, null);
          return;
        }
        callback(null, createVersion);
      });
    }
  });
}

module.exports.getAppFactoryBlueprint = function(pid, domainName, blueprintName, version, callback) {
  var queryObj = {
    domainName: domainName,
    domainPid: pid,
    "blueprintsAppFactory.blueprintName": blueprintName,
    "blueprintsAppFactory.version": version
  };

  console.log('query == > ', queryObj);


  Domains.find(queryObj, {
    blueprintsAppFactory: {
      $elemMatch: {
        blueprintName: blueprintName,
        version: version
      }
    }
  }, function(err, data) {
    if (err) {
      console.log(err);
      callback(err, null);
    } else {
      callback(null, data);
    }
  });
}

module.exports.getCloudFormationBlueprint = function(pid, domainName, blueprintName, version, callback) {
  Domains.find({
    domainName: domainName,
    domainPid: pid,
    "bluePrintsCloudFormation.blueprintName": blueprintName,
    "bluePrintsCloudFormation.version": version
  }, {
    bluePrintsCloudFormation: {
      $elemMatch: {
        blueprintName: blueprintName,
        version: version
      }
    }
  }, function(err, data) {
    if (err) {
      console.log(err);
      callback(err, null);
    } else {
      callback(null, data);
    }
  });
}

module.exports.getInstance = function(instanceId, callback) {
  Domains.find({
    "domainInstances.instanceId": instanceId
  }, function(err, data) {
    if (err) {
      callback(err, null);
    } else {
      if (data.length) {
        var domainInstances = data[0].domainInstances;
        if (domainInstances && domainInstances.length) {
          for (var i = 0; i < domainInstances.length; i++) {
            if (domainInstances[i].instanceId == instanceId) {
              callback(null, domainInstances[i]);
              return;
            }
          }
          callback(null, null);
        } else {
          callback(null, null);
        }
      } else {
        callback(null, null);
      }
    }
  });

}

module.exports.saveStackDetails = function(domainName, stackObjArray, callback) {

  Domains.update({
    domainName: domainName
  }, {
    $pushAll: {
      stacks: stackObjArray
    }
  }, {
    upsert: true
  }, function(err, data) {

    if (err) {
      callback(err, null);
      return;
    }
    callback(null, data);

  });

};