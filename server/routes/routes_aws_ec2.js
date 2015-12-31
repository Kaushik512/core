/* Copyright (C) Relevance Lab Private Limited- All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Gobinda Das <gobinda.das@relevancelab.com>,
 * Dec 2015
 */

// This file act as a Controller which contains aws related end points.

var EC2 = require('../lib/ec2.js');
var appConfig = require('_pr/config');
var logger = require('_pr/logger')(module);

module.exports.setRoutes = function(app, verifySession) {
    app.get('/aws/ec2/amiids', function(req, res) {
        logger.debug("Enter /aws/ec2/amiids");
        res.send(appConfig.aws.operatingSystems);
    });

}
