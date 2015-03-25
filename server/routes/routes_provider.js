var logger = require('../lib/logger')(module);
var EC2 = require('../lib/ec2.js');

module.exports.setRoutes = function(app,sessionVerificationFunc){
	app.all("/providers/*",sessionVerificationFunc);
	app.post('/providers/securitygroups',function(req,res){
		logger.debug("Enter for Provider securitygroups. %s",req.body.accesskey)

		var ec2 = new EC2({
			"access_key": req.body.accesskey,
			"secret_key": req.body.secretkey,
			"region"    : req.body.region
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