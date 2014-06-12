var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
  username: String,
  fname: String,
  lname: String,
  group: String,
  roleId: Number
});

var Users = mongoose.model('users', UserSchema);


module.exports.createUser = function(username, fname, lname, group, roleId, callback) {
  var user = new Users({
    username: username,
    fname: fname,
    lname: lname,
    group: group,
    roleId: roleId
  });
  user.save(function(err, data) {
    if (err) {
      callback(err, null);
      return;
    }
    console.log("Domain Document Created");
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
module.exports.getUsersInGroup = function(group, roleId, callback) {
  Users.find({
    //roleId:roleId,
    group: group,
  }, function(err, data) {
    if (err) {
      callback(err, null);
      return;
    }
    callback(null, data)
  });
}