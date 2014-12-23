var d4dModel = require('../classes/d4dmasters/d4dmastersmodel.js');
var settingsController = require('../controller/settings');
var fileIo = require('../classes/utils/fileio');
var uuid = require('node-uuid');
var configmgmtDao = require('../classes/d4dmasters/configmgmt');
var Chef = require('../classes/chef');
var Curl = require('../controller/utils/curl.js');

module.exports.setRoutes = function(app, sessionVerification) {

	//app.all('/d4dMasters',sessionVerification);

	/*app.get('/d4dMasters/saveTest', function(req, res) {
		var m = new d4dModel();
		m.save(function(err, data) {
			console.log(data);
			res.send(data);
		});
	})*/
	app.get('/d4dmasters/dockervalidate/:username/:password',function(req,res){
		var cmd = 'curl --raw -L --user ' + req.params.username + ':' + req.params.password + ' https://index.docker.io/v1/users';
		var curl = new Curl();
		curl.executecurl(cmd,function(err,stdout){
			if(err){
				res.end(err);
			}
			if(stdout){
				if(stdout.indexOf('OK') > 0){
					console.log('Good');
					res.end('200');
				}
				else
				{
					console.log('No User');
					res.end('402');
				}
			}
		});

	});

	app.get('/d4dmasters/getdockertags/:repopath/:dockerreponame',function(req,res){
		//fetch the username and password from 
		//Need to populate dockerrowid in template card. - done
		configmgmtDao.getMasterRow(18,'dockerreponame',req.params.dockerreponame,function(err,data){
			if(!err)
				{
					
				//	var dockerRepo = JSON.parse(data);
				//	console.log('Docker Repo ->', JSON.stringify(dockerRepo));
					var cmd = '';
					//Below is for public repository
					cmd = 'curl -v -H "Accept: application/json" -X GET https://index.docker.io/v1/repositories/' + req.params.repopath +  '/tags';
					//Below is for private repository
					//cmd = 'curl --user ' + dockerRepo.dockeruserid + ':' + dockerRepo.dockerpassword + ' -X GET https://index.docker.io/v1/' + dockerRepo.dockerrepopath + '/' + req.params.repopath +  '/tags';
					console.log('executing - ',cmd);
					var curl = new Curl();
					curl.executecurl(cmd,function(err,stdout){
					if(err){
						res.end(err);
					}
					if(stdout){
						if(stdout.indexOf('404:') > 0){
							console.log('No Data');
							res.end('402');
							
						}
						else
						{
							console.log('Received JSON');
							
							res.end(stdout);
						}
					}
					}); 
					
				}
			else
				res.end(err);
		});
		
	/*	*/

	});
	

	app.get('/d4dMasters/mastersjson', function(req, res) {
		res.send([{
			name: 'master'
		}, {
			name: 'master2'
		}]);
	});
	//getAccessFilesForRole
	app.get('/d4dMasters/getaccessroles/:loginname', function(req, res) {
		configmgmtDao.getAccessFilesForRole(req.params.loginname,req,res,function(err,getAccessFiles){
			if(getAccessFiles){
				getAccessFiles = getAccessFiles.replace(/\"/g,'').replace(/\:/g,'')
				console.log('Rcvd in call: ' + getAccessFiles);
				req.session.user.authorizedfiles = getAccessFiles;
				res.end(req.session.user.authorizedfiles);
			}
		});
	});

	app.get('/d4dMasters/getaccessroles/:masterid/:fieldname/:filedvalue',function(req,res){
		//configmgmtDao.getListFiltered(req.params.masterid,req.params.fieldname,req.params.fieldname)

	});

	app.get('/d4dMasters/getcodelist/:name',function(req,res){
		configmgmtDao.getCodeList(req.params.name,function(err,cl){
			console.log(cl);
			if(cl){
				console.log('Closing');
				res.end(cl);
			}
		});
	});

	app.get('/d4dMasters/getuser', function(req, res) {
		res.send({"user":[{
			username: req.session.user
		}, {
			role: '[' +  req.session.user.rolename + ']'
		}]});
	});

	app.get('/d4dMasters/authorizedfiles', function(req, res) {
		res.send('[' + req.session.user.authorizedfiles + ']');
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
	
	//Reading a icon file saved
	app.get('/d4dMasters/image/:imagename', function(req, res) {
		settingsController.getChefSettings(function(settings) {
			var chefRepoPath = settings.chefReposLocation;
			fs.readFile(chefRepoPath  + 'catalyst_files/' +req.params.imagename,function(err,data){
				if(err){
					res.end(404);
				}
				res.writeHead(200,{'Content-Type': 'image/gif' });
				res.end(data, 'binary');
			});
			
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
	app.get('/d4dMasters/getprovider/:rowid',function(req,res){
		d4dModel.findOne({ id: '9' }, function (err, d4dMasterJson) {
			if (err) {
	            console.log("Hit and error:" + err);
	        }
			if (d4dMasterJson) {
				var chefRepoPath = '';
					var hasOrg = false;
					d4dMasterJson.masterjson.rows.row.forEach(function (itm, i) {
	                console.log("found" + itm.field.length);
		                for (var j = 0; j < itm.field.length; j++) {
		                    if (itm.field[j]["name"] == 'rowid') {
		                        if (itm.field[j]["values"].value == req.params.rowid) {
		                            console.log("found: " + i + " -- "  + itm.field[j]["values"].value);
		                            hasOrg = true;
		                            //Re-construct the json with the item found
		                            var configmgmt ='';
		                            for (var k = 0; k < itm.field.length; k++) {
		                            		
		                            			if(configmgmt == '')
		                            				configmgmt += "\"" + itm.field[k]["name"] + "\":\"" +  itm.field[k]["values"].value + "\"";
		                            			else
		                            				configmgmt += ",\"" + itm.field[k]["name"] + "\":\"" +  itm.field[k]["values"].value + "\"";

		                            }
		                            configmgmt = "{" + configmgmt + "}";
		                            console.log(JSON.stringify(configmgmt));
		                        }
		                    }
		                }
	            	}); // rows loop
			}
		});

	});


	app.get('/d4dMasters/getlist/:masterid/:fieldname',function(req,res){
		d4dModel.findOne({ id: req.params.masterid }, function (err, d4dMasterJson) {
			if (err) {
	            console.log("Hit and error:" + err);
	        }
			if (d4dMasterJson) {
				var jsonlist = '';
				d4dMasterJson.masterjson.rows.row.forEach(function (itm, i) {
	                console.log("found" + itm.field.length);
	                   var rowid = '';
	                   var fieldvalue = '';
		               for (var j = 0; j < itm.field.length; j++) {
		               		if (itm.field[j]["name"] == req.params.fieldname) {
		               				fieldvalue = itm.field[j]["values"].value;
		               		}
		               		if (itm.field[j]["name"] == "rowid") {
		               				rowid = itm.field[j]["values"].value;
		               		}
		               } 
		               if(jsonlist == '')
	    					jsonlist += "\"" + fieldvalue + "\":\"" +  rowid + "\"";
					   else
	    					jsonlist += ",\"" + fieldvalue + "\":\"" +  rowid + "\"";

		        });
		       configmgmt = "{" + jsonlist + "}";
		       console.log(JSON.stringify(jsonlist));
		       //res.end(jsonlist);
			}
		});
	});
	
	app.get('/d4dMasters/getlist/:masterid/:fieldname/:fieldname1',function(req,res){
		d4dModel.findOne({ id: req.params.masterid }, function (err, d4dMasterJson) {
			if (err) {
	            console.log("Hit and error:" + err);
	            res.end(null);
	        }
			if (d4dMasterJson) {
				var jsonlist = '';
				d4dMasterJson.masterjson.rows.row.forEach(function (itm, i) {
	                console.log("found" + itm.field.length);
	                   var rowid = '';
	                   var fieldvalue = '';
		               for (var j = 0; j < itm.field.length; j++) {
		               		if (itm.field[j]["name"] == req.params.fieldname) {
		               				fieldvalue = itm.field[j]["values"].value;
		               		}
		               		if (itm.field[j]["name"] == req.params.fieldname1) {
		               				rowid = itm.field[j]["values"].value;
		               		}
		               } 
		              /* if(jsonlist == '')
	    					jsonlist += "\"" + fieldvalue + "\":\"" +  rowid + "\"";
					   else
	    					jsonlist += ",\"" + fieldvalue + "\":\"" +  rowid + "\""; */

	    				if(jsonlist == '')
	    					jsonlist += "{\"" + req.params.fieldname + "\":\"" +  fieldvalue + "\",\"" + req.params.fieldname1 + "\":\"" + rowid + "\"}";
					   else
	    					jsonlist += ",{\"" + req.params.fieldname + "\":\"" +  fieldvalue + "\",\"" + req.params.fieldname1 + "\":\"" + rowid + "\"}";

		        });
		       configmgmt = "[" + jsonlist + "]";
		       console.log(JSON.stringify(jsonlist));
		       res.end(configmgmt);
			} else {
				res.send(404);
			}
		});
	});

	app.get('/d4dMasters/getorgnamebychefserver/:chefserver',function(req,res){
			configmgmtDao.getListFiltered(10,'orgname','configname',req.params.chefserver, function(err, catorgname) {
		            if (err) {
		                res.send(500);
		                return;
		            }
		            console.log("catorgname:", catorgname);

		            if (!catorgname) {
		                res.send('');
		                
		                return;
		            }
		            else{
		            	res.end(catorgname);
		            	return;
		            }


		    });
	});
	app.get('/d4dMasters/:masterid/:filtercolumnname/:filtercolumnvalue', function(req, res) {

 		d4dModel.findOne({ id: req.params.masterid }, function (err, d4dMasterJson) {
			if (err) {
	            console.log("Hit and error:" + err);
	        }
			if (d4dMasterJson) {
				var chefRepoPath = '';
					var hasOrg = false;
					d4dMasterJson.masterjson.rows.row.forEach(function (itm, i) {
	                console.log("found" + itm.field.length);
		                for (var j = 0; j < itm.field.length; j++) {
		                    if (itm.field[j]["name"] == req.params.filtercolumnname) {
		                        if (itm.field[j]["values"].value == req.params.filtercolumnvalue) {
		                            console.log("found: " + i + " -- "  + itm.field[j]["values"].value);
		                            hasOrg = true;
		                            //Re-construct the json with the item found
		                            var configmgmt ='';
		                            for (var k = 0; k < itm.field.length; k++) {
		                            			if(configmgmt == '')
		                            				configmgmt += "\"" + itm.field[k]["name"] + "\":\"" +  itm.field[k]["values"].value + "\"";
		                            			else
		                            				configmgmt += ",\"" + itm.field[k]["name"] + "\":\"" +  itm.field[k]["values"].value + "\"";
		                            }
		                            configmgmt = "{" + configmgmt + "}";
		                            console.log(JSON.stringify(configmgmt));
		                            res.end(configmgmt)
		                        }
		                    }
		                }
	            	}); // rows loop
			}
		});
	});

	app.get('/d4dMasters/configmgmt/:rowid', function(req, res) {

 		d4dModel.findOne({ id: '10' }, function (err, d4dMasterJson) {
			if (err) {
	            console.log("Hit and error:" + err);
	        }
			if (d4dMasterJson) {
				var chefRepoPath = '';
				settingsController.getChefSettings(function(settings) {
						chefRepoPath = settings.chefReposLocation;
						console.log("Repopath:" + chefRepoPath);
				
					var hasOrg = false;
					d4dMasterJson.masterjson.rows.row.forEach(function (itm, i) {
	                console.log("found" + itm.field.length);
		                for (var j = 0; j < itm.field.length; j++) {
		                    if (itm.field[j]["name"] == 'rowid') {
		                        if (itm.field[j]["values"].value == req.params.rowid) {
		                            console.log("found: " + i + " -- "  + itm.field[j]["values"].value);
		                            hasOrg = true;
		                            //Re-construct the json with the item found
		                            var configmgmt ='';
		                            var orgname ='';
		                            var loginname ='';
		                            //looping to get the orgname , loginname
									for (var k = 0; k < itm.field.length; k++) {
		                            		if(itm.field[k]["name"].indexOf("login") >= 0)
		                            			loginname = itm.field[k]["values"].value + "/";
		                            		if(itm.field[k]["name"].indexOf("orgname") >= 0)
		                            			orgname = itm.field[k]["values"].value + "/";
                        			}

		                            for (var k = 0; k < itm.field.length; k++) {
		                            		if(itm.field[k]["name"].indexOf("filename") > 0)
		                            		{
		                            			if(configmgmt == '')
		                            				configmgmt += "\"" + itm.field[k]["name"].replace('_filename','') + "\":\"" +  chefRepoPath + orgname  + loginname + '.chef/' + itm.field[k]["values"].value + "\"";
		                            			else
		                            				configmgmt += ",\"" + itm.field[k]["name"].replace('_filename','')  + "\":\"" +  chefRepoPath + orgname  + loginname + '.chef/' + itm.field[k]["values"].value + "\"";	

		                            		}
		                            }
		                            configmgmt = "{" + configmgmt + "}";
		                            console.log(JSON.stringify(configmgmt));
		                        }
		                    }

		                   // console.log();
		                }
	            	}); // rows loop
				}); //setting closure
			}
		});
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
		var bodyItems = Object.keys(req.body);
		var saveAsfileName = '';
		for(var i = 0; i < bodyItems.length;i++){
			if(bodyItems[i].indexOf("_filename") > 0)
				saveAsfileName = req.body[bodyItems[i]];
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

			//Handling the exception to handle uploads without orgname
			if(req.params.orgname == "undefined"){
				req.params.orgname = "catalyst_files";
			}

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
							console.log('this is where file gets saved as (no folderpath): ' + chefRepoPath + req.params.orgname + '/' + suffix + controlName + '__' + fil.name);
							fs.writeFileSync(chefRepoPath + req.params.orgname + '/' + suffix + controlName + '__' + fil.name, data);
						}
						else{
							if(folderpath.indexOf('.chef') > 0){ //identifying if its a chef config file
								console.log('this is where file gets saved as .chef (with folderpath): ' + chefRepoPath + req.params.orgname + folderpath + fil.name);
								fs.writeFileSync(chefRepoPath + req.params.orgname + folderpath + fil.name, data);
							}
							else //not a a chef config file
							{
								console.log("Folderpath rcvd:" + folderpath);
								
								if(fil.name == saveAsfileName)
									{
										console.log('this is where file gets saved as (with folderpath): ' + chefRepoPath + req.params.orgname + '/' + suffix + controlName + '__' + fil.name);
										fs.writeFileSync(chefRepoPath + req.params.orgname + '/' + suffix + controlName + '__' + fil.name, data);
										
								}
								else
									{
										console.log('this is where file gets saved as (with folderpath) fixed name: ' + chefRepoPath + req.params.orgname  + folderpath + '/' + saveAsfileName);
										//fs.writeFileSync(chefRepoPath + folderpath.substring(1,folderpath.length) + fil.name, data);
										fs.writeFileSync(chefRepoPath + req.params.orgname + folderpath + '/' + saveAsfileName, data);
									}

							}
						}

						
				//	});

				}
			}
		});
		return("200");
	}

	app.post('/d4dMasters/savemasterjsonfull/:id', function(req, res) {
		console.log('received request ' + req.params.id);
		d4dModel.findOne({ id: req.params.id }, function (err, d4dMasterJson) {
			if (err) {
	            console.log("Hit and error:" + err);
	        }
	        if (d4dMasterJson) {
	        	var bodyJson = JSON.parse(JSON.stringify(req.body));

					//pushing the rowid field
				var editMode = false; //to identify if in edit mode.
				var uuid1 = uuid.v4();
				var rowtoedit = null;
				if(bodyJson["rowid"] != null){ //for edit
					editMode = true;
					for(var u = 0; u < d4dMasterJson.masterjson.rows.row.length; u++){
						console.log("Value:" + bodyJson["rowid"]);
						if(d4dMasterJson.masterjson.rows.row[u].rowid == bodyJson["rowid"])
						{
							rowtoedit = d4dMasterJson.masterjson.rows.row[u];
						}
					}
				}
				else //for insert
				{
					bodyJson["rowid"] = uuid1;
				}

				var frmkeys = Object.keys(bodyJson);
				var rowFLD = [];
				console.log(JSON.stringify(bodyJson));

				frmkeys.forEach(function(itm){
					if(!editMode){
						var thisVal = bodyJson[itm];
						var item;

						if(thisVal.indexOf('[') >= 0) //used to check if its an array
							item = "{\"" +  itm + "\" : "  + thisVal + "}";
						else
							item = "{\"" + itm + "\" : \"" + thisVal.replace(/\"/g,'\\"') + "\"}";

						rowFLD.push(JSON.parse(item));
					}
					else{

					}
				});

				var FLD = "{" + JSON.stringify(rowFLD) + "}";
				console.log(FLD);
	        }
				
		});
	});


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
					var editMode = false; //to identify if in edit mode.
					var rowtoedit = null;
					if(bodyJson["rowid"] != null){
						editMode = true;
						for(var u = 0; u < d4dMasterJson.masterjson.rows.row.length; u++){
							for(var i = 0; i < d4dMasterJson.masterjson.rows.row[u].field.length; i++){
								console.log("Value:" + bodyJson[d4dMasterJson.masterjson.rows.row[u].field[i].name]);
								if(d4dMasterJson.masterjson.rows.row[u].field[i].values.value == bodyJson["rowid"])
								{
									
									rowtoedit = d4dMasterJson.masterjson.rows.row[u];
									
								}
							}
						}


						/*d4dMasterJson.masterjson.rows.row.forEach(function(row){
							for(var i = 0; i < row.field.length; i++){
								console.log("Value:" + bodyJson[row.field[i].name]);
								if(row.field[i].values.value == bodyJson["rowid"])
								{
									
									rowtoedit = this;
									return(true);
								}
							}
						}); */
					}
					else
						bodyJson["rowid"] = uuid1;
					//console.log(bodyJson['orgname']);
					
					if(rowtoedit) //testing if the rowtoedit has a value
						console.log("Edited Row:" + JSON.stringify(rowtoedit));


					var frmkeys = Object.keys(bodyJson);

					//var frmvals = Object.keys(bodyJson);
					var rowFLD = [];
				//	var filesNames = Object.keys(req.files);
					var folderpath = ''; //will hold the folderpath field to create the path in the system

					console.log(JSON.stringify(bodyJson));

					frmkeys.forEach(function(itm){
						if(!editMode){
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
						}
						else{ //in edit mode
							if(rowtoedit){
								uuid1 = bodyJson["rowid"];
								console.log('Bodyjson[folderpath]:' + bodyJson["folderpath"]);
								if( bodyJson["folderpath"] == undefined) //folderpath issue fix
									folderpath = ''
								else
									folderpath = bodyJson["folderpath"];
								for(var j = 0; j < rowtoedit.field.length; j++){
									if(bodyJson[rowtoedit.field[j].name] != null){
										rowtoedit.field[j].values.value = bodyJson[rowtoedit.field[j].name];
										console.log('Entered Edit' + rowtoedit.field[j].values.value);
									}
								}
							}
						}

					});
					console.log('Changed');
					var FLD = "{\"field\":" + JSON.stringify(rowFLD) + "}";
					//frmvals.push(rowFLD);
					console.log(FLD);
					if(!rowtoedit){ //push new values only when not in edit mode
						d4dMasterJson.masterjson.rows.row.push(JSON.parse(FLD));
					}

					console.log(JSON.stringify(d4dMasterJson.masterjson));
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

app.get('/d4dMasters/:chefserver/cookbooks', function(req, res) {
        configmgmtDao.getChefServerDetailsByChefServer(req.params.chefserver, function(err, chefDetails) {
            if (err) {
                res.send(500);
                return;
            }
            console.log("chefdata", chefDetails);

            if (!chefDetails) {
                res.send(404);
                return;
            }

            var chef = new Chef({
                userChefRepoLocation: chefDetails.chefRepoLocation,
                chefUserName: chefDetails.loginname,
                chefUserPemFile: chefDetails.userpemfile,
                chefValidationPemFile: chefDetails.validatorpemfile,
                hostedChefUrl: chefDetails.url,
            });

            chef.getCookbooksList(function(err, cookbooks) {
                console.log(err);
                if (err) {
                    res.send(500);
                    return;
                } else {
                    res.send({
                        serverId: chefDetails.rowid,
                        cookbooks: cookbooks
                    });
                }
            });

        });

    });

    app.get('/d4dMasters/:chefserver/roles', function(req, res) {
        configmgmtDao.getChefServerDetailsByChefServer(req.params.chefserver, function(err, chefDetails) {
            if (err) {
                res.send(500);
                return;
            }
            console.log("chefdata", chefDetails);
            if (!chefDetails) {
                res.send(404);
                return;
            }
            var chef = new Chef({
                userChefRepoLocation: chefDetails.chefRepoLocation,
                chefUserName: chefDetails.loginname,
                chefUserPemFile: chefDetails.userpemfile,
                chefValidationPemFile: chefDetails.validatorpemfile,
                hostedChefUrl: chefDetails.url,
            });

            chef.getRolesList(function(err, roles) {
                console.log(err);
                if (err) {
                    res.send(500);
                    return;
                } else {
                    res.send({
                        serverId: chefDetails.rowid,
                        roles: roles
                    });
                }
            });

        });

    });


}
