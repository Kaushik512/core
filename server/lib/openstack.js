var Client = require('node-rest-client').Client;

function getAuthToken(host,username,password,tenantName,callback){
	console.log("START:: getAuthToken");
		var args = {
			data: {"auth": {"tenantName": tenantName, "passwordCredentials":{"username": username, "password": password}}},
			headers:{"Content-Type": "application/json"} 
		   };
		
		client = new Client();
		var authUrl = 'http://'+host+':5000/v2.0/tokens';
		client.registerMethod("postMethod", authUrl, "POST");
		client.methods.postMethod(args,function(data,response){
			 if(data.access){
				console.log("Auth Token: "+data.access.token.id); 
				console.log("END:: getAuthToken");
				callback(null,data.access.token.id);
				return;
			   }else{
				 console.log("Error in getAuthToken");
				 callback(data,null);
			   }
			}); 
				
}

var Openstack = function(options) {
	
	this.getProjects = function(callback){
		console.log("START:: getProjects");
		
		getAuthToken(options.host,options.username,options.password,options.tenantName,function(err,token){
			if(token){
			   console.log("token::"+token);	
			   var args = {
					   headers:{"X-Auth-Token": token} 
					};
				client = new Client();
				var projectsUrl = 'http://'+options.host+':5000/v3/projects';
				client.registerMethod("jsonMethod", projectsUrl, "GET");
				client.methods.jsonMethod(args,function(data,response){
					console.log("get Projects response::"+data);
					if(data.projects){
					   console.log("END:: getProjects");
					   callback(null,data);
					   return ;
					}else{
						console.log("Error in getProjects");
						callback(data,null);
					}
				});    
			}else{
				console.log(err);
				callback(err,null);
			    return ;
			}
		})
		
    }
    	
	this.getTenants = function(callback){
		console.log("START:: getTenants");
		
		getAuthToken(options.host,options.username,options.password,options.tenantName,function(err,token){
			if(token){
			   console.log("token::"+token);	
			   var args = {
					   headers:{"X-Auth-Token": token} 
					};
				client = new Client();
				var tenantsUrl = 'http://'+options.host+':5000/v2.0/tenants';
				client.registerMethod("jsonMethod", tenantsUrl, "GET");
				client.methods.jsonMethod(args,function(data,response){
					if(data.tenants){
					   var tenants = data.tenants;
					   console.log("END:: getTenants");
					   callback(null,data);
					   return ;
					}else{
						console.log("Error in getTenants");
						callback(data,null);
					}
				});    
			}else{
				console.log(err);
				callback(err,null);
			    return ;
			}
		})
	}
  
  this.getImages = function(tenantId,callback){
	console.log("START:: getImages");	
	  
			 getAuthToken(options.host,options.username,options.password,options.tenantName,function(err,token){ 
					if(token){ 	
						console.log("Token Id::"+token);
						console.log("Tenant Id::"+tenantId);
						
						var args = {
							   headers:{"X-Auth-Token": token} 
							};
						
						client = new Client();
						
						var imagesUrl = 'http://'+options.host+':8774/v2/'+tenantId+'/images';
						
						console.log("imagesUrl:"+imagesUrl);
						client.registerMethod("jsonMethod", imagesUrl, "GET");
						
						client.methods.jsonMethod(args,function(data,response){
							console.log("get Images Response::"+data);
							if(data.images){
								console.log("END:: getImages");
							    callback(null,data);
							    return;
							}else{
								console.log("Error in getImages");
								callback(data,null);
							}
						});
					}else{
						console.log(err);
						callback(err,null);
			            return ;
					}	 
			 });
}
	
this.getServers = function(tenantId,callback){
	
	console.log("START:: getServers");	
	
			 getAuthToken(options.host,options.username,options.password,options.tenantName,function(err,token){ 
				if(token){
					console.log("Token Id::"+token);
					console.log("Tenant Id::"+tenantId);
					
					var args = {
						   headers:{"X-Auth-Token": token} 
						};
					
					client = new Client();
					
					var serversUrl = 'http://'+options.host+':8774/v2/'+tenantId+'/servers';
					
					console.log("serversUrl:"+serversUrl);
					client.registerMethod("jsonMethod", serversUrl, "GET");
					
					client.methods.jsonMethod(args,function(data,response){
						console.log("get Servers Response::"+data);
						if(data.servers){
							console.log("END:: getServers");
						    callback(null,data);
						    return ;
						}else{
							console.log("Error in getServers");
							callback(data,null);
						}
					});
				}else{
					console.log("error:"+err);
					callback(err,null);
			        return ;
				}	
				 
			 });
	
}

  this.getFlavors = function(tenantId,callback){
	console.log("START:: getFlavors");	

			 getAuthToken(options.host,options.username,options.password,options.tenantName,function(err,token){
				if(token){ 
					console.log("Token Id::"+token);
					console.log("Tenant Id::"+tenantId);
					
					var args = {
						   headers:{"X-Auth-Token": token} 
						};
					
					client = new Client();
					
					var flavorsUrl = 'http://'+options.host+':8774/v2/'+tenantId+'/flavors';
					
					console.log("flavorsUrl:"+flavorsUrl);
					client.registerMethod("jsonMethod", flavorsUrl, "GET");
					
					client.methods.jsonMethod(args,function(data,response){
						console.log("getFlavors Response::"+data);
						//var json = JSON.parse(data);
						if(data.flavors){
							console.log("END:: getFlavors");
						    callback(null,data);
						    return;
						}else{
							console.log("Error in getFlavors");
							callback(data,null);
						}
					});
			 }else{
				  console.log(err);
				  callback(err,null);
				  return;
			 }
			 });
}

  this.getNetworks= function(callback){
       console.log("START:: getNetworks");
       
       getAuthToken(options.host,options.username,options.password,options.tenantName,function(err,token){
		   if(token){   
			   console.log("token::"+token);	
			   var args = {
					   headers:{"X-Auth-Token": token,"Content-Type": "application/json"} 
					};
				client = new Client();
				var networksUrl = 'http://'+options.host+':9696/v2.0/networks';
				client.registerMethod("jsonMethod", networksUrl, "GET");
				client.methods.jsonMethod(args,function(data,response){
					console.log("getNetworks response:: "+data);
					var json = JSON.parse(data);
					if(json.networks){
					   console.log("END:: getNetworks");
					   callback(null,json);
					   return ;
					}else{
						console.log("Error in getNetworks");
						callback(data,null);
					}
				});    
		}else{
			console.log(err);
		    callback(err,null);
		    return;
		}	
	})
		
 }

 this.getSecurityGroups = function(callback){
	 console.log("START:: getSecurityGroups");
	 
	 getAuthToken(options.host,options.username,options.password,options.tenantName,function(err,token){
		 if(token){
			   console.log("token::"+token);	
			   var args = {
					   headers:{"X-Auth-Token": token,"Content-Type": "application/json"} 
					};
				client = new Client();
				var securityGroupsUrl = 'http://'+options.host+':9696/v2.0/security-groups';
				client.registerMethod("jsonMethod", securityGroupsUrl, "GET");
				client.methods.jsonMethod(args,function(data,response){
					//console.log("getSecurityGroups response:: "+data);
					var json = JSON.parse(data);
					if(json.security_groups){
					   console.log("END:: getSecurityGroups");
					   callback(null,json);
					   return ;
					}else{
						console.log("Error in getSecurityGroups");
						callback(data,null);
					}
				}); 
		}else{
			console.log(err);
		    callback(err,null);
		    return;
		}   
	})
 }
 
 this.createServer = function(tenantId,createServerJson,callback){
	 console.log("START:: createServer");
	 
	 getAuthToken(options.host,options.username,options.password,options.tenantName,function(err,token){
		 if(token){
			   console.log("token::"+token);	
			   var args = {
				       data: createServerJson, 
					   headers:{"X-Auth-Token": token,"Content-Type": "application/json"} 
					};
				client = new Client();
				var createServerUrl = 'http://'+options.host+':8774/v2/'+tenantId+'/servers';
				client.registerMethod("jsonMethod", createServerUrl, "POST");
				client.methods.jsonMethod(args,function(data,response){
					console.log("createServer response:: "+data);
					if(data.server){
					   console.log("END:: createServer");	
					   callback(null,data);
					   return;
				    }else{
						callback(data,null);
					}
					
				}); 
		}else{
			console.log(err);
		    callback(err,null);
		    return;
		}   
	})
 }

  this.getServerById = function(tenantId,serverId,callback){
	 console.log("START:: Getting server details by id");
	 
	 getAuthToken(options.host,options.username,options.password,options.tenantName,function(err,token){
		   if(token){
			   console.log("token:"+token);
			   
			   var args = {
				    headers: {"X-Auth-Token": token, "Content-Type": "application/json"}
				    };
			   
			   var serverDetailUrl = 'http://'+options.host+':8774/v2/'+tenantId+'/servers/'+serverId;
			   client = new Client();
			   client.registerMethod("getServerDetails",serverDetailUrl,"GET");
			   client.methods.getServerDetails(args,function(data,response){
				   console.log("getServerDetails response:"+data);
				   if(data.server){
					   console.log("END:: Getting server details by id");	
					   callback(null,data);
					   return;
				    }else{
						callback(data,null);
					}
				   });
		   }else{
			   console.log(err);
		       callback(err,null);
		       return;
		   }
		 });
	 
 }
 
}


module.exports = Openstack;