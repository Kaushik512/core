/* Copyright (C) Relevance Lab Private Limited- All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Gobinda Das <gobinda.das@relevancelab.com>,
 * Dec 2015
 */

var d4dModel = require('./d4dmastersmodel.js');
var uuid = require('node-uuid');
var logger = require('_pr/logger')(module);


function Orgs() {
    this.getOrgList = function(callback) {

        d4dModel.findOne({
            id: "1"
        }, function(err, d4dMasterJson) {
            if (err) {
                callback(err, null);
                logger.debug("Hit and error:" + err);
                return;
            }
            if (d4dMasterJson) {
                callback(null, d4dMasterJson);

            } else {
                callback(err, null);
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
                logger.debug("Hit and error:" + err);
            }
            if (d4dMasterJson) {
                var hasOrg = false;
                d4dMasterJson.masterjson.rows.row.forEach(function(itm, i) {
                    logger.debug("found" + itm.field.length);

                    for (var j = 0; j < itm.field.length; j++) {
                        if (itm.field[j]["name"] == 'orgname') {
                            if (itm.field[j]["values"].value == name) {
                                logger.debug("found: " + i + " -- " + itm.field[j]["values"].value);
                                hasOrg = true;
                            }
                        }

                    }

                });
                if (hasOrg == false) {
                    //Creating org
                    logger.debug('Creating');
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
                    callback(true, name);
                }

            } else {
                callback(true, null);
                logger.debug("none found");
            }

        });

    }
}


module.exports = new Orgs();
