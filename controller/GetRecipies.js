

var ChefApi = require("chef-api");




getCookbooks = function(options,callback){
    var chef = new ChefApi();
    chef.config(options);

	chef.getCookbooks(null,function(err, res){
		if(err)
			callback(err, null);

		//var jsonResp = JSON.parse(res)
        console.log(res);
		
		var keys = Object.keys(res);
		keys.sort(function(a,b){
			if(a<b){
		      return -1;
	        } else if(a>b){
		     return 1;
	        } else {
		     return 0;
	        }
		});
		callback(null, keys);
	});
	// chef.getClients(function(err, data){
	// 	console.log(JSON.parse(data));
	// 	console.log(JSON.stringify(err));
	// 	console.log(Object.keys());
	// });
}

module.exports.getCookbooks = getCookbooks;


