var taskstatusDao = require('../classes/taskstatus');


module.exports.setRoutes = function(app, sessionVerificationFunc) {

	app.get('/task/:taskId/status', sessionVerificationFunc, function(req, res) {
		taskstatusDao.getTaskStatusById(req.params.taskId, function(err, data) {
			if (data.length) {
				res.send(data[0]);
			} else {
				res.send(404);
			}

		});
	});

});