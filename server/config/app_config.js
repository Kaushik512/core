var pathExtra = require('path-extra');
var mkdirp = require('mkdirp');
var fs = require('fs');
var currentDirectory = __dirname;
var path = require('path');
var logger = require('../lib/logger')(module);


var configJson;
try {
    configJson = fs.readFileSync(currentDirectory + '/catalyst-config.json', {
        'encoding': 'utf8'
    });
} catch (err) {
    console.log(err);
    configJson = null;
    throw err;
}


if (configJson) {
    var config = JSON.parse(configJson);
    //console.log(config);
}
//creating path
mkdirp.sync(config.catalystHome);
mkdirp.sync(config.instancePemFilesDir);
mkdirp.sync(config.tempDir);
mkdirp.sync(config.chef.cookbooksDir);

var chefRepoLocation = mkdirp.sync(config.chef.chefReposLocation);
logger.debug('chef repo location ==>', config.chef.chefReposLocation);


module.exports = config;