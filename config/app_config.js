var pathExtra = require('path-extra');
var mkdirp = require('mkdirp');

var homeDirectory = pathExtra.homedir();

console.log('homeDirectory ==>',homeDirectory);


//creating path

mkdirp.sync(homeDirectory+'/catalyst/');
mkdirp.sync(homeDirectory+'/catalyst/instance-pemfiles/');


module.exports = {
	"app_run_port" : 3000,
	"settingsDir":homeDirectory+'/catalyst/',
    "instancePemFilesDir": homeDirectory + "/catalyst/instance-pemfiles/"

}