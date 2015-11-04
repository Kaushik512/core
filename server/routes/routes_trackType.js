/* Copyright (C) Relevance Lab Private Limited- All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Srikanth V <srikanth.v@relevancelab.com>,
 * Oct 2015
 */


// The file contains all the end points for Tracks

var logger = require('_pr/logger')(module);
var Track = require('_pr/model/track/trackType');
var errorResponses = require('./error_responses');


module.exports.setRoutes = function(app, sessionVerificationFunc) {
    app.all('/trackType/*', sessionVerificationFunc);

    // Get all track
    app.get('/trackType', function(req, res) {
        Track.getTrackType(function(err, trackType) {
            if (err) {
                res.send(500, errorResponses.db.error);
                return;
            }
            if (trackType) {
                res.send(200, trackType);
                return;
            }
        });
    });

    // Create track
    app.post('/trackType', function(req, res) {
        logger.debug(JSON.stringify(req.body));
        logger.debug("Got Track data: ", JSON.stringify(req.body.trackTypeData));

        Track.createNew(req.body.trackTypeData, function(err, trackType) {
            if (err) {
                logger.debug("error Type:>>>>>");
                res.send(500, errorResponses.db.error);
                return;
            }
            if(trackType){
                logger.debug("post trackType");
                res.send(200,trackType);
                return;
            }
        });


    });

    // Update Track
    app.post('/trackType/:trackTypeId/update', function(req, res) {
        logger.debug("Got track Type data: ", JSON.stringify(req.body.trackTypeData), req.params.trackTypeId);
        Track.getTrackTypeById(req.params.trackTypeId, function(err, trackType) {
            if (err) {
                res.send(500, errorResponses.db.error);
                return;
            }
            if (!trackType) {
                res.send(404, "Tracks not found!");
                return;
            }
            Track.updateTrack(req.params.trackTypeId, req.body.trackTypeData, function(err, updateCount) {
                if (err) {
                    res.send(500, errorResponses.db.error);
                    return;
                }
                res.send(200, {
                    updateCount: updateCount
                });
            });
        });
    });

    // Get Track w.r.t. Id
    app.get('/trackType/:trackTypeId', function(req, res) {
        Track.getTrackTypeById(req.params.trackTypeId, function(err, trackType) {
            if (err) {
                res.send(500, errorResponses.db.error);
                return;
            }
            if (trackType) {
                res.send(200, trackType);
                return;
            } else {
                res.send(404, "Track not found!");
                return;
            }
        });
    });

    // Delete Track w.r.t. Id
    app.delete('/trackType/:trackTypeId', function(req, res) {
        Track.getTrackTypeById(req.params.trackTypeId, function(err, trackType) {
            if (err) {
                res.send(500, errorResponses.db.error);
                return;
            }
            if (trackType) {
                Track.removeTracks(req.params.trackTypeId , function(err, trackType) {
                    if (err) {
                        logger.debug("Error while removing trackType: ", JSON.stringify(trackType));
                        res(500, "Error while removing trackType:");
                        return;
                    }
                    if (trackType) {
                        logger.debug("Successfully Removed trackType.");
                        res.send(200, "Successfully Removed trackType.");
                        return;
                    }
                });
            } else {
                res.send(404, "Tracks not found!");
                return;
            }
        });
    });

};