var mongoose = require('mongoose');
var d4dModelNew = require('../model/d4dmasters/d4dmastersmodelnew.js');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  username: String,
  fname: String,
  lname: String,
  groupId: Number,
  roleId: Number
});

var Users = mongoose.model('users', UserSchema);


module.exports.createUser = function(username, fname, lname, groupId, roleId, callback) {
  var user = new Users({
    username: username,
    fname: fname,
    lname: lname,
    groupId: groupId,
    roleId: roleId
  });
  user.save(function(err, data) {
    if (err) {
      callback(err, null);
      return;
    }
    console.log("User Document Created");
    callback(null, data);
  });

};

module.exports.getUser = function(username, callback) {
        d4dModelNew.d4dModelMastersUsers.find({
            loginname: username,
            id:7
        }, function(err, d4dMasterJson) {
            if (err) {
                console.log("Hit and error:" + err);
            }
            if (d4dMasterJson) {
                //
               console.log("sent response" + JSON.stringify(d4dMasterJson));
               callback(null,d4dMasterJson);
                
                //res.end();
            } else {
                console.log("none found");
                callback(err,null);
            }


        });
}

module.exports.getUser__ = function(username, callback) {
  Users.find({
    username: username,
  }, function(err, data) {
    if (err) {
      callback(err, null);
      return;
    }
    callback(null, data)
  });
}

module.exports.getUsersInGroup = function(groupId, roleId, callback) {
  Users.find({
    //roleId:roleId,
    groupId: groupId,
  }, function(err, data) {
    if (err) {
      callback(err, null);
      return;
    }
    callback(null, data)
  });
}