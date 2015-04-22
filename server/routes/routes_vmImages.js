var logger = require('../lib/logger')(module);
var EC2 = require('../lib/ec2.js');
var VMImage = require('../model/classes/masters/vmImage.js');
var AWSProvider = require('../model/classes/masters/cloudprovider/awsCloudProvider.js');
var appConfig = require('../config/app_config');
var blueprintsDao = require('../model/dao/blueprints');
var AWSKeyPair = require('../model/classes/masters/cloudprovider/keyPair.js');
module.exports.setRoutes = function(app, sessionVerificationFunc){
	app.all('/vmimages/*',sessionVerificationFunc);

    // Create Image for a AWS Provider.
    app.post('/vmimages', function(req, res) {
        logger.debug("Enter post() for /vmimages");

        var providerId = req.body.providerId.trim();
        var imageIdentifier = req.body.imageIdentifier.trim();
        var name = req.body.name.trim();
        var osType = req.body.osType.trim();
        var osName = req.body.osName.trim();
        var userName = req.body.userName.trim();
        var orgId = req.body.orgId;


            logger.debug("orgId: ",orgId);

            // Field validation for undefined and empty
            if(typeof providerId === 'undefined' || providerId.length === 0){
                res.send(400,"{Please Enter ProviderId.}");
                return;
            }
            if(typeof imageIdentifier === 'undefined' || imageIdentifier.length === 0){
                res.send(400,"{Please Enter ImageIdentifier.}");
                return;
            }
            if(typeof name === 'undefined' || name.length === 0){
                res.send(400,"{Please Enter Name.}");
                return;
            }
            if(typeof osType === 'undefined' || osType.length === 0){
                res.send(400,"{Please Enter OS Type.}");
                return;
            }
            if(typeof osName === 'undefined' || osName.length === 0){
                res.send(400,"{Please Enter OS Name.}");
                return;
            }
            if(typeof userName === 'undefined' || userName.length === 0){
                res.send(400,"{Please Enter OS UserName.}");
                return;
            }

            var vmimageData={
            	id: 22,
            	providerId: providerId,
            	imageIdentifier: imageIdentifier,
            	name: name,
              osType: osType,
              osName: osName,
              userName: userName,
              orgId: orgId
            };
            
            AWSProvider.getAWSProviderById(providerId, function(err, aProvider) {
               if (err) {
                   logger.error(err);
                   res.send(500, "Image creation failed due to Image name already exist.");
                   return;
               }
               logger.debug("Returned Provider: ",aProvider);
               AWSKeyPair.getAWSKeyPairByProviderId(providerId,function(err,keyPair){
                logger.debug("keyPairs length::::: ",keyPair[0].region);
                if(err){
                    res.send(500,"Error getting to fetch Keypair.")      
                }
                logger.debug("vmimageData <<<<<<<<<<<<<<<<<<<<< %s",vmimageData);
                var ec2 = new EC2({
                    "access_key": aProvider.accessKey,
                    "secret_key": aProvider.secretKey,
                    "region"    : keyPair[0].region
                });
                logger.debug("ec2>>>>>>>>>>>>>>>>> ",JSON.stringify(ec2));
                ec2.checkImageAvailability(vmimageData.imageIdentifier,function(err,data){
                    if(err){
                        logger.debug("Unable to describeImages from AWS.",err);
                        res.send(500,"Invalid Image Id.");
                        return;
                    }
                    logger.debug("Success to Describe Images from AWS. %s",data.Images[0].VirtualizationType);
                    vmimageData.vType = data.Images[0].VirtualizationType;
                    VMImage.createNew(vmimageData, function(err, anImage) {
                       if (err) {
                           logger.debug("err.....",err);
                           res.send(500,"Image creation fail.");
                           return;
                       }
                       res.send(anImage);
                       logger.debug("Exit post() for /vmimages");
                   });
                });
            });
        });
    });

    // Return list of all Images.
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

    // Return a particular Image for id.
    app.get('/vmimages/:imageId', function(req, res) {
       logger.debug("Enter get() for /vmimages/%s",req.params.imageId);
       var imageId = req.params.imageId.trim();
       if(typeof imageId === 'undefined' || imageId.length === 0){
        res.send(500,"Please Enter ImageId.");
        return;
    }
    VMImage.getImageById(imageId, function(err, anImage) {
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

    // Update a paricular Image values.
    app.post('/vmimages/:imageId/update', function(req, res) {
       logger.debug("Enter Post() for /vmimages/%s/update",req.params.imageId);
       var imageId = req.params.imageId.trim();
       var providerId = req.body.providerId.trim();
       var imageIdentifier = req.body.imageIdentifier.trim();
       var name = req.body.name.trim();
       var osType = req.body.osType.trim();
       var osName = req.body.osName.trim();
       var userName = req.body.userName.trim();
       var orgId = req.body.orgId;

       if(typeof providerId === 'undefined' || providerId.length === 0){
        res.send(400,"{Please Enter ProviderId.}");
        return;
    }
    if(typeof imageIdentifier === 'undefined' || imageIdentifier.length === 0){
        res.send(400,"{Please Enter ImageIdentifier.}");
        return;
    }
    if(typeof name === 'undefined' || name.length === 0){
        res.send(400,"{Please Enter Name.}");
        return;
    }
    
    if(typeof imageId === 'undefined' || imageId.length === 0){
        res.send(400,"{Please Enter ImageId.}");
        return;
    }
    if(typeof osType === 'undefined' || osType.length === 0){
        res.send(400,"{Please Enter OS Type.}");
        return;
    }
    if(typeof osName === 'undefined' || osName.length === 0){
        res.send(400,"{Please Enter OS Name.}");
        return;
    }
    if(typeof userName === 'undefined' || userName.length === 0){
                res.send(400,"{Please Enter OS UserName.}");
                return;
            }
    var vmimageData={
       id: 22,
       providerId: providerId,
       imageIdentifier: imageIdentifier,
       name: name,
       osType: osType,
       osName: osName,
       userName: userName,
       orgId: orgId
    };
    logger.debug("image >>>>>>>>>>>>",vmimageData);

            AWSProvider.getAWSProviderById(providerId, function(err, aProvider) {
               if (err) {
                   logger.error(err);
                   res.send(500, "Image creation failed due to Image name already exist.");
                   return;
               }
               logger.debug("Returned Provider: ",aProvider);
               AWSKeyPair.getAWSKeyPairByProviderId(providerId,function(err,keyPair){
                logger.debug("keyPairs length::::: ",keyPair[0].region);
                if(err){
                    res.send(500,"Error getting to fetch Keypair.")      
                }
                logger.debug("vmimageData <<<<<<<<<<<<<<<<<<<<< %s",vmimageData);
                var ec2 = new EC2({
                    "access_key": aProvider.accessKey,
                    "secret_key": aProvider.secretKey,
                    "region"    : keyPair[0].region
                });
                logger.debug("ec2>>>>>>>>>>>>>>>>> ",JSON.stringify(ec2));
                ec2.checkImageAvailability(vmimageData.imageIdentifier,function(err,data){
                    if(err){
                        logger.debug("Unable to describeImages from AWS.",err);
                        res.send(500,"Invalid Image Id.");
                        return;
                    }
        VMImage.getImageById(imageId, function(err, anImage) {
                if (err) {
                    logger.error(err);
                    res.send(500, errorResponses.db.error);
                    return;
                }
                if (anImage) {
                   vmimageData.vType = anImage.vType;
               } 
               logger.debug("ImageData:>>>>>>>>>>> ",JSON.stringify(vmimageData));
            VMImage.updateImageById(imageId, vmimageData, function(err, updateCount) {
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
            });
        });
      });
    });

    // Delete a particular Image from DB.
    app.delete('/vmimages/:imageId', function(req, res) {
       logger.debug("Enter delete() for /vmimages/%s",req.params.imageId);
       var imageId = req.params.imageId.trim();
       if(typeof imageId === 'undefined' || imageId.length === 0){
        res.send(500,"Please Enter ImageId.");
        return;
    }
        blueprintsDao.getBlueprintByImageId(imageId, function(err, data) {
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

    // Return images for a provider.
    app.get('/vmimages/providers/:providerId', function(req, res) {
        logger.debug("Enter get() for /vmimages/providers/%s",req.params.providerId);
        var providerId = req.params.providerId.trim();
        if(typeof providerId === 'undefined' || providerId.length === 0){
            res.send(500,"Please Enter providerId.");
            return;
        }
        VMImage.getImageByProviderId(providerId, function(err, images) {
            if (err) {
                logger.error(err);
                res.send(500, errorResponses.db.error);
                return;
            }
            if (images) {
                logger.debug("Exit get() for /vmimages/%s",req.params.providerId);
                res.send(images);
            } else {
                res.send(404);
            }
        });
    });

    // Return AMI from AWS w.r.t. amiid
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

    // Return available instance sizes.
    app.get('/vmimages/instancesizes/all/list', function(req, res) {
       logger.debug("Enter get() for /vmimages/instancesizes");
       res.send(appConfig.aws.virtualizationType);
    });

    // Return available regions.
    app.get('/vmimages/regions/list', function(req, res) {
        logger.debug("Enter /vmimages/regions/list");
        res.send(appConfig.aws.regions);
    });

    // Return available os types.
    app.get('/vmimages/os/type/all/list', function(req, res) {
        logger.debug("Enter /vmimages/regions/list");
        res.send(appConfig.aws.operatingSystems);
    });
}