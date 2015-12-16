
var Openstack = require('_pr/lib/openstack');
var logger = require('_pr/logger')(module);
var openstackProvider = require('_pr/model/classes/masters/cloudprovider/openstackCloudProvider.js');

module.exports.setRoutes = function(app, verificationFunc) {

	app.all('/openstack/*', verificationFunc);

	var getopenstackprovider = function(providerid,callback){

        var host = "192.168.102.12";
        var username = "admin";
        var password = "ADMIN_PASS";
        var tenantName = "demo";
        var tenantid = "64371fa53f804417900e32c367d800b9";
	    var openstackconfig = {
            host: host,
            username: username,
            password: password,
            tenantName: tenantName,
            tenantId: tenantid,
            serviceendpoints: {
            }
        };

	    openstackProvider.getopenstackProviderById(providerid,function(err,data){
	    		logger.debug('IN getopenstackProviderById: data: ');
	    		logger.debug(JSON.stringify(data));
	    		logger.debug('------------------------');
	    		openstackconfig.host = data.host;
	    		openstackconfig.username = data.username;
	    		openstackconfig.password = data.password;
	    		openstackconfig.tenantName = data.tenantname;
	    		openstackconfig.tenantId = data.tenantid;
	    		openstackconfig.serviceendpoints = data.serviceendpoints;
	    		logger.debug('IN getopenstackProviderById: openstackconfig: ');
	    		logger.debug(JSON.stringify(openstackconfig));
	    	//	data.tenantName = "demo";
	    		callback(null,openstackconfig);
	    });
        
    }

	app.get('/openstack/:providerid/projects', function(req, res) {
     
	    getopenstackprovider(req.params.providerid,function(err,openstackconfig){
	     
	        var openstack = new Openstack(openstackconfig);

	        openstack.getProjects(function(err,projects){
	        	if(err){
	                 logger.error('openstack tenants fetch error', err);
	                 res.status(500).send(err.error.message);
	                 return;
	        	}
	            
				res.send(projects);
			});
		});	
    });


	app.get('/openstack/:providerid/tenants', function(req, res) {
     
	     getopenstackprovider(req.params.providerid,function(err,openstackconfig){
	     
	        var openstack = new Openstack(openstackconfig);

	        openstack.getTenants(function(err,tenants){
	        	if(err){
	                 logger.error('openstack tenants fetch error', err);
	                 res.status(500).send(err.error.message);
	                 return;
	        	}
	            
				res.send(tenants);
			});
		});	
    });

    app.get('/openstack/:providerid/images', function(req, res) {

     getopenstackprovider(req.params.providerid,function(err,openstackconfig){

        var openstack = new Openstack(openstackconfig);

        openstack.getImages(openstackconfig.tenantid,function(err,images){
        	if(err){
                 logger.error('openstack images fetch error', err);
                 res.status(500).send(err.error.message);
                 return;
        	}
            
			res.send(images);
		});
	  });	
    });

    app.get('/openstack/:providerid/:tenantId/servers', function(req, res) {

      getopenstackprovider(req.params.providerid,function(err,openstackconfig){
      
        var openstack = new Openstack(openstackconfig);

        openstack.getServers(openstackconfig.tenantid,function(err,servers){
        	if(err){
                 logger.error('openstack servers fetch error', err);
                 res.status(500).send(err);
                 return;
        	}
            
			res.send(servers);
		});
	  });	
    });

    app.get('/openstack/:providerid/networks', function(req, res) {
    	logger.debug('Inside openstack get networks:');
       getopenstackprovider(req.params.providerid,function(err,openstackconfig){

	        var openstack = new Openstack(openstackconfig);
	        if(openstackconfig.serviceendpoints.network){
		        openstack.getNetworks(function(err,networks){
		        	if(err){
		                 logger.error('openstack networks fetch error', err);
		                 res.status(500).send(err);
		                 return;
		        	}
					res.send(networks);
					logger.debug('Exit openstack get networks' + JSON.stringify(networks));
				});
			}
			else{
				res.send([]);
			}
	     });	
    });

    app.get('/openstack/:providerid/flavors', function(req, res) {
    	logger.debug('Inside openstack get flavors');
      getopenstackprovider(req.params.providerid,function(err,openstackconfig){

	        var openstack = new Openstack(openstackconfig);

	        openstack.getFlavors(openstackconfig.tenantId,function(err,flavors){
	        	if(err){
	                 logger.error('openstack flavors fetch error', err);
	                 res.status(500).send(err);
	                 return;
	        	}
	            
				res.send(flavors);
				logger.debug('Exit openstack get flavors' + JSON.stringify(flavors));
			});
	  });
    });

    app.get('/openstack/:providerid/securityGroups', function(req, res) {
    	//logger.debug('Inside openstack get securityGroups',JSON.stringify(openstackconfig));

        getopenstackprovider(req.params.providerid,function(err,openstackconfig){

	        var openstack = new Openstack(openstackconfig);
	        if(openstackconfig.serviceendpoints.network){
		        openstack.getSecurityGroups(function(err,securityGroups){
		        	if(err){
		                 logger.error('openstack securityGroups fetch error', err);
		                 res.status(500).send(err);
		                 return;
		        	}
		            
					res.send(securityGroups);
					logger.debug('Exit openstack get securityGroups' + JSON.stringify(securityGroups));
				});
	    	}
	    	else{
	    		res.send([]);
	    	}
	    });
    });

    app.post('/openstack/:providerid/:tenantId/createServer',function(req,res){
        
      getopenstackprovider(req.params.providerid,function(err,openstackconfig){
			logger.debug('Openstackconfig',openstackconfig);
	        var openstack = new Openstack(openstackconfig);
           
            var json= "{\"server\": {\"name\": \"server-testa\",\"imageRef\": \"0495d8b6-1746-4e0d-a44e-010e41db0caa\",\"flavorRef\": \"2\",\"max_count\": 1,\"min_count\": 1,\"networks\": [{\"uuid\": \"a3bf46aa-20fa-477e-a2e5-e3d3a3ea1122\"}],\"security_groups\": [{\"name\": \"default\"}]}}";

	        openstack.createServer(openstackconfig.tenantId,json,function(err,data){
	        	if(err){
	                 logger.error('openstack createServer error', err);
	                 res.status(500).send(err);
	                 return;
	        	}
	            
				res.send(data);
			});
	    });
         
    });

    app.get('/openstack/:providerid/tenants/:tenantId/servers/:serverId',function(req,res){
     
      getopenstackprovider(req.params.providerid,function(err,openstackconfig){

      	var openstack = new Openstack(openstackconfig);
        logger.debug("serverId:",req.params.serverId);

        openstack.getServerById(req.params.tenantId, req.params.serverId, function(err,data){
      		 if(err){
      		 	logger.error('openstack createServer error', err);
	            res.status(500).send(err);
	            return;
      		 }

      		 res.send(data);
      	});

      });
    });

}
