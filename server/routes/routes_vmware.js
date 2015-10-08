
var Openstack = require('_pr/lib/openstack');
var logger = require('_pr/logger')(module);
var openstackProvider = require('_pr/model/classes/masters/cloudprovider/openstackCloudProvider.js');

module.exports.setRoutes = function(app, verificationFunc) {

	app.all('/vmware/*', verificationFunc);

	var getopenstackprovider = function(providerid,callback){

        var host = "192.168.102.12";
        var username = "admin";
        var password = "ADMIN_PASS";
        var tenantName = "demo";
        var tenantid = "64371fa53f804417900e32c367d800b9";
	    var openstackconfig = {host: host,username: username, password: password, tenantName: tenantName,tenantId: tenantid};

	    
        
    }

	

}