var blueprintsDao = require('../classes/blueprints');


module.exports.setRoutes = function(app, sessionVerificationFunc) {

	//app.all('/project', sessionVerificationFunc);

	app.get('/project/:projectId/env/:envId/blueprints', function(req, res) {
		blueprintsDao.getBlueprintsByProjectAndEnvId(req.params.projectId, req.params.envId, function(err, data) {
			if (err) {
				res.send(500);
				return;
			} 
			res.send(data);
		});
	});
    
    app.post('/project/:projectId/env/:envId/blueprint', function(req, res) {
    	var blueprintData = req.body.blueprintData;
    	blueprintData.projectId = req.params.projectId;
    	blueprintData.envId = req.params.envId;
    	
		blueprintsDao.createBlueprint(blueprintData, function(err, data) {
			if (err) {
				res.send(500);
				return;
			} 
			res.send(data);
		});
	});

	app.post('/project/:projectId/env/:envId/blueprint/:blueprintId/update', function(req, res) {
    	
    	var blueprintUpdateData = req.body.blueprintUpdateData;
    		
		blueprintsDao.updateBlueprint(req.params.blueprintId,blueprintUpdateData, function(err, data) {
			if (err) {
				res.send(500);
				return;
			}
			if(!data.length) {
				res.send(404)
			} else {
			  console.log(data);	  
			  res.send(data);	
			}
			
		});
	});

};