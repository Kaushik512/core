var d4dModel = require('./d4dmastersmodel.js');



function cusers() {

	this.getUserRole = function(callback,username,req) {
		var userrole;
		d4dModel.findOne({
			id: '7'
		}, function(err, d4dMasterJson) {
			if (err) {
				logger.debug("Hit and error:" + err);
			}
			if (d4dMasterJson) {
				var hasOrg = false;
				var userrole;
				d4dMasterJson.masterjson.rows.row.forEach(function(itm, i) {
					logger.debug("found name" + itm.field.length + ":" + username);

					for (var j = 0; j < itm.field.length; j++) {
						logger.debug(itm.field[j]["name"] == 'loginname');
						if (itm.field[j]["name"] == 'loginname') {
							//logger.debug("found:" + itm.field[j]["values"].value);
							if (itm.field[j]["values"].value == username) {
								logger.debug("found username: " + i + " -- " + itm.field[j]["values"].value);
								hasOrg = true;
								for (var k = 0; k < itm.field.length; k++) {
									logger.debug(itm.field[k]["name"] == 'userrolename');
									if (itm.field[k]["name"] == 'userrolename') {
										userrole = itm.field[k]["values"].value;
										req.session.cuserrole = userrole;
										logger.debug("UserRole:" + JSON.stringify(userrole));
									}
								}
							}
						}

						// logger.debug();
					}

					/*JSON.parse(itm).findOne({ name: req.params.fieldname }, function (err, itmjson) {
                    logger.debug(" Innner: " + JSON.stringify(itmjson));
                });*/

				});


			}
		});
	return(userrole);
	};
}

module.exports = new cusers();