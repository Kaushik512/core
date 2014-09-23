var d4dModel = require('./d4dmastersmodel.js');
var settingsController = require('../../controller/settings');

function Configmgmt() {

    this.getChefServerDetails = function(paramorgname, callback) {

        d4dModel.findOne({
            id: '10'
        }, function(err, d4dMasterJson) {
            if (err) {
                console.log("Hit and error:" + err);
            }
            if (d4dMasterJson) {
                var chefRepoPath = '';
                var configmgmt = '';
                settingsController.getChefSettings(function(settings) {
                    chefRepoPath = settings.chefReposLocation;
                    console.log("Repopath:" + chefRepoPath);
                    console.log("paramorgname :" + paramorgname);
                    var hasOrg = false;
                    d4dMasterJson.masterjson.rows.row.forEach(function(itm, i) {
                        console.log("found by org" + itm.field.length);
                        for (var j = 0; j < itm.field.length; j++) {
                            if (itm.field[j]["name"] == 'orgname') {
                                if (itm.field[j]["values"].value == paramorgname) {
                                    console.log("found: " + i + " -- " + itm.field[j]["values"].value);
                                    hasOrg = true;
                                    //Re-construct the json with the item found

                                    var orgname = '';
                                    var loginname = '';
                                    //looping to get the orgname , loginname
                                    for (var k = 0; k < itm.field.length; k++) {
                                        if (itm.field[k]["name"].indexOf("login") >= 0)
                                            loginname = itm.field[k]["values"].value + "/";
                                        if (itm.field[k]["name"].indexOf("orgname") >= 0)
                                            orgname = itm.field[k]["values"].value + "/";
                                    }

                                    for (var k = 0; k < itm.field.length; k++) {
                                        if (itm.field[k]["name"].indexOf("filename") > 0) {
                                            if (configmgmt == '')
                                                configmgmt += "\"" + itm.field[k]["name"].replace('_filename', '') + "\":\"" + chefRepoPath + orgname + loginname + '.chef/' + itm.field[k]["values"].value + "\"";
                                            else
                                                configmgmt += ",\"" + itm.field[k]["name"].replace('_filename', '') + "\":\"" + chefRepoPath + orgname + loginname + '.chef/' + itm.field[k]["values"].value + "\"";

                                        }
                                        else{
                                            if (configmgmt == '')
                                                configmgmt += "\"" + itm.field[k]["name"] + "\":\"" + itm.field[k]["values"].value + "\"";
                                            else
                                                configmgmt += ",\"" + itm.field[k]["name"] + "\":\"" + itm.field[k]["values"].value + "\"";
                                        }
                                    }
                                    configmgmt = "{" + configmgmt + "}";
                                    console.log(JSON.stringify(configmgmt));
                                    return;
                                }
                            }

                            // console.log();
                        }
                    }); // rows loop
                }); //setting closure
                callback(null, configmgmt);
            } else {
                callback(true, null);
            }
        });
    };

    this.getChefFiles = function(rowid, callback) {

        d4dModel.findOne({
            id: '10'
        }, function(err, d4dMasterJson) {
            if (err) {
                console.log("Hit and error:" + err);
            }
            if (d4dMasterJson) {
                var chefRepoPath = '';
                var configmgmt = '';
                settingsController.getChefSettings(function(settings) {
                    chefRepoPath = settings.chefReposLocation;
                    console.log("Repopath:" + chefRepoPath);

                    var hasOrg = false;
                    d4dMasterJson.masterjson.rows.row.forEach(function(itm, i) {
                        console.log("found" + itm.field.length);
                        for (var j = 0; j < itm.field.length; j++) {
                            if (itm.field[j]["name"] == 'rowid') {
                                if (itm.field[j]["values"].value == rowid) {
                                    console.log("found: " + i + " -- " + itm.field[j]["values"].value);
                                    hasOrg = true;
                                    //Re-construct the json with the item found

                                    var orgname = '';
                                    var loginname = '';
                                    //looping to get the orgname , loginname
                                    for (var k = 0; k < itm.field.length; k++) {
                                        if (itm.field[k]["name"].indexOf("login") >= 0)
                                            loginname = itm.field[k]["values"].value + "/";
                                        if (itm.field[k]["name"].indexOf("orgname") >= 0)
                                            orgname = itm.field[k]["values"].value + "/";
                                    }

                                    for (var k = 0; k < itm.field.length; k++) {
                                        if (itm.field[k]["name"].indexOf("filename") > 0) {
                                            if (configmgmt == '')
                                                configmgmt += "\"" + itm.field[k]["name"].replace('_filename', '') + "\":\"" + chefRepoPath + orgname + loginname + '.chef/' + itm.field[k]["values"].value + "\"";
                                            else
                                                configmgmt += ",\"" + itm.field[k]["name"].replace('_filename', '') + "\":\"" + chefRepoPath + orgname + loginname + '.chef/' + itm.field[k]["values"].value + "\"";

                                        }
                                        else{
                                            if (configmgmt == '')
                                                configmgmt += "\"" + itm.field[k]["name"] + "\":\"" + itm.field[k]["values"].value + "\"";
                                            else
                                                configmgmt += ",\"" + itm.field[k]["name"] + "\":\"" + itm.field[k]["values"].value + "\"";
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
                callback(null, configmgmt);
            } else {
                callback(true, null);
            }
        });
    };

    this.getProvider = function(rowid, callback) {

        d4dModel.findOne({
            id: '9'
        }, function(err, d4dMasterJson) {
            if (err) {
                console.log("Hit and error:" + err);
            }
            if (d4dMasterJson) {
                var configmgmt = '';
                var chefRepoPath = '';
                var hasOrg = false;
                d4dMasterJson.masterjson.rows.row.forEach(function(itm, i) {
                    console.log("found" + itm.field.length);
                    for (var j = 0; j < itm.field.length; j++) {
                        if (itm.field[j]["name"] == 'rowid') {
                            if (itm.field[j]["values"].value == rowid) {
                                console.log("found: " + i + " -- " + itm.field[j]["values"].value);
                                hasOrg = true;
                                //Re-construct the json with the item found
                                var configmgmt = '';
                                for (var k = 0; k < itm.field.length; k++) {

                                    if (configmgmt == '')
                                        configmgmt += "\"" + itm.field[k]["name"] + "\":\"" + itm.field[k]["values"].value + "\"";
                                    else
                                        configmgmt += ",\"" + itm.field[k]["name"] + "\":\"" + itm.field[k]["values"].value + "\"";

                                }
                                configmgmt = "{" + configmgmt + "}";
                                console.log(JSON.stringify(configmgmt));

                            }
                        }
                    }
                }); // rows loop
                callback(null, configmgmt);
            }
        });

    };

    this.getList = function(masterid, fieldname, callback) {
        d4dModel.findOne({
            id: masterid
        }, function(err, d4dMasterJson) {
            if (err) {
                console.log("Hit and error:" + err);
            }
            if (d4dMasterJson) {
                var jsonlist = '';
                d4dMasterJson.masterjson.rows.row.forEach(function(itm, i) {
                    console.log("found" + itm.field.length);
                    var rowid = '';
                    var fieldvalue = '';
                    for (var j = 0; j < itm.field.length; j++) {
                        if (itm.field[j]["name"] == fieldname) {
                            fieldvalue = itm.field[j]["values"].value;
                        }
                        if (itm.field[j]["name"] == "rowid") {
                            rowid = itm.field[j]["values"].value;
                        }
                    }
                    if (jsonlist == '')
                        jsonlist += "\"" + fieldvalue + "\":\"" + rowid + "\"";
                    else
                        jsonlist += ",\"" + fieldvalue + "\":\"" + rowid + "\"";

                });
                configmgmt = "{" + jsonlist + "}";
                console.log(JSON.stringify(jsonlist));
                callback(null, jsonlist);
            }
        });
    };

    this.getListFiltered = function(masterid, fieldname, comparedfieldname, comparedfieldvalue, callback) {
        d4dModel.findOne({
            id: masterid
        }, function(err, d4dMasterJson) {
            if (err) {
                console.log("Hit and error:" + err);
            }
            if (d4dMasterJson) {
                var jsonlist = '';
                d4dMasterJson.masterjson.rows.row.forEach(function(itm, i) {
                    console.log("found" + itm.field.length);
                    var rowid = '';
                    var fieldvalue = '';
                    var isFilteredRow = false;
                    //filtering for the correct rows
                    for (var j = 0; j < itm.field.length; j++) {
                        if (itm.field[j][comparedfieldname] == comparedfieldvalue) {
                            isFilteredRow = true;
                        }
                    }
                    if (isFilteredRow) {
                        for (var j = 0; j < itm.field.length; j++) {
                            if (itm.field[j]["name"] == fieldname) {
                                fieldvalue = itm.field[j]["values"].value;
                            }
                            if (itm.field[j]["name"] == "rowid") {
                                rowid = itm.field[j]["values"].value;
                            }
                        }
                        if (jsonlist == '')
                            jsonlist += "\"" + fieldvalue + "\":\"" + rowid + "\"";
                        else
                            jsonlist += ",\"" + fieldvalue + "\":\"" + rowid + "\"";
                    }

                });
                configmgmt = "{" + jsonlist + "}";
                console.log(JSON.stringify(jsonlist));
                callback(null, jsonlist);
            }
        });
    };

}

module.exports = new Configmgmt();