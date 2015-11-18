var AzureCloud = require('_pr/lib/azure');
var logger = require('_pr/logger')(module);
var xml2json = require('xml2json');
var azureProvider = require('_pr/model/classes/masters/cloudprovider/azureCloudProvider.js');
var fs = require('fs');
var appConfig = require('_pr/config');
var Cryptography = require('../lib/utils/cryptography');

//var hppubliccloudProvider = require('_pr/model/classes/masters/cloudprovider/hppublicCloudProvider.js');
//var openstackProvider = require('_pr/model/classes/masters/cloudprovider/openstackCloudProvider.js');

module.exports.setRoutes = function(app, verificationFunc) {

    app.all('/azure/*', verificationFunc);

    app.get('/azure/:id/networks', function(req, res) {

        logger.debug('Inside azure get networks');
        logger.debug('Provider id:', req.params.id);

        azureProvider.getAzureCloudProviderById(req.params.id, function(err, providerdata) {
            if (err) {
                logger.error('getAzureCloudProviderById ' + err);
                return;
            }

            logger.debug('providerdata:', providerdata);
            providerdata = JSON.parse(providerdata);

            var settings = appConfig;
            var pemFile = settings.instancePemFilesDir + providerdata._id + providerdata.pemFileName;
            var keyFile = settings.instancePemFilesDir + providerdata._id + providerdata.keyFileName;

            logger.debug("pemFile path:", pemFile);
            logger.debug("keyFile path:", pemFile);

            var cryptoConfig = appConfig.cryptoSettings;
            var cryptography = new Cryptography(cryptoConfig.algorithm, cryptoConfig.password);

            var decryptedPemFile = pemFile + '_decypted';
            var decryptedKeyFile = keyFile + '_decypted';

            cryptography.decryptFile(pemFile, cryptoConfig.decryptionEncoding, decryptedPemFile, cryptoConfig.encryptionEncoding, function(err) {
                if (err) {
                    logger.error('Pem file decryption failed>> ', err);
                    return;
                }

                cryptography.decryptFile(keyFile, cryptoConfig.decryptionEncoding, decryptedKeyFile, cryptoConfig.encryptionEncoding, function(err) {
                    if (err) {
                        logger.error('key file decryption failed>> ', err);
                        return;
                    }

                    var options = {
                        subscriptionId: providerdata.subscriptionId,
                        certLocation: decryptedPemFile,
                        keyLocation: decryptedKeyFile
                    };

                    var azureCloud = new AzureCloud(options);

                    azureCloud.getNetworks(function(err, networks) {
                        if (err) {
                            logger.error('azurecloud networks fetch error', err);
                            res.send(500, err);
                            return;
                        }
                        var json = xml2json.toJson(networks);
                        res.send(json);
                        logger.debug('Exit azure get networks:' + JSON.stringify(networks));
                        
                        fs.unlink(decryptedPemFile, function(err) {
                            logger.debug("Deleting decryptedPemFile..");
                            if (err) {
                                logger.error("Error in deleting decryptedPemFile..");
                            }

                            fs.unlink(decryptedKeyFile, function(err) {
                                logger.debug("Deleting decryptedKeyFile ..");
                                if (err) {
                                    logger.error("Error in deleting decryptedKeyFile..");
                                }
                            });
                        });
                    });
                });
            });

        });
    });

    app.get('/azure/:id/locations', function(req, res) {

        logger.debug('Inside azure get locations');
        logger.debug('Provider Id:', req.params.id);

        azureProvider.getAzureCloudProviderById(req.params.id, function(err, providerdata) {
            if (err) {
                logger.error('getAzureCloudProviderById ' + err);
                return;
            }

            logger.debug('providerdata:', providerdata);
            providerdata = JSON.parse(providerdata);

            var settings = appConfig;
            var pemFile = settings.instancePemFilesDir + providerdata._id + providerdata.pemFileName;
            var keyFile = settings.instancePemFilesDir + providerdata._id + providerdata.keyFileName;

            logger.debug("pemFile path:", pemFile);
            logger.debug("keyFile path:", keyFile);

            var cryptoConfig = appConfig.cryptoSettings;
            var cryptography = new Cryptography(cryptoConfig.algorithm, cryptoConfig.password);

            var decryptedPemFile = pemFile + '_decypted';
            var decryptedKeyFile = keyFile + '_decypted';

            cryptography.decryptFile(pemFile, cryptoConfig.decryptionEncoding, decryptedPemFile, cryptoConfig.encryptionEncoding, function(err) {
                if (err) {
                    logger.error('Pem file decryption failed>> ', err);
                    return;
                }

                cryptography.decryptFile(keyFile, cryptoConfig.decryptionEncoding, decryptedKeyFile, cryptoConfig.encryptionEncoding, function(err) {
                    if (err) {
                        logger.error('key file decryption failed>> ', err);
                        return;
                    }

                    var options = {
                        subscriptionId: providerdata.subscriptionId,
                        certLocation: decryptedPemFile,
                        keyLocation: decryptedKeyFile
                    };

                    var azureCloud = new AzureCloud(options);

                    azureCloud.getLocations(function(err, locations) {
                        if (err) {
                            logger.error('azurecloud locations fetch error', err);
                            res.send(500, err);
                            return;
                        }
                        var json = xml2json.toJson(locations);
                        res.send(json);
                        logger.debug('Exit azure get locations:' + JSON.stringify(locations));

                        fs.unlink(decryptedPemFile, function(err) {
                            logger.debug("Deleting decryptedPemFile..");
                            if (err) {
                                logger.error("Error in deleting decryptedPemFile..");
                            }

                            fs.unlink(decryptedKeyFile, function(err) {
                                logger.debug("Deleting decryptedKeyFile ..");
                                if (err) {
                                    logger.error("Error in deleting decryptedKeyFile..");
                                }
                            });
                        });
                    });

                });

            });

        });
    });

}