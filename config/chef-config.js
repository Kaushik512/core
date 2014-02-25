module.exports.knifeConfig = {
	instancePemFile : "/home/anshul/devopstest-us-west-2.pem",
	instanceUserName:"root",
	knifeCWD : "/home/anshul/chef-repos/anshul/chef-repo"
}

module.exports.chefConfig = {
	user_name: "anshul",
	key_path: "./config/anshul.pem",
	url: "https://api.opscode.com/organizations/anshul_rl"

	/*
	user_name: "adityakaranjkar",
	key_path: "./config/adityakaranjkar.pem",
	url: "https://api.opscode.com/organizations/adityacheforg"
	*/
}
/*
module.exports = {
	instanceUserName:"root",
	chefRepoLocation : "/home/anshul/chef-repos/anshul/chef-repo",
	chefUserName: "anshul",
	chefUserPemFile: "anshul.pem",
	chefValidationFile:"anshul_rl-validator.pem",
	chefUrl: "https://api.opscode.com/organizations/anshul_rl"
}*/