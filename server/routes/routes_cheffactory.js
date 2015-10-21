var masterUtil = require('_pr/lib/utils/masterUtil.js');
var ChefFactory = require('_pr/model/chef-factory');


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
                res.send(500, {
                    message: "Server Behaved Unexpectedly"
                });
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
        chefFactory.downloadFactoryItems(req.body, function(err) {
            if (err) {
                res.send(500, {
                    message: "Server Behaved Unexpectedly"
                });
                return;
            }
            res.send(200, {
                message: "synced"
            });
        });
    });

    app.post('/cheffactory/:serverId/roles/', verificationFunc, function(req, res) {
        var path = req.body.filePath;
        var fileContent = req.body.fileContent;
        var chefFactory = req.chefFactory;
        chefFactory.saveRoleFile(path, fileContent, function(err) {
            if (err) {
                res.send(500, {
                    message: "Server Behaved Unexpectedly"
                });
                return;
            }
            res.send(200);
        });
    });


};