/* Copyright (C) Relevance Lab Private Limited- All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Gobinda Das <gobinda.das@relevancelab.com>, 
 * Aug 2015
 */


// The file contains all the end points for GlobalSettings

var logger = require('_pr/logger')(module);
var GlobalSettings = require('_pr/model/global-settings/global-settings');
var errorResponses = require('./error_responses');


module.exports.setRoutes = function(app, sessionVerificationFunc) {
    app.all('/globalsettings/*', sessionVerificationFunc);

    // Get all GlobalSettings
    app.get('/globalsettings', function(req, res) {
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

    // Create GlobalSettings
    app.post('/globalsettings', function(req, res) {
        logger.debug("Got GlobalSettings data: ", JSON.stringify(req.body.aGlobalSettings));
        GlobalSettings.createNew(req.body.aGlobalSettings, function(err, globalSettings) {
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

    // Update GlobalSettings
    app.post('/globalsettings/:gSettingsId/update', function(req, res) {
        logger.debug("Got GlobalSettings data: ", JSON.stringify(req.body.aGlobalSettings));
        GlobalSettings.getGolbalSettingsById(req.params.gSettingsId, function(err, globalSettings) {
            if (err) {
                res.send(500, errorResponses.db.error);
                return;
            }
            if(!globalSettings){
                res.send(404,"GlobalSettings not found!");
                return;
            }
            GlobalSettings.updateSettings(req.params.gSettingsId, req.body.aGlobalSettings, function(err, globalSettings) {
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
    });

    // Get GlobalSettings w.r.t. Id
    app.get('/globalsettings/:gSettingsId', function(req, res) {
        GlobalSettings.getGolbalSettingsById(req.params.gSettingsId, function(err, globalSettings) {
            if (err) {
                res.send(500, errorResponses.db.error);
                return;
            }
            if (globalSettings) {
                res.send(200, globalSettings);
                return;
            }else{
                res.send(404,"GlobalSettings not found!");
                return;
            }
        });
    });

    // Delete GlobalSettings w.r.t. Id
    app.delete('/globalsettings/:gSettingsId', function(req, res) {
        GlobalSettings.getGolbalSettingsById(req.params.gSettingsId, function(err, globalSettings) {
            if (err) {
                res.send(500, errorResponses.db.error);
                return;
            }
            if (globalSettings) {
                GlobalSettings.removeGolbalSettings(req.params.gSettingsId,function(err,gSettings){
                    if(err){
                        logger.debug("Error while removing GlobalSettings: ",JSON.stringify(gSettings));
                        res(500,"Error while removing GlobalSettings:");
                        return;
                    }
                    if(gSettings){
                        logger.debug("Successfully Removed GlobalSettings.");
                        res.send(200,"Successfully Removed GlobalSettings.");
                        return;
                    }
                });
            }else{
                res.send(404,"GlobalSettings not found!");
                return;
            }
        });
    });
};
