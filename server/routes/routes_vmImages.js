var logger = require('../lib/logger')(module);
var EC2 = require('../lib/ec2.js');
var VMImage = require('../model/classes/masters/vmImage.js');

module.exports.setRoutes = function(app, sessionVerificationFunc){
	app.all('/vmimages/*',sessionVerificationFunc);

	app.post('/vmimages', function(req, res) {
        logger.debug("Enter post() for /vmimages");
        var vmimageData={
        	id: 22,
        	providerId: req.body.providerId,
        	imageId: req.body.imageId,
        	name: req.body.name
    };
    logger.debug("<<<<<<<<<<<<<<<<<<<<< %s",vmimageData);
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

    app.get('/vmimages', function(req, res) {
        VMImage.getImages(function(err, images) {
            if (err) {
                logger.error(err);
                res.send(500, errorResponses.db.error);
                return;
            }
            if (images.length) {
                res.send(images);
            } else {
                res.send(404);
            }
        });
    });

    app.get('/vmimages/:imageId', function(req, res) {
        VMImage.getImageById(req.params.imageId, function(err, anImage) {
            if (err) {
                logger.error(err);
                res.send(500, errorResponses.db.error);
                return;
            }
            if (anImage) {
                res.send(anImage);
            } else {
                res.send(404);
            }
        });
    });

    app.post('/vmimages/:imageId/update', function(req, res) {
        var vmimageData={
        	id: 22,
        	providerId: req.body.providerId,
        	imageId: req.body.imageId,
        	name: req.body.name
    	};
        logger.debug("image >>>>>>>>>>>>");
        VMImage.updateImageById(req.params.imageId, vmimageData, function(err, updateCount) {
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

    app.delete('/vmimages/:imageId', function(req, res) {
        VMImage.removeImageById(req.params.imageId, function(err, deleteCount) {
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

	app.post('/vmimages/availability',function(req,res){
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