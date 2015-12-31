/* Copyright (C) Relevance Lab Private Limited- All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Gobinda Das <gobinda.das@relevancelab.com>,
 * Dec 2015
 */

// This file act as a Controller which contains vmware related all end points.


var VMware = require('_pr/lib/vmware');
var logger = require('_pr/logger')(module);
var vmwareCloudProvider = require('_pr/model/classes/masters/cloudprovider/vmwareCloudProvider.js');
var appConfig = require('_pr/config');

module.exports.setRoutes = function(app, verificationFunc) {

	app.all('/vmware/*', verificationFunc);

    var getvmwareprovider = function(providerid, callback) {

        var vmwareconfig = {
            host: "",
            username: "",
            password: "",
            dc:"",
            serviceHost:""
        };

        vmwareCloudProvider.getvmwareProviderById(providerid, function(err, data) {
            logger.debug('IN getvmwareProviderById: data: ');
            logger.debug(JSON.stringify(data));
            if(data)
            {
                vmwareconfig.host = data.host;
                vmwareconfig.username = data.username;
                vmwareconfig.password = data.password;
                vmwareconfig.dc = data.dc;
                vmwareconfig.serviceHost = appConfig.vmware.serviceHost;
                logger.debug('IN getvmwareProviderById: vmwareconfig: ');
                logger.debug(JSON.stringify(appConfig.vmware));
                logger.debug(JSON.stringify(vmwareconfig));
            }
            else{
                vmwareconfig = null;
            }
            callback(null, vmwareconfig);
        });

    }

	app.get('/vmware/:providerid/datastores', function(req, res) {
        logger.debug('Inside vmware get datastores');
        getvmwareprovider(req.params.providerid,function(err,vmwareconfig){
            if(vmwareconfig){
                var vmware = new VMware(vmwareconfig);
                vmware.getDatastores(vmwareconfig.serviceHost,function(err,data){
                    if(!err)
                    {
                        logger.debug('Recvd:',JSON.stringify(JSON.parse(data)));
                        res.send('200',JSON.parse(data));
                    }
                    else{
                        logger.debug('Error in datastores query :',err);
                        res.send('500',null);
                    }
                });
            }
            else{
                //no provider found.
                logger.debug('No Provider found :');
                res.send('400','No Provider found');
            }

        });

    });

    app.put('/vmware/:providerid/:vmname/:action',function(req,res){
        if(req.params.action){
            var action = '';
            switch(req.params.action){
                case "start":
                    action = 'poweron';
                    break;
                case "stop":
                    action = 'poweroff';
                    break;
            }
            getvmwareprovider(req.params.providerid,function(err,vmwareconfig){
                if(vmwareconfig){
                    var vmware = new VMware(vmwareconfig);
                    vmware.startstopVM(vmwareconfig.serviceHost,req.params.vmname,action,function(err,data){
                        if(!err)
                        {
                            logger.debug('Recvd:',JSON.stringify(JSON.parse(data)));
                            res.send('200',JSON.parse(data));
                        }
                        else{
                            logger.debug('Error in action query :',err);
                            res.send('500',null);
                        }
                    });
                }
                else{
                    //no provider found.
                    logger.debug('No Provider found :');
                    res.send('400','No Provider found');
                }

            });

        }
        else{
            res.send('400','No Action defined');
        }
    });
}