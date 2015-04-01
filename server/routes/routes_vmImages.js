var logger = require('../lib/logger')(module);
var EC2 = require('../lib/ec2.js');
var VMImage = require('../model/classes/masters/vmImage.js');
var Provider = require('../model/classes/masters/cloudprovider/cloudprovider.js');
var appConfig = require('../config/app_config');
var blueprintsDao = require('../model/dao/blueprints');

module.exports.setRoutes = function(app, sessionVerificationFunc){
	app.all('/vmimages/*',sessionVerificationFunc);

	app.post('/vmimages', function(req, res) {
        logger.debug("Enter post() for /vmimages");
        var vmimageData={
        	id: 22,
        	providerId: req.body.providerId,
        	imageIdentifier: req.body.imageIdentifier,
        	name: req.body.name,
        	vType: req.body.vType
    };
	    Provider.getProviderById(req.body.providerId, function(err, aProvider) {
	            if (err) {
	                logger.error(err);
	                res.send(500, errorResponses.db.error);
	                return;
	            }
	            logger.debug("Returned Provider: ",aProvider);
	            if (aProvider){

	            } else{
	                res.send(404,"Invalid provide id,Please give correct one.");
	                return;
	            } 
    		logger.debug("vmimageData <<<<<<<<<<<<<<<<<<<<< %s",vmimageData);
        	VMImage.createNew(vmimageData, function(err, provider) {
            	if (err) {
                	logger.debug("err.....",err);
                	res.send(500);
                	return;
            	}
            	res.send(provider);
            	logger.debug("Exit post() for /vmimages");
        	});
    	});
    });

    app.get('/vmimages', function(req, res) {
    	logger.debug("Enter get() for /vmimages");
        VMImage.getImages(function(err, images) {
            if (err) {
                logger.error(err);
                res.send(500, errorResponses.db.error);
                return;
            }
            if (images) {
            	logger.debug("Enter get() for /vmimages");
                res.send(images);
            } else {
                res.send([]);
            }
        });
    });

    app.get('/vmimages/:imageId', function(req, res) {
    	logger.debug("Enter get() for /vmimages/%s",req.params.imageId);
        VMImage.getImageById(req.params.imageId, function(err, anImage) {
            if (err) {
                logger.error(err);
                res.send(500, errorResponses.db.error);
                return;
            }
            if (anImage) {
            	logger.debug("Exit get() for /vmimages/%s",req.params.imageId);
                res.send(anImage);
            } else {
                res.send(404);
            }
        });
    });

    app.post('/vmimages/:imageId/update', function(req, res) {
    	logger.debug("Enter Post() for /vmimages/%s/update",req.params.imageId);
        var vmimageData={
        	id: 22,
        	providerId: req.body.providerId,
        	imageIdentifier: req.body.imageIdentifier,
        	name: req.body.name,
        	vType: req.body.vType
    	};
        logger.debug("image >>>>>>>>>>>>");
        VMImage.updateImageById(req.params.imageId, vmimageData, function(err, updateCount) {
            if (err) {
                logger.error(err);
                res.send(500, errorResponses.db.error);
                return;
            }
            if (updateCount) {
            	logger.debug("Exit get() for /vmimages/%s/update",req.params.imageId);
                res.send({
                    updateCount: updateCount
                });
            } else {
                res.send(400);
            }
        });
    });

    app.delete('/vmimages/:imageId', function(req, res) {
    	logger.debug("Enter delete() for /vmimages/%s",req.params.imageId);
        blueprintsDao.getBlueprintByImageId(req.params.imageId, function(err, data) {
                if (err) {
                    logger.error('Failed to getBlueprint. Error = ', err);
                    res.send(500);
                    return;
                }
                if (data) {
                    logger.debug("Returned Blueprint:>>>>> %s",data.imageId);
                    res.send(403,"Image already used by some Blueprints.To delete Image please delete respective Blueprints first.");
                    return;
                }
            VMImage.removeImageById(req.params.imageId, function(err, deleteCount) {
                if (err) {
                    logger.error(err);
                    res.send(500, errorResponses.db.error);
                    return;
                }
                if (deleteCount) {
                	logger.debug("Exit delete() for /vmimages/%s",req.params.imageId);
                    res.send({
                        deleteCount: deleteCount
                    });
                } else {
                    res.send(400);
                }
            });
        });
    });

	app.post('/vmimages/availability',function(req,res){
		logger.debug("Enter post() for /vmimages: %s",req.body.imageId);
		
		var ec2 = new EC2({
			"access_key": req.body.accessKey,
			"secret_key": req.body.secretKey,
			"region"    : req.body.region
		});
		ec2.checkImageAvailability(req.body.imageId,function(err,data){
			if(err){
				logger.debug("Unable to describeImages from AWS.",err);
				res.send("Unable to Describe Images from AWS.",500);
				return;
			}
			logger.debug("Success to Describe Images from AWS.",data);
			res.send(data);
		});
	});

	app.get('/vmimages/instancesizes/all/list', function(req, res) {
    	logger.debug("Enter get() for /vmimages/instancesizes");
        res.send(appConfig.aws.virtualizationType);
    });

    app.get('/vmimages/regions/list', function(req, res) {
        logger.debug("Enter /vmimages/regions/list");
        res.send(appConfig.aws.regions);
    });

    app.get('/vmimages/os/type/all/list', function(req, res) {
        logger.debug("Enter /vmimages/regions/list");
        res.send(appConfig.aws.operatingSystems);
    });
}