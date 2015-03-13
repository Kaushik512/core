var mongoose = require('mongoose');
var d4dModelNew = require('../model/d4dmasters/d4dmastersmodelnew.js');
var d4dModelNew = require('../model/d4dmasters/d4dmastersmodelnew.js');
var permissionsetDao = require('../model/dao/permissionsetsdao');
var Schema = mongoose.Schema;
var logger = require('../lib/logger')(module);

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

module.exports.getUser = function(username, req, callback) {
    logger.debug('Entering getUser');
    d4dModelNew.d4dModelMastersUsers.find({
        loginname: username,
        id: 7
    }, function(err, d4dMasterJson) {
        logger.debug('Completed query on masters users.');
        if (err) {
            console.log("Hit and error:" + err);
        }
        if (d4dMasterJson) {
            //Fetching the permission set for the role defined for the user
            d4dMasterJson = JSON.parse(JSON.stringify(d4dMasterJson));
            logger.debug('Entering  permissionsetDao.getPermissionSet. d4dMasterJson : ' + JSON.stringify(d4dMasterJson));

            permissionsetDao.getPermissionSet(d4dMasterJson[0].userrolename, function(err, data) {
                if (!err) {
                    logger.debug('Setting req object with permission set');
                    req.session.user.permissionset = data;
                    logger.debug("sent response" + JSON.stringify(d4dMasterJson) + " Permissionset : " + JSON.stringify(req.session.user.permissionset));
                    logger.debug('Exiting  permissionsetDao.getPermissionSet.');
                    callback(null, d4dMasterJson);
                }
                else{
                   logger.debug('Exiting  permissionsetDao.getPermissionSet on err ' + err);
                   callback(err,null);
                }
            });


            //res.end();
        } else {
            console.log("none found");
            callback(err, null);
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