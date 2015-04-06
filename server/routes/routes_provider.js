var logger = require('../lib/logger')(module);
var EC2 = require('../lib/ec2.js');
var d4dModelNew = require('../model/d4dmasters/d4dmastersmodelnew.js');
var AWSProvider = require('../model/classes/masters/cloudprovider/awsCloudProvider.js');
var VMImage = require('../model/classes/masters/vmImage.js');
var AWSKeyPair = require('../model/classes/masters/cloudprovider/keyPair.js');
var uuid = require('node-uuid'); //Unique ID
var fs = require('fs');
var path = require('path');
module.exports.setRoutes = function(app,sessionVerificationFunc){
	app.all("/aws/providers/*",sessionVerificationFunc);

// Create AWS Provider.
	app.post('/aws/providers', function(req, res) {
        logger.debug("Enter post() for /providers.");
        var accessKey = req.body.accessKey.trim();
        var secretKey = req.body.secretKey.trim();
        var name = req.body.name.trim();
        var providerType = req.body.providerType.trim();
        var keyPairs = req.body.keyPairs;
        
        // Field validation for undefined and empty
        if(typeof keyPairs === 'undefined' || keyPairs.length === 0){
            res.send(500,"Please Enter keyPairs.");
            return;
        }
        if(typeof accessKey === 'undefined' || accessKey.length === 0){
            res.send(500,"Please Enter AccessKey.");
            return;
        }
        if(typeof secretKey === 'undefined' || secretKey.length === 0){
            res.send(500,"Please Enter SecretKey.");
            return;
        }
        if(typeof name === 'undefined' || name.length === 0){
            res.send(500,"Please Enter Name.");
            return;
        }
        if(typeof providerType === 'undefined' || providerType.length === 0){
            res.send(500,"Please Enter ProviderType.");
            return;
        }
        var providerData= {
        	id: 9,
        	accessKey: accessKey,
        	secretKey: secretKey,
        	name: name,
        	providerType: providerType
        };
                AWSProvider.createNew(providerData, function(err, provider) {
                    if (err) {
                        logger.debug("err.....",err);
                        res.send(500,"Provider creation failed due to either Provider name already exist or some other issue.");
                        return;
                    }
                    logger.debug("Provider id:  %s",JSON.stringify(provider._id));
                    AWSKeyPair.createNew(req,provider._id,function(err,keyPair){
                        if(keyPair){
                            var dommyProvider = {
                                _id: provider._id,
                                id: 9,
                                accessKey: provider.accessKey,
                                secretKey: provider.secretKey,
                                name: provider.name,
                                providerType: provider.providerType,
                                __v: provider.__v,
                                keyPairs: keyPair
                            };
                            res.send(dommyProvider);        
                        }
                    }); 
                    logger.debug("Exit post() for /providers");
                    //res.send(provider);
                });
    });

// Return list of all available AWS Providers.
    app.get('/aws/providers', function(req, res) {
    	logger.debug("Enter get() for /providers");
        
        AWSProvider.getAWSProviders(function(err, providers) {
            
            if (err) {
                logger.error(err);
                res.send(500, errorResponses.db.error);
                return;
            }
            if (providers) {
                var allProviders = [];
                var count =0;
                for(var i in providers){
                    logger.debug("For loop called....");
                    AWSKeyPair.getAWSKeyPairByProviderId(providers[i]._id,function(err,keyPair){

                        if(keyPair){
                            var dommyProvider = {
                                _id: providers[i]._id,
                                id: 9,
                                accessKey: providers[i].accessKey,
                                secretKey: providers[i].secretKey,
                                name: providers[i].name,
                                providerType: providers[i].providerType,
                                __v: providers[i].__v,
                                keyPairs: keyPair
                            };
                                    allProviders.push(dommyProvider);
                                    logger.debug("Provider:::::::::::: ",JSON.stringify(dommyProvider));
                                    count++;
                                    if(providers.length === count){
                                        logger.debug("Exit get() for /providers",JSON.stringify(allProviders.length));
                                        res.send(allProviders);
                                    }
                        }

                    });
                }
            	
            } else {
                res.send([]);
            }
        });
    });

// Return AWS Provider respect to id.
    app.get('/aws/providers/:providerId', function(req, res) {
    	logger.debug("Enter get() for /providers/%s",req.params.providerId);
        var providerId = req.params.providerId.trim();
        if(typeof providerId === 'undefined' || providerId.length === 0){
            res.send(500,"Please Enter ProviderId.");
            return;
        }
        AWSProvider.getAWSProviderById(providerId, function(err, aProvider) {
            if (err) {
                logger.error(err);
                res.send(500, errorResponses.db.error);
                return;
            }
            if (aProvider) {
            	AWSKeyPair.getAWSKeyPairByProviderId(aProvider._id,function(err,keyPair){
                        logger.debug("keyPairs length::::: ",keyPair.length);
                        if(keyPair){
                            var dommyProvider = {
                                _id: keyPair[0].providerId,
                                id: 9,
                                accessKey: aProvider.accessKey,
                                secretKey: aProvider.secretKey,
                                name: aProvider.name,
                                providerType: aProvider.providerType,
                                __v: aProvider.__v,
                                keyPairs: keyPair
                            };
                            res.send(dommyProvider);        
                        }

                    });
            } else {
                res.send(404);
            }
        });
    });

// Update a particular AWS Provider
    app.post('/aws/providers/:providerId/update', function(req, res) {
    	logger.debug("Enter post() for /providers/%s/update",req.params.providerId);

        var accessKey = req.body.accessKey.trim();
        var secretKey = req.body.secretKey.trim();
        var name = req.body.name.trim();
        var providerType = req.body.providerType.trim();
        var regions = req.body.regions;
        var providerId = req.params.providerId.trim();
        if(typeof providerId === 'undefined' || providerId.length === 0){
            res.send(500,"Please Enter ProviderId.");
            return;
        }
        if(typeof regions === 'undefined' || regions.length === 0){
            res.send(500,"Please Enter Resgions.");
            return;
        }
        if(typeof accessKey === 'undefined' || accessKey.length === 0){
            res.send(500,"Please Enter AccessKey.");
            return;
        }
        if(typeof secretKey === 'undefined' || secretKey.length === 0){
            res.send(500,"Please Enter SecretKey.");
            return;
        }
        if(typeof name === 'undefined' || name.length === 0){
            res.send(500,"Please Enter Name.");
            return;
        }
        if(typeof providerType === 'undefined' || providerType.length === 0){
            res.send(500,"Please Enter ProviderType.");
            return;
        }

        var providerData= {
            id: 9,
            accessKey: accessKey,
            secretKey: secretKey,
            name: name,
            providerType: providerType
        };
        logger.debug("provider>>>>>>>>>>>> %s",providerData.providerType);
        AWSProvider.updateAWSProviderById(req.params.providerId, providerData, function(err, updateCount) {
            if (err) {
                logger.error(err);
                res.send(500, errorResponses.db.error);
                return;
            }
            if (updateCount) {
            	logger.debug("Enter post() for /providers/%s/update",req.params.providerId);
                res.send({
                    updateCount: updateCount
                });
            } else {
                res.send(400);
            }
        });
    });

// Delete a particular AWS Provider.
    app.delete('/aws/providers/:providerId', function(req, res) {
    	logger.debug("Enter delete() for /providers/%s",req.params.providerId);
    	var providerId = req.params.providerId.trim();
        if(typeof providerId === 'undefined' || providerId.length === 0){
            res.send(500,"Please Enter ProviderId.");
            return;
        }
        
        VMImage.getImageByProviderId(providerId, function(err, anImage) {
            if (err) {
                logger.error(err);
                res.send(500, errorResponses.db.error);
                return;
            }
            if (anImage) {
                res.send(403,"Provider already used by Some Images.To delete provider please delete respective Images first.");
            	return;
            }

        	AWSProvider.removeAWSProviderById(providerId, function(err, deleteCount) {
	            if (err) {
	                logger.error(err);
	                res.send(500, errorResponses.db.error);
	                return;
	            }
	            if (deleteCount) {
	            	logger.debug("Enter delete() for /providers/%s",req.params.providerId);
	                res.send({
	                    deleteCount: deleteCount
	                });
	            } else {
	                res.send(400);
	            }
	        });
        });
    });

// Return all available security groups from AWS.
	app.post('/aws/providers/securitygroups',function(req,res){
		logger.debug("Enter for Provider securitygroups. %s",req.body.accessKey);

		var ec2 = new EC2({
			"access_key": req.body.accessKey,
			"secret_key": req.body.secretKey,
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

	/*app.get('/providers/test/:rowid',function(req,res){
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
	});*/

// Return all available keypairs from AWS.
	app.post('/aws/providers/keypairs/list',function(req,res){
		logger.debug("Enter for Provider keypairs.");

		var ec2 = new EC2({
			"access_key": req.body.accessKey,
			"secret_key": req.body.secretKey,
			"region"    : req.body.region
		});

		ec2.describeKeyPairs(function(err,data){
			if(err){
				logger.debug("Unable to get AWS Keypairs");
				res.send("Unable to get AWS Keypairs.",500);
				return;
			}
			logger.debug("Able to get AWS Keypairs. %s",JSON.stringify(data));
			res.send(data);
		});

	});

    app.post('/aws/providers/file/upload/test',function(req,res){
        logger.debug("Enter for Provider file upload.");
        logger.debug("uploaded file: ",req.files)
        var myFiles = req.files;
        for(var i in myFiles){
            logger.debug("Incomming files: ",JSON.stringify(myFiles[i]));
        }
        fs.readFile(req.files.fileLogo.path, function (err, data) {
        var pathNew = '/home/gobinda/' + uuid.v1() + path.extname(req.files.fileLogo.name)

        fs.writeFile(pathNew, data, function (err) {
            console.log('uploaded', pathNew);
        });
    });

    });
}