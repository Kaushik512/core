/* Copyright (C) Relevance Lab Private Limited- All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Gobinda Das <gobinda.das@relevancelab.com>, 
 * May 2015
 */

// This file act as a Controller which contains VMImage related all end points.

var logger = require('_pr/logger')(module);
var EC2 = require('../lib/ec2.js');
var VMImage = require('../model/classes/masters/vmImage.js');
var AWSProvider = require('../model/classes/masters/cloudprovider/awsCloudProvider.js');
var openstackProvider = require('../model/classes/masters/cloudprovider/openstackCloudProvider.js');
var appConfig = require('_pr/config');
var blueprintsDao = require('../model/dao/blueprints');
var AWSKeyPair = require('../model/classes/masters/cloudprovider/keyPair.js');
var masterUtil = require('../lib/utils/masterUtil.js');
var usersDao = require('../model/users.js');
var configmgmtDao = require('../model/d4dmasters/configmgmt.js');
var Cryptography = require('../lib/utils/cryptography');
var appConfig = require('_pr/config');
module.exports.setRoutes = function(app, sessionVerificationFunc) {
    app.all('/vmimages/*', sessionVerificationFunc);
    var cryptoConfig = appConfig.cryptoSettings;
    var cryptography = new Cryptography(cryptoConfig.algorithm, cryptoConfig.password);

    // Create Image for a AWS Provider.
    app.post('/vmimages', function(req, res) {
        logger.debug("Enter post() for /vmimages");
        var user = req.session.user;
        var category = configmgmtDao.getCategoryFromID("22");
        var permissionto = 'create';
        var providerId = req.body.providerId.trim();
        var imageIdentifier = req.body.imageIdentifier.trim();
        var name = req.body.name.trim();
        var osType = req.body.osType.trim();
        var osName = req.body.osName.trim();
        var userName = req.body.userName.trim();

        var password = '';
        if(req.body.password){
          password = req.body.password.trim();    
        }
        
        var orgId = req.body.orgId;
        var providerType = req.body.providertype.toLowerCase().trim();


        logger.debug("orgId: ", orgId);

        // Field validation for undefined and empty
        if (typeof providerId === 'undefined' || providerId.length === 0) {
            res.status(400).send( "{Please Enter ProviderId.}");
            return;
        }
        if (typeof imageIdentifier === 'undefined' || imageIdentifier.length === 0) {
            res.status(400).send( "{Please Enter ImageIdentifier.}");
            return;
        }
        if (typeof name === 'undefined' || name.length === 0) {
            res.status(400).send( "{Please Enter Name.}");
            return;
        }
        if (typeof osType === 'undefined' || osType.length === 0) {
            res.status(400).send( "{Please Enter OS Type.}");
            return;
        }
        if (typeof osName === 'undefined' || osName.length === 0) {
            res.status(400).send( "{Please Enter OS Name.}");
            return;
        }
        if (typeof userName === 'undefined' || userName.length === 0) {
            res.status(400).send( "{Please Enter OS UserName.}");
            return;
        }
        if (typeof providerType === 'undefined' || providerType.length === 0) {
            res.status(400).send( "{Please Enter OS Provider Type.}");
            return;
        }

        var vmimageData = {
            id: 22,
            providerId: providerId,
            imageIdentifier: imageIdentifier,
            name: name,
            osType: osType,
            osName: osName,
            userName: userName,
            password: password,
            orgId: orgId,
            providerType: providerType,
            instancePassword: password
        };

        usersDao.haspermission(user.cn, category, permissionto, null, req.session.user.permissionset, function(err, data) {
            if (!err) {
                logger.debug('Returned from haspermission : ' + data + ' : ' + (data == false));
                if (data == false) {
                    logger.debug('No permission to ' + permissionto + ' on ' + category);
                    res.send(401, "You don't have permission to perform this operation.");
                    return;
                }
            } else {
                logger.error("Hit and error in haspermission:", err);
                res.send(500);
                return;
            }

            masterUtil.getLoggedInUser(user.cn, function(err, anUser) {
                if (err) {
                    res.status(500).send( "Failed to fetch User.");
                }
                logger.debug("LoggedIn User:>>>> ", JSON.stringify(anUser));
                if (anUser) {
                    //data == true (create permission)
                    /*if(data && anUser.orgname_rowid[0] !== ""){
                    logger.debug("Inside check not authorized.");
                    res.send(401,"You don't have permission to perform this operation.");
                    return;
                }*/

                    if(providerType == "openstack" || providerType == "hppubliccloud" || providerType == "azure" || providerType == "vmware"){
                    
                        logger.debug('Provider Type',providerType);
                        openstackProvider.getopenstackProviderById(providerId, function(err, aProvider) {
                            if (err) {
                                logger.error(err);
                                res.status(500).send( "Image creation failed due to Image name already exist.");
                                return;
                            }
                            logger.debug("Returned Provider: ", aProvider);
                            logger.debug("vmimageData <<<<<<<<<<<<<<<<<<<<< %s", vmimageData);
                            vmimageData.vType = 'openstack';
                            if(providerType == "azure"){
                              vmimageData.vType = 'azure';
                            }
                            VMImage.createNew(vmimageData, function(err, anImage) {
                                if (err) {
                                    logger.debug("err.....", err);
                                    res.status(500).send( "Selected is already registered.");
                                    return;
                                }
                                logger.debug("Exit post() for /vmimages");
                                res.send(anImage);
                                return;
                            });
                        }); //end awsprovider
                    }
                    else{
                        AWSProvider.getAWSProviderById(providerId, function(err, aProvider) {
                            if (err) {
                                logger.error(err);
                                res.status(500).send( "Image creation failed due to Image name already exist.");
                                return;
                            }
                            logger.debug("Returned Provider: ", aProvider);
                            AWSKeyPair.getAWSKeyPairByProviderId(providerId, function(err, keyPair) {
                                logger.debug("keyPairs length::::: ", keyPair[0].region);
                                if (err) {
                                    res.status(500).send( "Error getting to fetch Keypair.")
                                }
                                logger.debug("vmimageData <<<<<<<<<<<<<<<<<<<<< %s", vmimageData);
                                var keys = [];
                                keys.push(aProvider.accessKey);
                                keys.push(aProvider.secretKey);
                                cryptography.decryptMultipleText(keys, cryptoConfig.decryptionEncoding, cryptoConfig.encryptionEncoding, function(err, decryptedKeys) {
                                    if (err) {
                                        res.status(500).send("Failed to decrypt accessKey or secretKey");
                                        return;
                                    }
                                    var ec2 = new EC2({
                                        "access_key": decryptedKeys[0],
                                        "secret_key": decryptedKeys[1],
                                        "region": keyPair[0].region
                                    });
                                    logger.debug("ec2>>>>>>>>>>>>>>>>> ", JSON.stringify(ec2));
                                    ec2.checkImageAvailability(vmimageData.imageIdentifier, function(err, data) {
                                        if (err) {
                                            logger.debug("Unable to describeImages from AWS.", err);
                                            res.status(500).send( "Invalid Image Id.");
                                            return;
                                        }
                                        if (data.Images.length > 0) {
                                            logger.debug("Success to Describe Images from AWS. %s", data.Images[0].VirtualizationType);
                                            vmimageData.vType = data.Images[0].VirtualizationType;
                                            VMImage.createNew(vmimageData, function(err, anImage) {
                                                if (err) {
                                                    logger.debug("err.....", err);
                                                    res.status(500).send( "Selected is already registered.");
                                                    return;
                                                }
                                                logger.debug("Exit post() for /vmimages");
                                                res.send(anImage);
                                                return;
                                            });
                                        } else {
                                            res.status(500).send( "The image is empty for amid: " + vmimageData.imageIdentifier);
                                            return;
                                        }

                                    });
                                });
                            });
                        }); //end awsprovider
                    }
                }
            });
        });
    });

    // Return list of all Images.
    app.get('/vmimages', function(req, res) {
        logger.debug("Enter get() for /vmimages");
        var loggedInUser = req.session.user.cn;
        masterUtil.getLoggedInUser(loggedInUser, function(err, anUser) {
            if (err) {
                res.status(500).send( "Failed to fetch User.");
            }
            if (!anUser) {
                res.status(500).send( "Invalid User.");
            }
            if (anUser.orgname_rowid[0] === "") {
                masterUtil.getAllActiveOrg(function(err, orgList) {
                    if (err) {
                        res.status(500).send( 'Not able to fetch Orgs.');
                    }
                    if (orgList) {
                        VMImage.getImagesForOrg(orgList, function(err, images) {
                            if (err) {
                                logger.error(err);
                                res.status(500).send( errorResponses.db.error);
                                return;
                            }
                            if (images) {
                                logger.debug("Exit get() for /vmimages");
                                res.send(images);
                            } else {
                                res.send([]);
                            }
                        });
                    }
                });
            } else {
                masterUtil.getOrgs(loggedInUser, function(err, orgList) {
                    if (err) {
                        res.status(500).send( 'Not able to fetch Orgs.');
                    }
                    if (orgList) {
                        VMImage.getImagesForOrg(orgList, function(err, images) {
                            if (err) {
                                logger.error(err);
                                res.status(500).send( errorResponses.db.error);
                                return;
                            }
                            if (images) {
                                logger.debug("Exit get() for /vmimages");
                                res.send(images);
                            } else {
                                res.send([]);
                            }
                        });
                    }
                });
            }
        });
    });

    // Return a particular Image for id.
    app.get('/vmimages/:imageId', function(req, res) {
        logger.debug("Enter get() for /vmimages/%s", req.params.imageId);
        var imageId = req.params.imageId.trim();
        if (typeof imageId === 'undefined' || imageId.length === 0) {
            res.status(500).send( "Please Enter ImageId.");
            return;
        }
        VMImage.getImageById(imageId, function(err, anImage) {
            if (err) {
                logger.error(err);
                res.status(500).send( errorResponses.db.error);
                return;
            }
            if (anImage) {
                logger.debug("Exit get() for /vmimages/%s", req.params.imageId);
                res.send(anImage);
            } else {
                res.send(404);
            }
        });
    });

    // Update a paricular Image values.
    app.post('/vmimages/:imageId/update', function(req, res) {
        logger.debug("Enter Post() for /vmimages/%s/update", req.params.imageId);
        var user = req.session.user;
        var category = configmgmtDao.getCategoryFromID("22");
        var permissionto = 'modify';
        var imageId = req.params.imageId.trim();
        var providerId = req.body.providerId.trim();
        var imageIdentifier = req.body.imageIdentifier.trim();
        var name = req.body.name.trim();
        var osType = req.body.osType.trim();
        var osName = req.body.osName.trim();
        var userName = req.body.userName.trim();
        var orgId = req.body.orgId;
        var providerType = req.body.providertype.toLowerCase().trim();
        var password = req.body.password.trim(); //only for azure provider

        if (typeof providerId === 'undefined' || providerId.length === 0) {
            res.status(400).send( "{Please Enter ProviderId.}");
            return;
        }
        if (typeof imageIdentifier === 'undefined' || imageIdentifier.length === 0) {
            res.status(400).send( "{Please Enter ImageIdentifier.}");
            return;
        }
        if (typeof name === 'undefined' || name.length === 0) {
            res.status(400).send( "{Please Enter Name.}");
            return;
        }

        if (typeof imageId === 'undefined' || imageId.length === 0) {
            res.status(400).send( "{Please Enter ImageId.}");
            return;
        }
        if (typeof osType === 'undefined' || osType.length === 0) {
            res.status(400).send( "{Please Enter OS Type.}");
            return;
        }
        if (typeof osName === 'undefined' || osName.length === 0) {
            res.status(400).send( "{Please Enter OS Name.}");
            return;
        }
        if (typeof userName === 'undefined' || userName.length === 0) {
            res.status(400).send( "{Please Enter OS UserName.}");
            return;
        }
        var vmimageData = {
            id: 22,
            providerId: providerId,
            imageIdentifier: imageIdentifier,
            name: name,
            osType: osType,
            osName: osName,
            userName: userName,
            orgId: orgId,
            providerType: providerType,
            instancePassword: password
        };
        logger.debug("image >>>>>>>>>>>>", vmimageData);
        usersDao.haspermission(user.cn, category, permissionto, null, req.session.user.permissionset, function(err, data) {
            if (!err) {
                logger.debug('Returned from haspermission : ' + data + ' : ' + (data == false));
                if (data == false) {
                    logger.debug('No permission to ' + permissionto + ' on ' + category);
                    res.send(401, "You don't have permission to perform this operation.");
                    return;
                }
            } else {
                logger.error("Hit and error in haspermission:", err);
                res.send(500);
                return;
            }

            masterUtil.getLoggedInUser(user.cn, function(err, anUser) {
                if (err) {
                    res.status(500).send( "Failed to fetch User.");
                }
                logger.debug("LoggedIn User:>>>> ", JSON.stringify(anUser));
                if (anUser) {
                    //data == true (create permission)
                    /*if(data && anUser.orgname_rowid[0] !== "" && anUser.userrolename !== "Admin"){
                    logger.debug("Inside check not authorized.");
                    res.send(401,"You don't have permission to perform this operation.");
                    return;
                }*/
                    if(providerType == "openstack" || providerType == "hppubliccloud" || providerType == "azure" || providerType == "vmware"){
                        logger.debug('Provider Type',providerType);
                        VMImage.getImageById(imageId, function(err, anImage) {
                            if (err) {
                                logger.error(err);
                                res.status(500).send( errorResponses.db.error);
                                return;
                            }
                            vmimageData.vType = 'openstack';
                            
                            if(providerType == 'azure'){
                                vmimageData.vType = 'azure';
                            }

                            logger.debug("ImageData:>>>>>>>>>>> ", JSON.stringify(vmimageData));
                            VMImage.updateImageById(imageId, vmimageData, function(err, updateCount) {
                                if (err) {
                                    logger.error(err);
                                    res.status(500).send( errorResponses.db.error);
                                    return;
                                }
                                if (updateCount) {
                                    logger.debug("Exit get() for /vmimages/%s/update", req.params.imageId);
                                    res.send({
                                        updateCount: updateCount
                                    });
                                } else {
                                    res.send(400);
                                }
                            });
                        });
                    }
                    else{
                        AWSProvider.getAWSProviderById(providerId, function(err, aProvider) {
                            if (err) {
                                logger.error(err);
                                res.status(500).send( "Image creation failed due to Image name already exist.");
                                return;
                            }
                            logger.debug("Returned Provider: ", aProvider);
                            AWSKeyPair.getAWSKeyPairByProviderId(providerId, function(err, keyPair) {
                                logger.debug("keyPairs length::::: ", keyPair[0].region);
                                if (err) {
                                    res.status(500).send( "Error getting to fetch Keypair.")
                                }
                                logger.debug("vmimageData <<<<<<<<<<<<<<<<<<<<< %s", vmimageData);
                                var keys = [];
                                keys.push(aProvider.accessKey);
                                keys.push(aProvider.secretKey);
                                cryptography.decryptMultipleText(keys, cryptoConfig.decryptionEncoding, cryptoConfig.encryptionEncoding, function(err, decryptedKeys) {
                                    if (err) {
                                        res.sned(500, "Failed to decrypt accessKey or secretKey");
                                        return;
                                    }
                                    var ec2 = new EC2({
                                        "access_key": decryptedKeys[0],
                                        "secret_key": decryptedKeys[1],
                                        "region": keyPair[0].region
                                    });
                                    logger.debug("ec2>>>>>>>>>>>>>>>>> ", JSON.stringify(ec2));
                                    ec2.checkImageAvailability(vmimageData.imageIdentifier, function(err, data) {
                                        if (err) {
                                            logger.debug("Unable to describeImages from AWS.", err);
                                            res.status(500).send( "Invalid Image Id.");
                                            return;
                                        }
                                        VMImage.getImageById(imageId, function(err, anImage) {
                                            if (err) {
                                                logger.error(err);
                                                res.status(500).send( errorResponses.db.error);
                                                return;
                                            }
                                            if (anImage) {
                                                vmimageData.vType = anImage.vType;
                                            }
                                            logger.debug("ImageData:>>>>>>>>>>> ", JSON.stringify(vmimageData));
                                            VMImage.updateImageById(imageId, vmimageData, function(err, updateCount) {
                                                if (err) {
                                                    logger.error(err);
                                                    res.status(500).send( errorResponses.db.error);
                                                    return;
                                                }
                                                if (updateCount) {
                                                    logger.debug("Exit get() for /vmimages/%s/update", req.params.imageId);
                                                    res.send({
                                                        updateCount: updateCount
                                                    });
                                                } else {
                                                    res.send(400);
                                                }
                                            });
                                        }); //vmimage getimagebyid
                                    });
                                }); //
                            });
                        });
                    }
                }
            });
        });
    });
    // Delete a particular Image from DB.
    app.delete('/vmimages/:imageId', function(req, res) {
        logger.debug("Enter delete() for /vmimages/%s", req.params.imageId);
        var user = req.session.user;
        var category = configmgmtDao.getCategoryFromID("9");
        var permissionto = 'delete';
        var imageId = req.params.imageId.trim();
        if (typeof imageId === 'undefined' || imageId.length === 0) {
            res.status(500).send( "Please Enter ImageId.");
            return;
        }
        usersDao.haspermission(user.cn, category, permissionto, null, req.session.user.permissionset, function(err, data) {
            if (!err) {
                logger.debug('Returned from haspermission : ' + data + ' : ' + (data == false));
                if (data == false) {
                    logger.debug('No permission to ' + permissionto + ' on ' + category);
                    res.send(401, "You don't have permission to perform this operation.");
                    return;
                }
            } else {
                logger.error("Hit and error in haspermission:", err);
                res.send(500);
                return;
            }

            masterUtil.getLoggedInUser(user.cn, function(err, anUser) {
                if (err) {
                    res.status(500).send( "Failed to fetch User.");
                }
                logger.debug("LoggedIn User:>>>> ", JSON.stringify(anUser));
                if (anUser) {
                    //data == true (create permission)
                    /*if(data && anUser.orgname_rowid[0] !== ""){
                    logger.debug("Inside check not authorized.");
                    res.send(401,"You don't have permission to perform this operation.");
                    return;
                }*/
                    blueprintsDao.getBlueprintByImageId(imageId, function(err, data) {
                        if (err) {
                            logger.error('Failed to getBlueprint. Error = ', err);
                            res.send(500);
                            return;
                        }
                        if (data) {
                            logger.debug("Returned Blueprint:>>>>> %s", data.imageId);
                            res.send(403, "Image already used by some Blueprints.To delete Image please delete respective Blueprints first.");
                            return;
                        }
                        VMImage.removeImageById(req.params.imageId, function(err, deleteCount) {
                            if (err) {
                                logger.error(err);
                                res.status(500).send( errorResponses.db.error);
                                return;
                            }
                            if (deleteCount) {
                                logger.debug("Exit delete() for /vmimages/%s", req.params.imageId);
                                res.send({
                                    deleteCount: deleteCount
                                });
                            } else {
                                res.send(400);
                            }
                        });
                    });
                }
            });
        });
    });

    // Return images for a provider.
    app.get('/vmimages/providers/:providerId', function(req, res) {
        logger.debug("Enter get() for /vmimages/providers/%s", req.params.providerId);
        var providerId = req.params.providerId.trim();
        if (typeof providerId === 'undefined' || providerId.length === 0) {
            res.status(500).send( "Please Enter providerId.");
            return;
        }
        VMImage.getImageByProviderId(providerId, function(err, images) {
            if (err) {
                logger.error(err);
                res.status(500).send( errorResponses.db.error);
                return;
            }
            if (images) {
                logger.debug("Exit get() for /vmimages/%s", req.params.providerId);
                res.send(images);
            } else {
                res.send(404);
            }
        });
    });

    // Return AMI from AWS w.r.t. amiid
    app.post('/vmimages/availability', function(req, res) {
        logger.debug("Enter post() for /vmimages: %s", req.body.imageId);

        var ec2 = new EC2({
            "access_key": req.body.accessKey,
            "secret_key": req.body.secretKey,
            "region": req.body.region
        });
        ec2.checkImageAvailability(req.body.imageId, function(err, data) {
            if (err) {
                logger.debug("Unable to describeImages from AWS.", err);
                res.send("Unable to Describe Images from AWS.", 500);
                return;
            }
            logger.debug("Success to Describe Images from AWS.", data);
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