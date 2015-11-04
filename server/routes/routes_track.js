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

        //updating the record when type is present.
        Track.getTrackByType(req.body.trackData.type, function(err, tracks) {
            if (err) {
                logger.debug("error Type:>>>>>");
                res.send(500, errorResponses.db.error);
                return;
            }
            if (tracks.length === 0) {
                //creating new record when type is not present.
                Track.createNew(req.body.trackData, function(err, tracks) {
                    if (err) {
                        logger.debug("error Type New:>>>>>");
                        res.send(500, errorResponses.db.error);
                        return;
                    }
                    if (tracks) {
                        res.send(200, tracks);
                        return;
                    }
                });
            } else {
                console.log(req.body.trackData);
                var items = tracks[0].itemUrls.concat(req.body.trackData.itemUrls);
                tracks[0].itemUrls = items;
                logger.debug("tracks[0]",items);
                tracks[0].save(function(err, track) {
                    if (err) {
                        logger.debug("error Type Update:>>>>>", err);
                        res.send(500, errorResponses.db.error);
                        return;
                    }
                    res.send(200, track);
                });
            }
        });


    });

    // Update Track
    app.post('/track/:trackId/update', function(req, res) {
        logger.debug("Got tracks data: ", JSON.stringify(req.body.trackData), req.params.trackId);
        Track.getTrackById(req.params.trackId, function(err, tracks) {
            if (err) {
                res.send(500, errorResponses.db.error);
                return;
            }
            if (!tracks) {
                res.send(404, "Tracks not found!");
                return;
            }
            if (!req.body.trackData.itemUrls) {
                res.send(400, {
                    message: "Bad Request"
                })
                return;
            }
            Track.updateTrack(req.params.trackId, req.body.trackData.itemUrls, function(err, updateCount) {
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
    app.get('/track/:trackId', function(req, res) {
        Track.getTrackById(req.params.trackId, function(err, tracks) {
            if (err) {
                res.send(500, errorResponses.db.error);
                return;
            }
            if (tracks) {
                res.send(200, tracks);
                return;
            } else {
                res.send(404, "Track not found!");
                return;
            }
        });
    });

    // Delete Track w.r.t. Id
    app.delete('/track/:trackId/:itemId', function(req, res) {
        Track.getTrackById(req.params.trackId, function(err, track) {
            if (err) {
                res.send(500, errorResponses.db.error);
                return;
            }
            if (track) {

                if (track.itemUrls && track.itemUrls.length) {
                    var itemUrls = [];
                    for (var i = 0; i < track.itemUrls.length; i++) {
                        if (track.itemUrls[i].id !== req.params.itemId) {
                            itemUrls.push(track.itemUrls[i]);
                        }
                    }
                    if (itemUrls.length) {
                        track.itemUrls = itemUrls;
                        track.save(function(err) {
                            if (err) {
                                logger.debug("Error while removing tracks: ", JSON.stringify(tracks));
                                res(500, "Error while removing tracks:");
                                return;
                            }
                            res.send(200, "Successfully Removed tracks.");
                            return;
                        });
                    } else {
                        track.remove(function(err) {
                            if (err) {
                                logger.debug("Error while removing tracks: ", JSON.stringify(tracks));
                                res(500, "Error while removing tracks:");
                                return;
                            }
                            res.send(200, "Successfully Removed tracks.");
                            return;
                        });
                    }

                } else {
                    track.remove(function(err) {
                        if (err) {
                            logger.debug("Error while removing tracks: ", JSON.stringify(tracks));
                            res(500, "Error while removing tracks:");
                            return;
                        }
                        res.send(200, "Successfully Removed tracks.");
                        return;
                    });
                }
            } else {
                res.send(404, "Tracks not found!");
                return;
            }
        });
    });

};