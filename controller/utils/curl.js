var util = require('util');
var process = require('child_process').exec;




var executecurl = function(){

	this.executecurl = function(cmd,callback){
		child = process(cmd,function(error,stdout,stderr){
			if(error){
				callback(error,null);
			}
			if(stderr){
				callback(stderr,null);

			}
			if(stdout){
				console.log("Out:" + stdout);
				callback(null,stdout);
			}
		});
		
	}
	this.executecwdcmd = function(cmd,cwd1,callback){

		child = process(cmd,{cwd: cwd1},function(error,stdout,stderr){
			if(error){
				callback(error,null);
			}
			if(stderr){
				callback(stderr,null);

			}
			if(stdout){
				console.log("Out:" + stdout);
				callback(null,stdout);
			}
		});
		
	}

	
}

module.exports = executecurl;

