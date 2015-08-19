var Openstack = require('_pr/lib/openstack');
var logger = require('_pr/logger')(module);

module.exports.setRoutes = function(app, verificationFunc) {

	app.all('/openstack/*', verificationFunc);




	app.get('/openstack/tenants', function(req, res) {

        //Openstack settings API should give host,username,password and default tenantName 
        var openstack = new Openstack({host: host,username: username, password: password, tenantName: tenantName});

        openstack.getTenants(function(err,tenants){
        	if(err){
                 logger.error('openstack tenants fetch error', err);
                 res.send(500,err.error.message);
                 return;
        	}
            
			res.send(tenants);
		});
    });

    


    app.get('/openstack/images', function(req, res) {

        //Openstack settings API should give host,username,password and default tenantName 
        var openstack = new Openstack({host: host,username: username, password: password, tenantName: tenantName});
        
        
    });

    app.get('/openstack/servers', function(req, res) {

        //Openstack settings API should give host,username,password and default tenantName 
        var openstack = new Openstack({host: host,username: username, password: password, tenantName: tenantName});

        openstack.getServers(function(err,servers){
        	if(err){
                 logger.error('openstack servers fetch error', err);
                 res.send(500,err);
                 return;
        	}
            
			res.send(servers);
		});
    });

    app.get('/openstack/networks', function(req, res) {

        //Openstack settings API should give host,username,password and default tenantName 
        var openstack = new Openstack({host: host,username: username, password: password, tenantName: tenantName});

        openstack.getNetworks(function(err,networks){
        	if(err){
                 logger.error('openstack networks fetch error', err);
                 res.send(500,err);
                 return;
        	}
            
			res.send(networks);
		});
    });

    app.get('/openstack/flavors', function(req, res) {

        //Openstack settings API should give host,username,password and default tenantName 
        var openstack = new Openstack({host: host,username: username, password: password, tenantName: tenantName});

        openstack.getNetworks(function(err,flavors){
        	if(err){
                 logger.error('openstack flavors fetch error', err);
                 res.send(500,err);
                 return;
        	}
            
			res.send(flavors);
		});
    });

    app.get('/openstack/securityGroups', function(req, res) {

        //Openstack settings API should give host,username,password and default tenantName 
        var openstack = new Openstack({host: host,username: username, password: password, tenantName: tenantName});

        openstack.getSecurityGroups(function(err,securityGroups){
        	if(err){
                 logger.error('openstack securityGroups fetch error', err);
                 res.send(500,err);
                 return;
        	}
            
			res.send(securityGroups);
		});
    });

}