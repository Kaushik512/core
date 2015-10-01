var sys = require('sys');
var exec = require('child_process').exec;
var SSHExec = require('./utils/sshexec'); 

function execute(cmd, isJsonResponse, callback){
	console.log("START of executing issued command");
	exec(cmd, function(error, stdout, stderr){ 
		if(error){
			console.log("Error");
			console.log(error);
			callback(error,null);
			return
		}
		if(stderr){
			console.log("Std error");
			console.log(stderr);
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
					   console.log("Error in setting subscription:",err);
					   callback(err,null);
					   return;
				   }	

				   console.log("Set SubscriptionById is success", data);
				   callback(null,data);
				   return;
	        });	
	}

	this.setStorageByName = function(name,callback){
		var setStorageCmd = "azure storage account set "+name;

		execute(setStorageCmd, false, function(err,data){
            	   if(err){
					   console.log("Error in setting storage by name:",err);
					   callback(err,null);
					   return;
				   }	

				   console.log("Set StorageByName is success", data);
				   callback(null,data);
				   return;
	        });	
	}

	this.listVM = function(callback){
            execute("azure vm list --json",true,function(err,data){
            	   if(err){
					   console.log("Error in listing VM's:",err);
					   callback(err,null);
					   return;
				   }	

				   console.log("Number of VM's:", data.length);
				   callback(null,data);
				   return;
	        });	
	}

    this.getLocations = function(callback){
	        execute("azure vm location list --json",true,function(err,data){
		        	if(err){
						   console.log("Error in listing locations:",err);
						   callback(err,null);
						   return;
					 }

				   console.log("Number of locations:", data.length);
				   callback(null,data);
				   return;
		        });
    }

    this.getNetworks = function(callback){
    	 execute("azure network vnet list --json",true,function(err,data){
    	 	          if(err){
						   console.log("Error in listing networks:",err);
						   callback(err,null);
						   return;
					   }

					   console.log("Number of Virtual networks:", data.length);
					   callback(null,data);
					   return;
		        });
    }

    this.createServer = function(params,callback){
        
        //cloudServiceName,imageName,userName,password,vmName,size,sshPort
		//var createVMcmd = "azure vm create "+ params.VMName +" "+ params.imageName +" "+ params.userName +" "+params.password+" -z \""+params.size+" -l \""+params.location+"\" -e "+ params.sshPort +"-w " + params.vnet + " -b " + params.subnet;
		
		var createVMcmd = "azure vm create "+ params.VMName +" "+ params.imageName +" "+ params.username +" "+params.password+" -z \""+params.size+"\" -l \""+params.location+"\" -e "+ params.sshPort +" -w " + params.vnet + " -b " + params.subnet;

		console.log("Create VM command:", createVMcmd);
        var self = this;

		execute(createVMcmd,false,function(err,data){
		   if(err){
			   console.log("Error in VM creation:",err);
			   callback(err,null);
			   return;
		   }	
		   console.log("Create VM response:",data);

           var endpointsPorts = params.endpoints;

           var port = endpointsPorts.split(',')[0];
           
           console.log('Creating endpoint CatEndpoint with port:',port);

           self.createEndPoint(params.VMName,"CatEndpoint",port, function(){

           });

		   callback(null,data);

		});	
    }

    this.createEndPoint = function(serverName,name,port,callback){
      var createEndPoint = "azure vm endpoint create "+serverName+" "+port+" -n "+name;

       execute(createEndPoint,false,function(err,data){
      	  if(err){
			   console.log("Error in endpoint creation:",err);
			   callback(err,null);
			   return;
		   }
         
         console.log("endpoint creation response:",data);
		 callback(null,data);
      });
    }

    this.getServerByName = function(serverName,callback){
      
      var showVMcmd = "azure vm show --json "+serverName;

      execute(showVMcmd,true,function(err,data){
      	  if(err){
			   console.log("Error in VM show:",err);
			   callback(err,null);
			   return;
		   }
         
         console.log("Show VM response:",data);
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
	    console.log(JSON.stringify(opts));
	    var sshExec = new SSHExec(opts);
	    sshExec.exec(cmdString, function(err,stdout){
	    	 console.log(stdout);
	    	 callback(stdout);
	    	 return;
	    	}, function(err,stdout){
	    	console.log('Out:',stdout);//assuming that receiving something out would be a goog sign :)
	    	callback('ok');
	    	return;
	    }, function(err,stdout){
	    	console.log('Error Out:',stdout);
	    });

	}
	this.timeouts = [];
	this.callbackdone = false;

	this.waitforserverready = function(instanceName,username,pwd,callback){
	        var self = this;
	        console.log('instanceName received:',JSON.stringify(instanceName));
	        var wfsr = function(){
		        self.getServerByName(instanceName,function(err,data){
		                if (err) {
		                	callback(err, null);
		                	return;
		            	}
		                if(!err){
		                       console.log('Quried server:',JSON.stringify(data));
		                       var ip_address = data.Network.Endpoints[0].virtualIPAddress;
                               console.log('Azure VM ip address:',ip_address);

		                       if(data.InstanceStatus == 'ReadyRole'){
		                       	//set the floating ip to instance
		                       	  if(ip_address)
		                       			if(!err)
		                       				{
		                       					self.updatedfloatingip = true;
		                       					console.log('Updated with floating ip');
		                       				}
		                       }

		                       if(self.updatedfloatingip){
		                       		self.trysshoninstance(ip_address, username, pwd, function(cdata){
		                       				console.log('End trysshoninstance:',cdata);
		                       				if(cdata == 'ok'){
		                       					//Clearing all timeouts
		                       					for (var i = 0; i < self.timeouts.length; i++) {
		                       						console.log('Clearing timeout : ',self.timeouts[i]);
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
		                       					console.log('Timeout 1 set');
		                       					if(!self.callbackdone){
		                       					  self.timeouts.push(setTimeout(wfsr,30000));
		                       				   }
		                       				}
		                       		});
		                       }
		                       else
		                       	{
		                       		console.log('Timeout 2 set');
		                       		if(!self.callbackdone){
		                       		 self.timeouts.push(setTimeout(wfsr,30000));
		                       		}
		                       	}
		                       
		                }
		        });
	        };
	        console.log('Timeout 3 set');
	        self.timeouts.push(setTimeout(wfsr,15000));
	 }

}


module.exports = AzureCloud;
