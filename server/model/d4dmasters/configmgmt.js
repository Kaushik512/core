var d4dModel = require('./d4dmastersmodel.js');
var d4dModelNew = require('./d4dmastersmodelnew.js');
var settingsController = require('../settings');
var codelist = require('../../codelist.json');

function Configmgmt() {
    this.getDBModelFromID = function(id,callback){
        switch(id){
            case "1":
                callback(null,'d4dModelMastersOrg');
                break;
            case "2":
                callback(null,'d4dModelMastersProductGroup');
                break;
            case "3":
                callback(null,'d4dModelMastersEnvironments');
                break;
            case "4":
                callback(null,'d4dModelMastersProjects');
                break;
            case "5":
                callback(null,'d4dModelMastersProjects');
                break;
            case "6":
                callback(null,'d4dModelMastersProjects');
                break;
            case "7":
                callback(null,'d4dModelMastersProjects');
                break;
            case "8":
                callback(null,'d4dModelMastersProjects');
                break;
            case "9":
                callback(null,'d4dModelMastersProjects');
                break;
            case "10":
                callback(null,'d4dModelMastersConfigManagement');
                break;
            case "16":
                callback(null,'d4dModelMastersDesignTemplateTypes');
                break;
            case "17":
                callback(null,'d4dModelMastersTemplatesList');
                break;
            case "18":
                callback(null,'d4dModelMastersDockerConfig');
                break;
            case "19":
                callback(null,'d4dModelMastersServicecommands');
                break;
        }
    };
    this.getChefServerDetails_old = function(rowid, callback) {
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

                                        } else {
                                            if (configmgmt == '')
                                                configmgmt += "\"" + itm.field[k]["name"] + "\":\"" + itm.field[k]["values"].value + "\"";
                                            else
                                                configmgmt += ",\"" + itm.field[k]["name"] + "\":\"" + itm.field[k]["values"].value + "\"";
                                        }
                                    }
                                    configmgmt += ",\"chefRepoLocation\":\"" + chefRepoPath + orgname + loginname + "\"";

                                    configmgmt = "{" + configmgmt + "}";
                                    configmgmt = JSON.parse(configmgmt);
                                    console.log(JSON.stringify(configmgmt));
                                }
                            }

                            // console.log();
                        }
                    }); // rows loop
                    callback(null, configmgmt);
                }); //setting closure

            } else {
                callback(true, null);
            }
        });
    };

    this.getChefServerDetails = function(rowid, callback) {
        this.getDBModelFromID("10",function(err,dbtype){
            if (err) {
                console.log("Hit and error getChefServerDetails.getDBModelFromID:" + err);
                callback(true, err);
            }
            if(dbtype){
                console.log("Master Type: " + dbtype);
                eval('d4dModelNew.'+ dbtype).findOne({
                rowid: rowid
                }, function(err, d4dMasterJson) {
                    if (err) {
                        console.log("Hit and error @ getChefServerDetails:" + err);
                    }
                    var chefRepoPath = '';
                    var configmgmt = '';
                    settingsController.getChefSettings(function(settings) {
                            chefRepoPath = settings.chefReposLocation;
                            console.log("Repopath:" + chefRepoPath);

                            var outJson = JSON.parse(JSON.stringify(d4dMasterJson));
                            var keys = Object.keys(outJson);
                            var orgname = '';
                            var loginname = '';
                            for (i = 0; i < keys.length; i++) {
                                var k = keys[i];
                                if (keys[i].indexOf("login") >= 0)
                                    loginname = outJson[k] + "/";
                                if (keys[i].indexOf("orgname") >= 0)
                                    orgname = outJson[k] + "/";
                            }
                            if(loginname != '' && orgname != ''){
                                for (i = 0; i < keys.length; i++) {
                                    var k = keys[i];
                                    if(keys[i].indexOf('_filename') > 0){
                                     keys[i] = keys[i].replace('_filename','');
                                      outJson[k] = chefRepoPath + orgname + loginname + '.chef/' + outJson[k];
                                    }
                                    if(configmgmt == '')
                                        configmgmt = '\"' + keys[i] + '\":\"' + outJson[k] + '\"';
                                    else
                                        configmgmt += ',\"' + keys[i] + '\":\"' + outJson[k] + '\"';

                                    //console.log('>>>>>' + keys[i] + ':' + outJson[keys[i]] );
                                }
                                if(configmgmt != ''){
                                    configmgmt += ',\"chefRepoLocation\":\"' + chefRepoPath + orgname + loginname + '\"';
                                }
                            }
                            console.log('configmgmt: ' + configmgmt);
                            callback(null,JSON.parse('{' + configmgmt + '}'));
                    });
                    // for (var j = 0; j < outJson.length; j++) {
                    //     console.log('Out:' + outJson[j]);
                    // }
                    // for(var itm in d4dMasterJson){
                    //     console.log(itm);
                    // }
                    
                });
            }
        });
    };


    this.getAccessFilesForRole = function(loginname, user, req, res, callback) {
        console.log("Received Role name: " + loginname);
        var accessibleFiles = [];
        var mainRef = this;
        var countOuter = 0;
        var countInner = 0;
        var countInnerInner = 0;
        var roleslist = this.getListFiltered(7, "userrolename", "loginname", loginname, function(err, rolenames) {
            if (rolenames) {
                console.log("Rolenames for User:" + rolenames);
                var rn = rolenames.replace(/\"/g, '').split(':')[0].split(',');

                rn.forEach(function(rn1) {
                    if (user.rolename == null || user.rolename == '')
                        user.rolename = rn1;
                    else
                        user.rolename += ",&nbsp;" + rn1;

                    console.log("Role " + countOuter + ":" + rn1);
                    var permissionlist = mainRef.getListFiltered(6, "globalaccessname", "userrolename", rn1, function(err, globalaccessname) {

                        console.log("inside globalaccessname : " + (globalaccessname == null));
                        console.log("globalaccessname : " + globalaccessname.toString());
                        var ga = globalaccessname.replace(/\"/g, '').split(':')[0].split(',');
                        if (ga) {

                            ga.forEach(function(ga1) {

                                console.log('Access Type : ' + ga1);
                                mainRef.getListFiltered(8, "files", "globalaccessname", ga1, function(err, jlt) {
                                    countInner++;
                                    console.log('inner loop ' + jlt);
                                    //count++;
                                    if (accessibleFiles.indexOf(jlt) < 0) {
                                        jlt = jlt.split(':')[0];
                                        accessibleFiles.push(jlt);
                                    }
                                    console.log(countOuter, rn.length, countInner, ga.length);
                                    if (countOuter < rn.length) {

                                    }
                                    if (countInner == ga.length && countOuter < rn.length) {
                                        countOuter++;
                                        if (countOuter < rn.length) {
                                            countInner = 0;
                                        }

                                    }
                                    console.log(countOuter, rn.length, countInner, ga.length);
                                    if (countOuter == rn.length && countInner == ga.length) {
                                        callback(null, accessibleFiles.toString());

                                    }
                                });
                            });
                        }
                    });

                }); //end of foreach rn

            } //end if(rolename)

        }); //filter1
        // callback(null,accessibleFiles.toString());
    };

    this.getAccessFilesForRole2 = function(loginname, req, res, callback) {
        console.log("Received Role name: " + loginname);
        var accessibleFiles = [];
        var mainRef = this;
        var countOuter = 0;
        var roleslist = this.getListFiltered(7, "userrolename", "loginname", loginname, function(err, rolenames) {
            if (rolenames) {
                console.log("Rolenames for User:" + rolenames);
                var rn = rolenames.replace(/\"/g, '').split(':')[0].split(',');
                if (rn) {

                    rn.forEach(function(rn1) {
                        console.log("Role " + countOuter + ":" + rn1);
                        countOuter++;
                        var permissionlist = mainRef.getListFiltered(5, "globalaccessname", "userrolename", rn1, function(err, globalaccessname) {
                            console.log("inside" + (globalaccessname == null));
                            if (err) {
                                console.log("Hit and error:" + err);
                            }
                            if (globalaccessname) {

                                var ga = globalaccessname.replace(/\"/g, '').split(':')[0].split(',');
                                if (ga) {
                                    var count = 0;
                                    ga.forEach(function(ga1) {
                                        mainRef.getListFiltered(8, "files", "globalaccessname", ga1, function(err, jlt) {
                                            console.log('inner loop ' + jlt);
                                            count++;
                                            if (accessibleFiles.indexOf(jlt) < 0) {
                                                accessibleFiles.push(jlt);
                                            }
                                            if (count == ga.length) {
                                                //callback(null,accessibleFiles.toString());
                                            }
                                        });
                                    });

                                }
                            }
                            if (countOuter == rn.length) {

                            }
                        });
                    });

                } else
                    callback("err", null);
                /* */

            }
        });
        // callback(null,"HIT");
    };
    //Receiving the permission level for Role
    this.getAccessFilesForRole1 = function(rolename, req, res, callback) {
        console.log("Received Role name: " + rolename);
        var accessibleFiles = [];
        var mainRef = this;
        var roleslist = this.getListFiltered(6, "globalaccessname", "userrolename", rolename, function(err, globalaccessname) {
            if (err) {
                console.log("Hit and error:" + err);
            }
            if (globalaccessname) {

                //"\"Projects,Groups,Environments,Providers,ChefServer,Gallery,UserManagement,Design\":
                /* var ga = globalaccessname.substring(1,globalaccessname.length);
                console.log("First pass: " + ga);
                ga = ga.substring(0,ga.length-2).split(',');
                console.log("Second pass: " + ga);
                for(var k = 0; k < ga.length;k++){
                    //console.log(ga[k]);
                }*/
                var ga = globalaccessname.replace(/\"/g, '').split(':')[0].split(',');
                if (ga) {
                    var testing = function(ga, callback) {
                        for (var k = 0; k < ga.length; k++) {
                            console.log('Set Global Access : ' + ga[k]);


                            var justlikethat = mainRef.getListFiltered(8, "files", "globalaccessname", ga[k], function(err, gafiles) {
                                if (gafiles) {

                                    var gaf = gafiles.split(',');
                                    for (var l = 0; l < gaf.length; l++) {
                                        if (accessibleFiles.indexOf(gaf[l]) < 0) {
                                            accessibleFiles.push(gaf[l]);
                                            console.log('File List for Global ' + accessibleFiles);

                                        }
                                    }
                                }
                            });

                        }

                    }

                }
                // callback(null,accessibleFiles);
                //var obj1 = JSON.parse(globalaccessname);
            }
        }); //end call back getlistfiltereed
        console.log('Final :' + accessibleFiles);
    };

    this.getChefServerDetailsByChefServer = function(paramconfigname, callback) {
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
                    console.log("paramorgname :" + paramconfigname);
                    var hasOrg = false;
                    d4dMasterJson.masterjson.rows.row.forEach(function(itm, i) {
                        console.log("found by org" + itm.field.length);
                        for (var j = 0; j < itm.field.length; j++) {
                            if (itm.field[j]["name"] == 'configname') {
                                if (itm.field[j]["values"].value == paramconfigname) {
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

                                        } else {
                                            if (configmgmt == '')
                                                configmgmt += "\"" + itm.field[k]["name"] + "\":\"" + itm.field[k]["values"].value + "\"";
                                            else
                                                configmgmt += ",\"" + itm.field[k]["name"] + "\":\"" + itm.field[k]["values"].value + "\"";
                                        }
                                    }
                                    configmgmt += ",\"chefRepoLocation\":\"" + chefRepoPath + orgname + loginname + "\"";

                                    configmgmt = "{" + configmgmt + "}";
                                    //console.log(">>>>>>" + JSON.stringify(configmgmt));
                                    configmgmt = JSON.parse(configmgmt);
                                    return;
                                }
                            }

                            // console.log();
                        }
                    }); // rows loop
                    callback(null, configmgmt);
                }); //setting closure

            } else {
                callback(true, null);
            }
        });
    }

    this.getChefServerDetailsByOrgname = function(paramorgname, callback) {
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
                                            // console.log(itm.field[k]["name"]," <===> ",itm.field[k]["values"].value);
                                            if (configmgmt == '')
                                                configmgmt += "\"" + itm.field[k]["name"].replace('_filename', '') + "\":\"" + chefRepoPath + orgname + loginname + '.chef/' + itm.field[k]["values"].value + "\"";
                                            else
                                                configmgmt += ",\"" + itm.field[k]["name"].replace('_filename', '') + "\":\"" + chefRepoPath + orgname + loginname + '.chef/' + itm.field[k]["values"].value + "\"";
                                            //  console.log("configmgmt ==>  ",configmgmt);
                                        } else {
                                            //  console.log(itm.field[k]["name"]," <===> ",itm.field[k]["values"].value);

                                            if (configmgmt == '')
                                                configmgmt += "\"" + itm.field[k]["name"] + "\":\"" + itm.field[k]["values"].value + "\"";
                                            else
                                                configmgmt += ",\"" + itm.field[k]["name"] + "\":\"" + itm.field[k]["values"].value + "\"";
                                            // console.log("configmgmt ==>  ",configmgmt);
                                        }
                                    }
                                    configmgmt += ",\"chefRepoLocation\":\"" + chefRepoPath + orgname + loginname + "\"";

                                    configmgmt = "{" + configmgmt + "}";
                                    //console.log(JSON.stringify(configmgmt));
                                    console.log(configmgmt);
                                    configmgmt = JSON.parse(configmgmt);
                                    return;
                                }
                            }

                            // console.log();
                        }
                    }); // rows loop
                    callback(null, configmgmt);
                }); //setting closure

            } else {
                callback(true, null);
            }
        });
    }

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

    this.getMasterRow = function(masterid, fieldname, fieldvalue, callback) {

        d4dModel.findOne({
            id: masterid
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
                        if (itm.field[j]["name"] == fieldname) {
                            if (itm.field[j]["values"].value == fieldvalue) {
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
                                console.log('Before Call back ->' + JSON.stringify(configmgmt));
                                //return(configmgmt);
                                //return;
                            }
                        }
                    }
                    callback(null, configmgmt);

                }); // rows loop

            }
        });

    };

    this.getList = function(masterid, fieldname, callback) {
        var configmgmt = '';
        d4dModel.findOne({
            id: masterid
        }, function(err, d4dMasterJson) {
            if (err) {
                console.log("Hit and error:" + err);
                callback(err, null);
                return;
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
                        jsonlist += "{\"" + fieldvalue + "\":\"" + rowid + "\"}";
                    else
                        jsonlist += ",{\"" + fieldvalue + "\":\"" + rowid + "\"}";

                });
                configmgmt = "[" + jsonlist + "]";
                console.log(JSON.stringify(configmgmt));
                callback(null, JSON.parse(configmgmt));;
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
                    //console.log("found" + itm.field.length);
                    //console.log("Item Json" + JSON.stringify(itm));
                    var rowid = '';
                    var fieldvalue = '';
                    var isFilteredRow = false;
                    //filtering for the correct rows
                    for (var j = 0; j < itm.field.length; j++) {
                        //    console.log(JSON.stringify("in the loop : " + itm.field[j][]) + ":" + itm.field[j]['name'] + ':' + comparedfieldvalue);

                        if (itm.field[j]["name"] == comparedfieldname) {
                            if (itm.field[j]["values"].value == comparedfieldvalue) {
                                console.log("In Field [ " + itm.field[j]["name"] + "]" + itm.field[j]["values"].value);
                                isFilteredRow = true;

                            }


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
                return (jsonlist);
            }
        });
    };

    this.getCodeList = function(name, callback) {
        if (codelist) {
            var count = 0;
            var list = '';
            console.log('Code List Items length: ' + codelist.length);
            codelist.forEach(function(k, v) {
                console.log("Code items: ", k.name, "Values", k.values.length);
                if (k.name == name) {
                    for (var i = 0; i < k.values.length; i++) {
                        if (list == '') {
                            list = k.values[i];
                        } else
                            list += ',' + k.values[i];

                        console.log(k.values[i]);
                    }
                }
                count++;
                if (count >= codelist.length) {
                    console.log('reached callback');
                    callback(null, list);
                    //return;
                }
            });
        }
    };

    this.getServiceFromId = function(serviceId, callback) {
        d4dModel.findOne({
            id: '19'
        }, function(err, d4dMasterJson) {
            if (err) {
                console.log("Hit and error:" + err);
                callback(err,null);
                return;
            }
            if (d4dMasterJson) {
                //var bodyJson = JSON.parse(JSON.stringify(req.body));
                bodyJson = {};
                bodyJson.serviceids = [].concat(serviceId);

                if (bodyJson["serviceids"] != null) {
                    var root = '';
                    bodyJson["serviceids"].forEach(function(serviceid, servicecount) {
                        console.log(serviceid + '::' + servicecount);

                        d4dMasterJson.masterjson.rows.row.forEach(function(itm, i) {
                            console.log("found" + itm.field.length);


                            var configmgmt = '';
                            for (var j = 0; j < itm.field.length; j++) {
                                if (itm.field[j]["name"] == 'rowid') {
                                    if (itm.field[j]["values"].value == serviceid) {
                                        console.log("found: " + i + " -- " + itm.field[j]["values"].value);
                                        hasOrg = true;
                                        //Re-construct the json with the item found


                                        for (var k = 0; k < itm.field.length; k++) {
                                            if (configmgmt == '')
                                                configmgmt += "\"" + itm.field[k]["name"] + "\":\"" + itm.field[k]["values"].value + "\"";
                                            else
                                                configmgmt += ",\"" + itm.field[k]["name"] + "\":\"" + itm.field[k]["values"].value + "\"";
                                        }
                                        // configmgmt = "{" + configmgmt + "}";
                                        // console.log(JSON.stringify(configmgmt));
                                        // res.end(configmgmt);
                                    }
                                }
                            }
                            if (configmgmt != '') {
                                if (root != '')
                                    root += ",{" + configmgmt + "}";
                                else
                                    root += "{" + configmgmt + "}";;

                            }

                        }); // rows loop


                    });
                    root = '[' + root + ']';
                    console.log(root);
                    callback(null,JSON.parse(root));
                }

            } else {
                callback(true,null);
                return;
            }

        });

    }

}

module.exports = new Configmgmt();