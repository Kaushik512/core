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
            logger.debug('Exit azure get networks:' + JSON.stringify(networks));
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
            logger.debug('Exit azure get locations:' + JSON.stringify(locations));
        });
    });

}