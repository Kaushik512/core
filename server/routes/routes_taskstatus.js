/* Copyright (C) Relevance Lab Private Limited- All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Gobinda Das <gobinda.das@relevancelab.com>,
 * Dec 2015
 */

// This file act as a Controller which contains task status related all end points.

var taskStatusModule = require('../model/taskstatus');


module.exports.setRoutes = function(app, sessionVerificationFunc) {

    app.get('/taskstatus/:taskId/status', sessionVerificationFunc, function(req, res) {
        taskStatusModule.getTaskStatus(req.params.taskId, function(err, taskStatus) {
            if (err) {
                res.send(500);
                return;
            }
            taskStatus.getStatusByTimestamp(req.query.timestamp, function(err, data) {
                if (err) {
                    res.send(500);
                    return;
                }
                if (!data) {
                    res.send(404);
                    return;
                }
                res.send(data);
            });
        });
    });

};
