
var auth = require('./route_authentication');
var provider = require('./route_providers.js');
var chef = require('./routes_cookbook.js');

module.exports.setRoutes = function (app) {
   
  var verificationFunc = auth.setRoutes(app);
  provider.setRoutes(app,verificationFunc);
  chef.setRoutes(app,verificationFunc);

}