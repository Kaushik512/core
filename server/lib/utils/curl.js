/* Copyright (C) Relevance Lab Private Limited- All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Gobinda Das <gobinda.das@relevancelab.com>,
 * Dec 2015
 */

var logger = require('_pr/logger')(module);
var util = require('util');
var process = require('child_process').exec;




var curl = function(){

	this.executecurl = function(cmd,callback){
		child = process(cmd,function(error,stdout,stderr){
			if(error){
				logger.debug("error:" + error);
				callback(error,null);
			}
			if(stderr){
				logger.debug("stderr:" + stderr + "end of errr");
				callback(stderr,null);

			}
			if(stdout){
				logger.debug("Out:" + stdout);
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
				logger.debug("Out:" + stdout);
				callback(null,stdout);
			}
		});
		
	}

	
}

module.exports = curl;

