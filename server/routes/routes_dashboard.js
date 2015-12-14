/* Copyright (C) Relevance Lab Private Limited- All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Gobinda Das <gobinda.das@relevancelab.com>,
 * May 2015
 */

// This file act as a Controller which contains provider related all end points.

var logger = require('_pr/logger')(module);
var EC2 = require('../lib/ec2.js');
var d4dModelNew = require('../model/d4dmasters/d4dmastersmodelnew.js');
var AWSProvider = require('../model/classes/masters/cloudprovider/awsCloudProvider.js');
var openstackProvider = require('../model/classes/masters/cloudprovider/openstackCloudProvider.js');
var hppubliccloudProvider = require('../model/classes/masters/cloudprovider/hppublicCloudProvider.js');
var azurecloudProvider = require('../model/classes/masters/cloudprovider/azureCloudProvider.js');
var vmwareProvider = require('../model/classes/masters/cloudprovider/vmwareCloudProvider.js');
var VMImage = require('../model/classes/masters/vmImage.js');
var AWSKeyPair = require('../model/classes/masters/cloudprovider/keyPair.js');
var blueprints = require('../model/dao/blueprints');
var instances = require('../model/classes/instance/instance');
var masterUtil = require('../lib/utils/masterUtil.js');
var usersDao = require('../model/users.js');
var configmgmtDao = require('../model/d4dmasters/configmgmt.js');
var Cryptography = require('../lib/utils/cryptography');
var appConfig = require('_pr/config');

