var CloudFormation = require('../controller/cloudFormation.js');
var settingsController = require('../controller/settings');

module.exports.setRoutes = function(app, verifySession) {

	app.post('/aws/cloudfront/createStack', verifySession, function(req, res) {
		console.log(req.body);
		settingsController.getAwsSettings(function(awsSettings) {
			var cloudFormation = new CloudFormation(awsSettings);
			cloudFormation.createStack({
				StackName: req.body.stackName,
				TemplateURL: req.body.templateUrl,
				Parameters:JSON.parse(req.body.parameters),
			}, function(err, stackId) {
				if (err) {
					res.send(500);
				} else {
					res.send(stackId);
				}

			});

		});

	});


};