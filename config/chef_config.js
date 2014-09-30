var pathExtra = require('path-extra');
var mkdirp = require('mkdirp');

var homeDirectory = pathExtra.homedir();

console.log('homeDirectory ==>',homeDirectory);


//creating path

var dir = mkdirp.sync(homeDirectory+'/catalyst/chef-repos/');
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

chefConfig.chefReposLocation = homeDirectory+'/catalyst/chef-repos/'

module.exports = chefConfig
