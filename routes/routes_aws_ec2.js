var EC2 = require('../controller/ec2.js');
var settingsController = require('../controller/settings');

module.exports.setRoutes = function(app, verifySession) {

	app.post('/aws/ec2/securityGroups', verifySession, function(req, res) {
		settingsController.getAwsSettings(function(settings) {
			console.log(settings,req.body);
			var ec2 = new EC2({
				"access_key": settings.access_key,
				"secret_key": settings.secret_key,
				"region": req.body.region
			});

            ec2.getSecurityGroups(function(err,data){
            	if(err){
            		res.send(500);
            		return;
            	}
            	res.send(data);
            });

		});
	});

}