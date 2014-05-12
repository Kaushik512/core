
var auth = require('./route_authentication');
var provider = require('./route_providers.js');
var chef = require('./routes_chef.js');
var domains = require('./routes_domains.js');
var hiddenSettings = require('./routes_hiddenSetting.js');
var settings = require('./routes_settings');
var users = require('./route_users');

module.exports.setRoutes = function (app) {
   
  var sessionVerificationFunc = auth.setRoutes(app);
  provider.setRoutes(app,sessionVerificationFunc);
  chef.setRoutes(app,sessionVerificationFunc);
  domains.setRoutes(app,sessionVerificationFunc);
  hiddenSettings.setRoutes(app,sessionVerificationFunc);
  settings.setRoutes(app,sessionVerificationFunc);
  users.setRoutes(app,sessionVerificationFunc);
}