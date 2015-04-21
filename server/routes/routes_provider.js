var logger = require('../lib/logger')(module);
var EC2 = require('../lib/ec2.js');
var d4dModelNew = require('../model/d4dmasters/d4dmastersmodelnew.js');
var AWSProvider = require('../model/classes/masters/cloudprovider/awsCloudProvider.js');
var VMImage = require('../model/classes/masters/vmImage.js');
var AWSKeyPair = require('../model/classes/masters/cloudprovider/keyPair.js');
var blueprints = require('../model/dao/blueprints');
var instances = require('../model/dao/instancesdao');
var masterUtil = require('../lib/utils/masterUtil.js');
module.exports.setRoutes = function(app,sessionVerificationFunc){
	app.all("/aws/providers/*",sessionVerificationFunc);

// Create AWS Provider.
app.post('/aws/providers', function(req, res) {

    logger.debug("Enter post() for /providers.",typeof req.body.fileName);
    var accessKey = req.body.accessKey;
    var secretKey = req.body.secretKey;
    var providerName = req.body.providerName;
    var providerType = req.body.providerType;
    var orgId = req.body.orgId;

    if(typeof accessKey === 'undefined' || accessKey.length === 0){
        res.send(400,"{Please Enter AccessKey.}");
        return;
    }
    if(typeof secretKey === 'undefined' || secretKey.length === 0){
        res.send(400,"{Please Enter SecretKey.}");
        return;
    }
    if(typeof providerName === 'undefined' || providerName.length === 0){
        res.send(400,"{Please Enter Name.}");
        return;
    }
    if(typeof providerType === 'undefined' || providerType.length === 0){
        res.send(400,"{Please Enter ProviderType.}");
        return;
    }
    var region;
    if(typeof req.body.region === 'string'){
      logger.debug("inside single region: ",req.body.region);
      region = req.body.region;
    }else{
      region = req.body.region[0];
    }
    logger.debug("Final Region:  ",region)
    var providerData= {
     id: 9,
     accessKey: accessKey,
     secretKey: secretKey,
     providerName: providerName,
     providerType: providerType,
     orgId: orgId
 };
      var ec2 = new EC2({
           "access_key": accessKey,
           "secret_key": secretKey,
           "region"    : region
        });

        ec2.describeKeyPairs(function(err,data){
           if(err){
            logger.debug("Unable to get AWS Keypairs");
            res.send("Invalid AccessKey or SecretKey.",500);
            return;
             }
            logger.debug("Able to get AWS Keypairs. %s",JSON.stringify(data));
           AWSProvider.createNew(providerData, function(err, provider) {
              if (err) {
                  logger.debug("err.....",err);
                  res.send(500,"Provider creation failed due to Provider name already exist.");
                  return;
              }
              logger.debug("Provider id:  %s",JSON.stringify(provider._id));
              AWSKeyPair.createNew(req,provider._id,function(err,keyPair){
                masterUtil.getOrgById(providerData.orgId,function(err,orgs){
                  if(err){
                    res.send(500,"Not able to fetch org.");
                    return;
                  }
                  if(orgs.length > 0){
                    if(keyPair){
                        var dommyProvider = {
                            _id: provider._id,
                            id: 9,
                            accessKey: provider.accessKey,
                            secretKey: provider.secretKey,
                            providerName: provider.providerName,
                            providerType: provider.providerType,
                            orgId: orgs[0].rowid,
                            orgname: orgs[0].orgname,
                            __v: provider.__v,
                            keyPairs: keyPair
                            };
                            res.send(dommyProvider);        
                        }   
                      }
                    })
                  }); 
                  logger.debug("Exit post() for /providers");
              });
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
        logger.debug("providers>>> ",   JSON.stringify(providers));
        if (providers) {
            res.send(providers);
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
                masterUtil.getOrgById(aProvider.orgId,function(err,orgs){
                  if(err){
                    res.send(500,"Not able to fetch org.");
                    return;
                  }
                  if(orgs.length > 0){
                    if(keyPair){
                        var dommyProvider = {
                            _id: aProvider._id,
                            id: 9,
                            accessKey: aProvider.accessKey,
                            secretKey: aProvider.secretKey,
                            providerName: aProvider.providerName,
                            providerType: aProvider.providerType,
                            orgId: aProvider.orgId,
                            orgName: orgs[0].orgname,
                            __v: aProvider.__v,
                            keyPairs: keyPair
                        };
                        res.send(dommyProvider);        
                    }
                  }
                });
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
 var providerName = req.body.providerName.trim();
 var providerType = req.body.providerType.trim();
 var providerId = req.params.providerId.trim();
 var orgId = req.body.orgId.trim();
 if(typeof providerId === 'undefined' || providerId.length === 0){
    res.send(400,"{Please Enter ProviderId.}");
    return;
}
if(typeof accessKey === 'undefined' || accessKey.length === 0){
    res.send(400,"{Please Enter AccessKey.}");
    return;
}
if(typeof secretKey === 'undefined' || secretKey.length === 0){
    res.send(400,"{Please Enter SecretKey.}");
    return;
}
if(typeof providerName === 'undefined' || providerName.length === 0){
    res.send(400,"{Please Enter Name.}");
    return;
}
if(typeof providerType === 'undefined' || providerType.length === 0){
    res.send(400,"{Please Enter ProviderType.}");
    return;
}

var region;
    if(typeof req.body.region === 'string'){
      logger.debug("inside single region: ",req.body.region);
      region = req.body.region;
    }else{
      region = req.body.region[0];
    }
    logger.debug("Final Region:  ",region)
var providerData= {
    id: 9,
    accessKey: accessKey,
    secretKey: secretKey,
    providerName: providerName,
    providerType: providerType,
    orgId: orgId
};
logger.debug("provider>>>>>>>>>>>> %s",providerData.providerType);
var ec2 = new EC2({
           "access_key": accessKey,
           "secret_key": secretKey,
           "region"    : region
        });

        ec2.describeKeyPairs(function(err,data){
           if(err){
            logger.debug("Unable to get AWS Keypairs");
            res.send("Invalid AccessKey or SecretKey.",500);
            return;
             }
            logger.debug("Able to get AWS Keypairs. %s",JSON.stringify(data));
AWSProvider.updateAWSProviderById(req.params.providerId, providerData, function(err, updateCount) {
        if (err) {
            logger.error(err);
            res.send(500, errorResponses.db.error);
            return;
        }
      AWSKeyPair.createNew(req,providerId,function(err,keyPair){  
        if (updateCount) {
         logger.debug("Enter post() for /providers/%s/update",req.params.providerId);
         res.send({
            updateCount: updateCount
        });
     } else {
        res.send(400);
            }
        });//
     });
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

// Delete a particular AWS Provider.
app.delete('/aws/providers/keypairs/:keyPairId', function(req, res) {
 logger.debug("Enter delete() for /aws/providers/keypairs/%s",req.params.keyPairId);
 var keyPairId = req.params.keyPairId.trim();
 if(typeof keyPairId === 'undefined' || keyPairId.length === 0){
    res.send(500,"Please Enter keyPairId.");
    return;
}

    blueprints.getBlueprintByKeyPairId(keyPairId, function(err, aBluePrint) {
        if (err) {
            logger.error(err);
            res.send(500, errorResponses.db.error);
            return;
        }
        logger.debug("BluePrints:>>>>> ",JSON.stringify(aBluePrint));
        if (aBluePrint.length) {
            res.send(403,"KeyPair already used by Some BluePrints.To delete KeyPair please delete respective BluePrints First.");
            return;
        }else{
                instances.getInstanceByKeyPairId(keyPairId, function(err, anInstance) {
                 if (err) {
                     logger.error(err);
                     res.send(500, errorResponses.db.error);
                     return;
                 }
                 if (anInstance.length) {
                  res.send(403,"KeyPair is already used by Instance.");
              } else {
                  AWSKeyPair.removeAWSKeyPairById(keyPairId,function(err,deleteCount){  
                    if (deleteCount) {
                      logger.debug("KeyPair deleted",keyPairId);
                      res.send({
                        deleteCount: deleteCount
                    });
                  }
            });
          }
    });
}
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
            res.send("Invalid AccessKey or SecretKey.",500);
            return;
             }
            logger.debug("Able to get AWS Keypairs. %s",JSON.stringify(data));
            res.send(data);
         });
    });

  // Return all available security groups from AWS for VPC.
  app.post('/aws/providers/vpc/:vpcId/securitygroups',function(req,res){
    logger.debug("Enter for Provider securitygroups fro vpc. %s",req.body.accessKey);

        var ec2 = new EC2({
         "access_key": req.body.accessKey,
         "secret_key": req.body.secretKey,
         "region"    : req.body.region
      });

        ec2.getSecurityGroupsForVPC(req.params.vpcId,function(err,data){
         if(err){
          logger.debug("Unable to get AWS Security Groups for VPC.");
          res.send("Unable to get AWS Security Groups for VPC.",500);
          return;
          }
          logger.debug("Able to get AWS Security Groups for VPC. %s",JSON.stringify(data));
          res.send(data);
      });
  });

  // Return all VPCs w.r.t. region
    app.post('/aws/providers/describe/vpcs',function(req,res){
        logger.debug("Enter describeVpcs ");
            
        var ec2 = new EC2({
                "access_key": req.body.accessKey,
                "secret_key": req.body.secretKey,
                "region"    : req.body.region
        });
        ec2.describeVpcs(function(err,data){
                if(err){
                    logger.debug("Unable to describe Vpcs from AWS.",err);
                    res.send("Unable to Describe Vpcs from AWS.",500);
                    return;
                }
            logger.debug("Success to Describe Vpcs from AWS.",data);
            res.send(data);
        });
    });

    // Return all Subnets w.r.t. vpc
    app.post('/aws/providers/vpc/:vpcId/subnets',function(req,res){
        logger.debug("Enter describeSubnets ");
        
        var ec2 = new EC2({
            "access_key": req.body.accessKey,
            "secret_key": req.body.secretKey,
            "region"    : req.body.region
        });
        ec2.describeSubnets(req.params.vpcId,function(err,data){
            if(err){
                logger.debug("Unable to describeSubnets from AWS.",err);
                res.send("Unable to describeSubnets from AWS.",500);
                return;
            }
            logger.debug("Success to describeSubnets from AWS.",data);
            res.send(data);
        });
    });
}