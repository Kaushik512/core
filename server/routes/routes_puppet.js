var Puppet = require('_pr/lib/puppet.js');

module.exports.setRoutes = function(app, verificationFunc) {
    app.get('/puppet/environments', function(req, res) {
        var puppet = new Puppet({
            host: '52.27.204.155',
            port: 8140,
            username: 'ubuntu',
            pemFileLocation: '/WORK/D4D/server/config/cat_instances.pem',
            ca: '/WORK/nodetest/ssl/ca/ca_crt.pem',
            cert: '/WORK/nodetest/ssl/certs/ip-172-31-19-103.us-west-2.compute.internal.pem',
            key: '/WORK/nodetest/ssl/private_keys/ip-172-31-19-103.us-west-2.compute.internal.pem'
        });

        puppet.getEnvironments(function(err, data) {
            if (err) {
                res.send(500, err);
                return;
            }
            res.send(200, data);
        });
    });

    app.post('/puppet/environments', function(req, res) {
        var puppet = new Puppet({
            host: '52.27.204.155',
            port: 8140,
            username: 'ubuntu',
            pemFileLocation: '/WORK/D4D/server/config/cat_instances.pem',
            ca: '/WORK/nodetest/ssl/ca/ca_crt.pem',
            cert: '/WORK/nodetest/ssl/certs/ip-172-31-19-103.us-west-2.compute.internal.pem',
            key: '/WORK/nodetest/ssl/private_keys/ip-172-31-19-103.us-west-2.compute.internal.pem'
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
            host: '192.168.101.34',
            port: 8140,
            username: 'root',
            password: 'Temperance123',
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
            host: '192.168.101.34', //'52.27.204.155',
            port: 22,
            username: 'root',
            password: 'Temperance123',
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
            host: '192.168.101.34', //'52.27.204.155',
            port: 22,
            username: 'root',
            password: 'Temperance123',
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
};