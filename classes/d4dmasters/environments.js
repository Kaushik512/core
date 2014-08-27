var d4dModel = require('./d4dmastersmodel.js');



function Env() {

	this.createEnv = function(name, orgname, callback) {
		var envField = "{\"field\":[{\"name\":\"environmentname\",\"values\":{\"value\":\"" + name + "\"}},{\"name\":\"orgname\",\"values\":{\"value\":\"" + orgname + "\"}}]}";

		d4dModel.findOne({
			id: '3'
		}, function(err, d4dMasterJson) {
			if (err) {
				console.log("Hit and error:" + err);
			}
			if (d4dMasterJson) {
				var hasOrg = false;
				d4dMasterJson.masterjson.rows.row.forEach(function(itm, i) {
					console.log("found" + itm.field.length);

					for (var j = 0; j < itm.field.length; j++) {
						if (itm.field[j]["name"] == 'environmentname') {
							//console.log("found:" + itm.field[j]["values"].value);
							if (itm.field[j]["values"].value == name) {
								console.log("found: " + i + " -- " + itm.field[j]["values"].value);
								hasOrg = true;
							}
						}
					}


				});
				if (hasOrg == false) {
					//Creating org
					console.log('Creating');
					d4dMasterJson.masterjson.rows.row.push(JSON.parse(envField));


					d4dModel.update({
						"id": "3"
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
						callback(null, data);
					});
				} else {
					callback(null, name);
				}

			} else {
				callback(true, name);
				console.log("none found");
			}

		});

	}



}


module.exports = new Env();