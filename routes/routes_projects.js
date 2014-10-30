var blueprintsDao = require('../classes/blueprints');
var settingsController = require('../controller/settings');
var instancesDao = require('../classes/instances');

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
        console.log(JSON.stringify(blueprintData));
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