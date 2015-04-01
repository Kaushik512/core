
var configmgmtDao = require('../model/d4dmasters/configmgmt.js');
var Chef = require('../lib/chef');


var Jenkins = require('../lib/jenkins');

var errorResponses = require('./error_responses.js');

var Tasks = require('../model/classes/tasks/tasks.js');

var logger = require('../lib/logger')(module);

module.exports.setRoutes = function(app, sessionVerification) {
    app.all('/tasks/*', sessionVerification);

    app.get('/tasks/:taskId/run', function(req, res) {
        Tasks.getTaskById(req.params.taskId, function(err, task) {
            if (err) {
                logger.error(err);
                res.send(500, errorResponses.db.error);
                return;
            }
            task.execute(req.session.user.cn,function(err, taskRes) {
                if (err) {
                    logger.error(err);
                    res.send(500, err);
                    return;
                } 
                res.send(taskRes);
            });
        });

    });

    app.delete('/tasks/:taskId', function(req, res) {
        Tasks.removeTaskById(req.params.taskId, function(err, deleteCount) {
            if (err) {
                logger.error(err);
                res.send(500, errorResponses.db.error);
                return;
            }
            if (deleteCount) {
                res.send({
                    deleteCount: deleteCount
                });
            } else {
                res.send(400);
            }
        });
    });

    app.get('/tasks/:taskId', function(req, res) {
        Tasks.getTaskById(req.params.taskId, function(err, data) {
            if (err) {
                logger.error(err);
                res.send(500, errorResponses.db.error);
                return;
            }
            if (data) {
                res.send(data);
            } else {
                res.send(404);
            }
        });
    });

    app.post('/tasks', function(req, res) {
        Tasks.getTaskByIds(req.body.taskIds, function(err, data) {
            if (err) {
                logger.error(err);
                res.send(500, errorResponses.db.error);
                return;
            }
            if (data) {
                res.send(data);
            } else {
                res.send(404);
            }
        });
    });

    app.post('/tasks/:taskId/update', function(req, res) {
        var taskData = req.body.taskData;

        Tasks.updateTaskById(req.params.taskId, taskData, function(err, updateCount) {
            if (err) {
                logger.error(err);
                res.send(500, errorResponses.db.error);
                return;
            }
            if (updateCount) {
                res.send({
                    updateCount: updateCount
                });
            } else {
                res.send(400);
            }
        });
    });

};