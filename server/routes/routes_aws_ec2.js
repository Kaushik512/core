/**
 * Created by anshul on 2/1/15.
 */
var EC2 = require('../lib/ec2.js');
var appConfig = require('../config/app_config');
var logger = require('../lib/logger')(module);

module.exports.setRoutes = function(app, verifySession) {

    app.get('/aws/ec2/securityGroups', verifySession, function(req, res) {
        logger.debug("Enter /aws/ec2/securityGroups");

        var settings = appConfig.aws;
        var ec2 = new EC2({
            "access_key": settings.access_key,
            "secret_key": settings.secret_key,
            "region": req.query.region
        });

        ec2.getSecurityGroups(function(err, data) {
            if (err) {
                logger.debug("Unable to get AWS Security Groups", err);
                res.send(500);
                return;
            }
            logger.debug("Returning AW Security Groups");
            res.send(data);
        });

    });

    app.get('/aws/ec2/amiids', function(req, res) {
        logger.debug("Enter /aws/ec2/amiids");
        res.send(appConfig.aws.os);
    });

    app.post('/aws/ec2/test',function(req,res){
        logger.debug("Enter post() for /aws/ec2/test");
        logger.debug("Recieved : %s %s ",req.body.accesskey,req.body.secretkey);
        var ec2 = new EC2({
            "access_key": req.body.accesskey,
            "secret_key": req.body.secretkey,
            "region": req.body.region
        });
        ec2.getSecurityGroups(function(err,data){
            logger.debug("Called AW Security Groups");
            if(err){
                logger.debug("Unable to get AWS Security Groups", err);
                res.send("Unable to connect Provider.",500);
                return;
            }
            logger.debug("Successfully Connected with Provider.");
            res.send(data);
        });
         logger.debug("Exit post() for /aws/ec2/test");

    });

}