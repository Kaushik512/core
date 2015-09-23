var AzureCloud = require('_pr/lib/azure');
var logger = require('_pr/logger')(module);

//var hppubliccloudProvider = require('_pr/model/classes/masters/cloudprovider/hppublicCloudProvider.js');
//var openstackProvider = require('_pr/model/classes/masters/cloudprovider/openstackCloudProvider.js');

module.exports.setRoutes = function(app, verificationFunc) {

    app.all('/azure/*', verificationFunc);

    app.get('/azure/networks', function(req, res) {
        
        logger.debug('Inside azure get networks');

            var azureCloud = new AzureCloud();

            azureCloud.getNetworks(function(err, networks) {
                if (err) {
                    logger.error('azurecloud networks fetch error', err);
                    res.send(500, err);
                    return;
                }
                res.send(networks);
                logger.debug('Exit azure get networks' + JSON.stringify(networks));
            });
    });

    app.get('/azure/locations', function(req, res) {
        
            logger.debug('Inside azure get locations');

            var azureCloud = new AzureCloud();

            azureCloud.getLocations(function(err, locations) {
                if (err) {
                    logger.error('azurecloud locations fetch error', err);
                    res.send(500, err);
                    return;
                }
                res.send(locations);
                logger.debug('Exit azure get locations' + JSON.stringify(locations));
            });
    });

/*    app.get('/hppubliccloud/:providerid/projects', function(req, res) {

        gethppubliccloudprovider(req.params.providerid, function(err, hppubliccloudconfig) {

            var hppubliccloud = new Hppubliccloud(hppubliccloudconfig);

            hppubliccloud.getProjects(function(err, projects) {
                if (err) {
                    logger.error('hppubliccloud tenants fetch error', err);
                    res.send(500, err.error.message);
                    return;
                }

                res.send(projects);
            });
        });
    });


    app.get('/hppubliccloud/:providerid/tenants', function(req, res) {

        gethppubliccloudprovider(req.params.providerid, function(err, hppubliccloudconfig) {

            var hppubliccloud = new Hppubliccloud(hppubliccloudconfig);

            hppubliccloud.getTenants(function(err, tenants) {
                if (err) {
                    logger.error('hppubliccloud tenants fetch error', err);
                    res.send(500, err.error.message);
                    return;
                }

                res.send(tenants);
            });
        });
    });

    app.get('/hppubliccloud/:providerid/images', function(req, res) {

        gethppubliccloudprovider(req.params.providerid, function(err, hppubliccloudconfig) {

            var hppubliccloud = new Hppubliccloud(hppubliccloudconfig);

            hppubliccloud.getImages(hppubliccloudconfig.tenantid, function(err, images) {
                if (err) {
                    logger.error('hppubliccloud images fetch error', err);
                    res.send(500, err.error.message);
                    return;
                }

                res.send(images);
            });
        });
    });

    app.get('/hppubliccloud/:providerid/:tenantId/servers', function(req, res) {

        gethppubliccloudprovider(req.params.providerid, function(err, hppubliccloudconfig) {

            var hppubliccloud = new Hppubliccloud(hppubliccloudconfig);

            hppubliccloud.getServers(hppubliccloudconfig.tenantid, function(err, servers) {
                if (err) {
                    logger.error('hppubliccloud servers fetch error', err);
                    res.send(500, err);
                    return;
                }

                res.send(servers);
            });
        });
    });

    app.get('/hppubliccloud/:providerid/networks', function(req, res) {
        logger.debug('Inside hppubliccloud get networks');
        gethppubliccloudprovider(req.params.providerid, function(err, hppubliccloudconfig) {

            var hppubliccloud = new Hppubliccloud(hppubliccloudconfig);

            hppubliccloud.getNetworks(function(err, networks) {
                if (err) {
                    logger.error('hppubliccloud networks fetch error', err);
                    res.send(500, err);
                    return;
                }
                res.send(networks);
                logger.debug('Exit hppubliccloud get networks' + JSON.stringify(networks));
            });
        });
    });

    app.get('/hppubliccloud/:providerid/flavors', function(req, res) {
        logger.debug('Inside hppubliccloud get flavors');
        gethppubliccloudprovider(req.params.providerid, function(err, hppubliccloudconfig) {
        	logger.debug('hppubliccloudconfig:',JSON.stringify(hppubliccloudconfig));
            var hppubliccloud = new Hppubliccloud(hppubliccloudconfig);

            hppubliccloud.getFlavors(hppubliccloudconfig.tenantId, function(err, flavors) {
                if (err) {
                    logger.error('hppubliccloud flavors fetch error', err);
                    res.send(500, err);
                    return;
                }

                res.send(flavors);
                logger.debug('Exit hppubliccloud get flavors' + JSON.stringify(flavors));
            });
        });
    });

    app.get('/hppubliccloud/:providerid/securityGroups', function(req, res) {
        logger.debug('Inside hppubliccloud get securityGroups');
        gethppubliccloudprovider(req.params.providerid, function(err, hppubliccloudconfig) {

            var hppubliccloud = new Hppubliccloud(hppubliccloudconfig);

            hppubliccloud.getSecurityGroups(function(err, securityGroups) {
                if (err) {
                    logger.error('hppubliccloud securityGroups fetch error', err);
                    res.send(500, err);
                    return;
                }

                res.send(securityGroups);
                logger.debug('Exit hppubliccloud get securityGroups' + JSON.stringify(securityGroups));
            });
        });
    });

    app.post('/hppubliccloud/:providerid/:tenantId/createServer', function(req, res) {

        gethppubliccloudprovider(req.params.providerid, function(err, hppubliccloudconfig) {
            logger.debug('hppubliccloudconfig', hppubliccloudconfig);
            var hppubliccloud = new Hppubliccloud(hppubliccloudconfig);

            var json = "{\"server\": {\"name\": \"server-testa\",\"imageRef\": \"0495d8b6-1746-4e0d-a44e-010e41db0caa\",\"flavorRef\": \"2\",\"max_count\": 1,\"min_count\": 1,\"networks\": [{\"uuid\": \"a3bf46aa-20fa-477e-a2e5-e3d3a3ea1122\"}],\"security_groups\": [{\"name\": \"default\"}]}}";
            
            hppubliccloud.createServer(hppubliccloudconfig.tenantId, json, function(err, data) {
                if (err) {
                    logger.error('hppubliccloud createServer error', err);
                    res.send(500, err);
                    return;
                }

                res.send(data);
            });
        });

    });

    app.get('/hppubliccloud/:providerid/tenants/:tenantId/servers/:serverId', function(req, res) {

        gethppubliccloudprovider(req.params.providerid, function(err, hppubliccloudconfig) {

            var hppubliccloud = new Hppubliccloud(hppubliccloudconfig);
            console.log("serverId:", req.params.serverId);

            hppubliccloud.getServerById(req.params.tenantId, req.params.serverId, function(err, data) {
                if (err) {
                    logger.error('hppubliccloud createServer error', err);
                    res.send(500, err);
                    return;
                }

                res.send(data);
            });

        });
    });*/

}