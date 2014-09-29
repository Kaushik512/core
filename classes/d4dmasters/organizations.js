var d4dModel = require('./d4dmastersmodel.js');
var uuid = require('node-uuid');


function Orgs() {

	this.getOrgList = function(callback) {

		d4dModel.findOne({
			id: "1"
		}, function(err, d4dMasterJson) {
			if (err) {
				callback(err,null);
				console.log("Hit and error:" + err);
			    return;
			}
			if (d4dMasterJson) {
				callback(null,d4dMasterJson);
				
			} else {
				callback(err,null);
			}


		});

	};

	this.createOrg = function(name, callback) {
		var uuid1 = uuid.v4();
		var orgField = "{\"field\":[{\"values\":{\"value\":\"" + name + "\"},\"name\":\"orgname\"},{\"values\":{\"value\":\"\"},\"name\":\"domainname\"},{\"values\":{\"value\":\"" + uuid1 + "\"},\"name\":\"rowid\"},{\"values\":{\"value\":[\"Dev\",\"Test\",\"Stage\"]},\"name\":\"costcode\"}]}";
		
		d4dModel.findOne({
			id: '1'
		}, function(err, d4dMasterJson) {
			if (err) {
				console.log("Hit and error:" + err);
			}
			if (d4dMasterJson) {
				var hasOrg = false;
				d4dMasterJson.masterjson.rows.row.forEach(function(itm, i) {
					console.log("found" + itm.field.length);

					for (var j = 0; j < itm.field.length; j++) {
						if (itm.field[j]["name"] == 'orgname') {
							//console.log("found:" + itm.field[j]["values"].value);
							if (itm.field[j]["values"].value == name) {
								console.log("found: " + i + " -- " + itm.field[j]["values"].value);
								hasOrg = true;
							}
						}

						// console.log();
					}

					/*JSON.parse(itm).findOne({ name: req.params.fieldname }, function (err, itmjson) {
                    console.log(" Innner: " + JSON.stringify(itmjson));
                });*/

				});
				if (hasOrg == false) {
					//Creating org
					console.log('Creating');
					d4dMasterJson.masterjson.rows.row.push(JSON.parse(orgField));
					d4dModel.update({
						"id": "1"
					}, {
						$set: {
							"masterjson": d4dMasterJson.masterjson
						}
					}, {
						upsert: false
					}, function(err, data) {
						if (err) {
							callback(err, null);
							return;
						}
						callback(null, name);
						
					});
					
				} else {
					callback(true,name);
				}

			} else {
				callback(true,null);
				console.log("none found");
			}

		});

	}



}


module.exports = new Orgs();