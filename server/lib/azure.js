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

    this.getFlavors = function(){
    	//From locations responses get virtualMachinesRoleSizes
    }

}


module.exports = AzureCloud;
