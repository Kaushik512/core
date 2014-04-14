
var auth = require('./routes/route_authentication');
var provider = require('./routes/route_providers.js');

module.exports.setRoutes = function (app) {
   
  var verificationFunc = auth.setRoutes(app);
  provider.setRoutes(app,verificationFunc);


}