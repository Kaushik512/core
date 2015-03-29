var logger = require('../lib/logger')(module);
var EC2 = require('../lib/ec2.js');
var d4dModelNew = require('../model/d4dmasters/d4dmastersmodelnew.js');
var Provider = require('../model/classes/masters/cloudprovider/cloudprovider.js');

module.exports.setRoutes = function(app,sessionVerificationFunc){
	app.all("/providers/*",sessionVerificationFunc);


	app.post('/providers', function(req, res) {
        logger.debug("Enter post() for /providers");
        var providerData={
        accessKey: req.body.accessKey,
        secretKey: req.body.secretKey,
        name: req.body.name,
        providerType: req.body.providerType,
        regions: req.body.regions
    };
    logger.debug("<<<<<<<<<<<<<<<<<<<<< %s",providerData);
        Provider.createNew(providerData, function(err, provider) {
            if (err) {
                logger.debug("err.....",err);
                res.send(500);
                return;
            }
            res.send(provider);
            logger.debug("Exit post() for /providers");
        });
    });

    app.get('/providers/:providerId', function(req, res) {
        Provider.getProviderById(req.params.providerId, function(err, aProvider) {
            if (err) {
                logger.error(err);
                res.send(500, errorResponses.db.error);
                return;
            }
            if (aProvider) {
                res.send(aProvider);
            } else {
                res.send(404);
            }
        });
    });

    app.post('/providers/:providerId/update', function(req, res) {
        var providerData={
        accessKey: req.body.accessKey,
        secretKey: req.body.secretKey,
        name: req.body.name,
        providerType: req.body.providerType,
        regions: req.body.regions
    	};
        logger.debug("provider>>>>>>>>>>>> %s",providerData.providerType);
        Provider.updateProviderById(req.params.providerId, providerData, function(err, updateCount) {
            if (err) {
                logger.error(err);
                res.send(500, errorResponses.db.error);
                return;
            }
            if (updateCount) {
                res.send({
                    updateCount: updateCount
                });
            } else {
                res.send(400);
            }
        });
    });

    app.delete('/providers/:providerId', function(req, res) {
        Provider.removeProviderById(req.params.providerId, function(err, deleteCount) {
            if (err) {
                logger.error(err);
                res.send(500, errorResponses.db.error);
                return;
            }
            if (deleteCount) {
                res.send({
                    deleteCount: deleteCount
                });
            } else {
                res.send(400);
            }
        });
    });

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

	app.get('/providers/test/:rowid',function(req,res){
		logger.debug("Enter for Provider test. %s",req.params.rowid);
		d4dModelNew.d4dModelMastersProviders.find({
            rowid: req.params.rowid
        }, function(err, d4dMasterJson) {
            if (err) {
                logger.debug("Hit and error:", err);
            }
            if (d4dMasterJson) {
                res.writeHead(200, {
                    'Content-Type': 'application/json'
                });
                res.end(JSON.stringify(d4dMasterJson));
                logger.debug("sent response %s", JSON.stringify(d4dMasterJson));
            } else {
                res.send(400, {
                    "error": err
                });
                logger.debug("none found");
            }


        });
	});
}