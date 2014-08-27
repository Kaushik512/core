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

	app.get('/d4dMasters/mastersjson', function(req, res) {
		res.send([{
			name: 'master'
		}, {
			name: 'master2'
		}]);
	});

	app.get('/d4dMasters/removeitem/:id/:fieldname/:fieldvalue', function(req, res) {
		
		console.log('received request ' + req.params.id);
		d4dModel.findOne({
			id: req.params.id
		}, function(err, d4dMasterJson) {
			if (err) {
				console.log("Hit and error:" + err);
			}
			if (d4dMasterJson) {
				/*res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(d4dMasterJson));*/
				console.log("Before splice" + JSON.stringify(d4dMasterJson));
				d4dMasterJson.masterjson.rows.row.forEach(function(itm, i) {
					//console.log("found" + itm.field.length);
					for (var j = 0; j < itm.field.length; j++) {
						if (itm.field[j]["name"] == req.params.fieldname) {
							//console.log("found:" + itm.field[j]["values"].value);
							if (itm.field[j]["values"].value == req.params.fieldvalue) {
								console.log("found: " + i + " -- " + itm.field[j]["values"].value);
								d4dMasterJson.masterjson.rows.row.splice(i, 1);
								// d4dMasterJson.masterjson.changed = true;

								return;
							}
						}

						// console.log();
					}
					/*JSON.parse(itm).findOne({ name: req.params.fieldname }, function (err, itmjson) {
                    console.log(" Innner: " + JSON.stringify(itmjson));
                });*/

				});

				// d4dMasterJson.content = JSON.stringify(d4dMasterJson);

				d4dMasterJson.markModified('masterjson');

				d4dMasterJson.save(function(err, d4dMasterJson) {
					if (err) {
						console.log("Hit and error:" + err)
						res.send(500);
					};
					console.log('saved');
				});

				//  console.log("After splice" + JSON.stringify(d4dMasterJson));
				/*d4dMasterJson.save(function (err, d4dMasterJson) {
                if (err) {
                    console.log("Hit and error:" + err)
                    res.send(500);
                };
                console.log('saved');
            });*/
				res.end(JSON.stringify(d4dMasterJson));
				console.log("sent response" + JSON.stringify(d4dMasterJson));

			} else {
				res.send(400, {
					"error": err
				});
				console.log("none found");
			}


		});
	});


	app.get('/d4dMasters/readmasterjson/:id', function(req, res) {
		console.log('received request ' + req.params.id);
		d4dModel.findOne({
			id: req.params.id
		}, function(err, d4dMasterJson) {
			if (err) {
				console.log("Hit and error:" + err);
			}
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

	app.get('/d4dMasters/qmasterjson/:id/:name', function(req, res) {

	});

	app.get('/d4dMasters/getuuid', function(req, res) {
		var uuid1 = uuid.v4();
		res.writeHead(200, {
			'Content-Type': 'application/json'
		});
		// res.json(d4dMasterJson);
		//res.setHeader('Content-Type', 'application/json');
		res.end(JSON.stringify(uuid1));
		console.log("sent response" + JSON.stringify('{"uuid":"' + uuid1 + '"}'));
	});
	app.post('/d4dMasters/savemasterjson/:id', function(req, res) {
		//Finding the Master Json if present

		console.log(req.body);

		console.log('received request ' + req.params.id);
		d4dModel.findOne({
			id: req.params.id
		}, function(err, d4dMasterJson) {
			if (err) {
				console.log("Hit and error:" + err);
			}
			if (!d4dMasterJson) {


				var d4dmj = new d4dModel({
					id: '1',
					masterjson: req.body
				});
				d4dmj.save(function(err, d4dmj) {
					if (err) {
						console.log("Hit and error:" + err)
						res.send(500);
					};
					console.log('saved');
				});
				res.send(200);
			} else {

				d4dMasterJson.masterjson = req.body;

				d4dMasterJson.save(function(err, d4dMasterJson) {
					if (err) {
						console.log("Hit and error:" + err)
					}
					console.log('updated');
				});
				res.send(200);
			}
		});
		//mongoose.disconnect();
	});

	app.get('/createbg/:orgname/:bgname',function(req, res) {
   // var envField = "{\"field\":[{\"name\":\"environmentname\",\"values\":{\"value\":\"" + req.params.envname + "\"}},{\"name\":\"orgname\",\"values\":{\"value\":\"" + req.params.orgname + "\"}}]}";
      var bgfield = "{\"field\":[{\"values\":{\"value\":\"" + req.params.bgname + "\"},\"name\":\"productgroupname\"},{\"values\":{\"value\":\"" + req.params.orgname + "\"},\"name\":\"orgname\"},{\"name\":\"costcode\"}] }";   
	//var orgField = "{\"field\":[{\"values\":{\"value\":\"" + req.params.orgname + "\"},\"name\":\"orgname\"},{\"values\":{\"value\":\"\"},\"name\":\"domainname\"},{\"values\":{\"value\":[\"Dev\",\"Test\",\"Stage\"]},\"name\":\"costcode\"}]}";
	db.on('error', console.error.bind(console, 'connection error:'));
	console.log(JSON.stringify(bgfield));
    db.once('open', function callback() {

        console.log('in once');
    });
    console.log('received request ' + req.params.bgname);
    d4dModel.findOne({ id: '2' }, function (err, d4dMasterJson) {
		if (err) {
            console.log("Hit and error:" + err);
        }
		if (d4dMasterJson) {
			var hasOrg = false;
			d4dMasterJson.masterjson.rows.row.forEach(function (itm, i) {
                console.log("found" + itm.field.length);
				
                for (var j = 0; j < itm.field.length; j++) {
                    if (itm.field[j]["name"] == 'productgroupname') {
                        if (itm.field[j]["values"].value == req.params.bgname) {
                            console.log("found: " + i + " -- "  + itm.field[j]["values"].value);
                            hasOrg = true;
                        }
                    }

                   // console.log();
                }
            });
			if(hasOrg == false){
					//Creating org
					console.log('Creating');
					d4dMasterJson.masterjson.rows.row.push(JSON.parse(bgfield));
					d4dModel.update(
						{"id": "2"},{$set:{"masterjson":d4dMasterJson.masterjson}},{
						   upsert: false
						  }, function(err, data) {
						   if (err) {
							callback(err, null);
							res.send(500);
							return;
						   }
						   res.send(200);
						   //callback(null, data);
						  });
                }
			else{
			res.send(200);
			}
             
		}
		else {
            res.send(500, { "error": err });
            console.log("none found");
        }
		
		});
	});


app.get('/createproj/:orgname/:envname/:prodgroup/:projname',function(req, res){
    var projField = "{\"field\":[{\"values\":{\"value\":\"" + req.params.projname + "\"},\"name\":\"projectname\"},{\"values\":{\"value\":\"" + req.params.orgname + "\"},\"name\":\"orgname\"},{\"values\":{\"value\":\"" + req.params.prodgroup + "\"},\"name\":\"productgroupname\"},{\"values\":{\"value\":\"" + req.params.envname + "\"},\"name\":\"environmentname\"},{\"values\":{\"value\":[\"Code 1\",\"Code 2\"]},\"name\":\"costcode\"}] }";
	
	//var orgField = "{\"field\":[{\"values\":{\"value\":\"" + req.params.orgname + "\"},\"name\":\"orgname\"},{\"values\":{\"value\":\"\"},\"name\":\"domainname\"},{\"values\":{\"value\":[\"Dev\",\"Test\",\"Stage\"]},\"name\":\"costcode\"}]}";
	db.on('error', console.error.bind(console, 'connection error:'));
	console.log(JSON.stringify(projField));
    db.once('open', function callback() {

        console.log('in once');
    });
    console.log('received request ' + req.params.orgname);
    d4dModel.findOne({ id: '4' }, function (err, d4dMasterJson) {
		if (err) {
            console.log("Hit and error:" + err);
        }
		if (d4dMasterJson) {
			var hasOrg = false;
			d4dMasterJson.masterjson.rows.row.forEach(function (itm, i) {
                console.log("found" + itm.field.length);
				
                for (var j = 0; j < itm.field.length; j++) {
                    if (itm.field[j]["name"] == 'projectname') {
                        //console.log("found:" + itm.field[j]["values"].value);
                        if (itm.field[j]["values"].value == req.params.projname) {
                            console.log("found: " + i + " -- "  + itm.field[j]["values"].value);
                            hasOrg = true;
                        }
                    }

                   // console.log();
                }
            });
			if(hasOrg == false){
					//Creating org
					console.log('Creating');
					d4dMasterJson.masterjson.rows.row.push(JSON.parse(projField));
					d4dModel.update(
						{"id": "4"},{$set:{"masterjson":d4dMasterJson.masterjson}},{
						   upsert: false
						  }, function(err, data) {
						   if (err) {
							callback(err, null);
							res.send(500);
							return;
						   }
						   res.send(200);
						   //callback(null, data);
						  });
                }
			else{
			res.send(200);
			}
             
		}
		else {
            res.send(500, { "error": err });
            console.log("none found");
        }
		
	});
});


app.get('/createenv/:orgname/:envname',function(req, res){
    var envField = "{\"field\":[{\"name\":\"environmentname\",\"values\":{\"value\":\"" + req.params.envname + "\"}},{\"name\":\"orgname\",\"values\":{\"value\":\"" + req.params.orgname + "\"}}]}";
	//var orgField = "{\"field\":[{\"values\":{\"value\":\"" + req.params.orgname + "\"},\"name\":\"orgname\"},{\"values\":{\"value\":\"\"},\"name\":\"domainname\"},{\"values\":{\"value\":[\"Dev\",\"Test\",\"Stage\"]},\"name\":\"costcode\"}]}";
	db.on('error', console.error.bind(console, 'connection error:'));
	console.log(JSON.stringify(envField));
    db.once('open', function callback() {

        console.log('in once');
    });
    console.log('received request ' + req.params.orgname);
    d4dModel.findOne({ id: '3' }, function (err, d4dMasterJson) {
		if (err) {
            console.log("Hit and error:" + err);
        }
		if (d4dMasterJson) {
			var hasOrg = false;
			d4dMasterJson.masterjson.rows.row.forEach(function (itm, i) {
                console.log("found" + itm.field.length);
				
                for (var j = 0; j < itm.field.length; j++) {
                    if (itm.field[j]["name"] == 'environmentname') {
                        //console.log("found:" + itm.field[j]["values"].value);
                        if (itm.field[j]["values"].value == req.params.envname) {
                            console.log("found: " + i + " -- "  + itm.field[j]["values"].value);
                            hasOrg = true;
                        }
                    }
                }
				
             
            });
			if(hasOrg == false){
					//Creating org
					console.log('Creating');
					d4dMasterJson.masterjson.rows.row.push(JSON.parse(envField));
					
					
					d4dModel.update(
						{"id": "3"},{$set:{"masterjson":d4dMasterJson.masterjson}},{
						   upsert: false
						  }, function(err, data) {
						   if (err) {
							callback(err, null);
							res.send(500);
							return;
						   }
						   res.send(200);
						   //callback(null, data);
						  });
                }
			else{
			res.send(200);
			}
             
		}
		else {
            res.send(500, { "error": err });
            console.log("none found");
        }
		
	});
});


app.get('/createorg/:orgname',function(req, res){
	var orgField = "{\"field\":[{\"values\":{\"value\":\"" + req.params.orgname + "\"},\"name\":\"orgname\"},{\"values\":{\"value\":\"\"},\"name\":\"domainname\"},{\"values\":{\"value\":[\"Dev\",\"Test\",\"Stage\"]},\"name\":\"costcode\"}]}";
	db.on('error', console.error.bind(console, 'connection error:'));
	console.log(JSON.stringify(orgField));
    db.once('open', function callback() {

        console.log('in once');
    });
    console.log('received request ' + req.params.orgname);
    d4dModel.findOne({ id: '1' }, function (err, d4dMasterJson) {
		if (err) {
            console.log("Hit and error:" + err);
        }
		if (d4dMasterJson) {
			var hasOrg = false;
			d4dMasterJson.masterjson.rows.row.forEach(function (itm, i) {
                console.log("found" + itm.field.length);
				
                for (var j = 0; j < itm.field.length; j++) {
                    if (itm.field[j]["name"] == 'orgname') {
                        //console.log("found:" + itm.field[j]["values"].value);
                        if (itm.field[j]["values"].value == req.params.orgname) {
                            console.log("found: " + i + " -- "  + itm.field[j]["values"].value);
                            hasOrg = true;
                        }
                    }

                   // console.log();
                }
				
               /*JSON.parse(itm).findOne({ name: req.params.fieldname }, function (err, itmjson) {
                    console.log(" Innner: " + JSON.stringify(itmjson));
                });*/

            });
			if(hasOrg == false){
					//Creating org
					console.log('Creating');
					d4dMasterJson.masterjson.rows.row.push(JSON.parse(orgField));
					d4dModel.update(
						{"id": "1"},{$set:{"masterjson":d4dMasterJson.masterjson}},{
						   upsert: false
						  }, function(err, data) {
						   if (err) {
							callback(err, null);
							res.send(500);
							return;
						   }
						   res.send(200);
						   //callback(null, data);
						  });
					
					/*d4dMasterJson.update(function (err, d4dMasterJson) {
						if (err) {
							console.log("Hit and error:" + err)
						}
						console.log('updated' + JSON.stringify(d4dMasterJson));
					});*/
					//res.send(200);
                }
			else{
			res.send(200);
			}
             
		}
		else {
            res.send(500, { "error": err });
            console.log("none found");
        }
		
	});
});




}
