var CloudFormation = require('../controller/cloudFormation.js');
var settingsController = require('../controller/settings');
var domainsDao = require('../controller/domains.js');
var https = require('https');

module.exports.setRoutes = function(app, verifySession) {

	app.get('/aws/cloudformation/getTemplates', verifySession, function(req, res) {
		res.render('cloudFormation-templates.ejs');
	});

	app.post('/aws/cloudformation/configureTemplates', verifySession, function(req, res) {
		if (req.body.templateUrl && req.body.title) {
			console.log(req.body.templateUrl);
			var templateBody = "";
			https.get(req.body.templateUrl, function(httpRes) {
				console.log("Got response: " + httpRes.statusCode);
				httpRes.on('data', function(chunk) {
					templateBody += chunk.toString('utf-8');
				});
				httpRes.on('end', function() {
					var templateObj = JSON.parse(templateBody);
					res.render('cloudFormation-configure.ejs', {
						templateObj: templateObj,
						templateUrl: req.body.templateUrl,
						templateTitle: req.body.title
					});
				});
			}).on('error', function(e) {
				console.log("Got error: " + e.message);
				res.send(500);
			});
		} else {
			res.send(400);
		}
	});

	app.post('/aws/cloudformation/createStack', verifySession, function(req, res) {
		console.log(req.body);
		var domainName = req.body.domainName;
		var pid = req.body.pid;
		domainsDao.createDomainDocument(domainName, pid, function(err, data) {
			if (err) {
				res.send(500);
				return;
			}
			settingsController.getAwsSettings(function(awsSettings) {
				var cloudFormation = new CloudFormation(awsSettings);
				cloudFormation.createStack({
					StackName: req.body.stackName,
					TemplateURL: req.body.templateUrl,
					Parameters: req.body.parameters,
				}, function(err, stackId) {
					if (err) {
						res.send(500);
					} else {
						domainsDao.saveStackDetails(domainName,[{
							stackId:stackId,
							stackName:req.body.stackName
						}],function(err,data){
							if(err) {
								console.log(err);
								res.send(500);
							} else {
								res.send(stackId);
							}
						});
					}
				});
			});
		});
	});
};