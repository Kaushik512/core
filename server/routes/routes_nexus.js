/* Copyright (C) Relevance Lab Private Limited- All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Gobinda Das <gobinda.das@relevancelab.com>, 
 * Oct 2015
 */

// This file act as a controller for nexus.

var nexus = require('../lib/nexus.js');
var logger = require('_pr/logger')(module);

module.exports.setRoutes = function(app, verificationFunc) {
    app.all('/nexus/*', verificationFunc);

    // Authenticate Nexus.
    app.post('/nexus/authenticate', function(req, res) {
    	logger.debug("Called nexus authenticate");
    	if(!req.body.hostname){
    		res.send(500,"HostName can't be empty.");
    		return;
    	}
    	if(!req.body.username){
    		res.send(500,"UserName can't be empty.");
    		return;
    	}
    	if(!req.body.nexuspassword){
    		res.send(500,"Password can't be empty.");
    		return;
    	}
    	if(req.body.hostname.indexOf("http://") === -1){
    		res.send(500,"Invalid hostname.");
    		return;
    	}
        nexus.authenticateNexus(req.body, function(data) {
            if (!data.length) {
                logger.debug("Nexus Authentication Failed: ");
                res.send(data);
                return;
            }else{
            	res.send(200,data);
            }
        });
    });

    app.get('/nexus/:anId/repositories',function(req,res){
    	logger.debug("Called nexus repositories..");
    	if(!req.params.anId){
    		res.send(500,"Nexus Id can't be empty.");
    	}
    	nexus.getNexusRepositories(req.params.anId,function(err,repositories){
    		if(err){
    			logger.debug("Error while fetching nexus repositories.");
    			res.send(500,"Error while fetching nexus repositories.");
    			return;
    		}
    		if(!repositories){
    			res.send(404,"There is no Nexus Server configured.");
    			return;
    		}
    		logger.debug("Got nexus repositories: ",JSON.stringify(repositories));
    		repositories = JSON.parse(repositories);
    		res.send(repositories.repositories.data['repositories-item']);
    	});
    });

    app.get('/nexus/:anId/repositories/:repoName/artifact',function(req,res){
    	logger.debug("Called nexus repositories..");
    	if(!req.params.anId){
    		res.send(500,"Nexus Id can't be empty.");
    	}
    	nexus.getNexusArtifact(req.params.anId,req.params.repoName,function(err,artifact){
    		if(err){
    			logger.debug("Error while fetching nexus artifact.");
    			res.send(500,"Error while fetching nexus artifact.");
    			return;
    		}
    		if(!artifact){
    			res.send(404,"There is no Nexus Server configured.");
    			return;
    		}
    		logger.debug("Got nexus artifact: ",JSON.stringify(artifact));
    		res.send(artifact);
    	});
    });

    app.post('/nexus/:anId/repositories/:repoName/artifact/versions',function(req,res){
    	logger.debug("Called nexus repositories..");
    	if(!req.params.anId){
    		res.send(500,"Nexus Id can't be empty.");
    	}
    	nexus.getNexusArtifactVersions(req.params.anId,req.params.repoName,req.body,function(err,versions){
    		if(err){
    			logger.debug("Error while fetching nexus artifact versions.");
    			res.send(500,"Error while fetching nexus artifact versions.");
    			return;
    		}
    		if(!versions){
    			res.send(404,"There is no Nexus Server configured.");
    			return;
    		}
    		logger.debug("Got nexus artifact versions: ",JSON.stringify(versions));
    		res.send(versions);
    	});
    });

    // This endpoint will capture nexus repo url and update in knife.rb file
    app.post('/nexus/organization/:orgId/chef',function(req,res){
    	logger.debug("Called nexus url update knife.rb..");
    	nexus.updateNexusRepoUrl(req.params.orgId,req.body,function(err,data){
    		if(err){
    			logger.debug("Error: ",err);
    			res.send(500,"Error got.");
    			return;
    		}
    		if(data){
    			res.send(data);
    			return;
    		}else{
    			res.send(404,"No data found.");
    			return;
    		}
    	});
    });

}
