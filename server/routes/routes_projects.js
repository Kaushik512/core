/* Copyright (C) Relevance Lab Private Limited- All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Gobinda Das <gobinda.das@relevancelab.com>,
 * Dec 2015
 */

// This file act as a Controller which contains project related all end points.


var blueprintsDao = require('../model/dao/blueprints');

var instancesDao = require('../model/classes/instance/instance');

module.exports.setRoutes = function(app, sessionVerificationFunc) {

    app.all('/projects/*', sessionVerificationFunc);

    app.get('/projects/:projectId/environments/:envId/blueprints', function(req, res) {
        blueprintsDao.getBlueprintsByProjectAndEnvId(req.params.projectId, req.params.envId, req.query.blueprintType, req.session.user.cn, function(err, data) {
            if (err) {
                res.send(500);
                return;
            }
            res.send(data);
        });
    });

    app.post('/projects/:projectId/environments/:envId/blueprints', function(req, res) {
        var blueprintData = req.body.blueprintData;
        blueprintData.projectId = req.params.projectId;
        blueprintData.envId = req.params.envId;
        logger.debug(JSON.stringify(blueprintData));
        if (!blueprintData.runlist) {
            blueprintData.runlist = [];
        }
        if (!blueprintData.users || !blueprintData.users.length) {
            res.send(400);
            return;
        }

        blueprintsDao.createBlueprint(blueprintData, function(err, data) {
            if (err) {
                res.send(500);
                return;
            }
            res.send(data);
        });
    });

    app.get('/projects/:projectId/environments/:envId/instances', function(req, res) {
        instancesDao.getInstancesByProjectAndEnvId(req.params.projectId, req.params.envId, req.query.instanceType, req.session.user.cn, function(err, data) {
            if (err) {
                res.send(500);
                return;
            }
            res.send(data);
        });
    });


};