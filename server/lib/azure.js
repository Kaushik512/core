var sys = require('sys');
var exec = require('child_process').exec;
 

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
		
		var createVMcmd = "azure vm create "+ params.VMName +" "+ params.imageName +" admin Pass@1234 -z \""+params.size+"\" -l \""+params.location+"\" -e "+ params.sshPort +" -w " + params.vnet + " -b " + params.subnet;
		//var createVMcmd = "azure vm create D4D-test1 b4590d9e3ed742e4a1d46e5424aa335e__suse-sles-12-v20150213 admin Pass@1234 -z ExtraSmall -e 22 -l \"Southeast Asia\" -w \"RelVN\" -b \"StaticSubnet\"";

		console.log("Create VM command:", createVMcmd);
		
		execute(createVMcmd,false,function(err,data){
		   if(err){
			   console.log("Error in VM creation:",err);
			   callback(err,null);
			   return;
		   }	
		   	
		   console.log("Create VM response:",data);
		   callback(null,data);
		});	

    }

    this.getServerByName = function(serverName,callback){
      
      var showVMcmd = "azure vm show --json"+serverName;

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
}


module.exports = AzureCloud;
