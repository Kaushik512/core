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

    app.post('/nexus/authenticate', function(req, res) {
    	logger.debug("Called nexus authenticate");
    	if(req.body.hostname.indexOf("http://") === -1){
    		res.send(500);
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
}
