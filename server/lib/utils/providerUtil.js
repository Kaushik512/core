var logger = require('../../lib/logger')(module);
var ProviderUtil = function(){
	this.saveAwsPemFiles = function(regions,callback){
		var recursive = function(regions){
			logger.debug("recursive called>>>>>>>>>>>");
			if(regions){
				  var i, j, keys, length, newArray, _results;
				  i = void 0;
				  keys = void 0;
				  length = void 0;
				  keys = Object.keys(regions);
				  i = 0;
				  length = keys.length;
				  _results = [];
					  while (i < length) {
					    regions[keys[i]];
					    if (typeof regions[keys[i]] === "object") {
					      newArray = regions[keys[i]];
					      for (var j in newArray) {
					        if (typeof newArray[j] === "object") {
					          recursive(newArray[j]);
					          //logger.debug("Print all array values: ", newArray[j]);
					        }
								
					      }
					      logger.debug("Print all region values: ", regions[keys[i]]);
					    }
					    
					    _results.push(i++);

					  }
				}
		}
		recursive(regions);
		callback(null,true);
	}

}

module.exports = new ProviderUtil();