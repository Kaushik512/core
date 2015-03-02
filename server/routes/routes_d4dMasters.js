var d4dModel = require('../model/d4dmasters/d4dmastersmodel.js');
var d4dModelNew = require('../model/d4dmasters/d4dmastersmodelnew.js');

var fileIo = require('../lib/utils/fileio');
var uuid = require('node-uuid');
var configmgmtDao = require('../model/d4dmasters/configmgmt');
var Chef = require('../lib/chef');
var Curl = require('../lib/utils/curl.js');
var appConfig = require('../config/app_config');
var logger  = require('../lib/logger')(module);
var childProcess = require('child_process');
var exec = childProcess.exec;


module.exports.setRoutes = function(app, sessionVerification) {

    app.all('/d4dMasters/*',sessionVerification);


    /*app.get('/d4dMasters/saveTest', function(req, res) {
        var m = new d4dModel();
        m.save(function(err, data) {
            console.log(data);
            res.send(data);
        });
    })*/
    app.get('/d4dmasters/dockervalidate/:username/:password', function(req, res) {
        var cmd = 'curl --raw -L --user ' + req.params.username + ':' + req.params.password + ' https://index.docker.io/v1/users';
        var curl = new Curl();
        curl.executecurl(cmd, function(err, stdout) {
            if (err) {
                res.end(err);
            }
            if (stdout) {
                if (stdout.indexOf('OK') > 0) {
                    console.log('Good');
                    res.end('200');
                } else {
                    console.log('No User');
                    res.end('402');
                }
            }
        });

    });

    app.get('/d4dmasters/instanceping/:ip',function(req,res){
        var cmd = 'ping -c 1 -w 1 ' + req.params.ip ;
        var curl = new Curl();
        console.log("Pinging Node to check if alive :" + cmd );
        curl.executecurl(cmd, function(err, stdout) {
            if (err) {
                res.end(err);
            }
            if (stdout) {
                if (stdout.indexOf('1 received') > 0) {
                    console.log('Good');
                    //res.send();
                    res.end('Alive');
                    //res.send('200');
                    return;

                } else {
                    console.log('Not Found');
                    //res.send('400 Not Found');\
                   res.end('Not Alive');
                   // res.send('200');
                    return;
                }
            }
        });
    });

    app.get('/d4dmasters/getdockertags/:repopath/:dockerreponame', function(req, res) {
        //fetch the username and password from 
        //Need to populate dockerrowid in template card. - done
        console.log('hit getdockertags');
        configmgmtDao.getMasterRow(18, 'dockerreponame', req.params.dockerreponame, function(err, data) {
            if (!err) {

                var dockerRepo = JSON.parse(data);
                console.log('Docker Repo ->', JSON.stringify(dockerRepo));
                var cmd = '';
                //Below is for public repository
                cmd = 'curl -v -H "Accept: application/json" -X GET https://' + dockerRepo.dockeruserid + ':' + dockerRepo.dockerpassword + '@index.docker.io/v1/repositories/' + req.params.repopath + '/tags';
                //Below is for private repository
                //cmd = 'curl --user ' + dockerRepo.dockeruserid + ':' + dockerRepo.dockerpassword + ' -X GET https://index.docker.io/v1/' + dockerRepo.dockerrepopath + '/' + req.params.repopath +  '/tags';
                console.log('executing - ', cmd);
                var curl = new Curl();
                curl.executecurl(cmd, function(err, stdout) {
                    if (err) {
                        res.end(err);
                    }
                    if (stdout) {
                        if (stdout.indexOf('404:') > 0) {
                            console.log('No Data');
                            res.end('402');

                        } else {
                            console.log('Received JSON');

                            res.end(stdout);
                        }
                    }
                });

            } else {
                console.log('Error:' + err);
                res.end(err);
            }
        });

        /*  */

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
        configmgmtDao.getAccessFilesForRole(req.params.loginname, req, res, function(err, getAccessFiles) {
            if (getAccessFiles) {
                getAccessFiles = getAccessFiles.replace(/\"/g, '').replace(/\:/g, '')
                console.log('Rcvd in call: ' + getAccessFiles);
                req.session.user.authorizedfiles = getAccessFiles;
                res.end(req.session.user.authorizedfiles);
            }
        });
    });

    app.get('/d4dMasters/getaccessroles/:masterid/:fieldname/:filedvalue', function(req, res) {
        //configmgmtDao.getListFiltered(req.params.masterid,req.params.fieldname,req.params.fieldname)

    });

    app.get('/d4dMasters/getcodelist/:name', function(req, res) {
        configmgmtDao.getCodeList(req.params.name, function(err, cl) {
            console.log(cl);
            if (cl) {
                console.log('Closing');
                res.end(cl);
            }
        });
    });

    app.get('/d4dMasters/getuser', function(req, res) {
        res.send({
            "user": [{
                username: req.session.user
            }, {
                role: '[' + req.session.user.rolename + ']'
            }]
        });


        // var query = {};
        // console.log(req.session.user);
        // query['loginname'] = req.session.user.cn; //building the query 
        // query['id'] = '7';

        // console.log(req.session.user.cn);
       
        // d4dModelNew.d4dModelMastersUsers.find(query, function(err, d4dMasterJson) {
        //     if (err) {
        //         console.log("Hit and error:" + err);
        //     }
        //     res.end(JSON.stringify(d4dMasterJson));
        //     console.log("sent response" + JSON.stringify(d4dMasterJson));
        // });
            
    });

    app.get('/d4dMasters/authorizedfiles', function(req, res) {
        res.send('[' + req.session.user.authorizedfiles + ']');
    });

    app.get('/d4dMasters/candelete/:rowid/:formid',function(req,res){
         
         // swtich(req.params.formid){
         //    case "1": //this will be org

         // }
         // configmgmtDao.deleteCheck(req.params.rowid,formids,fieldname,function(err,data){
            
         // });
         
    });

    app.get('/d4dMasters/removeitem/:id/:fieldname/:fieldvalue', function(req, res) {
        console.log("REceived request for delete chk." + req.params.fieldvalue +  ' : ' + req.params.id + ' : ' + req.params.fieldname);
       // console.log('received request ' + req.params.id);
       //Referntial integrity check to be done.
       var tocheck = [];
        switch (req.params.id){
            case "1":
                tocheck.push('2');
                tocheck.push('3');
                break;
            case "2":
                tocheck.push('4');
                break;
            case "3":
                tocheck.push('4');
                break;
        }
        configmgmtDao.deleteCheck(req.params.rowid,formids,fieldname,function(err,data){
        if(data == "none"){
            configmgmtDao.getDBModelFromID(req.params.id, function(err, dbtype) {
                if (err) {
                    console.log("Hit and error:" + err);
                }
                if (dbtype) {
                    //Currently rowid is hardcoded since variable declaration was working
                    var item = '\"' + req.params.fieldname + '\"';
                    console.log("Master Type: " + dbtype + ":" + item + ":" + req.params.fieldvalue);
                    eval('d4dModelNew.' + dbtype).remove({
                        rowid: req.params.fieldvalue
                    }, function(err) {
                        if (err) {
                            console.log('Hit an errror on delete : ' + err);
                            res.send(500);
                            return;
                        } else {
                            console.log('Document deleted : ' + req.params.fieldvalue);
                            res.send(200);
                            return;
                        }
                    }); //end findOne
                }
            }); //end configmgmtDao
        }
        else{
            console.log('There are dependent elements cannot delete');
            res.send(500);
            return;
        }
        });

    });

    //Reading a icon file saved
    app.get('/d4dMasters/image/:imagename', function(req, res) {
        var settings = appConfig.chef;
        var chefRepoPath = settings.chefReposLocation;
        console.log(chefRepoPath);
        fs.readFile(chefRepoPath + 'catalyst_files/' + req.params.imagename, function(err, data) {
            if (err) {
                res.end(404);
            }
            res.writeHead(200, {
                'Content-Type': 'image/gif'
            });
            res.end(data, 'binary');
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

    app.get('/d4dMasters/readmasterjsonrecord/:id/:rowid', function(req, res) {
        console.log('received request ' + req.params.id + ' rowid: ' + req.params.rowid);
        configmgmtDao.getRowids(function(err,rowidlist){
            configmgmtDao.getDBModelFromID(req.params.id, function(err, dbtype) {
                if (err) {
                    console.log("Hit and error:" + err);
                }
                if (dbtype) {
                    console.log("Master Type: " + dbtype)
                    eval('d4dModelNew.' + dbtype).findOne({
                        rowid: req.params.rowid
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

                            //Change any _rowid references to the name
                           
                                //var __keys = Object.keys(d4dMasterJson[k]);
                               
                                //console.log('OBject:' + d4dMasterJson[k]);
                                var jobj = JSON.parse(JSON.stringify(d4dMasterJson));
                            
                                for(var k1 in jobj){
                                    //if any key has _rowid then update corresponding field
                                    //configmgmtDao.convertRowIDToValue('4a6934a5-74d6-47fe-b930-36cde5167ad7',rowidlist);
                                    if(k1.indexOf('_rowid') > 0){

                                        var flds = k1.split('_');
                                        var names = '';
                                        if(jobj[k1].indexOf(',') > 0){
                                            //Will handle this seperately : Vinod to Do
                                            var itms = jobj[k1].split(',');
                                            for(_itms in itms){
                                                console.log("in items");
                                                if(names == '')
                                                {
                                                    names = configmgmtDao.convertRowIDToValue(itms[_itms],rowidlist);
                                                }
                                                else{
                                                    names += ',' + configmgmtDao.convertRowIDToValue(itms[_itms],rowidlist);
                                                }
                                                console.log('names:',names);
                                            }
                                            
                                        }
                                        else{
                                            names = configmgmtDao.convertRowIDToValue(jobj[k1],rowidlist)
                                        }




                                        
                                        d4dMasterJson[flds[0]] = names; //configmgmtDao.convertRowIDToValue(jobj[k1],rowidlist);
                                       
                                       // console.log('jobj[flds[0]]',d4dMasterJson[flds[0]],flds[0],k1);
                                    }
                                    //console.log("key***:",k1," val***:",jobj[k1]);
                                   
                                }
                                //console.log("sent response" + JSON.stringify(d4dMasterJson));
                                //res.end(JSON.stringify(d4dMasterJson));
                                
                               // console.log(k,d4dMasterJson[k],v);
                           

                            res.end(JSON.stringify(d4dMasterJson));
                            console.log("sent response" + JSON.stringify(d4dMasterJson));
                            //res.end();
                        } else {
                            res.end(JSON.stringify([]));
                            console.log("none found");
                        }


                    });
                }
            });
        }); //getRowids

    });

    app.get('/d4dMasters/readmasterjsonnew__/:id', function(req, res) {
        console.log('received new request ' + req.params.id);
        d4dModelNew.d4dModelMastersOrg.find({
            id: req.params.id
        }, function(err, d4dMasterJson) {
            if (err) {
                console.log("Hit and error:" + err);
            }
            if (d4dMasterJson) {
                //
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

    app.get('/d4dMasters/readmasterjsonnew/:id', function(req, res) {
        console.log('received new request ' + req.params.id);
         configmgmtDao.getRowids(function(err,rowidlist){

            console.log("Rowid List----&&&&---->" + rowidlist);
            configmgmtDao.getDBModelFromID(req.params.id, function(err, dbtype) {
                if (err) {
                    console.log("Hit and error:" + err);
                }
                if (dbtype) {
                    console.log("Master Type: " + dbtype);
                    
                    var query = {};
                query['id'] = req.params.id;
                
                    
                    
                    console.log('hit a filtered request' + (req.params.id == 2 || req.params.id == 3 || req.params.id == 4 || req.params.id == 10));
                    if(req.params.id == '1' || req.params.id == '2' || req.params.id == '3' || req.params.id == '4' || req.params.id == '10'){
                        query['active'] = 'true';
                    }


                    eval('d4dModelNew.' + dbtype).find(
                        query
                        
                    , function(err, d4dMasterJson) {
                        if (err) {
                            console.log("Hit and error:" + err);
                        }
                        //Need to iterate thru the json and find if there is a field with _rowid then convert it to prefix before sending.
                            var _keys = Object.keys(d4dMasterJson);
                            console.log("Master Length:" + _keys.length);
                            if(_keys.length <= 0){
                                console.log("sent response" + JSON.stringify(d4dMasterJson));
                                res.end(JSON.stringify(d4dMasterJson));
                            }
                            var counter = 0;
                            var todelete = [];
                            //_keys.forEach(function(k,v){
                            for(var k=0,v=0;k<_keys.length;k++,v++) {
                                //var __keys = Object.keys(d4dMasterJson[k]);
                               
                                //console.log('OBject:' + d4dMasterJson[k]);
                                var jobj = JSON.parse(JSON.stringify(d4dMasterJson[k]));
                            
                                for(var k1 in jobj){
                                    //if any key has _rowid then update     corresponding field
                                    //configmgmtDao.convertRowIDToValue('4a6934a5-74d6-47fe-b930-36cde5167ad7',rowidlist);
                                    if(k1.indexOf('_rowid') > 0){
                                        //check if its an array of rowid's
                                        var flds = k1.split('_');
                                        var names = '';
                                        if(jobj[k1].indexOf(',') > 0){
                                            //Will handle this seperately : Vinod to Do
                                            var itms = jobj[k1].split(',');
                                            for(_itms in itms){
                                                console.log("in items");
                                                var _itmsName = configmgmtDao.convertRowIDToValue(itms[_itms],rowidlist);
                                                if(_itmsName != '')
                                                {
                                                        if(names == '')
                                                        {
                                                            names = _itmsName; //configmgmtDao.convertRowIDToValue(itms[_itms],rowidlist);
                                                        }
                                                        else{
                                                            names += ',' + _itmsName; //configmgmtDao.convertRowIDToValue(itms[_itms],rowidlist);
                                                        }
                                                        console.log('names:',names);
                                                }
                                            }
                                            
                                        }
                                        else{
                                            names = configmgmtDao.convertRowIDToValue(jobj[k1],rowidlist)
                                        }
                                        console.log('names:',names,(names == ''));

                                        d4dMasterJson[k][flds[0]] = names;

                                        if(names == '' && k1.indexOf('orgname_rowid') >= 0)
                                            todelete.push(k);
                                        //console.log('jobj[flds[0]]',jobj[flds[0]]);
                                        console.log('jobj[flds[0]]',d4dMasterJson[k][flds[0]],flds[0],k1,k);
                                    }
                                  //  console.log("key**:",k1," val**:",jobj[k1]);
                                   
                                }
                                console.log("Orgname check:" + d4dMasterJson[k]['orgname']);
                                
                                
                                counter++;
                            };//);
                                    console.log("To Delete Array:", todelete.toString());
                                    var collection = [];
                                    
                                    for(var i = 0; i < d4dMasterJson.length;i++){
                                        if(todelete.indexOf(i) === -1) {
                                            collection.push(d4dMasterJson[i]);
                                        }
                                        
                                    }
                                    console.log("sent response 484" + JSON.stringify(collection));
                                    res.end(JSON.stringify(collection));
                                    //console.log(k,d4dMasterJson[k],v);

                        


                            
                        
                    });
                }
            });
        }); //rowidlist
    });

     app.get('/d4dMasters/readmasterjsonneworglist/:id', function(req, res) {
        console.log('received new request ' + req.params.id);
         configmgmtDao.getRowids(function(err,rowidlist){

            console.log("Rowid List----&&&&---->" + rowidlist);
            configmgmtDao.getDBModelFromID(req.params.id, function(err, dbtype) {
                if (err) {
                    console.log("Hit and error:" + err);
                }
                if (dbtype) {
                    console.log("Master Type: " + dbtype);
                    
                    var query = {};
                    
                    query['id'] = req.params.id;
                    console.log('hit a filtered request' + (req.params.id == 2 || req.params.id == 3 || req.params.id == 4 || req.params.id == 10));
                    if(req.params.id == '2' || req.params.id == '3' || req.params.id == '4' || req.params.id == '10'){
                        query['active'] = true;
                    }


                    eval('d4dModelNew.' + dbtype).find(
                        {id:req.params.id
                        }
                    , function(err, d4dMasterJson) {
                        if (err) {
                            console.log("Hit and error:" + err);
                        }
                        //Need to iterate thru the json and find if there is a field with _rowid then convert it to prefix before sending.
                            var _keys = Object.keys(d4dMasterJson);
                            console.log("Master Length:" + _keys.length);
                            if(_keys.length <= 0){
                                console.log("sent response" + JSON.stringify(d4dMasterJson));
                                res.end(JSON.stringify(d4dMasterJson));
                            }
                            var counter = 0;
                            var todelete = [];
                            //_keys.forEach(function(k,v){
                            for(var k=0,v=0;k<_keys.length;k++,v++) {
                                //var __keys = Object.keys(d4dMasterJson[k]);
                               
                                //console.log('OBject:' + d4dMasterJson[k]);
                                var jobj = JSON.parse(JSON.stringify(d4dMasterJson[k]));
                            
                                for(var k1 in jobj){
                                    //if any key has _rowid then update     corresponding field
                                    //configmgmtDao.convertRowIDToValue('4a6934a5-74d6-47fe-b930-36cde5167ad7',rowidlist);
                                    if(k1.indexOf('_rowid') > 0){
                                        //check if its an array of rowid's
                                        var flds = k1.split('_');
                                        var names = '';
                                        if(jobj[k1].indexOf(',') > 0){
                                            //Will handle this seperately : Vinod to Do
                                            var itms = jobj[k1].split(',');
                                            for(_itms in itms){
                                                console.log("in items");
                                                var _itmsName = configmgmtDao.convertRowIDToValue(itms[_itms],rowidlist);
                                                if(_itmsName != '')
                                                {
                                                        if(names == '')
                                                        {
                                                            names = _itmsName; //configmgmtDao.convertRowIDToValue(itms[_itms],rowidlist);
                                                        }
                                                        else{
                                                            names += ',' + _itmsName; //configmgmtDao.convertRowIDToValue(itms[_itms],rowidlist);
                                                        }
                                                        console.log('names:',names);
                                                }
                                            }
                                            
                                        }
                                        else{
                                            names = configmgmtDao.convertRowIDToValue(jobj[k1],rowidlist)
                                        }
                                        console.log('names:',names,(names == ''));

                                        d4dMasterJson[k][flds[0]] = names;

                                        if(names == '' && k1.indexOf('orgname_rowid') >= 0)
                                            todelete.push(k);
                                        //console.log('jobj[flds[0]]',jobj[flds[0]]);
                                        console.log('jobj[flds[0]]',d4dMasterJson[k][flds[0]],flds[0],k1,k);
                                    }
                                    
                                  //  console.log("key**:",k1," val**:",jobj[k1]);
                                   
                                }
                                console.log("Orgname check:" + d4dMasterJson[k]['orgname']);
                                
                                
                                counter++;
                            };//);
                                    console.log("To Delete Array:", todelete.toString());
                                    var collection = [];
                                    
                                    for(var i = 0; i < d4dMasterJson.length;i++){
                                        if(todelete.indexOf(i) === -1) {
                                            collection.push(d4dMasterJson[i]);
                                        }
                                        
                                    }
                                    console.log("sent response 484" + JSON.stringify(collection));
                                    res.end(JSON.stringify(collection));
                                    //console.log(k,d4dMasterJson[k],v);

                        


                            
                        
                    });
                }
            });
        }); //rowidlist
    });
    //for kana to be reverted to the original function 
    app.get('/d4dMasters/readmasterjsonnewk_/:id', function(req, res) {
        console.log('received new request ' + req.params.id);
        configmgmtDao.getRowids(function(err,rowidlist){

            console.log("Rowid List-->" + rowidlist);
            d4dModelNew.d4dModelMastersOrg.find({
                id: 1
            }, function(err, docorgs) {
                var orgnames = docorgs.map(function(docorgs1) {
                    return docorgs1.rowid;
                });
                if(req.params.id == '2'  || req.params.id == '3'  || req.params.id == '10' ){
                    configmgmtDao.getDBModelFromID(req.params.id, function(err, dbtype) {
                        if (err) {
                            console.log("Hit and error:" + err);
                        }
                        if (dbtype) {
                            console.log("Master Type: " + dbtype);
                            eval('d4dModelNew.' + dbtype).find({
                                id: req.params.id,
                                orgname_rowid: {
                                    $in: orgnames
                                }
                            }, function(err, d4dMasterJson) {
                                if (err) {
                                    console.log("Hit and error:" + err);
                                }
                                //Need to iterate thru the json and find if there is a field with _rowid then convert it to prefix before sending.
                                var _keys = Object.keys(d4dMasterJson);
                                _keys.forEach(function(k,v){
                                    //var __keys = Object.keys(d4dMasterJson[k]);
                                   
                                    //console.log('OBject:' + d4dMasterJson[k]);
                                    var jobj = JSON.parse(JSON.stringify(d4dMasterJson[k]));
                                    for(var k1 in jobj){
                                        //if any key has _rowid then update corresponding field
                                        //configmgmtDao.convertRowIDToValue('4a6934a5-74d6-47fe-b930-36cde5167ad7',rowidlist);
                                        if(k1.indexOf('_rowid')){
                                            var flds = k1.split('_');
                                            jobj[flds[0]] = configmgmtDao.convertRowIDToValue(jobj[k1],rowidlist);
                                        }
                                        console.log("key:",k1," val:",jobj[k1]);

                                    }
                                    console.log(k,d4dMasterJson[k],v);
                                });
                                console.log("sent response" + JSON.stringify(d4dMasterJson));
                                res.end(JSON.stringify(d4dMasterJson));
                                
                                console.log();
                            });
                        }
                    });
                } //end if (1,2,3,4)
                else if(req.params.id == '1' || req.params.id == '4'){
                        d4dModelNew.d4dModelMastersProductGroup.find({
                            id: 2,
                            rowid:{
                                $in: orgnames
                            }
                        }, function(err, docbgs) {
                            var bgnames = docbgs.map(function(docbgs1) {
                                return docbgs1.productgroupname;
                            });
                            configmgmtDao.getDBModelFromID(req.params.id, function(err, dbtype) {
                                if (err) {
                                    console.log("Hit and error:" + err);
                                }
                                if (dbtype) {
                                    console.log("Master Type: " + dbtype);
                                    eval('d4dModelNew.' + dbtype).find({
                                        id: req.params.id,
                                        productgroupname: {
                                            $in: bgnames
                                        }
                                    }, function(err, d4dMasterJson) {
                                        if (err) {
                                            console.log("Hit and error:" + err);
                                        }
                                        res.end(JSON.stringify(d4dMasterJson));
                                        console.log("sent response" + JSON.stringify(d4dMasterJson));
                                    });
                                }
                            });


                        });
                }
                else{
                    configmgmtDao.getDBModelFromID(req.params.id, function(err, dbtype) {
                        if (err) {
                            console.log("Hit and error:" + err);
                        }
                        if (dbtype) {
                            console.log("Master Type: " + dbtype);
                            eval('d4dModelNew.' + dbtype).find({
                                id: req.params.id
                            }, function(err, d4dMasterJson) {
                                if (err) {
                                    console.log("Hit and error:" + err);
                                }
                                res.end(JSON.stringify(d4dMasterJson));
                                console.log("sent response" + JSON.stringify(d4dMasterJson));
                            });
                        }
                    });
                } //end else
            });
        });//get rowid list
    });


    app.get('/d4dMasters/readmasterjsoncounts',function(req,res){
        logger.debug('Entered readmasterjsoncounts');
        var ret = [];
        var masts = ['2', '3', '4'];
        var counts = [];
        for(var i =1;i<5;i++)
            counts[i] = 0;
          d4dModelNew.d4dModelMastersOrg.find({
            id: 1,
            active:true
        }, function(err, docorgs) {
            var orgnames = docorgs.map(function(docorgs1) {
                return docorgs1.rowid;
            });
        d4dModelNew.d4dModelMastersOrg.find({
            id: {
                $in: masts,
            },
            orgname_rowid:{$in:orgnames}
        }, function(err, d4dMasterJson) {
            if (err) {
                console.log("Hit and error:" + err);
            }
            if (d4dMasterJson) {
                // res.send(200, d4dMasterJson);
                // res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.writeHead(200, {
                    'Content-Type': 'application/json'
                });
                
                console.log("sent response" + JSON.stringify(d4dMasterJson));
                logger.debug(d4dMasterJson.length);
                var i = 0;
                for(var i=0;i < d4dMasterJson.length;i++){
                    //Need to do a org check.

                    logger.debug(d4dMasterJson[i]["id"]);
                    counts[d4dMasterJson[i]["id"]]++;
                }
                for(var i =2;i<5;i++){
                    ret.push('{"' + i + '":"' + counts[i] + '"}');
                }
                ret.push('{"1":"' + orgnames.length + '"}');
                res.end('[' + ret.join(',') + ']');
                //res.end();
                return;
            } else {
                //res.send(400, {
                ret.push(i + ':' + '');
                // "error": err
                // });
                console.log("none found");
            }
        });
    });
    });

    app.get('/d4dMasters/getdashboardvalues/:items', function(req, res) {
        console.log('received request ' + req.params.items);
        var masts = [];
        masts = req.params.items.split(',');
        console.log('---Length--' + masts.length);

    });

    app.get('/d4dMasters/qmasterjson/:id/:name', function(req, res) {

    });
    app.get('/d4dMasters/getprovider/:rowid', function(req, res) {
        d4dModel.findOne({
            id: '9'
        }, function(err, d4dMasterJson) {
            if (err) {
                console.log("Hit and error:" + err);
            }
            if (d4dMasterJson) {
                var chefRepoPath = '';
                var hasOrg = false;
                d4dMasterJson.masterjson.rows.row.forEach(function(itm, i) {
                    console.log("found" + itm.field.length);
                    for (var j = 0; j < itm.field.length; j++) {
                        if (itm.field[j]["name"] == 'rowid') {
                            if (itm.field[j]["values"].value == req.params.rowid) {
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
            }
        });

    });


    app.get('/d4dMasters/getlist/:masterid/:fieldname', function(req, res) {
        d4dModel.findOne({
            id: req.params.masterid
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
                        if (itm.field[j]["name"] == req.params.fieldname) {
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
                //res.end(jsonlist);
            }
        });
    });

    app.get('/d4dMasters/getlist/:masterid/:fieldname/:fieldname1', function(req, res) {
        d4dModel.findOne({
            id: req.params.masterid
        }, function(err, d4dMasterJson) {
            if (err) {
                console.log("Hit and error:" + err);
                res.end(null);
            }
            if (d4dMasterJson) {
                var jsonlist = '';
                d4dMasterJson.masterjson.rows.row.forEach(function(itm, i) {
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

                    if (jsonlist == '')
                        jsonlist += "{\"" + req.params.fieldname + "\":\"" + fieldvalue + "\",\"" + req.params.fieldname1 + "\":\"" + rowid + "\"}";
                    else
                        jsonlist += ",{\"" + req.params.fieldname + "\":\"" + fieldvalue + "\",\"" + req.params.fieldname1 + "\":\"" + rowid + "\"}";

                });
                configmgmt = "[" + jsonlist + "]";
                console.log(JSON.stringify(jsonlist));
                res.end(configmgmt);
            } else {
                res.send(404);
            }
        });
    });

    app.get('/d4dMasters/getorgnamebychefserver/:chefserver', function(req, res) {
        configmgmtDao.getListFiltered(10, 'orgname', 'configname', req.params.chefserver, function(err, catorgname) {
            if (err) {
                res.send(500);
                return;
            }
            console.log("catorgname:", catorgname);

            if (!catorgname) {
                res.send('');

                return;
            } else {
                res.end(catorgname);
                return;
            }


        });
    });
    app.post('/d4dMasters/getListFiltered/:masterid',function(req,res){
        configmgmtDao.getDBModelFromID(req.params.masterid, function(err, dbtype) {
            if (err) {
                console.log("Hit and error:" + err);
            }
            if (dbtype) {
                var query = {};
                // query['rowid'] = {
                //     '$in':req.body.serviceids
                // }
                query['id'] = req.params.masterid;
                console.log('Req.body for glf' + JSON.stringify(req.body));
                var bodyJson = JSON.parse(JSON.stringify(req.body));

                console.log('Query Build in getListFiltered:' + JSON.stringify(bodyJson));
                var _keys = Object.keys(bodyJson);
                _keys.forEach(function(k,v){
                    console.log(k,bodyJson[k]);
                    query[k] = bodyJson[k];
                });
                // bodyJson.forEach(function(k, v)    {
                //     console.log('Object call to ' + k);
                //     var _keys = Object.keys(k);
                //     console.log(_keys + ' ' + k[_keys]);
                //     query[_keys] = k[_keys];

                // });
                eval('d4dModelNew.' + dbtype).find(query, function(err, d4dMasterJson) {
                    if (err) {
                        console.log("Hit and error:" + err);
                    }
                    console.log(' getListFiltered ' + d4dMasterJson.length)
                    if(d4dMasterJson.length > 0)
                    {   
                        console.log("sent response" + JSON.stringify(d4dMasterJson));
                        res.send("Found");

                    }
                    else
                        {
                            console.log("sent response" + JSON.stringify(d4dMasterJson));
                            res.send("Not Found");
                        }
                    
                });
            } else {
                res.send(500);
            }
        });
    });

    app.get('/d4dMasters/:masterid/:filtercolumnname/:filtercolumnvalue', function(req, res) {

        configmgmtDao.getDBModelFromID(req.params.masterid, function(err, dbtype) {
            if (err) {
                console.log("Hit and error:" + err);
            }
            if (dbtype) {
                var query = {};
                query[req.params.filtercolumnname] = req.params.filtercolumnvalue; //building the query 
                query['id'] = req.params.masterid;

                console.log("Master Type: " + dbtype);
                eval('d4dModelNew.' + dbtype).find(query, function(err, d4dMasterJson) {
                    if (err) {
                        console.log("Hit and error:" + err);
                    }
                    res.end(JSON.stringify(d4dMasterJson));
                    console.log("sent response" + JSON.stringify(d4dMasterJson));
                });
            }
        });
    });




    app.get('/d4dMasters/configmgmt/:rowid', function(req, res) {

        d4dModel.findOne({
            id: '10'
        }, function(err, d4dMasterJson) {
            if (err) {
                console.log("Hit and error:" + err);
            }
            if (d4dMasterJson) {
                var chefRepoPath = '';
                settingsController.getChefSettings(function(settings) {
                    chefRepoPath = settings.chefReposLocation;
                    console.log("Repopath:" + chefRepoPath);

                    var hasOrg = false;
                    d4dMasterJson.masterjson.rows.row.forEach(function(itm, i) {
                        console.log("found" + itm.field.length);
                        for (var j = 0; j < itm.field.length; j++) {
                            if (itm.field[j]["name"] == 'rowid') {
                                if (itm.field[j]["values"].value == req.params.rowid) {
                                    console.log("found: " + i + " -- " + itm.field[j]["values"].value);
                                    hasOrg = true;
                                    //Re-construct the json with the item found
                                    var configmgmt = '';
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
            return (true);
        } else
            mkdir_p(path, mode, null, position + 1);
    }
    var mkdirSync1 = function(path) {
        try {
            fs.mkdirSync(path, 0777);
        } catch (e) {
            //if ( e.code != 'EEXIST' ) throw e;
        }
    }

    function saveuploadedfile(suffix, folderpath, req) {
        console.log(req.body);
        var fi;
        if (req.params.fileinputs.indexOf(',') > 0)
            fi = req.params.fileinputs.split(',');
        else {
            fi = new Array();
            fi.push(req.params.fileinputs);
        }
        var bodyItems = Object.keys(req.body);
        var saveAsfileName = '';
        for (var i = 0; i < bodyItems.length; i++) {
            if (bodyItems[i].indexOf("_filename") > 0)
                saveAsfileName = req.body[bodyItems[i]];
        }


        var filesNames = Object.keys(req.files);
        var count = filesNames.length;
        console.log('in' + count);
        filesNames.forEach(function(item) {
            console.log(item);
        });

        var settings = appConfig.chef;

        var chefRepoPath = settings.chefReposLocation;

        console.log('Type of org : ' + typeof req.params.orgname);
       console.log('Org ID: ' + req.params.orgid);
        console.log(chefRepoPath + req.params.orgname + folderpath.substring(0, folderpath.length - 1));
        console.log('Orgname : #' + req.params.orgname.toString() + '#' + (req.params.orgname == ''));

        //Handling the exception to handle uploads without orgname
        if (req.params.orgname) {
            if (req.params.orgname == '/')
                req.params.orgname = '';

            if (req.params.orgname == '' || req.params.orgname == "undefined") {
                req.params.orgname = "catalyst_files";
            }
        }
        var path = chefRepoPath + req.params.orgid + folderpath.substring(0, folderpath.length - 1);



        //fs.mkdirParent(chefRepoPath + req.params.orgname + folderpath.substring(0,folderpath.length - 1),0777); //if path is not present create it.
        parts = require('path').normalize(path).split('/');
        console.log('Length of parts:' + parts.length);
        for (var i = 1; i <= parts.length; i++) {
            var directory = parts.slice(0, i).join('/');
            console.log(directory);
            mkdirSync1(directory);
            // fs.mkdirSync(directory,0777);
            //mkdir_p1(directory,'0777');
        }




        //mkdir_p(chefRepoPath + req.params.orgname + folderpath.substring(0,folderpath.length - 1)); ///if path is not present create it.
        console.log("files:" + fi.length);
        for (var i = 0; i < fi.length; i++) {
            var controlName = fi[i];
            var fil = eval('req.files.' + fi[i]);
            if (typeof fil != 'undefined') {

                var data = fs.readFileSync(fil.path); //, function(err, data) { 
                //var getDirName = require("path").dirname;
                /*fileIo.writeFileSync(chefRepoPath + req.params.orgname + '/' + suffix + controlName + '__' + fil.name, data, null, function(err) {
                                    console.log(err);
                                    count--;
                                    if (count === 0) { // all files uploaded
                                        return("200");
                                    }
                                });*/
                if (folderpath == '') {
                    console.log('this is where file gets saved as (no folderpath): ' + chefRepoPath + req.params.orgname + '/' + suffix + controlName + '__' + fil.name);
                    fs.writeFileSync(chefRepoPath + req.params.orgname + '/' + suffix + controlName + '__' + fil.name, data);
                } else {
                    if (folderpath.indexOf('.chef') > 0) { //identifying if its a chef config file
                        console.log('this is where file gets saved as .chef (with folderpath): ' + chefRepoPath + req.params.orgid + folderpath + fil.name);
                        fs.writeFileSync(chefRepoPath + req.params.orgid + folderpath + fil.name, data);
                    } else //not a a chef config file
                    {
                        console.log("Folderpath rcvd:" + folderpath);

                        if (fil.name == saveAsfileName) {
                            console.log('this is where file gets saved as (with folderpath): ' + chefRepoPath + req.params.orgid + '/' + suffix + controlName + '__' + fil.name);
                            fs.writeFileSync(chefRepoPath + req.params.orgname + '/' + suffix + controlName + '__' + fil.name, data);

                        } else {
                            console.log('this is where file gets saved as (with folderpath) fixed name: ' + chefRepoPath + req.params.orgid + folderpath + '/' + saveAsfileName);
                            //fs.writeFileSync(chefRepoPath + folderpath.substring(1,folderpath.length) + fil.name, data);
                            fs.writeFileSync(chefRepoPath + req.params.orgname + folderpath + '/' + saveAsfileName, data);
                        }

                    }
                }


                //  });

            }
        }
        console.log('Before ssl fetch');
        if(req.params.id == '10') //Fix introduced for Kana 
        { 
            console.log('In ssl fetch');
            var options = {
                    cwd: chefRepoPath + req.params.orgname + folderpath,
                    onError: function(err) {
                        callback(err, null);
                    },
                    onClose: function(code) {
                        callback(null, code);
                    }
            };
            var cmdSSLFetch = 'knife ssl fetch';

            var procSSLFetch = exec(cmdSSLFetch, options, function(err, stdOut, stdErr) {
                if (err) {
                    console.log('Failed on procSSLFetch routes d4dMasters:', err);
                    return;
                }
            });
            procSSLFetch.on('close', function(code) {
                console.log('procSSLFetch done: ');
            });

            procSSLFetch.stdout.on('data', function(data) {
                //console.log('stdout: ==> ' + data);
                console.log('procSSLFetch : ' , data);
            });
        }
        return ("200");
    }


    app.post('/d4dmasters/getrows/:masterid', function(req, res) {
        configmgmtDao.getDBModelFromID(req.params.masterid, function(err, dbtype) {
            if (err) {
                console.log("Hit and error:" + err);
            }
            if (dbtype) {
                var query = {};
                query['rowid'] = {
                    '$in':req.body.serviceids
                }
                query['id'] = req.params.masterid;

                console.log("Master Type: " + dbtype);
                eval('d4dModelNew.' + dbtype).find(query, function(err, d4dMasterJson) {
                    if (err) {
                        console.log("Hit and error:" + err);
                    }
                    res.end(JSON.stringify(d4dMasterJson));
                    console.log("sent response" + JSON.stringify(d4dMasterJson));
                });
            } else {
                res.send(500);
            }
        });
    });

    app.post('/d4dMastersold/getrows/:masterid', function(req, res) {
        console.log('received request ' + req.params.id);
        d4dModel.findOne({
            id: req.params.masterid
        }, function(err, d4dMasterJson) {
            if (err) {
                console.log("Hit and error:" + err);
            }
            if (d4dMasterJson) {
                var bodyJson = JSON.parse(JSON.stringify(req.body));

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

                    //console.log(JSON.stringify(root));
                    res.send(JSON.parse(root));

                }

            }

        });
    });

    app.post('/d4dMasters/savemasterjsonfull/:id', function(req, res) {
        console.log('received request ' + req.params.id);
        d4dModel.findOne({
            id: req.params.id
        }, function(err, d4dMasterJson) {
            if (err) {
                console.log("Hit and error:" + err);
            }
            if (d4dMasterJson) {
                var bodyJson = JSON.parse(JSON.stringify(req.body));

                //pushing the rowid field
                var editMode = false; //to identify if in edit mode.
                var uuid1 = uuid.v4();
                var rowtoedit = null;
                if (bodyJson["rowid"] != null) { //for edit
                    editMode = true;
                    for (var u = 0; u < d4dMasterJson.masterjson.rows.row.length; u++) {
                        console.log("Value:" + bodyJson["rowid"]);
                        if (d4dMasterJson.masterjson.rows.row[u].rowid == bodyJson["rowid"]) {
                            rowtoedit = d4dMasterJson.masterjson.rows.row[u];
                        }
                    }
                } else //for insert
                {
                    bodyJson["rowid"] = uuid1;
                }

                var frmkeys = Object.keys(bodyJson);
                var rowFLD = [];
                console.log(JSON.stringify(bodyJson));

                frmkeys.forEach(function(itm) {
                    if (!editMode) {
                        var thisVal = bodyJson[itm];
                        var item;

                        if (thisVal.indexOf('[') >= 0) //used to check if its an array
                            item = "{\"" + itm + "\" : " + thisVal + "}";
                        else
                            item = "{\"" + itm + "\" : \"" + thisVal.replace(/\"/g, '\\"') + "\"}";

                        rowFLD.push(JSON.parse(item));
                    } else {

                    }
                });

                var FLD = "{" + JSON.stringify(rowFLD) + "}";
                console.log(FLD);
            }

        });
    });


    app.post('/d4dMasters/savemasterjsonrow/:id/:fileinputs/:orgname', function(req, res) {
        console.log('received request ' + req.params.id);
        d4dModel.findOne({
            id: req.params.id
        }, function(err, d4dMasterJson) {
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
                if (bodyJson["rowid"] != null) {
                    editMode = true;
                    for (var u = 0; u < d4dMasterJson.masterjson.rows.row.length; u++) {
                        for (var i = 0; i < d4dMasterJson.masterjson.rows.row[u].field.length; i++) {
                            console.log("Value:" + bodyJson[d4dMasterJson.masterjson.rows.row[u].field[i].name]);
                            if (d4dMasterJson.masterjson.rows.row[u].field[i].values.value == bodyJson["rowid"]) {

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
                } else
                    bodyJson["rowid"] = uuid1;
                //console.log(bodyJson['orgname']);

                if (rowtoedit) //testing if the rowtoedit has a value
                    console.log("Edited Row:" + JSON.stringify(rowtoedit));


                var frmkeys = Object.keys(bodyJson);

                //var frmvals = Object.keys(bodyJson);
                var rowFLD = [];
                //  var filesNames = Object.keys(req.files);
                var folderpath = ''; //will hold the folderpath field to create the path in the system

                console.log(JSON.stringify(bodyJson));

                frmkeys.forEach(function(itm) {
                    if (!editMode) {
                        var thisVal = bodyJson[itm];
                        //console.log(thisVal.replace(/\"/g,'\\"'));
                        console.log('thisVal' + thisVal);
                        var item;

                        if (thisVal.indexOf('[') >= 0 && itm != "templatescookbooks") { //used to check if its an array
                            item = "{\"values\" : {\"value\" : " + thisVal + "},\"name\" : \"" + itm + "\"}";
                        } else
                            item = "{\"values\" : {\"value\" : \"" + thisVal.replace(/\"/g, '\\"') + "\"},\"name\" : \"" + itm + "\"}";


                        rowFLD.push(JSON.parse(item));
                        if (itm == 'folderpath') { //special variable to hold the folder to which the files will be copied.
                            folderpath = thisVal;
                        }
                    } else { //in edit mode
                        if (rowtoedit) {
                            uuid1 = bodyJson["rowid"];
                            console.log('Bodyjson[folderpath]:' + bodyJson["folderpath"]);
                            if (bodyJson["folderpath"] == undefined) //folderpath issue fix
                                folderpath = ''
                            else
                                folderpath = bodyJson["folderpath"];
                            for (var j = 0; j < rowtoedit.field.length; j++) {
                                if (bodyJson[rowtoedit.field[j].name] != null) {
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
                if (!rowtoedit) { //push new values only when not in edit mode
                    d4dMasterJson.masterjson.rows.row.push(JSON.parse(FLD));
                }

                console.log(JSON.stringify(d4dMasterJson.masterjson));
                d4dModel.update({
                    "id": req.params.id
                }, {
                    $set: {
                        "masterjson": d4dMasterJson.masterjson
                    }
                }, {
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

                    if (req.params.fileinputs != 'null')
                        res.send(saveuploadedfile(uuid1 + '__', folderpath, req));
                    else
                        res.send(200);

                    if(req.params.id == '10'){

                    }
                    //res.send(200);
                    //callback(null, data);
                });
            }
        });
    });
    app.post('/d4dMasters/deactivateorg/:action',function(req,res){
        var bodyJson = JSON.parse(JSON.stringify(req.body));

        if(!req.orgid){
            console.log('Org ID found ' + bodyJson.orgid);
            configmgmtDao.deactivateOrg(bodyJson.orgid,req.params.action,function(err,data){
                 if(err){
                    console.log('Error:' + err);
                    res.send(500);
                 }
                 console.log(data);
                 res.send(200);
            });
        }
       
    });
    app.post('/d4dMasters/savemasterjsonrownew/:id/:fileinputs/:orgname', function(req, res) {
        console.log('received new save request ' + req.params.id);
        var bodyJson = JSON.parse(JSON.stringify(req.body));
        //pushing the rowid field

        var editMode = false; //to identify if in edit mode.
        var rowtoedit = null;
        if (bodyJson["rowid"] != null) {
            editMode = true;
        } else {
            editMode = false;
            bodyJson["rowid"] = uuid.v4();
        }
        console.log('EditMode:' + editMode);
        bodyJson["id"] = req.params.id; //storing the form id.
        configmgmtDao.getDBModelFromID(req.params.id, function(err, dbtype) {
            if (err) {
                console.log("Hit and error:" + err);
            }
            if (dbtype) {
                console.log("Master Type: " + dbtype);

                eval('d4dModelNew.' + dbtype).findOne({
                    rowid: bodyJson["rowid"]
                }, function(err, d4dMasterJson) {
                    if (err) {
                        console.log("Hit and error:" + err);
                    }
                    if (d4dMasterJson) {
                        rowtoedit = JSON.parse(JSON.stringify(d4dMasterJson));
                        console.log('<<<<< Reached here >>>>' + (rowtoedit == null));
                    }
                    // if(!rowtoedit)
                    //  console.log("Edited Row:" + rowtoedit);

                    var frmkeys = Object.keys(bodyJson);
                    var orgid = '';
                    if(frmkeys.indexOf('orgname_rowid') >= 0){ //
                        req.params['orgid'] = bodyJson['orgname_rowid'];
                    }

                    //var frmvals = Object.keys(bodyJson);
                    var rowFLD = [];
                    //  var filesNames = Object.keys(req.files);
                    var folderpath = ''; //will hold the folderpath field to create the path in the system

                    //       console.log('BodyJSON rowid:' + JSON.stringify(bodyJson));
                    var newrowid = '';
                    frmkeys.forEach(function(itm) {
                        console.log("Each item: itm " + itm + ' bodyJson[itm] ' + bodyJson[itm]);
                        if (itm.trim() == 'rowid') {
                            console.log('!!!! in rowid ' + bodyJson[itm]);
                            newrowid = bodyJson[itm];
                        }
                        if (!editMode) {
                            var thisVal = bodyJson[itm];
                            console.log(thisVal);
                            var item = null;
                            if (thisVal.indexOf('[') >= 0 && itm != "templatescookbooks") { //used to check if its an array
                                item = "\"" + itm + "\" : \"" + thisVal + "\"";
                            } else //
                                item = "\"" + itm + "\" : \"" + thisVal.replace(/\"/g, '\\"') + "\"";

                            rowFLD.push(item);
                            if (itm == 'folderpath') { //special variable to hold the folder to which the files will be copied.
                                rowFLD.push("\"" + itm + "\" : \"" + thisVal.replace(/\"/g, '\\"') + "\"");
                                console.log('Got a folderpath:' + thisVal);
                                folderpath = thisVal;
                            }
                        } else {
                            if (d4dMasterJson != null) {
                                uuid1 = bodyJson["rowid"];
                                //    console.log('Bodyjson[folderpath]:' + bodyJson["folderpath"]);
                                console.log('rowtoedit :' + rowtoedit);
                                if (bodyJson["folderpath"] == undefined) //folderpath issue fix
                                    folderpath = ''
                                else
                                    folderpath = bodyJson["folderpath"];
                                var fldadded = false;
                                for (var myval in rowtoedit) {
                                    if (itm == myval)
                                        {
                                            rowtoedit[myval] = bodyJson[myval];
                                            fldadded = true;
                                        }
                                    console.log("itm " + itm + " myval:" + myval + " value : " + rowtoedit[myval]);
                                }
                                if(!fldadded){
                                    //
                                    //console.log("");
                                }
                                // for(var myval in d4dMasterJson){
                                //      console.log("key:"+myval+", value:");
                                // //   d4dMasterJson[myval] = bodyJson[myval];

                                // }
                                //console.log(JSON.stringify(d4dMasterJson));
                            }
                        }
                    });
                    var FLD = JSON.stringify(rowFLD);
                    if (!editMode) { //push new values only when not in edit mode
                        //dMasterJson = JSON.parse(FLD);
                        //   console.log('>>>>>> Whats going to be saved:' + FLD['rowid']);

                        eval('var mastersrdb =  new d4dModelNew.' + dbtype + '({' + JSON.parse(FLD) + '})');
                        mastersrdb.save(function(err, data) {
                            if (err) {
                                console.log('Hit Save error' + err);
                                res.send(500);
                                return;

                            }
                            console.log('New Master Saved');

                            console.log(req.params.fileinputs == 'null');
                            console.log('New record folderpath:' + folderpath + ' rowid:' + newrowid + ' FLD["folderpath"]:' + folderpath);
                            if(!folderpath)
                            {
                                if (FLD["folderpath"] == undefined) //folderpath issue fix
                                    folderpath = ''
                                else
                                    folderpath = rowFLD["folderpath"];
                            }

                            if (req.params.fileinputs != 'null')
                                res.send(saveuploadedfile(newrowid + '__', folderpath, req));
                            else
                                res.send(200);

                            return;
                        });
                    } else {
                        console.log("Rowid: " + bodyJson["rowid"]);
                        var currowid = bodyJson["rowid"];
                        delete rowtoedit._id; //fixing the issue of 
                        console.log('Rowtoedit:' + JSON.stringify(rowtoedit));
                        eval('d4dModelNew.' + dbtype).update({
                            rowid: bodyJson["rowid"]
                        }, {
                            $set: rowtoedit
                        }, {
                            upsert: false
                        }, function(err, saveddata) {
                            if (err) {
                                console.log('Hit Save error' + err);
                                res.send(500);
                                return;
                            }

                            if (bodyJson["folderpath"] == undefined) //folderpath issue fix
                                folderpath = ''
                            else
                                folderpath = bodyJson["folderpath"];

                            console.log('Master Data Updated: ' + saveddata);
                            console.log(req.params.fileinputs == 'null');
                            console.log('folderpath:' + folderpath + ' rowid:' + currowid);

                            if (req.params.fileinputs != 'null')
                                res.send(saveuploadedfile(currowid + '__', folderpath, req));
                            else
                                res.send(200);
                            return;
                        });
                    }
                    //dMasterJson = rowtoedit;

                    //console.log(JSON.stringify(d4dMasterJson));



                }); //end findone
                //console.log('state of rowtoedit ' + (rowtoedit != null)); //testing if the rowtoedit has a value

            }
        }); //end getdbmodelfromid

    });

    app.post('/d4dMasters/testingupload/:suffix/:fileinputs', function(req, res) {
        console.log(req.body);
        var fi;
        if (req.params.fileinputs.indexOf(',') > 0)
            fi = req.params.fileinputs.split(',');
        else {
            fi = new Array();
            fi.push(req.params.fileinputs);
        }


        var filesNames = Object.keys(req.files);
        var count = filesNames.length;
        console.log('in' + count);
        filesNames.forEach(function(item) {
            console.log(item);
        });


        settingsController.getChefSettings(function(settings) {
            var chefRepoPath = settings.chefReposLocation;
            fs.mkdirParent(chefRepoPath + req.params.orgname); //if path is not present create it.
            for (var i = 0; i < fi.length; i++) {
                var controlName = fi[i];
                var fil = eval('req.files.' + fi[i]);
                if (typeof fil != 'undefined') {
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

    app.get('/createbg/:orgname/:bgname', function(req, res) {
        // var envField = "{\"field\":[{\"name\":\"environmentname\",\"values\":{\"value\":\"" + req.params.envname + "\"}},{\"name\":\"orgname\",\"values\":{\"value\":\"" + req.params.orgname + "\"}}]}";
        var bgfield = "{\"field\":[{\"values\":{\"value\":\"" + req.params.bgname + "\"},\"name\":\"productgroupname\"},{\"values\":{\"value\":\"" + req.params.orgname + "\"},\"name\":\"orgname\"},{\"name\":\"costcode\"}] }";
        //var orgField = "{\"field\":[{\"values\":{\"value\":\"" + req.params.orgname + "\"},\"name\":\"orgname\"},{\"values\":{\"value\":\"\"},\"name\":\"domainname\"},{\"values\":{\"value\":[\"Dev\",\"Test\",\"Stage\"]},\"name\":\"costcode\"}]}";
        db.on('error', console.error.bind(console, 'connection error:'));
        console.log(JSON.stringify(bgfield));
        db.once('open', function callback() {

            console.log('in once');
        });
        console.log('received request ' + req.params.bgname);
        d4dModel.findOne({
            id: '2'
        }, function(err, d4dMasterJson) {
            if (err) {
                console.log("Hit and error:" + err);
            }
            if (d4dMasterJson) {
                var hasOrg = false;
                d4dMasterJson.masterjson.rows.row.forEach(function(itm, i) {
                    console.log("found" + itm.field.length);

                    for (var j = 0; j < itm.field.length; j++) {
                        if (itm.field[j]["name"] == 'productgroupname') {
                            if (itm.field[j]["values"].value == req.params.bgname) {
                                console.log("found: " + i + " -- " + itm.field[j]["values"].value);
                                hasOrg = true;
                            }
                        }

                        // console.log();
                    }
                });
                if (hasOrg == false) {
                    //Creating org
                    console.log('Creating');
                    d4dMasterJson.masterjson.rows.row.push(JSON.parse(bgfield));
                    d4dModel.update({
                        "id": "2"
                    }, {
                        $set: {
                            "masterjson": d4dMasterJson.masterjson
                        }
                    }, {
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
                } else {
                    res.send(200);
                }

            } else {
                res.send(500, {
                    "error": err
                });
                console.log("none found");
            }

        });
    });


    app.get('/createproj/:orgname/:envname/:prodgroup/:projname', function(req, res) {
        var projField = "{\"field\":[{\"values\":{\"value\":\"" + req.params.projname + "\"},\"name\":\"projectname\"},{\"values\":{\"value\":\"" + req.params.orgname + "\"},\"name\":\"orgname\"},{\"values\":{\"value\":\"" + req.params.prodgroup + "\"},\"name\":\"productgroupname\"},{\"values\":{\"value\":\"" + req.params.envname + "\"},\"name\":\"environmentname\"},{\"values\":{\"value\":[\"Code 1\",\"Code 2\"]},\"name\":\"costcode\"}] }";

        //var orgField = "{\"field\":[{\"values\":{\"value\":\"" + req.params.orgname + "\"},\"name\":\"orgname\"},{\"values\":{\"value\":\"\"},\"name\":\"domainname\"},{\"values\":{\"value\":[\"Dev\",\"Test\",\"Stage\"]},\"name\":\"costcode\"}]}";
        db.on('error', console.error.bind(console, 'connection error:'));
        console.log(JSON.stringify(projField));
        db.once('open', function callback() {

            console.log('in once');
        });
        console.log('received request ' + req.params.orgname);
        d4dModel.findOne({
            id: '4'
        }, function(err, d4dMasterJson) {
            if (err) {
                console.log("Hit and error:" + err);
            }
            if (d4dMasterJson) {
                var hasOrg = false;
                d4dMasterJson.masterjson.rows.row.forEach(function(itm, i) {
                    console.log("found" + itm.field.length);

                    for (var j = 0; j < itm.field.length; j++) {
                        if (itm.field[j]["name"] == 'projectname') {
                            //console.log("found:" + itm.field[j]["values"].value);
                            if (itm.field[j]["values"].value == req.params.projname) {
                                console.log("found: " + i + " -- " + itm.field[j]["values"].value);
                                hasOrg = true;
                            }
                        }

                        // console.log();
                    }
                });
                if (hasOrg == false) {
                    //Creating org
                    console.log('Creating');
                    d4dMasterJson.masterjson.rows.row.push(JSON.parse(projField));
                    d4dModel.update({
                        "id": "4"
                    }, {
                        $set: {
                            "masterjson": d4dMasterJson.masterjson
                        }
                    }, {
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
                } else {
                    res.send(200);
                }

            } else {
                res.send(500, {
                    "error": err
                });
                console.log("none found");
            }

        });
    });


    app.get('/createenv/:orgname/:envname', function(req, res) {
        var envField = "{\"field\":[{\"name\":\"environmentname\",\"values\":{\"value\":\"" + req.params.envname + "\"}},{\"name\":\"orgname\",\"values\":{\"value\":\"" + req.params.orgname + "\"}}]}";
        //var orgField = "{\"field\":[{\"values\":{\"value\":\"" + req.params.orgname + "\"},\"name\":\"orgname\"},{\"values\":{\"value\":\"\"},\"name\":\"domainname\"},{\"values\":{\"value\":[\"Dev\",\"Test\",\"Stage\"]},\"name\":\"costcode\"}]}";
        db.on('error', console.error.bind(console, 'connection error:'));
        console.log(JSON.stringify(envField));
        db.once('open', function callback() {

            console.log('in once');
        });
        console.log('received request ' + req.params.orgname);
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
                            if (itm.field[j]["values"].value == req.params.envname) {
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
                            res.send(500);
                            return;
                        }
                        res.send(200);
                        //callback(null, data);
                    });
                } else {
                    res.send(200);
                }

            } else {
                res.send(500, {
                    "error": err
                });
                console.log("none found");
            }

        });
    });


    app.get('/createorg/:orgname', function(req, res) {
        var orgField = "{\"field\":[{\"values\":{\"value\":\"" + req.params.orgname + "\"},\"name\":\"orgname\"},{\"values\":{\"value\":\"\"},\"name\":\"domainname\"},{\"values\":{\"value\":[\"Dev\",\"Test\",\"Stage\"]},\"name\":\"costcode\"}]}";
        db.on('error', console.error.bind(console, 'connection error:'));
        console.log(JSON.stringify(orgField));
        db.once('open', function callback() {

            console.log('in once');
        });
        console.log('received request ' + req.params.orgname);
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
                            if (itm.field[j]["values"].value == req.params.orgname) {
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
                } else {
                    res.send(200);
                }

            } else {
                res.send(500, {
                    "error": err
                });
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