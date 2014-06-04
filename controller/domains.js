var mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost/devops');

var Schema = mongoose.Schema;

var DomainsSchema = new Schema({
  domainName: String,
  domainPid: Number,
  domainInstances: [{
    instanceId: String,
    instanceIP: String,
    instanceRole: String,
    instanceState: String,
    instanceActive: Boolean,
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
    stackName: String
  }],
  appFactoryInstances: [{
    instanceId: String,
    instanceIP: String,
    instanceName: String,
    instanceState: String,
    instanceActive: Boolean,
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
    groupName: String,
    version: String,
    os: String,
    InstanceType: String,
    numberOfInstance: Number,
    runlist: [String],
    expirationDays:Number,
    blueprintInstancesString: String
  }],
  blueprintsEnvironment: [String],
  bluePrintsCloudFormation: [{
    blueprintName: String,
    stackName: String,
    groupName: String,
    version: String,
    runlist: [String],
    expirationDays:Number,
    stackPrameters: [{
      ParameterKey: String,
      ParameterValue: String
    }],
    templateUrl: String,
    templateName: String

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
  return major + '.' + minor;
}

function sortBlueprintsArray(bluePrints) {
  bluePrints.sort(function(a, b) {
    if (a.version < b.version) {
      return -1;
    } else if (a.version > b.version) {
      return 1;
    } else {
      return 0;
    }
  });
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

module.exports.updateAppFactoryInstanceState = function(domainName, instanceId, instanceState, callback) {
  Domains.update({
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

module.exports.upsertAppFactoryBlueprint = function(pid, domainName, groupName, blueprintName, intanceType, numberOfInstance, os, runlist, blueprintInstanceString,expirationDays, callback) {
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
          if (bluePrints[i].blueprintName === blueprintName && bluePrints[i].groupName === groupName) {

            var newVersion = generateBlueprintVersionNumber(bluePrints[i].version);
            console.log('new version ==>', newVersion);

            bluePrints.splice(i, 0, {
              blueprintName: blueprintName,
              groupName: groupName,
              os: os,
              expirationDays:expirationDays,
              version: newVersion,
              InstanceType: intanceType,
              numberOfInstance: numberOfInstance,
              runlist: runlist,
              blueprintInstancesString: blueprintInstanceString
            });
            found = true;
            break;
          }
        }
        if (!found) {
          bluePrints.push({
            blueprintName: blueprintName,
            groupName: groupName,
            os: os,
            expirationDays:expirationDays,
            version: generateBlueprintVersionNumber(null),
            InstanceType: intanceType,
            numberOfInstance: numberOfInstance,
            runlist: runlist,
            blueprintInstancesString: blueprintInstanceString
          });
        }
        newBluePrints = bluePrints;

      } else {
        newBluePrints.push({
          blueprintName: blueprintName,
          groupName: groupName,
          os: os,
          expirationDays:expirationDays,
          version: generateBlueprintVersionNumber(null),
          InstanceType: intanceType,
          numberOfInstance: numberOfInstance,
          runlist: runlist,
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
        callback(null, data);
      });
    } else {
      // create new 
      newBluePrints.push({
        blueprintName: blueprintName,
        groupName: groupName,
        os: os,
        expirationDays:expirationDays,
        version: generateBlueprintVersionNumber(null),
        InstanceType: intanceType,
        numberOfInstance: numberOfInstance,
        runlist: runlist,
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
        callback(null, data);
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


module.exports.upsertCloudFormationBlueprint = function(pid, domainName, groupName, blueprintName, templateName, templateUrl, stackName, runlist, stackPrameters,expirationDays, callback) {
  console.log(domainName, pid, groupName);
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
          if (bluePrints[i].blueprintName === blueprintName && bluePrints[i].groupName === groupName) {
            var newVersion = generateBlueprintVersionNumber(bluePrints[i].version);
            console.log('new version ==>', newVersion);

            bluePrints.splice(i, 0, {
              blueprintName: blueprintName,
              groupName: groupName,
              version: newVersion,
              expirationDays:expirationDays,
              stackName: stackName,
              runlist: runlist,
              stackPrameters: stackPrameters,
              templateUrl: templateUrl,
              templateName: templateName
            });
            found = true;
            break;
          }
        }
        if (!found) {
          bluePrints.push({
            blueprintName: blueprintName,
            groupName: groupName,
            version: generateBlueprintVersionNumber(null),
            stackName: stackName,
            expirationDays:expirationDays,
            runlist: runlist,
            stackPrameters: stackPrameters,
            templateUrl: templateUrl,
            templateName: templateName
          });
        }
        newBluePrints = bluePrints;
      } else {
        newBluePrints.push({
          blueprintName: blueprintName,
          groupName: groupName,
          version: generateBlueprintVersionNumber(null),
          stackName: stackName,
          expirationDays:expirationDays,
          runlist: runlist,
          stackPrameters: stackPrameters,
          templateUrl: templateUrl,
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
        callback(null, data);
      });
    } else {
      // create new 
      newBluePrints.push({
        blueprintName: blueprintName,
        groupName: groupName,
        version: generateBlueprintVersionNumber(null),
        expirationDays:expirationDays,
        stackName: stackName,
        runlist: runlist,
        stackPrameters: stackPrameters,
        templateUrl: templateUrl,
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
        console.log("Domain Document Created");
        callback(null, data);
      });
    }
  });
}

module.exports.getAppFactoryBlueprint = function(pid, domainName, blueprintName, version, callback) {
  var queryObj = {
    domainName: domainName,
    domainPid: pid,
    "blueprintsAppFactory.blueprintName": blueprintName,
    "blueprintsAppFactory.version":version
  };
 
  console.log('query == > ', queryObj );


  Domains.find(queryObj, {
    blueprintsAppFactory: {
      $elemMatch: {
        blueprintName: blueprintName,
        version:version
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

module.exports.getCloudFormationBlueprint = function(pid, domainName, blueprintName,version, callback) {
  Domains.find({
    domainName: domainName,
    domainPid: pid,
    "bluePrintsCloudFormation.blueprintName": blueprintName,
     "bluePrintsCloudFormation.version":version
  }, {
    bluePrintsCloudFormation: {
      $elemMatch: {
        blueprintName: blueprintName,
        version:version
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