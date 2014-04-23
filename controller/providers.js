var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var providerSchema = new Schema({
  name: String,
  pid: Number,
  status: Boolean,
  roles: [{
    cid: Number,
    title: String,
    amiid: String,
    description: String,
    runlist: [String],
    sizing: {
      CPU: String,
      RAM: String,
      HDD: String,
    }
  }],
});


var provider = mongoose.model('providers', providerSchema);



module.exports.getProviders = function(callback) {
  console.log('now i m here');
  provider.find({}, 'name pid status', function(err, data) {

    if (err) {
      console.log("error");
      callback("error", null);
    } else {
      data.sort(function(a, b) {
        return a.pid - b.pid;
      });
      callback(null, data);
    }
  });
}

module.exports.getProviderRoles = function(pid, callback) {
  provider.find({
    pid: pid
  }, function(err, data) {

    if (err) {
      console.log("error");
      callback("error", null);
    } else {
      //console.log(data);
      callback(null, data[0]);
    }
  });
}

module.exports.setProviderStatus = function(pidList, callback) {

  if (!pidList) {
    pidList = [];
  }
  pidList = [].concat(pidList);

  for (var i = 0; i < pidList.length; i++) {
    pidList[i] = parseInt(pidList[i]);
  }
  console.log(pidList);
  provider.update({
    pid: {
      $in: pidList
    }
  }, {
    $set: {
      status: true
    }
  }, {
    upsert: false,
    multi: true
  }, function(err, data) {
    if (err) {
      console.log(err);
      callback(err);
      return;
    }
    console.log(data);
    provider.update({
      pid: {
        $nin: pidList
      }
    }, {
      $set: {
        status: false
      }
    }, {
      upsert: false,
      multi: true
    }, function(err, data) {
      if (err) {
        console.log(err);
        callback(err);
        return;
      }
      console.log(data);
      callback(null, data);
    });
  });

}