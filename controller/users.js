var mongoose = require('mongoose');

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