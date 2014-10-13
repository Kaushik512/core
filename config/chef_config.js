var appConfig = require('./app_config');
var mkdirp = require('mkdirp');


//creating path

var dir = mkdirp.sync(appConfig.settingsDir+'/chef-repos/');
console.log(dir);


var chefConfig = {
	chefReposLocation: "/home/anshul/chef-repos/",
	userChefRepoName : "pcjoshi9",
	chefUserName: "pcjoshi9",
	chefUserPemFile: "/home/anshul/chef-repos/pcjoshi9/.chef/pcjoshi9.pem",
	chefValidationPemFile:"pjlab-validator.pem",
	hostedChefUrl: "https://api.opscode.com/organizations/pjlab",
	defaultChefCookbooks:['recipe[a]']

}

chefConfig.chefReposLocation = appConfig.settingsDir+'/chef-repos/';

module.exports = chefConfig
