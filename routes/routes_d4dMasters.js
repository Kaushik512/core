var d4dModel = require('../classes/d4dmasters.js');


module.exports.setRoutes = function(app, sessionVerification) {

	//app.all('/d4dMasters',sessionVerification);

	/*app.get('/d4dMasters/saveTest', function(req, res) {
		var m = new d4dModel();
		m.save(function(err, data) {
			console.log(data);
			res.send(data);
		});
	})*/

	app.get('/d4dMasters/readmasterjson/:id', function(req, res) {
		console.log(typeof req.params.id);
		console.log('received request ' + req.params.id);
		d4dModel.find({
			id: req.params.id,
		}, function(err, d4dMasterJson) {
			if (err) {
				console.log("Hit and error:" + err);
			}
			console.log(d4dMasterJson);
			if (d4dMasterJson) {
				// res.send(200, d4dMasterJson);
				//  res.writeHead(200, { 'Content-Type': 'text/plain' });
				res.writeHead(200, {
					'Content-Type': 'application/json'
				});
				// res.json(d4dMasterJson);
				//res.setHeader('Content-Type', 'application/json');
				res.end(JSON.stringify(d4dMasterJson));
				console.log("sent response" + JSON.stringify(d4dMasterJson));
				//res.end();
			} else {
				res.send(400, {
					"error": err
				});
				console.log("none found");
			}


		});
	});

}