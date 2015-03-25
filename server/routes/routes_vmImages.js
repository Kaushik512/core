var logger = require('../lib/logger')(module);
var EC2 = require('../lib/ec2.js');

module.exports.setRoutes = function(app, sessionVerificationFunc){
	app.all('/vmimages/*',sessionVerificationFunc);

	app.post('/vmimages',function(req,res){
		logger.debug("Enter post() for /vmimages: %s",req.body.imageid);
		
		var ec2 = new EC2({
			"access_key": req.body.accesskey,
			"secret_key": req.body.secretkey,
			"region"    : req.body.region
		});
		ec2.checkImageAvailability(req.body.imageid,function(err,data){
			if(err){
				logger.debug("Unable to describeImages from AWS.",err);
				res.send("Unable to Describe Images from AWS.",500);
				return;
			}
			logger.debug("Success to Describe Images from AWS.",data);
			res.send(data);
		});
	});
}