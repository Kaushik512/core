/* Copyright (C) Relevance Lab Private Limited- All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Gobinda Das <gobinda.das@relevancelab.com>, 
 * Oct 2015
 */

// This file act as a interface between catalyst and nexus.


var Client = require('node-rest-client').Client;
var logger = require('_pr/logger')(module);

var Nexus = function() {
    this.authenticateNexus = function(requestBody, callback) {
        logger.debug("Got req for nexus authentication: ", JSON.stringify(requestBody));
        var options_auth = {
            user: requestBody['username'],
            password: requestBody['nexuspassword']
        };
        client = new Client(options_auth);
        var nexusUrl = requestBody['hostname'] + '/service/local/users';
        logger.debug('nexusUrl', nexusUrl);
        client.registerMethod("jsonMethod", nexusUrl, "GET");
        var reqSubmit = client.methods.jsonMethod(function(data, response) {
            logger.debug("response: ", response);
            logger.debug("data: ", JSON.stringify(data));
            callback(data);
        });

        // Handling Exception for nexus req.
        reqSubmit.on('error', function(err) {
            console.log('Something went wrong on req!!', err.request.options);
            callback(err);
        });
    }
}

module.exports = new Nexus();
