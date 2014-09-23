var masterjsonDao = require('../classes/d4dmasters/masterjson.js');
var configmgmtDao = require('../classes/d4dmasters/configmgmt.js');
var Chef = require('../classes/chef');



module.exports.setRoutes = function(app, sessionVerification) {
    app.all('/organizations/*', sessionVerification);


    app.get('/organizations/getTree', function(req, res) {
        masterjsonDao.getMasterJson("1", function(err, orgsJson) {
            if (err) {
                res.send(500);
                return;
            }
            var orgTree = [];
            if (orgsJson.masterjson && orgsJson.masterjson.rows && orgsJson.masterjson.rows.row) {
                for (var i = 0; i < orgsJson.masterjson.rows.row.length; i++) {
                    for (var j = 0; j < orgsJson.masterjson.rows.row[i].field.length; j++) {
                        //console.log(orgsJson.masterjson.rows.row[i].field[j]);
                        if (orgsJson.masterjson.rows.row[i].field[j].name = "orgname") {
                            orgTree.push({
                                name: orgsJson.masterjson.rows.row[i].field[j].values.value,
                                businessGroups: [],
                                environments: []
                            });
                            break;
                        }
                    }
                }

                masterjsonDao.getMasterJson("2", function(err, buJson) {
                    if (err) {
                        res.send(500);
                        return;
                    }
                    if (buJson.masterjson && buJson.masterjson.rows && buJson.masterjson.rows.row) {
                        for (var i = 0; i < orgTree.length; i++) {
                            for (var j = 0; j < buJson.masterjson.rows.row.length; j++) {
                                var isFilterdRow = false;
                                var orgname = '';
                                for (var k = 0; k < buJson.masterjson.rows.row[j].field.length; k++) {
                                    if (buJson.masterjson.rows.row[j].field[k].name == "orgname") {
                                        if (orgTree[i].name == buJson.masterjson.rows.row[j].field[k].values.value) {
                                            isFilterdRow = true;
                                            break;
                                        }
                                    }
                                }
                                console.log(isFilterdRow);
                                if (isFilterdRow) {
                                    for (var k = 0; k < buJson.masterjson.rows.row[j].field.length; k++) {
                                        console.log(buJson.masterjson.rows.row[j].field[k].name);
                                        if (buJson.masterjson.rows.row[j].field[k].name == "productgroupname") {
                                            orgTree[i].businessGroups.push({
                                                name: buJson.masterjson.rows.row[j].field[k].values.value,
                                                projects: []
                                            });
                                            break;
                                        }
                                    }
                                }
                            }
                        }

                        //getting projects 
                        masterjsonDao.getMasterJson("4", function(err, buJson) {
                            if (err) {
                                res.send(500);
                                return;
                            }
                            if (buJson.masterjson && buJson.masterjson.rows && buJson.masterjson.rows.row) {
                                for (var i = 0; i < orgTree.length; i++) {
                                    if (orgTree[i].businessGroups.length) {
                                        var businessGroups = orgTree[i].businessGroups;
                                        for (var j = 0; j < businessGroups.length; j++) {
                                            for (var k = 0; k < buJson.masterjson.rows.row.length; k++) {
                                                var isFilterdRow = false;
                                                for (var l = 0; l < buJson.masterjson.rows.row[k].field.length; l++) {
                                                    if (buJson.masterjson.rows.row[k].field[l].name == "productgroupname") {
                                                        if (businessGroups[j].name == buJson.masterjson.rows.row[k].field[l].values.value) {
                                                            isFilterdRow = true;
                                                            break;
                                                        }
                                                    }
                                                }
                                                if (isFilterdRow) {
                                                    for (var l = 0; l < buJson.masterjson.rows.row[k].field.length; l++) {
                                                        console.log(buJson.masterjson.rows.row[k].field[l].name);
                                                        if (buJson.masterjson.rows.row[k].field[l].name == "projectname") {
                                                            businessGroups[j].projects.push(buJson.masterjson.rows.row[k].field[l].values.value);
                                                            break;
                                                        }
                                                    }
                                                }
                                            }

                                        }
                                    }

                                }
                                //getting environments
                                masterjsonDao.getMasterJson("3", function(err, buJson) {
                                    if (err) {
                                        res.send(500);
                                        return;
                                    }
                                    if (buJson.masterjson && buJson.masterjson.rows && buJson.masterjson.rows.row) {
                                        for (var i = 0; i < orgTree.length; i++) {
                                            for (var j = 0; j < buJson.masterjson.rows.row.length; j++) {
                                                var isFilterdRow = false;
                                                var orgname = '';
                                                for (var k = 0; k < buJson.masterjson.rows.row[j].field.length; k++) {
                                                    if (buJson.masterjson.rows.row[j].field[k].name == "orgname") {
                                                        if (orgTree[i].name == buJson.masterjson.rows.row[j].field[k].values.value) {
                                                            isFilterdRow = true;
                                                            break;
                                                        }
                                                    }
                                                }
                                                if (isFilterdRow) {
                                                    for (var k = 0; k < buJson.masterjson.rows.row[j].field.length; k++) {
                                                        console.log(buJson.masterjson.rows.row[j].field[k].name);
                                                        if (buJson.masterjson.rows.row[j].field[k].name == "environmentname") {
                                                            orgTree[i].environments.push(buJson.masterjson.rows.row[j].field[k].values.value);
                                                            break;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    res.send(orgTree);
                                });

                            }

                        });



                    }

                });

                //getting business groups  

                //res.send(orgTree);

            } else {
                res.send(orgTree);
            }


        });

    });

    app.get('/organizations/:orgname/cookbooks', function(req, res) {
        configmgmtDao.getChefServerDetailsByOrgname(req.params.orgname,function(err,chefDetails){
            if(err){
                res.send(500);
                return;
            }
            console.log("chefdata",chefDetails);

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
                        serverId:chefDetails.rowid,
                        cookbooks:cookbooks
                    });
                }
            });
            
        });

    });


}