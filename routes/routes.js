var auth = require('./routes_authentication');
var provider = require('./routes_providers.js');
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



module.exports.setRoutes = function(app) {

  var verificationFunctions = auth.setRoutes(app);
  var sessionVerificationFunc = verificationFunctions.sessionVerificationFunc;
  var adminSessionVerificationFunc = verificationFunctions.adminSessionVerificationFunc;
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

}