
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
                if(!data) {
                  res.send(404);
                  return;
                }
                res.send(data);
            });
        });
    });

};