var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
  username: String,
  fname: String,
  lname: String,
  ou: String,
  roleId: Number
});

var Users = mongoose.model('users', UserSchema);


module.exports.createUser = function(username, fname, lname, ou, roleId, callback) {

  Users.find({
    username: username,
  }, function(err, data) {
    if (err) {
      callback(err, null);
      return;
    }
    if (data.length) {
      console.log("username name already present");
      callback(null, data);
      console.log(data);
    } else {
      console.log("user does not exist creating a new one");
      var user = new Users({
        username: username,
        fname: fname,
        lname: lname,
        ou: ou,
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
    }
  });

};

module.exports.getUser = function(username,ou, callback) {
  Users.find({
    username: username,
    ou:ou
  }, function(err, data) {
    if (err) {
      callback(err, null);
      return;
    }
    callback(null, data)
  });
}
module.exports.getUsersWithRoleIdInOu = function(ou,roleId,callback) {
 Users.find({
    roleId:roleId,
    ou:ou
  }, function(err, data) {
    if (err) {
      callback(err, null);
      return;
    }
    callback(null, data)
  });
}
