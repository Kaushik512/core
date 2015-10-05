var sys = require('sys');
var exec = require('child_process').exec;
var SSHExec = require('./utils/sshexec'); 
var logger = require('_pr/logger')(module);

function execute(cmd, isJsonResponse, callback){
	logger.debug("START of executing issued command");
	exec(cmd, function(error, stdout, stderr){ 
		if(error){
			logger.error("Error",error);
			callback(error,null);
			return
		}
		if(stderr){
			logger.error("Std error",stderr);
			callback(stderr,null);
			return;
		}
	
	   if(isJsonResponse){	
			 var json = JSON.parse(stdout);
			 //console.log("Json:", json)
			 callback(null,json); 
			 return;
	    }
	    callback(null,stdout); 
    });
}



var AzureCloud = function() {

	this.setSubscriptionById = function(id,callback){
		var setSubscriptionCmd = "azure account set "+id;

		execute(setSubscriptionCmd, false, function(err,data){
            	   if(err){
					   logger.error("Error in setting subscription:",err);
					   callback(err,null);
					   return;
				   }	

				   logger.debug("Set SubscriptionById is success", data);
				   callback(null,data);
				   return;
	        });	
	}

	this.setStorageByName = function(name,callback){
		var setStorageCmd = "azure storage account set "+name;

		execute(setStorageCmd, false, function(err,data){
            	   if(err){
					   logger.error("Error in setting storage by name:",err);
					   callback(err,null);
					   return;
				   }	

				   logger.debug("Set StorageByName is success", data);
				   callback(null,data);
				   return;
	        });	
	}

	this.listVM = function(callback){
            execute("azure vm list --json",true,function(err,data){
            	   if(err){
					   logger.error("Error in listing VM's:",err);
					   callback(err,null);
					   return;
				   }	

				   logger.debug("Number of VM's:", data.length);
				   callback(null,data);
				   return;
	        });	
	}

    this.getLocations = function(callback){
	        execute("azure vm location list --json",true,function(err,data){
		        	if(err){
						   logger.error("Error in listing locations:",err);
						   callback(err,null);
						   return;
					 }

				   logger.debug("Number of locations:", data.length);
				   callback(null,data);
				   return;
		        });
    }

    this.getNetworks = function(callback){
    	 execute("azure network vnet list --json",true,function(err,data){
    	 	          if(err){
						   logger.error("Error in listing networks:",err);
						   callback(err,null);
						   return;
					   }

					   logger.debug("Number of Virtual networks:", data.length);
					   callback(null,data);
					   return;
		        });
    }

    this.createServer = function(params,callback){
        
        //cloudServiceName,imageName,userName,password,vmName,size,sshPort
		//var createVMcmd = "azure vm create "+ params.VMName +" "+ params.imageName +" "+ params.userName +" "+params.password+" -z \""+params.size+" -l \""+params.location+"\" -e "+ params.sshPort +"-w " + params.vnet + " -b " + params.subnet;
		
		var createVMcmd = "azure vm create "+ params.VMName +" "+ params.imageName +" "+ params.username +" "+params.password+" -z \""+params.size+"\" -l \""+params.location+"\" -e "+ params.sshPort +" -w " + params.vnet + " -b " + params.subnet;

		logger.debug("Create VM command:", createVMcmd);
        var self = this;

		execute(createVMcmd,false,function(err,data){
		   if(err){
			   logger.error("Error in VM creation:",err);
			   callback(err,null);
			   return;
		   }	
		   logger.debug("Create VM response:",data);

           var endpointsPorts = params.endpoints;

           var port = endpointsPorts.split(',')[0];
           
           logger.debug('Creating endpoint CatEndpoint with port:',port);

           self.createEndPoint(params.VMName,"CatEndpoint",port, function(){

           });

		   callback(null,data);

		});	
    }

    this.createEndPoint = function(serverName,name,port,callback){
      var createEndPoint = "azure vm endpoint create "+serverName+" "+port+" -n "+name;

       execute(createEndPoint,false,function(err,data){
      	  if(err){
			   logger.error("Error in endpoint creation:",err);
			   callback(err,null);
			   return;
		   }
         
         logger.debug("endpoint creation response:",data);
		 callback(null,data);
      });
    }

    this.getServerByName = function(serverName,callback){
      
      var showVMcmd = "azure vm show --json "+serverName;

      execute(showVMcmd,true,function(err,data){
      	  if(err){
			   logger.error("Error in VM show:",err);
			   callback(err,null);
			   return;
		   }
         
         logger.debug("Show VM response:",data);
		 callback(null,data);
      });

    }

    this.updatedfloatingip = false;


	this.trysshoninstance = function(ip_address, username, pwd,callback){
		var opts = {
	        //privateKey: instanceData.credentials.pemFilePath,
	        password: pwd,
	        username: username,
	        host: ip_address,
	        instanceOS: 'linux',
	        port: 22,
	        cmds: ["ls -al"],
	        cmdswin: ["del "]
	    }
	    var cmdString = opts.cmds.join(' && ');
	    //console.log(JSON.stringify(opts));
	    var sshExec = new SSHExec(opts);
	    sshExec.exec(cmdString, function(err,stdout){
	    	 logger.debug(stdout);
	    	 callback(stdout);
	    	 return;
	    	}, function(err,stdout){
	    	logger.debug('Out:',stdout);//assuming that receiving something out would be a goog sign :)
	    	callback('ok');
	    	return;
	    }, function(err,stdout){
	    	logger.error('Error Out:',stdout);
	    });

	}
	this.timeouts = [];
	this.callbackdone = false;

	this.waitforserverready = function(instanceName,username,pwd,callback){
	        var self = this;
	        logger.debug('instanceName received:',JSON.stringify(instanceName));
	        var wfsr = function(){
		        self.getServerByName(instanceName,function(err,data){
		                if (err) {
		                	logger.error("Error",err);
		                	callback(err, null);
		                	return;
		            	}
		                if(!err){
		                       logger.debug('Quried server:',JSON.stringify(data));
		                       var ip_address = data.Network.Endpoints[0].virtualIPAddress;
                               logger.debug('Azure VM ip address:',ip_address);

		                       if(data.InstanceStatus == 'ReadyRole'){
		                       	//set the floating ip to instance
		                       	  if(ip_address)
		                       			if(!err)
		                       				{
		                       					self.updatedfloatingip = true;
		                       					logger.debug('Updated with floating ip');
		                       				}
		                       }

		                       if(self.updatedfloatingip){
		                       		self.trysshoninstance(ip_address, username, pwd, function(cdata){
		                       				logger.debug('End trysshoninstance:',cdata);
		                       				if(cdata == 'ok'){
		                       					//Clearing all timeouts
		                       					for (var i = 0; i < self.timeouts.length; i++) {
		                       						logger.debug('Clearing timeout : ',self.timeouts[i]);
												    clearTimeout(self.timeouts[i]);
												}
												self.timeouts = [];
												if(!self.callbackdone)
		                       						{
		                       							self.callbackdone = true;
		                       							callback(null,ip_address);
		                       						}

		                       					return;
		                       				}
		                       				else
		                       				{
		                       					logger.debug('Timeout 1 set');
		                       					if(!self.callbackdone){
		                       					  self.timeouts.push(setTimeout(wfsr,30000));
		                       				   }
		                       				}
		                       		});
		                       }
		                       else
		                       	{
		                       		logger.debug('Timeout 2 set');
		                       		if(!self.callbackdone){
		                       		 self.timeouts.push(setTimeout(wfsr,30000));
		                       		}
		                       	}
		                       
		                }
		        });
	        };
	        logger.debug('Timeout 3 set');
	        self.timeouts.push(setTimeout(wfsr,15000));
	 }

}


module.exports = AzureCloud;
