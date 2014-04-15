var ChefApi = require("../node_modules/chef-api");

var Chef = function(settings) {

	var chefApi = new ChefApi();
	chefApi.config({
		user_name: settings.chefUserName,
		key_path: settings.chefReposLocation + settings.chefUserName + "/.chef/" + settings.chefUserPemFile,
		url: settings.hostedChefUrl
	});

	this.getHostedChefCookbooks = function(callback) {
		if (typeof callback !== 'function') {
			return;
		}
		chefApi.getCookbooks(null, function(err, res) {
			if (err)
				callback(err, null);

			var keys = Object.keys(res);
			keys.sort(function(a, b) {
				if (a < b) {
					return -1;
				} else if (a > b) {
					return 1;
				} else {
					return 0;
				}
			});
			callback(null, keys);
		});

	};

}

module.exports = Chef;