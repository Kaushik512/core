var d4dModel = require('./d4dmastersmodel.js');
var uuid = require('node-uuid');
var d4dModelNew = require('./d4dmastersmodelnew.js');
var logger = require('./../../lib/logger')(module);


function Env() {


    this.createEnv__ = function(name, orgname, callback) {
        var uuid1 = uuid.v4();
        //var envField = "{\"field\":[{\"name\":\"environmentname\",\"values\":{\"value\":\"" + name + "\"}},{\"name\":\"orgname\",\"values\":{\"value\":\"" + orgname + "\"}},{\"name\":\"rowid\",\"values\":{\"value\":\"" + uuid1 + "\"}}]}";

        var tempObj = JSON.parse(envField);
        console.log('tempObj ==>', envField);

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
                    var fieldOrgName = null;
                    var fieldEnvName = null;
                    for (var j = 0; j < itm.field.length; j++) {
                        if (itm.field[j]["name"] == 'environmentname') {
                            //console.log("found:" + itm.field[j]["values"].value);
                            if (itm.field[j]["values"].value == name) {
                                console.log("found: " + i + " -- " + itm.field[j]["values"].value);
                                fieldEnvName = itm.field[j]["values"].value;
                            }
                        } else if (itm.field[j]["name"] == 'orgname') {
                            console.log("found: " + i + " -- " + itm.field[j]["values"].value);
                            fieldOrgName = itm.field[j]["values"].value;

                        }
                    }
                    console.log('org====>', orgname, fieldOrgName, fieldEnvName, name);
                    if (orgname == fieldOrgName && fieldEnvName == name) {
                        console.log('has org true');
                        hasOrg = true;
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

    this.createEnv = function(name, orgname,bgname,projname, callback) {
        var uuid1 = uuid.v4();
        //var envField = "{\"field\":[{\"name\":\"environmentname\",\"values\":{\"value\":\"" + name + "\"}},{\"name\":\"orgname\",\"values\":{\"value\":\"" + orgname + "\"}},{\"name\":\"rowid\",\"values\":{\"value\":\"" + uuid1 + "\"}}]}";
        var envField = [];
        // envField.push("\"environmentname: \"" + name + "\"");
        // envField.push("orgname : \"" +  orgname + "\"");
        // envField.push("rowid : \"" + uuid1 + "\"");
        // envField.push("id : \"3\"");
        envField.push('\"environmentname\" : \"' + name + '\"');
        envField.push('\"orgname\" : \"' + orgname + '\"');
        envField.push('\"rowid\" : \"' + uuid1 + '\"');
        envField.push('\"id\" : \"3\"');
      //      var tempObj = JSON.parse(envField);
        var FLD = JSON.parse('{' + envField + '}');

        logger.debug('tempObj ==>', JSON.stringify(FLD));

        // var query = {};
        // query[fieldname] = fieldvalue; //building the query 
        // query['id'] = masterid;
       


        d4dModelNew.d4dModelMastersEnvironments.findOne({
            environmentname : name,
            orgname: orgname,
            id:'3'
        },function(err,envdata){
                if(!envdata)
                {
                    var mastersrdb =  new d4dModelNew.d4dModelMastersEnvironments(FLD);
                    mastersrdb.save(function(err,data){
                        if(err){
                            console.log('Hit Save in createEnv error' + err);
                            callback(err, null);
                            return;
                        }
                        console.log('New Env Master Saved');
                        console.log('Need to update project with : o' + orgname + ' b' + bgname + ' e' + name + ' p' + projname);
                        //Step to add env to project.
                        d4dModelNew.d4dModelMastersProjects.findOne({
                            orgname: orgname,
                            productgroupname: bgname,
                            projectname: projname,
                            id:'4'
                        },function(err,data2){
                            if(!err)
                            {
                                var newenv = data2.environmentname + ',' + name;
                                d4dModelNew.d4dModelMastersProjects.update({
                                    orgname: orgname,
                                    productgroupname: bgname,
                                    projectname: projname,
                                    id:'4'
                                },{environmentname:newenv},function(err,data1){
                                    if(!err)
                                        { 
                                            callback(null, data1);
                                               return;
                                        }
                                    else{
                                        callback(err,null);
                                        return;
                                    }
    
                                });
                            }
                            else
                            {
                                callback(err,null);
                                return;
                            }
                        });
                        
                    });
                }
                else{
                    callback(null,name);
                }
        });
    }

}


module.exports = new Env();