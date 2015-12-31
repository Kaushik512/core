/* Copyright (C) Relevance Lab Private Limited- All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Gobinda Das <gobinda.das@relevancelab.com>,
 * Dec 2015
 */

var sys = require('sys')
var exec = require('child_process').exec;

function puts(error, stdout, stderr) {sys.puts(stdout)}

var Azure = function(settings){

	this.importPublishSettingsFile = funciton(pathtofile,callback){
		exec("ls -la", puts);
	}

}