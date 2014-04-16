
var auth = require('./route_authentication');
var provider = require('./route_providers.js');
var chef = require('./routes_chef.js');

module.exports.setRoutes = function (app) {
   
  var sessionVerificationFunc = auth.setRoutes(app);
  provider.setRoutes(app,sessionVerificationFunc);
  chef.setRoutes(app,sessionVerificationFunc);

}