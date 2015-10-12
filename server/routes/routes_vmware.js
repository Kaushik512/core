
var VMware = require('_pr/lib/vmware');
var logger = require('_pr/logger')(module);
var vmwareCloudProvider = require('_pr/model/classes/masters/cloudprovider/vmwareCloudProvider.js');
var appConfig = require('_pr/config');

module.exports.setRoutes = function(app, verificationFunc) {

	app.all('/vmware/*', verificationFunc);

    var getvmwareprovider = function(providerid, callback) {

        var host = "192.168.102.12";
        var username = "admin";
        var password = "ADMIN_PASS";
        var dc = "DC1";
        var servicehost = "http://192.168.102.43:3000";
        var vmwareconfig = {
            host: host,
            username: username,
            password: password,
            dc:dc,
            serviceHost:servicehost
        };

        vmwareCloudProvider.getvmwareProviderById(providerid, function(err, data) {
            logger.debug('IN getvmwareProviderById: data: ');
            logger.debug(JSON.stringify(data));
            logger.debug('------------------------');
            vmwareconfig.host = data.host;
            vmwareconfig.username = data.username;
            vmwareconfig.password = data.password;
            vmwareconfig.dc = data.dc;
            vmwareconfig.serviceHost = appConfig.vmware.serviceHost;
            logger.debug('IN getvmwareProviderById: vmwareconfig: ');
            logger.debug(JSON.stringify(appConfig.vmware));
            logger.debug(JSON.stringify(vmwareconfig));
            //  data.tenantName = "demo";
            callback(null, vmwareconfig);
        });

    }

	app.get('/vmware/:providerid/datastores', function(req, res) {

        logger.debug('Inside vmware get datastores');
        getvmwareprovider(req.params.providerid,function(err,vmwareconfig){
            var vmware = new VMware(vmwareconfig);
            vmware.getDatastores(vmwareconfig.serviceHost,function(err,data){
                console.log('Recvd:',JSON.stringify(data));
            });

        });

    });

	

}