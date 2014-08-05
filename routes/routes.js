var auth = require('./routes_authentication');
var provider = require('./routes_devopsRoles.js');
var chef = require('./routes_chef.js');
var domains = require('./routes_domains.js');
var hiddenSettings = require('./routes_hiddenSetting.js');
var settings = require('./routes_settings');
var users = require('./routes_users');
var awsCloudFormation = require('./routes_awsCloudFormation');
var appFactory = require('./routes_appFactory');
var monitoring = require('./routes_monitoring');
var environments = require('./routes_environments');
var userGroups = require('./routes_usergroups');
var userRoles = require('./routes_userroles');
var docker = require('./routes_docker');
var ec2_routes = require('./routes_aws_ec2');

var d4dMasters = require('./routes_d4dMasters');
var blueprints = require('./routes_blueprints');



module.exports.setRoutes = function(app) {


  app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
  });


  var verificationFunctions = auth.setRoutes(app);
  var sessionVerificationFunc = verificationFunctions.sessionVerificationFunc;
  var adminSessionVerificationFunc = verificationFunctions.adminSessionVerificationFunc;

  d4dMasters.setRoutes(app, adminSessionVerificationFunc);
  blueprints.setRoutes(app, sessionVerificationFunc);


  /* 
  provider.setRoutes(app, sessionVerificationFunc);
  chef.setRoutes(app, sessionVerificationFunc);
  domains.setRoutes(app, sessionVerificationFunc);
  hiddenSettings.setRoutes(app, sessionVerificationFunc);
  settings.setRoutes(app, sessionVerificationFunc);
  users.setRoutes(app, adminSessionVerificationFunc);
  awsCloudFormation.setRoutes(app, sessionVerificationFunc);
  appFactory.setRoutes(app, sessionVerificationFunc);
  monitoring.setRoutes(app, sessionVerificationFunc);
  environments.setRoutes(app, sessionVerificationFunc);
  userGroups.setRoutes(app, adminSessionVerificationFunc);
  userRoles.setRoutes(app, adminSessionVerificationFunc);
  docker.setRoutes(app,sessionVerificationFunc);
  ec2_routes.setRoutes(app,sessionVerificationFunc);
  */

}