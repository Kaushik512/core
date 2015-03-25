var logger = require('../lib/logger')(module);
var EC2 = require('../lib/ec2.js');

module.exports.setRoutes = function(app,sessionVerificationFunc){
	app.all("/providers/*",sessionVerificationFunc);
	app.get('providers/securitygroups/:accesskey/:secretkey/:region',function(req,res){
		logger.debug("Enter for Provider securitygroups.")

		var ec2 = new EC2({
			"access_key": req.params.accesskey,
			"secret_key": req.params.secretkey,
			"region"    : req.params.region
		});

		ec2.getSecurityGroups(function(err,data){
			if(err){
				logger.debug("Unable to get AWS Security Groups.");
				res.send("Unable to get AWS Security Groups.",500);
				return;
			}
			logger.debug("Able to get AWS Security Groups. %s",JSON.stringify(data));
			res.send(data);
		});

	});
}