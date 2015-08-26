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
            // Top: {
            //     "_id": "55dda6f57a26104016f74665",
            //     "puppetservername": "puppet aws",
            //     "username": "ubuntu",
            //     "userpemfile_filename": "cat_instances.pem",
            //     "rowid": "842ef96d-87fa-4c8b-9193-5399bdd16cb2",
            //     "id": "25",
            //     "folderpath": "/46d1da9a-d927-41dc-8e9e-7e926d927537/ubuntu/.puppet/",
            //     "configType": "puppet",
            //     "__v": 0,
            //     "active": true,
            //     "orgname_rowid": ["46d1da9a-d927-41dc-8e9e-7e926d927537"],
            //     "orgname": ["Phoenix"]
            // }
            var puppetSettings = {
                host: puppetData.hostname,
                username: puppetData.username,
            };


            if (puppetData.userpemfile_filename) {
                puppetSettings.pemFileLocation = appConfig.puppet.puppetReposLocation + puppetData.folderpath + puppetData.userpemfile_filename
            } else {
                puppetSettings.pemFileLocation = puppetData.user_password;
            }
            console.log( 'puppet pemfile ==> '+puppetSettings.pemFileLocation);
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

    app.post('/puppet/environments', function(req, res) {
        var puppet = new Puppet({
            host: '52.27.204.155',
            port: 8140,
            username: 'ubuntu',
            pemFileLocation: '/home/gobinda/Gobinda/Work/AllPemFiles/cat_instances.pem'
        });

        puppet.createEnvironment(req.body.envName, function(err, data) {
            if (err) {
                res.send(500, err);
                return;
            }
            res.send(200, data);
        });

    });
    app.get('/puppet/nodes', function(req, res) {
        var puppet = new Puppet({
            host: '52.27.204.155',
            port: 8140,
            username: 'ubuntu',
            pemFileLocation: '/WORK/D4D/server/config/cat_instances.pem',
            ca: '/WORK/nodetest/ssl/ca/ca_crt.pem',
            cert: '/WORK/nodetest/ssl/certs/ip-172-31-19-103.us-west-2.compute.internal.pem',
            key: '/WORK/nodetest/ssl/private_keys/ip-172-31-19-103.us-west-2.compute.internal.pem'
        });

        puppet.getNodesList(function(err, data) {
            if (err) {
                res.send(500, err);
                return;
            }
            res.send(200, data);
        });
    });


    app.get('/puppet/nodes/:nodeName', function(req, res) {
        var puppet = new Puppet({
            host: '52.27.204.155',
            port: 8140,
            username: 'ubuntu',
            pemFileLocation: '/WORK/D4D/server/config/cat_instances.pem',
            ca: '/WORK/nodetest/ssl/ca/ca_crt.pem',
            cert: '/WORK/nodetest/ssl/certs/ip-172-31-19-103.us-west-2.compute.internal.pem',
            key: '/WORK/nodetest/ssl/private_keys/ip-172-31-19-103.us-west-2.compute.internal.pem'
        });

        puppet.getNode(req.params.nodeName, function(err, data) {
            if (err) {
                res.send(500, err);
                return;
            }
            res.send(200, data);
        });
    });

    app.get('/puppet/config', function(req, res) {
        var puppet = new Puppet({
            host: '52.27.204.155',
            port: 8140,
            username: 'ubuntu',
            pemFileLocation: '/WORK/D4D/server/config/cat_instances.pem',
            ca: '/WORK/nodetest/ssl/ca/ca_crt.pem',
            cert: '/WORK/nodetest/ssl/certs/ip-172-31-19-103.us-west-2.compute.internal.pem',
            key: '/WORK/nodetest/ssl/private_keys/ip-172-31-19-103.us-west-2.compute.internal.pem'
        });

        puppet.getPuppetConfig(function(err, data) {
            if (err) {
                res.send(500, err);
                return;
            }
            res.send(200, data);
        });
    });

    app.get('/puppet/bootstrap', function(req, res) {
        var puppet = new Puppet({
            host: '52.27.204.155',
            port: 8140,
            username: 'ubuntu',
            pemFileLocation: '/WORK/D4D/server/config/cat_instances.pem',
            // host: '192.168.101.34',
            // port: 8140,
            // username: 'root',
            // password: 'Temperance123',
            ca: '/WORK/nodetest/ssl/ca/ca_crt.pem',
            cert: '/WORK/nodetest/ssl/certs/ip-172-31-19-103.us-west-2.compute.internal.pem',
            key: '/WORK/nodetest/ssl/private_keys/ip-172-31-19-103.us-west-2.compute.internal.pem'
        });

        puppet.bootstrap({
            host: '52.24.65.185',
            port: 8140,
            username: 'ubuntu',
            pemFileLocation: '/WORK/D4D/server/config/cat_instances.pem',
            environment: "anshul"
            //host: '192.168.101.21',
            // port: 8140,
            // username: 'root',
            // password: 'Temperance123',
        }, function(err, data) {
            if (err) {
                res.send(500, err);
                return;
            }
            res.send(200, data);
        });
    });
};