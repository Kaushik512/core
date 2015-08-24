/* Copyright (C) Relevance Lab Private Limited- All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Gobinda Das <gobinda.das@relevancelab.com>, 
 * Aug 2015
 */


// The file contains all the end points for Tracks

var logger = require('_pr/logger')(module);
var Track = require('_pr/model/track/track');
var errorResponses = require('./error_responses');


module.exports.setRoutes = function(app, sessionVerificationFunc) {
    app.all('/track/*', sessionVerificationFunc);

    // Get all track
    app.get('/track', function(req, res) {
        Track.getTracks(function(err, tracks) {
            if (err) {
                res.send(500, errorResponses.db.error);
                return;
            }
            if (tracks) {
                res.send(200, tracks);
                return;
            }
        });
    });

    // Create track
    app.post('/track', function(req, res) {
        logger.debug("Got Track data: ", JSON.stringify(req.body.trackData));
        Track.createNew(req.body.trackData, function(err, tracks) {
            if (err) {
                res.send(500, errorResponses.db.error);
                return;
            }
            if (tracks) {
                res.send(200, tracks);
                return;
            }
        });
    });

    // Update Track
    app.post('/track/:trackId/update', function(req, res) {
        logger.debug("Got tracks data: ", JSON.stringify(req.body.trackData));
        Track.getTrackById(req.params.trackId, function(err, tracks) {
            if (err) {
                res.send(500, errorResponses.db.error);
                return;
            }
            if(!tracks){
                res.send(404,"Tracks not found!");
                return;
            }
            Track.updateTrack(req.params.trackId, req.body.trackData, function(err, tracks) {
                if (err) {
                    res.send(500, errorResponses.db.error);
                    return;
                }
                if (tracks) {
                    res.send(200, tracks);
                    return;
                }
            });
        });
    });

    // Get Track w.r.t. Id
    app.get('/track/:trackId', function(req, res) {
        Track.getTrackById(req.params.trackId, function(err, tracks) {
            if (err) {
                res.send(500, errorResponses.db.error);
                return;
            }
            if (tracks) {
                res.send(200, tracks);
                return;
            }else{
                res.send(404,"Track not found!");
                return;
            }
        });
    });

    // Delete Track w.r.t. Id
    app.delete('/track/:trackId', function(req, res) {
        Track.getTrackById(req.params.trackId, function(err, tracks) {
            if (err) {
                res.send(500, errorResponses.db.error);
                return;
            }
            if (tracks) {
                Track.removeTracks(req.params.trackId,function(err,tracks){
                    if(err){
                        logger.debug("Error while removing tracks: ",JSON.stringify(tracks));
                        res(500,"Error while removing tracks:");
                        return;
                    }
                    if(tracks){
                        logger.debug("Successfully Removed tracks.");
                        res.send(200,"Successfully Removed tracks.");
                        return;
                    }
                });
            }else{
                res.send(404,"Tracks not found!");
                return;
            }
        });
    });
};
