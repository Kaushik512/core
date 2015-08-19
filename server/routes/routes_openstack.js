var Openstack = require('../lib/openstack');
var logger = require('_pr/logger')(module);

module.exports.setRoutes = function(app, verificationFunc) {

	app.all('/openstack/*', verificationFunc);

	var getopenstackprovider = function(providerid,callback){

        var host = "192.168.102.12";
        var username = "admin";
        var password = "ADMIN_PASS";
        var tenantName = "admin";

	    var openstackconfig = {host: host,username: username, password: password, tenantName: tenantName};
        callback(null,openstackconfig);
    }

	app.get('/openstack/projects', function(req, res) {
     
	    getopenstackprovider(req.params.providerid,function(err,openstackconfig){
	     
	        var openstack = new Openstack(openstackconfig);

	        openstack.getProjects(function(err,projects){
	        	if(err){
	                 logger.error('openstack tenants fetch error', err);
	                 res.send(500,err.error.message);
	                 return;
	        	}
	            
				res.send(projects);
			});
		});	
    });


	app.get('/openstack/tenants', function(req, res) {
     
	     getopenstackprovider(req.params.providerid,function(err,openstackconfig){
	     
	        var openstack = new Openstack(openstackconfig);

	        openstack.getTenants(function(err,tenants){
	        	if(err){
	                 logger.error('openstack tenants fetch error', err);
	                 res.send(500,err.error.message);
	                 return;
	        	}
	            
				res.send(tenants);
			});
		});	
    });

    app.get('/openstack/images', function(req, res) {

     getopenstackprovider(req.params.providerid,function(err,openstackconfig){

        var openstack = new Openstack(openstackconfig);

        openstack.getImages(req.params.tenantId,function(err,images){
        	if(err){
                 logger.error('openstack images fetch error', err);
                 res.send(500,err.error.message);
                 return;
        	}
            
			res.send(images);
		});
	  });	
    });

    app.get('/openstack/servers', function(req, res) {

      getopenstackprovider(req.params.providerid,function(err,openstackconfig){
      
        var openstack = new Openstack(openstackconfig);

        openstack.getServers(req.params.tenantId,function(err,servers){
        	if(err){
                 logger.error('openstack servers fetch error', err);
                 res.send(500,err);
                 return;
        	}
            
			res.send(servers);
		});
	  });	
    });

    app.get('/openstack/networks', function(req, res) {

       getopenstackprovider(req.params.providerid,function(err,openstackconfig){

	        var openstack = new Openstack(openstackconfig);

	        openstack.getNetworks(function(err,networks){
	        	if(err){
	                 logger.error('openstack networks fetch error', err);
	                 res.send(500,err);
	                 return;
	        	}
	            
				res.send(networks);
			});
	     });	
    });

    app.get('/openstack/flavors', function(req, res) {

      getopenstackprovider(req.params.providerid,function(err,openstackconfig){

	        var openstack = new Openstack(openstackconfig);

	        openstack.getFlavors(req.params.tenantId,function(err,flavors){
	        	if(err){
	                 logger.error('openstack flavors fetch error', err);
	                 res.send(500,err);
	                 return;
	        	}
	            
				res.send(flavors);
			});
	  });
    });

    app.get('/openstack/securityGroups', function(req, res) {

        getopenstackprovider(req.params.providerid,function(err,openstackconfig){

	        var openstack = new Openstack(openstackconfig);

	        openstack.getSecurityGroups(function(err,securityGroups){
	        	if(err){
	                 logger.error('openstack securityGroups fetch error', err);
	                 res.send(500,err);
	                 return;
	        	}
	            
				res.send(securityGroups);
			});
	    });
    });

    app.post('/openstack/createServer',function(req,res){
        
      getopenstackprovider(req.params.providerid,function(err,openstackconfig){

	        var openstack = new Openstack(openstackconfig);
           
            var json= "{\"server\": {\"name\": \"server-testa\",\"imageRef\": \"0495d8b6-1746-4e0d-a44e-010e41db0caa\",\"flavorRef\": \"2\",\"max_count\": 1,\"min_count\": 1,\"networks\": [{\"uuid\": \"a3bf46aa-20fa-477e-a2e5-e3d3a3ea1122\"}],\"security_groups\": [{\"name\": \"default\"}]}}";

	        openstack.createServer(req.params.tenantId,json,function(err,securityGroups){
	        	if(err){
	                 logger.error('openstack securityGroups fetch error', err);
	                 res.send(500,err);
	                 return;
	        	}
	            
				res.send(securityGroups);
			});
	    });
         
    });

}