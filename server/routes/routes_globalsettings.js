/* Copyright (C) Relevance Lab Private Limited- All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Gobinda Das <gobinda.das@relevancelab.com>, 
 * Aug 2015
 */


// The file contains all the end points for GlobalSettings

var logger = require('_pr/logger')(module);
var GlobalSettings = require('_pr/model/global-settings/global-settings');


module.exports.setRoutes = function(app, sessionVerificationFunc) {
    app.all('/globalsettings/*', sessionVerificationFunc);

    // Get all GlobalSettings
    app.get('/globalsettings/', function(req, res) {
        GlobalSettings.getGolbalSettings(function(err, globalSettings) {
            if (err) {
                res.send(500, errorResponses.db.error);
                return;
            }
            if (globalSettings) {
                res.send(200, globalSettings);
                return;
            }
        });
    });

    // Get all GlobalSettings
    app.post('/globalsettings/', function(req, res) {
    	logger.debug("Got GlobalSettings data: ",JSON.stringify(req.body.aGlobalSettings));
        GlobalSettings.createNew(req.body.aGlobalSettings,function(err, globalSettings) {
            if (err) {
                res.send(500, errorResponses.db.error);
                return;
            }
            if (globalSettings) {
                res.send(200, globalSettings);
                return;
            }
        });
    });
};