var providersdashboard = require('../model/dashboard/dashboardinstances.js');
var dashboardcosts = require('../model/dashboard/dashboardcosts.js');
var instancesDao = require('../model/classes/instance/instance');
var crontab = require('node-crontab');
var CW = require('../lib/cloudwatch.js');
module.exports.setRoutes = function(app, sessionVerificationFunc) {
    // app.all("/aws/providers/*", sessionVerificationFunc);
    app.all("/dashboard/providers/*", sessionVerificationFunc);
    var cryptoConfig = appConfig.cryptoSettings;
    var cryptography = new Cryptography(cryptoConfig.algorithm, cryptoConfig.password);
    
    //This will call this function for every hours and saves into monogdb.
    var totalInstancesCronJob = crontab.scheduleJob("0 * * * *", function() {
        logger.debug("Cron Job run every 60 minutes!!!!!!!!!!!!!!+++++++++");
        AWSProvider.getAWSProviders(function(err, providers) {
            if (err) {
                logger.error(err);
                return;
            }
            //logger.debug("providers>>> ", JSON.stringify(providers));
            var providersList = [];
            if (providers.length > 0) {
                var countProvider = 0;
                var countRegion = 0;
                var totalcount = 0;
                for (var i = 0; i < providers.length; i++) {
                    var keys = [];
                    keys.push(providers[i].accessKey);
                    keys.push(providers[i].secretKey);
                    cryptography.decryptMultipleText(keys, cryptoConfig.decryptionEncoding, cryptoConfig.encryptionEncoding, function(err, decryptedKeys) {
                        countProvider++;
                        if (err) {
                            return;
                        }
                        providers[i].accessKey = decryptedKeys[0];
                        providers[i].secretKey = decryptedKeys[1];
                        providersList.push(providers[i]);
                    });
                    //logger.debug("providers>>> ", JSON.stringify(providers));
                    if (providers.length === providersList.length) {
                        var exists = {},
                            uniqueProviderList = [],
                            elm;
                        for (var i = 0; i < providersList.length; i++) {
                            elm = providersList[i];
                            if (!exists[elm]) {
                                uniqueProviderList.push(elm);
                                exists[elm] = true;
                            }
                        }
                        //console.log("uniqueProviderList===================>" + uniqueProviderList);
                        for (var n = 0; n < uniqueProviderList.length; n++) {
                            var regions = ["us-east-1", "us-west-1", "us-west-2"];
                            for (var j = 0; j < regions.length; j++) {
                                var ec2 = new EC2({
                                    "access_key": uniqueProviderList[n].accessKey,
                                    "secret_key": uniqueProviderList[n].secretKey,
                                    "region": regions[j]
                                });
                                ec2.listInstances(function(err, nodes) {
                                    countRegion++;
                                    if (err) {
                                        logger.debug("Unable to list nodes from AWS.", err);
                                        return;
                                    }
                                    logger.debug("Success to list nodes from AWS.");
                                    var nodeList = [];
                                    for (var k = 0; k < nodes.Reservations.length; k++) {
                                        var instance = {
                                            "instance": nodes.Reservations[k].Instances[0].InstanceId
                                        };
                                        nodeList.push(instance);
                                    }
                                    var nodeListLength = nodeList.length;
                                    logger.debug("I am in count of Total Instances", nodeListLength);
                                    totalcount = totalcount + nodeListLength;
                                    if (countProvider === uniqueProviderList.length && countRegion === uniqueProviderList.length * regions.length) {
                                        providersdashboard.createNew(totalcount, function(err, totalcountInstances) {
                                            if (err) {
                                                return;
                                            }
                                            if (totalcountInstances) {
                                                console.log("I am in totalcount to save++++++++++++++++");
                                                //res.send(200, totalcountInstances);
                                                return;
                                            }
                                        });
                                        return;
                                    }
                                });
                            }
                        }

                    }
                }
                //console.log("providersList++++++++++++++++++"+providersList.length);
            } else {
                //res.send(200, []);
                return;
            }
        });
    });
    
    //This will call this function for every day at 11.59P.M and saves into monogdb.
    var totalCostsCronJob = crontab.scheduleJob("04 01 * * *", function() {
        logger.debug("Cron Job run every 1hours!!!!!!!!!!!!!!+++++++++ Mu hebi hero");
        AWSProvider.getAWSProviders(function(err, providers) {
            if (err) {
                logger.error(err);
                return;
            }
            logger.debug("providers >>> ", JSON.stringify(providers));
            var providersList = [];
            if (providers.length > 0) {
                var countProvider = 0;
                var countRegion = 0;
                var totalcount = 0;
                for (var i = 0; i < providers.length; i++) {
                    var keys = [];
                    keys.push(providers[i].accessKey);
                    keys.push(providers[i].secretKey);
                    cryptography.decryptMultipleText(keys, cryptoConfig.decryptionEncoding, cryptoConfig.encryptionEncoding, function(err, decryptedKeys) {
                        countProvider++;
                        if (err) {
                            return;
                        }
                        providers[i].accessKey = decryptedKeys[0];
                        providers[i].secretKey = decryptedKeys[1];
                        providersList.push(providers[i]);
                    });
                    logger.debug("providers>>> ", JSON.stringify(providers));
                    if (providers.length === providersList.length) {
                        var exists = {},
                            uniqueProviderList = [],
                            elm;
                        for (var i = 0; i < providersList.length; i++) {
                            elm = providersList[i];
                            if (!exists[elm]) {
                                uniqueProviderList.push(elm);
                                exists[elm] = true;
                            }
                        }
                        console.log("uniqueProviderList cronjob===================>" + uniqueProviderList);
                        for (var n = 0; n < uniqueProviderList.length; n++) {
                            var regions = ["us-east-1"];
                            for (var j = 0; j < regions.length; j++) {
                                // var ec2 = new EC2({
                                //     "access_key": uniqueProviderList[n].accessKey,
                                //     "secret_key": uniqueProviderList[n].secretKey,
                                //     "region": regions[j]
                                // });
                                var cloudwatch = new CW({
                                    "access_key": uniqueProviderList[n].accessKey,
                                    "secret_key": uniqueProviderList[n].secretKey,
                                    "region": regions[j]
                                });
                                cloudwatch.getTotalCostMaximum(function(err, nodes) {
                                    if(err){
                                        res.send(500, "Failed to fetch Total Cost.");
                                        return;
                                    }
                                    if(nodes){
                                        cloudwatch.getTotalCostMinimum(nodes, function(err, costToday) {
                                            if(err){
                                                res.send(500, "Failed to fetch Total Cost.");
                                                return;
                                            }
                                            if (costToday) {
                                                var finalCost = parseInt(costToday.toString());
                                                dashboardcosts.createNew(finalCost, function(err, totalcost) {
                                                    console.log("I am in getting cost for Today######################" + finalCost);
                                                    // res.send(200, {
                                                    //     totalcost: costToday
                                                    // });
                                                });
                                                
                                            }
                                        });
                                    }
                                });
                            }
                        }
                    }
                }
                //console.log("providersList++++++++++++++++++"+providersList.length);
            } else {
                //res.send(200, []);
                return;
            }
        });
    }); 

    /*app.get('/dashboard/providers/totalinstances', function(req, res) {
        console.log(" i am in totalinstances api");
        logger.debug("Enter get() for /providers");
        var loggedInUser = req.session.user.cn;
        masterUtil.getLoggedInUser(loggedInUser, function(err, anUser) {
            if (err) {
                res.send(500, "Failed to fetch User.");
                return;
            }
            if (!anUser) {
                res.send(500, "Invalid User.");
                return;
            }
            if (anUser.orgname_rowid[0] === "") {
                console.log("I am in if part...................");
                masterUtil.getAllActiveOrg(function(err, orgList) {
                    if (err) {
                        res.send(500, 'Not able to fetch Orgs.');
                        return;
                    }
                    if (orgList) {
                        AWSProvider.getAWSProvidersForOrg(orgList, function(err, providers) {
                            if (err) {
                                logger.error(err);
                                res.send(500, errorResponses.db.error);
                                return;
                            }
                            logger.debug("providers>>> ", JSON.stringify(providers));
                            var providersList = [];

                            if (providers.length > 0) {
                                var countProvider = 0;
                                var countRegion = 0;
                                var totalcount = 0;
                                for (var i = 0; i < providers.length; i++) {
                                    var keys = [];
                                    keys.push(providers[i].accessKey);
                                    keys.push(providers[i].secretKey);
                                    cryptography.decryptMultipleText(keys, cryptoConfig.decryptionEncoding, cryptoConfig.encryptionEncoding, function(err, decryptedKeys) {
                                        countProvider++;
                                        if (err) {
                                            res.send(500, "Failed to decrypt accessKey or secretKey");
                                            return;
                                        }
                                        providers[i].accessKey = decryptedKeys[0];
                                        providers[i].secretKey = decryptedKeys[1];
                                        providersList.push(providers[i]);
                                    });
                                    logger.debug("providers>>> ", JSON.stringify(providers));
                                    if (providers.length === providersList.length) {
                                        var exists = {},
                                            uniqueProviderList = [],
                                            elm;
                                        for (var i = 0; i < providersList.length; i++) {
                                            elm = providersList[i];
                                            if (!exists[elm]) {
                                                uniqueProviderList.push(elm);
                                                exists[elm] = true;
                                            }
                                        }
                                        console.log("uniqueProviderList===================>" + uniqueProviderList);
                                        for (var n = 0; n < uniqueProviderList.length; n++) {
                                            var regions = ["us-east-1", "us-west-1", "us-west-2"];
                                            for (var j = 0; j < regions.length; j++) {
                                                var ec2 = new EC2({
                                                    "access_key": uniqueProviderList[n].accessKey,
                                                    "secret_key": uniqueProviderList[n].secretKey,
                                                    "region": regions[j]
                                                });
                                                ec2.listInstances(function(err, nodes) {
                                                    countRegion++;
                                                    if (err) {
                                                        logger.debug("Unable to list nodes from AWS.", err);
                                                        res.send("Unable to list nodes from AWS.", 500);
                                                        return;
                                                    }
                                                    logger.debug("Success to list nodes from AWS.");
                                                    var nodeList = [];
                                                    for (var k = 0; k < nodes.Reservations.length; k++) {
                                                        var instance = {
                                                            "instance": nodes.Reservations[k].Instances[0].InstanceId
                                                        };
                                                        nodeList.push(instance);
                                                    }
                                                    var nodeListLength = nodeList.length;
                                                    logger.debug("I am in count of Total Instances", nodeListLength);
                                                    //res.send(nodeList);
                                                    totalcount = totalcount + nodeListLength;
                                                    if (countProvider === uniqueProviderList.length && countRegion === uniqueProviderList.length * regions.length) {
                                                        // providersdashboard.createNew(totalcount, function(err, totalcountInstances) {
                                                        //     if (err) {
                                                        //         res.send(500, "Unable to fetch Total Count");
                                                        //         return;
                                                        //     }
                                                        //     if (totalcountInstances) {
                                                        //         res.send(200, totalcountInstances);
                                                        //         return;
                                                        //     }
                                                        // });
                                                        res.send(200, {
                                                            totalcount: totalcount
                                                        });
                                                        return;
                                                    }
                                                });
                                            }
                                        }

                                    }
                                }
                                //console.log("providersList++++++++++++++++++"+providersList.length);
                            } else {
                                res.send(200, []);
                                return;
                            }
                        });
                    } else {
                        res.send(200, []);
                        return;
                    }
                });
            } else {
                console.log("I am in else part...................");
                masterUtil.getOrgs(loggedInUser, function(err, orgList) {
                    if (err) {
                        res.send(500, 'Not able to fetch Orgs.');
                        return;
                    }
                    if (orgList) {
                        AWSProvider.getAWSProvidersForOrg(orgList, function(err, providers) {
                            if (err) {
                                logger.error(err);
                                res.send(500, errorResponses.db.error);
                                return;
                            }
                            var providersList = [];
                            logger.debug("Providers::::::::::::::::::: ", providers === null);
                            if (providers === null) {
                                res.send(providersList);
                                return;
                            }
                            if (providers.length > 0) {
                                var countProvider = 0;
                                var countRegion = 0;
                                var totalcount = 0;
                                for (var i = 0; i < providers.length; i++) {
                                    var keys = [];
                                    keys.push(providers[i].accessKey);
                                    keys.push(providers[i].secretKey);
                                    cryptography.decryptMultipleText(keys, cryptoConfig.decryptionEncoding, cryptoConfig.encryptionEncoding, function(err, decryptedKeys) {
                                        if (err) {
                                            res.sned(500, "Failed to decrypt accessKey or secretKey");
                                            return;
                                        }
                                        providers[i].accessKey = decryptedKeys[0];
                                        providers[i].secretKey = decryptedKeys[1];
                                        providersList.push(providers[i]);
                                        logger.debug("providers>>> ", JSON.stringify(providers));
                                        // if (providers.length === providersList.length) {
                                        //     res.send(providersList);
                                        //     return;
                                        // }
                                    });
                                    logger.debug("providers>>> ", JSON.stringify(providers));
                                    if (providers.length === providersList.length) {
                                        var exists = {},
                                            uniqueProviderList = [],
                                            elm;
                                        for (var i = 0; i < providersList.length; i++) {
                                            elm = providersList[i];
                                            if (!exists[elm]) {
                                                uniqueProviderList.push(elm);
                                                exists[elm] = true;
                                            }
                                        }
                                        console.log("uniqueProviderList===================>" + uniqueProviderList);
                                        for (var n = 0; n < uniqueProviderList.length; n++) {
                                            var regions = ["us-east-1", "us-west-1", "us-west-2"];
                                            for (var j = 0; j < regions.length; j++) {
                                                var ec2 = new EC2({
                                                    "access_key": uniqueProviderList[n].accessKey,
                                                    "secret_key": uniqueProviderList[n].secretKey,
                                                    "region": regions[j]
                                                });
                                                ec2.listInstances(function(err, nodes) {
                                                    countRegion++;
                                                    if (err) {
                                                        logger.debug("Unable to list nodes from AWS.", err);
                                                        res.send("Unable to list nodes from AWS.", 500);
                                                        return;
                                                    }
                                                    logger.debug("Success to list nodes from AWS.");
                                                    var nodeList = [];
                                                    for (var k = 0; k < nodes.Reservations.length; k++) {
                                                        var instance = {
                                                            "instance": nodes.Reservations[k].Instances[0].InstanceId
                                                        };
                                                        nodeList.push(instance);
                                                    }
                                                    var nodeListLength = nodeList.length;
                                                    logger.debug("I am in count of Total Instances", nodeListLength);
                                                    //res.send(nodeList);
                                                    totalcount = totalcount + nodeListLength;
                                                    if (countProvider === uniqueProviderList.length && countRegion === uniqueProviderList.length * regions.length) {
                                                        res.send(200, {
                                                            totalcount: totalcount
                                                        });
                                                        return;
                                                    }
                                                });
                                            }
                                        }

                                    }
                                }
                            } else {
                                res.send(providersList);
                                return;
                            }
                        });
                    } else {
                        res.send(200, []);
                        return;
                    }
                });
            }
        });
    });*/
    
    app.get('/dashboard/providers/totalinstances', function(req, res) {
        providersdashboard.getLatestProviderInfo(function(err, providerDataLatest) {
            if (err) {
                return;
            }
            if (providerDataLatest) {
                console.log("I am in providerData of Latest++++++++++++++++");
                res.send(200, providerDataLatest);
                return;
            }
        });
    });

    app.get('/dashboard/providers/totalcosts', function(req, res) {
        dashboardcosts.getLatestCostInfo(function(err, costsDataLatest) {
            if (err) {
                return;
            }
            if (costsDataLatest) {
                console.log("I am in costsData of Latest++++++++++++++++");
                res.send(200, costsDataLatest);
                return;
            }
        });
    });
    
    /*app.get('/dashboard/providers/totalmanagedinstances', function(req, res) {
        instancesDao.getAllInstances(function(err, instances) {
            if (err) {
                logger.debug("Error while getElementBytting instance!");
                return;
            }
            if(instances){
                res.send(200, instances);
                return;
            }
        });
    });*/

    /*app.get('/dashboard/providers/totalcost', function(req, res) {
        var cloudwatch = new CW({
            "access_key": "AKIAJEP7C6AIIXGB6NJA",
            "secret_key": "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",
            "region": "us-east-1"
        });
        cloudwatch.getTotalCostMaximum(function(err, nodes) {
            if(err){
                res.send(500, "Failed to fetch Total Cost.");
                return;
            }
            if(nodes){
                cloudwatch.getTotalCostMinimum(nodes, function(err, costToday) {
                    if(err){
                        res.send(500, "Failed to fetch Total Cost.");
                        return;
                    }
                    if (costToday) {
                        console.log("I am in getting cost for Today######################" + costToday);
                        res.send(200, {
                            totalcost: costToday
                        });
                    }
                });
            }
        });
    });*/



    /*app.get('/dashboard/providers/totalusages', function(req, res) {
        var cloudwatch = new CW({
            "access_key": "AKIAJEP7C6AIIXGB6NJA",
            "secret_key": "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",
            "region": "us-east-1"
        });
    });*/



    // // Return list of all types of available providers.
    // app.get('/allproviders/list', function(req, res) {
    //     logger.debug("Enter get() for /allproviders/list");
    //     var loggedInUser = req.session.user.cn;
    //     masterUtil.getLoggedInUser(loggedInUser, function(err, anUser) {
    //         if (err) {
    //             res.send(500, "Failed to fetch User.");
    //             return;
    //         }
    //         if (!anUser) {
    //             res.send(500, "Invalid User.");
    //             return;
    //         }
    //         if (anUser.orgname_rowid[0] === "") {
    //             masterUtil.getAllActiveOrg(function(err, orgList) {
    //                 if (err) {
    //                     res.send(500, 'Not able to fetch Orgs.');
    //                     return;
    //                 }
    //                 if (orgList) {
    //                     AWSProvider.getAWSProvidersForOrg(orgList, function(err, providers) {
    //                         if (err) {
    //                             logger.error(err);
    //                             res.send(500, errorResponses.db.error);
    //                             return;
    //                         }
    //                         logger.debug("providers>>> ", JSON.stringify(providers));
    //                         var providersList = {};


    //                         if (providers.length > 0) {
    //                             var awsProviderList = [];
    //                             for (var i = 0; i < providers.length; i++) {
    //                                 var keys = [];
    //                                 keys.push(providers[i].accessKey);
    //                                 keys.push(providers[i].secretKey);
    //                                 cryptography.decryptMultipleText(keys, cryptoConfig.decryptionEncoding, cryptoConfig.encryptionEncoding, function(err, decryptedKeys) {
    //                                     if (err) {
    //                                         res.send(500, "Failed to decrypt accessKey or secretKey");
    //                                         return;
    //                                     }
    //                                     providers[i].accessKey = decryptedKeys[0];
    //                                     providers[i].secretKey = decryptedKeys[1];
    //                                     awsProviderList.push(providers[i]);
    //                                     logger.debug("aws providers>>> ", JSON.stringify(providers));
    //                                 });
    //                             }
    //                             providersList.awsProviders = awsProviderList;
    //                             //providersList.push(awsProviderList);
    //                         } else {
    //                             providersList.awsProviders = [];
    //                             //providersList.push([]);
    //                         }

    //                         openstackProvider.getopenstackProvidersForOrg(orgList, function(err, openstackProviders) {
    //                             if (err) {
    //                                 logger.error(err);
    //                                 res.send(500, errorResponses.db.error);
    //                                 return;
    //                             }

    //                             if (openstackProviders != null) {
    //                                 logger.debug("openstack Providers>>> ", JSON.stringify(openstackProviders));
    //                                 if (openstackProviders.length > 0) {
    //                                     providersList.openstackProviders = openstackProviders;
    //                                     //providersList.push(openstackProviders);
    //                                 }
    //                             } else {
    //                                 providersList.openstackProviders = [];
    //                                 //providersList.push([]);
    //                             }

    //                             vmwareProvider.getvmwareProvidersForOrg(orgList, function(err, vmwareProviders) {
    //                                 if (err) {
    //                                     logger.error(err);
    //                                     res.send(500, errorResponses.db.error);
    //                                     return;
    //                                 }
    //                                 if (vmwareProviders != null) {
    //                                     logger.debug("vmware Providers>>> ", JSON.stringify(vmwareProviders));
    //                                     if (vmwareProviders.length > 0) {
    //                                         providersList.vmwareProviders = vmwareProviders;
    //                                         //providersList.push(vmwareProviders);
    //                                     }
    //                                 } else {
    //                                     providersList.vmwareProviders = [];
    //                                 }


    //                                 hppubliccloudProvider.gethppubliccloudProvidersForOrg(orgList, function(err, hpCloudProviders) {
    //                                     if (err) {
    //                                         logger.error(err);
    //                                         res.send(500, errorResponses.db.error);
    //                                         return;
    //                                     }
    //                                     if (hpCloudProviders != null) {
    //                                         for (var i = 0; i < hpCloudProviders.length; i++) {
    //                                             hpCloudProviders[i]['providerType'] = hpCloudProviders[i]['providerType'].toUpperCase();
    //                                         }
    //                                         logger.debug("providers>>> ", JSON.stringify(hpCloudProviders));
    //                                         if (hpCloudProviders.length > 0) {
    //                                             providersList.hpPlublicCloudProviders = hpCloudProviders;
    //                                             //providersList.push(hpCloudProviders);
    //                                         }
    //                                     } else {
    //                                         providersList.hpPlublicCloudProviders = [];
    //                                         //providersList.push([]);
    //                                     }

    //                                     azurecloudProvider.getAzureCloudProvidersForOrg(orgList, function(err, azureProviders) {

    //                                         if (err) {
    //                                             logger.error(err);
    //                                             res.send(500, errorResponses.db.error);
    //                                             return;
    //                                         }
    //                                         if (azureProviders != null) {
    //                                             for (var i = 0; i < azureProviders.length; i++) {
    //                                                 azureProviders[i]['providerType'] = azureProviders[i]['providerType'].toUpperCase();
    //                                             }
    //                                             logger.debug("providers>>> ", JSON.stringify(providers));
    //                                             if (azureProviders.length > 0) {
    //                                                 providersList.azureProviders = azureProviders;
    //                                                 //providersList.push(azureProviders);
    //                                                 res.send(providersList);
    //                                                 return;
    //                                             }
    //                                         } else {
    //                                             providersList.azureProviders = [];
    //                                             //providersList.push([]);
    //                                             res.send(200, providersList);
    //                                             return;
    //                                         }
    //                                     });

    //                                 });

    //                             });

    //                         });

    //                     });
    //                 } else {
    //                     res.send(200, []);
    //                     return;
    //                 }
    //             });
    //         } else {
    //             masterUtil.getOrgs(loggedInUser, function(err, orgList) {
    //                 if (err) {
    //                     res.send(500, 'Not able to fetch Orgs.');
    //                     return;
    //                 }
    //                 if (orgList) {
    //                     AWSProvider.getAWSProvidersForOrg(orgList, function(err, providers) {
    //                         if (err) {
    //                             logger.error(err);
    //                             res.send(500, errorResponses.db.error);
    //                             return;
    //                         }
    //                         logger.debug("providers>>> ", JSON.stringify(providers));
    //                         var providersList = {};


    //                         if (providers.length > 0) {
    //                             var awsProviderList = [];
    //                             for (var i = 0; i < providers.length; i++) {
    //                                 var keys = [];
    //                                 keys.push(providers[i].accessKey);
    //                                 keys.push(providers[i].secretKey);
    //                                 cryptography.decryptMultipleText(keys, cryptoConfig.decryptionEncoding, cryptoConfig.encryptionEncoding, function(err, decryptedKeys) {
    //                                     if (err) {
    //                                         res.send(500, "Failed to decrypt accessKey or secretKey");
    //                                         return;
    //                                     }
    //                                     providers[i].accessKey = decryptedKeys[0];
    //                                     providers[i].secretKey = decryptedKeys[1];
    //                                     awsProviderList.push(providers[i]);
    //                                     logger.debug("aws providers>>> ", JSON.stringify(providers));
    //                                 });
    //                             }
    //                             providersList.awsProviders = awsProviderList;
    //                             //providersList.push(awsProviderList);
    //                         } else {
    //                             providersList.awsProviders = [];
    //                             //providersList.push([]);
    //                         }

    //                         openstackProvider.getopenstackProvidersForOrg(orgList, function(err, openstackProviders) {
    //                             if (err) {
    //                                 logger.error(err);
    //                                 res.send(500, errorResponses.db.error);
    //                                 return;
    //                             }

    //                             if (openstackProviders != null) {
    //                                 logger.debug("openstack Providers>>> ", JSON.stringify(openstackProviders));
    //                                 if (openstackProviders.length > 0) {
    //                                     providersList.openstackProviders = openstackProviders;
    //                                     //providersList.push(openstackProviders);
    //                                 }
    //                             } else {
    //                                 providersList.openstackProviders = [];
    //                                 //providersList.push([]);
    //                             }

    //                             vmwareProvider.getvmwareProvidersForOrg(orgList, function(err, vmwareProviders) {
    //                                 if (err) {
    //                                     logger.error(err);
    //                                     res.send(500, errorResponses.db.error);
    //                                     return;
    //                                 }
    //                                 if (vmwareProviders != null) {
    //                                     logger.debug("vmware Providers>>> ", JSON.stringify(vmwareProviders));
    //                                     if (vmwareProviders.length > 0) {
    //                                         providersList.vmwareProviders = vmwareProviders;
    //                                         //providersList.push(vmwareProviders);
    //                                     }
    //                                 } else {
    //                                     providersList.vmwareProviders = [];
    //                                 }


    //                                 hppubliccloudProvider.gethppubliccloudProvidersForOrg(orgList, function(err, hpCloudProviders) {
    //                                     if (err) {
    //                                         logger.error(err);
    //                                         res.send(500, errorResponses.db.error);
    //                                         return;
    //                                     }
    //                                     if (hpCloudProviders != null) {
    //                                         for (var i = 0; i < hpCloudProviders.length; i++) {
    //                                             hpCloudProviders[i]['providerType'] = hpCloudProviders[i]['providerType'].toUpperCase();
    //                                         }
    //                                         logger.debug("providers>>> ", JSON.stringify(hpCloudProviders));
    //                                         if (hpCloudProviders.length > 0) {
    //                                             providersList.hpPlublicCloudProviders = hpCloudProviders;
    //                                             //providersList.push(hpCloudProviders);
    //                                         }
    //                                     } else {
    //                                         providersList.hpPlublicCloudProviders = [];
    //                                         //providersList.push([]);
    //                                     }

    //                                     azurecloudProvider.getAzureCloudProvidersForOrg(orgList, function(err, azureProviders) {

    //                                         if (err) {
    //                                             logger.error(err);
    //                                             res.send(500, errorResponses.db.error);
    //                                             return;
    //                                         }
    //                                         if (azureProviders != null) {
    //                                             for (var i = 0; i < azureProviders.length; i++) {
    //                                                 azureProviders[i]['providerType'] = azureProviders[i]['providerType'].toUpperCase();
    //                                             }
    //                                             logger.debug("providers>>> ", JSON.stringify(providers));
    //                                             if (azureProviders.length > 0) {
    //                                                 providersList.azureProviders = azureProviders;
    //                                                 //providersList.push(azureProviders);
    //                                                 res.send(providersList);
    //                                                 return;
    //                                             }
    //                                         } else {
    //                                             providersList.azureProviders = [];
    //                                             //providersList.push([]);
    //                                             res.send(200, providersList);
    //                                             return;
    //                                         }
    //                                     });

    //                                 });

    //                             });

    //                         });

    //                     });
    //                 } else {
    //                     res.send(200, []);
    //                     return;
    //                 }
    //             });
    //         }
    //     });
    // });


    // // List out all aws nodes.
    // app.post('/aws/providers/node/list', function(req, res) {
    //     logger.debug("Enter List AWS Nodes: ");

    //     var ec2 = new EC2({
    //         "access_key": req.body.accessKey,
    //         "secret_key": req.body.secretKey,
    //         "region": req.body.region
    //     });
    //     ec2.listInstances(function(err, nodes) {
    //         if (err) {
    //             logger.debug("Unable to list nodes from AWS.", err);
    //             res.send("Unable to list nodes from AWS.", 500);
    //             return;
    //         }
    //         logger.debug("Success to list nodes from AWS.");
    //         var nodeList = [];
    //         for (var i = 0; i < nodes.Reservations.length; i++) {
    //             var instance = {
    //                 "instance": nodes.Reservations[i].Instances[0].InstanceId,
    //                 "privateIp": nodes.Reservations[i].Instances[0].PrivateIpAddress,
    //                 "publicIp": nodes.Reservations[i].Instances[0].PublicIpAddress,
    //                 "privateDnsName": nodes.Reservations[i].Instances[0].PrivateDnsName
    //             };
    //             nodeList.push(instance);
    //         }
    //         var nodeListLength = nodeList.length;
    //         logger.debug("I am in count of Total Instances", nodeListLength);
    //         res.send(nodeList);
    //     });
    // });
}