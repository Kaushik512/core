var Puppet = require('_pr/lib/puppet.js');
var masterUtil = require('_pr/lib/utils/masterUtil');
var errorResponses = require('./error_responses');
var appConfig = require('_pr/config');

module.exports.setRoutes = function(app, verificationFunc) {
    app.get('/puppet/:puppetServerId/environments', function(req, res) {

        masterUtil.getCongifMgmtsById(req.params.puppetServerId, function(err, puppetData) {
            if (err) {
                res.send(500, errorResponses.db.error);
                return;
            }
            console.log('puppet db ==> ', puppetData);
            if (!puppetData || puppetData.configType !== 'puppet') {
                res.send(404, {
                    message: "puppet server not found"
                })
            }

            var puppetSettings = {
                host: puppetData.hostname,
                username: puppetData.username,
            };
            if (puppetData.pemFileLocation) {
                puppetSettings.pemFileLocation = puppetData.pemFileLocation;
            } else {
                puppetSettings.password = puppetData.puppetpassword;
            }
            console.log('puppet pemfile ==> ' + puppetSettings.pemFileLocation);
            var puppet = new Puppet(puppetSettings);
            puppet.getEnvironments(function(err, data) {
                if (err) {
                    res.send(500, err);
                    return;
                }
                res.send(200, data);
            });
        });

    });

    app.post('/puppet/:puppetServerId/environments', function(req, res) {
        masterUtil.getCongifMgmtsById(req.params.puppetServerId, function(err, puppetData) {
            if (err) {
                res.send(500, errorResponses.db.error);
                return;
            }
            console.log('puppet db ==> ', puppetData);
            if (!puppetData || puppetData.configType !== 'puppet') {
                res.send(404, {
                    message: "puppet server not found"
                })
            }

            var puppetSettings = {
                host: puppetData.hostname,
                username: puppetData.username,
            };
            if (puppetData.pemFileLocation) {
                puppetSettings.pemFileLocation = puppetData.pemFileLocation;

            } else {
                puppetSettings.password = puppetData.puppetpassword;
            }
            console.log('puppet pemfile ==> ' + puppetSettings.pemFileLocation);
            var puppet = new Puppet(puppetSettings);
            puppet.createEnvironment(req.body.envName, function(err, data) {
                if (err) {
                    res.send(500, err);
                    return;
                }
                res.send(200, data);
            });
        });
    });


    app.get('/puppet/:puppetServerId/nodes', function(req, res) {
        masterUtil.getCongifMgmtsById(req.params.puppetServerId, function(err, puppetData) {
            if (err) {
                res.send(500, errorResponses.db.error);
                return;
            }
            console.log('puppet db ==> ', puppetData);
            if (!puppetData || puppetData.configType !== 'puppet') {
                res.send(404, {
                    message: "puppet server not found"
                })
            }

            var puppetSettings = {
                host: puppetData.hostname,
                username: puppetData.username,
            };
            if (puppetData.pemFileLocation) {
                puppetSettings.pemFileLocation = puppetData.pemFileLocation;
            } else {
                puppetSettings.password = puppetData.puppetpassword;
            }
            console.log('puppet pemfile ==> ' + puppetSettings.pemFileLocation);
            var puppet = new Puppet(puppetSettings);
            puppet.getNodesList(function(err, data) {
                if (err) {
                    res.send(500, err);
                    return;
                }
                res.send(200, data);
            });
        });

    });


    app.get('/puppet/:puppetServerId/nodes/:nodeName', function(req, res) {
        masterUtil.getCongifMgmtsById(req.params.puppetServerId, function(err, puppetData) {
            if (err) {
                res.send(500, errorResponses.db.error);
                return;
            }
            console.log('puppet db ==> ', puppetData);
            if (!puppetData || puppetData.configType !== 'puppet') {
                res.send(404, {
                    message: "puppet server not found"
                })
            }

            var puppetSettings = {
                host: puppetData.hostname,
                username: puppetData.username,
            };
            if (puppetData.pemFileLocation) {
                puppetSettings.pemFileLocation = puppetData.pemFileLocation;
            } else {
                puppetSettings.password = puppetData.puppetpassword;
            }
            console.log('puppet pemfile ==> ' + puppetSettings.pemFileLocation);
            var puppet = new Puppet(puppetSettings);
            puppet.getNode(req.params.nodeName, function(err, data) {
                if (err) {
                    res.send(500, err);
                    return;
                }
                res.send(200, data);
            });
        });



    });

};