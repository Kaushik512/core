var logger = require('../../lib/logger')(module);
var ProviderUtil = function(){
	this.saveAwsPemFiles = function(regions,callback){
		if(regions){
			logger.debug("saveAwsPemFiles called: >>>>>>>>> %s",regions.length);
			var i, keys, length;
			keys = Object.keys(regions);
			i = 0;
			length = keys.length;
			while (i < length) {
			  regions[keys[i]];
			  console.log(regions[keys[i]]);
			  if(typeof regions[keys[i]] === 'object'){
			  	var newArray = regions[keys[i]];
			  	 for(var j in newArray){
			  	 	console.log(">>>>>>>> "+newArray[j]);
			  	 }
			   }
			  i++;
			}
			callback(null,true);
		}
	}
}

module.exports = new ProviderUtil();