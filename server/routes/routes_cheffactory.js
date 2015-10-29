var masterUtil = require('_pr/lib/utils/masterUtil.js');
var ChefFactory = require('_pr/model/chef-factory');
var longJobTracker = require('../model/long-job-tracker');
var logger = require('_pr/logger')(module);

module.exports.setRoutes = function(app, verificationFunc) {

    app.all('/cheffactory/*', verificationFunc);

    app.all('/cheffactory/:serverId/*', function(req, res, next) {

        masterUtil.getCongifMgmtsById(req.params.serverId, function(err, infraManagerDetails) {
            if (err) {
                res.send(500, {
                    message: "Server Behaved Unexpectedly"
                });
                return;
            }
            if (!infraManagerDetails) {
                res.send(404, {
                    "message": "Infra manager not found"
                });
                return;
            }
            if (infraManagerDetails.configType === 'chef') {
                var chefFactory = new ChefFactory({
                    userChefRepoLocation: infraManagerDetails.chefRepoLocation,
                    chefUserName: infraManagerDetails.loginname,
                    chefUserPemFile: infraManagerDetails.userpemfile,
                    chefValidationPemFile: infraManagerDetails.validatorpemfile,
                    hostedChefUrl: infraManagerDetails.url
                });
                req.chefFactory = chefFactory;
                next();
            } else {
                res.send(404, {
                    "message": "Infra manager not supported"
                });
                return;
            }

        });

    });

    app.get('/cheffactory/:serverId/sync', function(req, res) {
        var chefFactory = req.chefFactory;
        chefFactory.sync(function(err, cookbooks) {
            if (err) {
                res.send(500, {
                    message: "Server Behaved Unexpectedly"
                });
                return;
            }
            res.send(200, cookbooks);
        });
    });

    app.get('/cheffactory/:serverId/cookbooks/', verificationFunc, function(req, res) {
        var path = req.query.path;
        var chefFactory = req.chefFactory;
        chefFactory.getCookbookData(path, function(err, cookbookData) {
            if (err) {
                res.send(500, {
                    message: "Server Behaved Unexpectedly"
                });
                return;
            }
            res.send(200, cookbookData);
        });
    });

    app.post('/cheffactory/:serverId/cookbooks/', verificationFunc, function(req, res) {
        var path = req.body.filePath;
        var fileContent = req.body.fileContent;
        var chefFactory = req.chefFactory;
        chefFactory.saveCookbookFile(path, fileContent, function(err) {
            if (err) {
                logger.debug(err);
                var errRespJson = {
                    message: "Server Behaved Unexpectedly",
                };
                if (err.stdErrMsg) {
                    errRespJson.stdErrMsg = err.stdErrMsg;
                }
                res.send(500, errRespJson);
                return;
            }
            res.send(200);
        });
    });

    app.get('/cheffactory/:serverId/roles/', verificationFunc, function(req, res) {
        var path = req.query.path;
        var chefFactory = req.chefFactory;
        chefFactory.getRoleData(path, function(err, cookbookData) {
            if (err) {
                res.send(500, {
                    message: "Server Behaved Unexpectedly"
                });
                return;
            }
            res.send(200, cookbookData);
        });
    });

    app.post('/cheffactory/:serverId/roles/', verificationFunc, function(req, res) {
        var path = req.body.filePath;
        var fileContent = req.body.fileContent;
        var chefFactory = req.chefFactory;
        chefFactory.saveRoleFile(path, fileContent, function(err) {
            if (err) {
                logger.error(err);
                var errRespJson = {
                    message: "Server Behaved Unexpectedly",
                };
                if (err.stdErrMsg) {
                    errRespJson.stdErrMsg = err.stdErrMsg;
                }
                res.send(500, errRespJson);
                return;
            }
            res.send(200);
        });
    });


    app.get('/cheffactory/:serverId/factoryItems/', verificationFunc, function(req, res) {
        var path = req.query.path;
        var chefFactory = req.chefFactory;
        chefFactory.getFactoryItems(function(err, factoryItems) {
            if (err) {
                res.send(500, {
                    message: "Server Behaved Unexpectedly"
                });
                return;
            }
            res.send(200, factoryItems);
        });
    });

    app.post('/cheffactory/:serverId/factoryItems/sync', verificationFunc, function(req, res) {
        var path = req.query.path;
        var chefFactory = req.chefFactory;

        var cookbookCount = 0;
        var roleCount = 0;
        var cookbooks = req.body.cookbooks;
        var roles = req.body.roles;
        var jobTracker;

        if (!((cookbooks && cookbooks.length) || (roles && roles.length))) {
            res.send(400, {
                message: "cookbooks/roles list is empty"
            });
            return;
        }



        function downloadCookbook(cookbookName) {
            chefFactory.downloadFactoryItem(cookbookName, 'cookbook', function(err) {
                cookbookCount++;
                var jobStatus;
                if (err) {
                    jobStatus = {
                        itemName: cookbookName,
                        itemType: 'cookbook',
                        error: true,
                        message: "Unable to download cookbook : " + cookbookName
                    };
                } else {
                    jobStatus = {
                        itemName: cookbookName,
                        itemType: 'cookbook',
                        error: false,
                        message: "Cookbook downloaded : " + cookbookName
                    };
                }
                if (cookbooks.length === cookbookCount) {
                    if (roles && roles.length) {
                        jobTracker.updateTaskStatus(jobStatus);
                        downloadRole(roles[roleCount]);
                    } else {
                        jobTracker.endTaskStatus(true, jobStatus);
                    }
                } else {
                    // updating
                    jobTracker.updateTaskStatus(jobStatus);
                    downloadCookbook(cookbooks[cookbookCount]);
                }
            });
        }

        function downloadRole(roleName) {
            chefFactory.downloadFactoryItem(roleName, 'role', function(err) {
                roleCount++;
                var jobStatus;
                if (err) {
                    jobStatus = {
                        itemName: roleName,
                        itemType: 'role',
                        error: true,
                        message: "Unable to download role : " + roleName
                    };
                } else {
                    jobStatus = {
                        itemName: roleName,
                        itemType: 'role',
                        error: false,
                        message: "Role downloaded: " + roleName
                    };
                }
                if (roles.length === roleCount) {
                    jobTracker.endTaskStatus(true, jobStatus);
                } else {
                    jobTracker.updateTaskStatus(jobStatus);
                    downloadRole(roles[roleCount]);
                }
            });
        }


        longJobTracker.getTaskStatus(null, function(err, obj) {
            if (err) {
                res.send(500, {
                    message: "unable to initialize Job tracker"
                });
                return;
            }
            jobTracker = obj;
            if (cookbooks && cookbooks.length) {
                downloadCookbook(cookbooks[cookbookCount]);
            } else if (roles && roles.length) {
                downloadRole(roles[roleCount]);
            }
            res.send(200, {
                jobId: jobTracker.getTaskId()
            });
        });


    });



};