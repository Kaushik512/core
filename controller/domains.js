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
    instanceActive: Boolean,
    bootStrapStatus: Boolean,
    runlist: [String],
  }],
  blueprintsAppFactory: [{
    blueprintName: String,
    blueprintInstances: [String]
  }],
  blueprintsEnvironment: [String]
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

module.exports.upsertAppFactoryBlueprint = function(pid, domainName, blueprintName, blueprintInstanceString, callback) {
  console.log(domainName,pid);
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
      var bluePrints = domain.blueprintsAppFactory;
      var newBluePrints = [];
      if (bluePrints && bluePrints.length) {
        for (var i = 0; i < bluePrints.length; i++) {
          if (bluePrints[i].blueprintName === blueprintName) {
            newBluePrints.push({
              blueprintName: blueprintName,
              blueprintInstances: blueprintInstanceString
            });
          } else {
            newBluePrints.push(bluePrints[i]);
          }
        }
      } else {
        newBluePrints.push({
          blueprintName: blueprintName,
          blueprintInstances: blueprintInstanceString
        });
      }

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
  console.log(domainName,pid);
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