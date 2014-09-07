var d4dModel = require('../classes/d4dmasters/d4dmastersmodel.js');
var settingsController = require('../controller/settings');
var fileIo = require('../classes/utils/fileio');
var uuid = require('node-uuid');


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
	

	var fs = require('fs');
	var path = require('path');
	 
	fs.mkdirParent = function(dirPath, mode, callback) {
	  //Call the standard fs.mkdir
	  fs.mkdir(dirPath, mode, function(error) {
	    //When it fail in this way, do the custom steps
	    if (error && error.errno === 34) {
	      //Create all the parents recursively
	      fs.mkdirParent(path.dirname(dirPath), mode, callback);
	      //And then the directory
	      fs.mkdirParent(dirPath, mode, callback);
	    }
	    //Manually run the callback since we used our own callback to do all these
	    callback && callback(error);
	  });
	};
	function mkdir_p(path, mode, callback, position) {
		mode = mode || 0777;
		position = position || 0;
		console.log('entered');
		parts = require('path').normalize(path).split('/');
		var directory = parts.slice(0, position + 1).join('/');
		console.log('stage 2 ' + directory);
		fs.mkdirSync(directory, mode);
		if (position >= parts.length) {
			return(true);
		}
		else
			mkdir_p(path,mode,null,position + 1);
	}
	var mkdirSync1 = function (path) {
					  try {
					    fs.mkdirSync(path,0777);
					  } catch(e) {
					    //if ( e.code != 'EEXIST' ) throw e;
					  }
					}

	function saveuploadedfile(suffix,folderpath,req){
		console.log(req.body);
		var fi;
		if(req.params.fileinputs.indexOf(',') > 0)
			fi = req.params.fileinputs.split(',');
		else{
			fi = new Array();
			fi.push(req.params.fileinputs);
		}


		var filesNames = Object.keys(req.files);
		var count = filesNames.length;
		console.log	('in' + count);
		filesNames.forEach(function(item) {
			console.log(item);
		});
		

		settingsController.getChefSettings(function(settings) {
			var chefRepoPath = settings.chefReposLocation;
			console.log(chefRepoPath + req.params.orgname + folderpath.substring(0,folderpath.length - 1));
			var path = chefRepoPath + req.params.orgname + folderpath.substring(0,folderpath.length - 1);
			
			
			
			//fs.mkdirParent(chefRepoPath + req.params.orgname + folderpath.substring(0,folderpath.length - 1),0777); //if path is not present create it.
			parts = require('path').normalize(path).split('/');
			console.log('Length of parts:' + parts.length);
			for(var i = 1; i <= parts.length; i++){
				var directory = parts.slice(0,i).join('/');
				console.log(directory);
				mkdirSync1(directory);
				// fs.mkdirSync(directory,0777);
				//mkdir_p1(directory,'0777');
			}




			//mkdir_p(chefRepoPath + req.params.orgname + folderpath.substring(0,folderpath.length - 1)); ///if path is not present create it.
			console.log("files:" + fi.length);
			for(var i = 0; i <  fi.length; i++){
				var controlName = fi[i];
				var fil = eval('req.files.' + fi[i]);
				if(typeof fil != 'undefined'){
					
					var data = fs.readFileSync(fil.path); //, function(err, data) {	
						//var getDirName = require("path").dirname;
						/*fileIo.writeFileSync(chefRepoPath + req.params.orgname + '/' + suffix + controlName + '__' + fil.name, data, null, function(err) {
									console.log(err);
									count--;
									if (count === 0) { // all files uploaded
										return("200");
									}
								});*/
						if(folderpath == ''){
							console.log('this is where file gets saved as : ' + chefRepoPath + req.params.orgname + '/' + suffix + controlName + '__' + fil.name);
							fs.writeFileSync(chefRepoPath + req.params.orgname + '/' + suffix + controlName + '__' + fil.name, data);
						}
						else{
							console.log('this is where file gets saved as : ' + chefRepoPath + req.params.orgname + folderpath + fil.name);
							fs.writeFileSync(chefRepoPath + req.params.orgname + folderpath + fil.name, data);
						}

						
				//	});

				}
			}
		});
		return("200");
	}

	app.post('/d4dMasters/savemasterjsonrow/:id/:fileinputs/:orgname', function(req, res) {
    console.log('received request ' + req.params.id);
	d4dModel.findOne({ id: req.params.id }, function (err, d4dMasterJson) {
		if (err) {
            console.log("Hit and error:" + err);
        }
			if (d4dMasterJson) {

					//{"orgname":"testingorg","domainname":"testingdomain","costcode":"[\"code1\",\"code2\",\"code3\"]"}
					//var orgField = "{\"field\":[{\"values\":{\"value\":\"" + req.params.orgname + "\"},\"name\":\"orgname\"},{\"values\":{\"value\":\"\"},\"name\":\"domainname\"},{\"values\":{\"value\":[\"Dev\",\"Test\",\"Stage\"]},\"name\":\"costcode\"}]}";
					
					var bodyJson = JSON.parse(JSON.stringify(req.body));

					//pushing the rowid field
					var uuid1 = uuid.v4();
					bodyJson["rowid"] = uuid1;
					//console.log(bodyJson['orgname']);
					var frmkeys = Object.keys(bodyJson);

					//var frmvals = Object.keys(bodyJson);
					var rowFLD = [];
				//	var filesNames = Object.keys(req.files);
					var folderpath = ''; //will hold the folderpath field to create the path in the system

					console.log(JSON.stringify(bodyJson));

					frmkeys.forEach(function(itm){
						
						var thisVal = bodyJson[itm];
						//console.log(thisVal.replace(/\"/g,'\\"'));
						console.log(thisVal);
						var item;

						if(thisVal.indexOf('[') >= 0) //used to check if its an array
							item = "{\"values\" : {\"value\" : "  + thisVal + "},\"name\" : \"" + itm + "\"}";
						else
							item = "{\"values\" : {\"value\" : \"" + thisVal.replace(/\"/g,'\\"') + "\"},\"name\" : \"" + itm + "\"}";
						

						rowFLD.push(JSON.parse(item));
						if(itm == 'folderpath'){ //special variable to hold the folder to which the files will be copied.
							folderpath = thisVal;
						}

					});
					console.log('Changed');
					var FLD = "{\"field\":" + JSON.stringify(rowFLD) + "}";
					//frmvals.push(rowFLD);
					console.log(FLD);
					d4dMasterJson.masterjson.rows.row.push(JSON.parse(FLD));
					console.log(d4dMasterJson.masterjson);
									d4dModel.update(
										{"id": req.params.id},{$set:{"masterjson":d4dMasterJson.masterjson}},{
										   upsert: false
										  }, function(err, data) {
										   if (err) {
											callback(err, null);
											res.send(500);
											return;
										   }
									   	   // To do save uploaded files.
								   	   	   //saveuploadedfile(suffix,fileinputs,orgname,req,res,callback)
								   	   	   console.log(req.params.fileinputs == 'null');
								   	   	   console.log('folderpath:' + folderpath);
								   	   	   if(req.params.fileinputs != 'null')
								   	   	   		res.send(saveuploadedfile(uuid1+ '__',folderpath,req));
								   	   	   else
								   	   	   		res.send(200);


										   //res.send(200);
										   //callback(null, data);
										  });
			}
		});								
	});

	app.post('/d4dMasters/testingupload/:suffix/:fileinputs',function(req,res){
		console.log(req.body);
		var fi;
		if(req.params.fileinputs.indexOf(',') > 0)
			fi = req.params.fileinputs.split(',');
		else{
			fi = new Array();
			fi.push(req.params.fileinputs);
		}


		var filesNames = Object.keys(req.files);
		var count = filesNames.length;
		console.log	('in' + count);
		filesNames.forEach(function(item) {
			console.log(item);
		});
		

		settingsController.getChefSettings(function(settings) {
			var chefRepoPath = settings.chefReposLocation;
			fs.mkdirParent(chefRepoPath + req.params.orgname); //if path is not present create it.
			for(var i = 0; i <  fi.length; i++){
				var controlName = fi[i];
				var fil = eval('req.files.' + fi[i]);
				if(typeof fil != 'undefined'){
					console.log('this is where file gets saved  : ' + chefRepoPath + fil.name);
					fileIo.readFile(fil.path, function(err, data) {	
						//var getDirName = require("path").dirname;
						fileIo.writeFile(chefRepoPath + req.params.orgname + '/' + controlName + '__' + fil.name, data, null, function(err) {
									console.log(err);
									count--;
									if (count === 0) { // all files uploaded
										res.send("ok");
									}
								});
						/*mkdirp(getDirName(chefRepoPath + 'logo' ),function(err){
							if(err) console.log(err);
							else{

								fileIo.writeFile(chefRepoPath + 'logo/' + fil.name, data, null, function(err) {
									console.log(err);
									count--;
									if (count === 0) { // all files uploaded
										res.send("ok");
									}
								});
							}
						}); */
					});

				}
			}
		});
		res.send(200);
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