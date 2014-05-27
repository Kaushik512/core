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
    runlist: [String],
  }],
  stacks: [{
    stackId: String,
    stackName: String
  }],
  blueprintsAppFactory: [{
    blueprintName: String,
    os: String,
    InstanceType: String,
    numberOfInstance: Number,
    runlist: [String],
    blueprintInstancesString: String
  }],
  blueprintsEnvironment: [String],
  bluePrintsCloudFormation: [{
    blueprintName: String,
    stackName: String,
    runlist: [String],
    stackPrameters: [{
      ParameterKey: String,
      ParameterValue: String
    }],
    templateUrl: String,
    templateName: String

  }],
});


var Domains = mongoose.model('domains', DomainsSchema);


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

module.exports.upsertAppFactoryBlueprint = function(pid, domainName, blueprintName, intanceType, numberOfInstance, os, runlist, blueprintInstanceString, callback) {
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
        for (var i = 0; i < bluePrints.length; i++) {
          if (bluePrints[i].blueprintName === blueprintName) {
            newBluePrints.push({
              blueprintName: blueprintName,
              os: os,
              InstanceType: intanceType,
              numberOfInstance: numberOfInstance,
              runlist: runlist,
              blueprintInstancesString: blueprintInstanceString
            });
          } else {
            newBluePrints.push(bluePrints[i]);
          }
        }
      } else {
        newBluePrints.push({
          blueprintName: blueprintName,
          os: os,
          InstanceType: intanceType,
          numberOfInstance: numberOfInstance,
          runlist: runlist,
          blueprintInstancesString: blueprintInstanceString
        });
      }
      console.log(newBluePrints);
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
        os: os,
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


module.exports.upsertCloudFormationBlueprint = function(pid, domainName, blueprintName, templateName, templateUrl, stackName, runlist, stackPrameters, callback) {
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
      var bluePrints = domain.bluePrintsCloudFormation;

      if (bluePrints && bluePrints.length) {
        for (var i = 0; i < bluePrints.length; i++) {
          if (bluePrints[i].blueprintName === blueprintName) {
            newBluePrints.push({
              blueprintName: blueprintName,
              stackName: stackName,
              runlist: runlist,
              stackPrameters: stackPrameters,
              templateUrl: templateUrl,
              templateName: templateName
            });
          } else {
            newBluePrints.push(bluePrints[i]);
          }
        }
      } else {
        newBluePrints.push({
          blueprintName: blueprintName,
          stackName: stackName,
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