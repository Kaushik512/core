/**
 * Created by anshul on 2/1/15.
 */
var EC2 = require('../lib/ec2.js');
var settingsController = require('../model/settings');
var appConfig = require('../config/app_config');

module.exports.setRoutes = function(app, verifySession) {

    app.get('/aws/ec2/securityGroups', verifySession, function(req, res) {
        settingsController.getAwsSettings(function(settings) {
            console.log(settings,req.body);
            var ec2 = new EC2({
                "access_key": settings.access_key,
                "secret_key": settings.secret_key,
                "region": req.query.region
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

    app.get('/aws/ec2/amiids',function(req,res){
        res.send(appConfig.aws.os);
    });

}