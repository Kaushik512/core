var d4dModel = require('./d4dmastersmodel.js');



function cusers() {

	this.getUserRole = function(callback,username,req) {
		var userrole;
		d4dModel.findOne({
			id: '7'
		}, function(err, d4dMasterJson) {
			if (err) {
				console.log("Hit and error:" + err);
			}
			if (d4dMasterJson) {
				var hasOrg = false;
				var userrole;
				d4dMasterJson.masterjson.rows.row.forEach(function(itm, i) {
					console.log("found name" + itm.field.length + ":" + username);

					for (var j = 0; j < itm.field.length; j++) {
						console.log(itm.field[j]["name"] == 'loginname');
						if (itm.field[j]["name"] == 'loginname') {
							//console.log("found:" + itm.field[j]["values"].value);
							if (itm.field[j]["values"].value == username) {
								console.log("found username: " + i + " -- " + itm.field[j]["values"].value);
								hasOrg = true;
								for (var k = 0; k < itm.field.length; k++) {
									console.log(itm.field[k]["name"] == 'userrolename');
									if (itm.field[k]["name"] == 'userrolename') {
										userrole = itm.field[k]["values"].value;
										req.session.cuserrole = userrole;
										console.log("UserRole:" + JSON.stringify(userrole));
									}
								}
							}
						}

						// console.log();
					}

					/*JSON.parse(itm).findOne({ name: req.params.fieldname }, function (err, itmjson) {
                    console.log(" Innner: " + JSON.stringify(itmjson));
                });*/

				});


			}
		});
	return(userrole);
	};
}

module.exports = new cusers();