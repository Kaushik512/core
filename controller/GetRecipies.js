
var fs = require('fs');

var key = fs.readFileSync('./key.pem');



var ChefApi = require("../node_modules/chef-api");
var chef = new ChefApi();

var options = {
	user_name: "devops4devops",
	key_path: "./devops4devops.pem",
	url: "https://rld2mgmt02.rllabindia.com"
	//key : "-----BEGIN RSA PRIVATE KEY-----\nMIIEpQIBAAKCAQEA20ikrbJZVEZ0idcgFZKUmFeog6CZ+RGJMrTuA9ZvtZYGZsn5\nkrCTokQHFz+zFVEF5qS7yNxZLLT8gP0ePnBR0L4/OaIbm1p8Zecl9BcBKarDm/rl\nIsNJuj0eVmeEAVaX3jcI5TAg1ann3e/Lg8qOlyKJsck0aXXysafrpqsJXHQbtxrm\n8aemDi8skzoFD5s5QMQCqUkN+pd5DYlwH4CGfuG1Du41CaHRBCoxJipAwaMxBrrP\nDN4tVJRmqtJ+PSqdZ+Qd0lwNS4BQv0UVHT5ItKWkbBgVfMivR/J6rVNAO1+sIHOA\ne0bCfo/c6eq1dBGExuweyK1W2h/3cY4TlefuwwIDAQABAoIBABAoWSIHWzevfVTO\nyilsxJA5HUydn9rPZPmchVE5EsAhjtUyGrapVieFtbQL2IlAkBu/laqmOdfmehiT\nDhBxvEWSTxxTCo+26iWkE5LZwxcr4v/yS8H0+9DCQiMBu6NRmx0flwM0OackvtYG\nnktWuI0AWX8FIVyH+VsH0YBVZ/os3RWb2NPF42uMzpQaQ3yjpzSdvTdWe0+clQCJ\n95lQLsoJtOie16Gyi/i0S0mwlRvBNqkrGnDzrGhSWv8TsAynuGsfml3oirhx61lv\nnLo90+r1pztp0IZp7FVhS979eyDz3+/T+S1zGJnRCeKNvv88cTeay5cIYRDQwoa8\nDo2iLLkCgYEA8ZwgvUaymdC5IpQKywcH2s931Kxr7SWcSvpW88+BZqw53Zf0sr/z\nwHXQNTtpj7ufmttfyBeXaps4vN/IWBi067aGURda3OzFhkI1yF9fLX5lIO+nCYgz\nP0w/onRBZV7yhQ3GFbXlE/YZGJrXFeP5qV/tA5eaKTR7VxUs8T0TQ+cCgYEA6Fga\n2URkXW7N3/ZW9Ind92yHgpetioj3VJvrY0aE0VoT4pSEH+uE8bBswEc23kdcrfO0\nUmSLck2zfS+s1t6nXQoOXDWugh3p7jNSFmk7ti4p636BsjE095MSCvD0DieZQ+2F\nIHoxzu286z35FmtHYr39gWjzyhQGhfy2hd5wIsUCgYEA79JlvPsb9Qn1epkwTW7h\nIRSmgXfUeUTH6rSq8r+aVmvF1Gss/PED5poK3YvnsEAwoOn4HQktxyfkHbaTir6b\ndw1qLbvc+UYcmrPF5uqj8uhvQU4go5mKJN5um7aB4zlnySJu6MXwaOvy5TVtIdF0\n0+bfwJ0O7K+nbj0aqypQoSkCgYEAsFRVI/iklsgF1Ge2vGV5IFKsUO7d1Jp34i1m\nqfQVznAnUTjXQQZT4by7+/zP5keQTa/7dOA7eCcCBgrNiFB4AcMk/NP8uWEMbStj\nrAB3QZ6tT7y1n0963D0wXz9YaPmidovnEavK6zk/u+RPirUl+wknQDQveHhULxGI\nT/ZtceUCgYEAiQLEMOsrYfN+w9MndapxJ8/C02dT0po8+WzNddMc7KlkRZCYT5Tp\nxjS8HmbIkwBzI3q5Y8OlSUbEi+K39oyQDTfDVSZYLkvJ01VvT3vkbxHabDcI5X6r\nC/nSBca3oG2Hn6G7vhoZQHXJtxluWP8YqifjHDJCaabyJzWyC+JEtqA=\n-----END RSA PRIVATE KEY-----",
	//ca : "-----BEGIN RSA PRIVATE KEY-----\nMIIEpQIBAAKCAQEA20ikrbJZVEZ0idcgFZKUmFeog6CZ+RGJMrTuA9ZvtZYGZsn5\nkrCTokQHFz+zFVEF5qS7yNxZLLT8gP0ePnBR0L4/OaIbm1p8Zecl9BcBKarDm/rl\nIsNJuj0eVmeEAVaX3jcI5TAg1ann3e/Lg8qOlyKJsck0aXXysafrpqsJXHQbtxrm\n8aemDi8skzoFD5s5QMQCqUkN+pd5DYlwH4CGfuG1Du41CaHRBCoxJipAwaMxBrrP\nDN4tVJRmqtJ+PSqdZ+Qd0lwNS4BQv0UVHT5ItKWkbBgVfMivR/J6rVNAO1+sIHOA\ne0bCfo/c6eq1dBGExuweyK1W2h/3cY4TlefuwwIDAQABAoIBABAoWSIHWzevfVTO\nyilsxJA5HUydn9rPZPmchVE5EsAhjtUyGrapVieFtbQL2IlAkBu/laqmOdfmehiT\nDhBxvEWSTxxTCo+26iWkE5LZwxcr4v/yS8H0+9DCQiMBu6NRmx0flwM0OackvtYG\nnktWuI0AWX8FIVyH+VsH0YBVZ/os3RWb2NPF42uMzpQaQ3yjpzSdvTdWe0+clQCJ\n95lQLsoJtOie16Gyi/i0S0mwlRvBNqkrGnDzrGhSWv8TsAynuGsfml3oirhx61lv\nnLo90+r1pztp0IZp7FVhS979eyDz3+/T+S1zGJnRCeKNvv88cTeay5cIYRDQwoa8\nDo2iLLkCgYEA8ZwgvUaymdC5IpQKywcH2s931Kxr7SWcSvpW88+BZqw53Zf0sr/z\nwHXQNTtpj7ufmttfyBeXaps4vN/IWBi067aGURda3OzFhkI1yF9fLX5lIO+nCYgz\nP0w/onRBZV7yhQ3GFbXlE/YZGJrXFeP5qV/tA5eaKTR7VxUs8T0TQ+cCgYEA6Fga\n2URkXW7N3/ZW9Ind92yHgpetioj3VJvrY0aE0VoT4pSEH+uE8bBswEc23kdcrfO0\nUmSLck2zfS+s1t6nXQoOXDWugh3p7jNSFmk7ti4p636BsjE095MSCvD0DieZQ+2F\nIHoxzu286z35FmtHYr39gWjzyhQGhfy2hd5wIsUCgYEA79JlvPsb9Qn1epkwTW7h\nIRSmgXfUeUTH6rSq8r+aVmvF1Gss/PED5poK3YvnsEAwoOn4HQktxyfkHbaTir6b\ndw1qLbvc+UYcmrPF5uqj8uhvQU4go5mKJN5um7aB4zlnySJu6MXwaOvy5TVtIdF0\n0+bfwJ0O7K+nbj0aqypQoSkCgYEAsFRVI/iklsgF1Ge2vGV5IFKsUO7d1Jp34i1m\nqfQVznAnUTjXQQZT4by7+/zP5keQTa/7dOA7eCcCBgrNiFB4AcMk/NP8uWEMbStj\nrAB3QZ6tT7y1n0963D0wXz9YaPmidovnEavK6zk/u+RPirUl+wknQDQveHhULxGI\nT/ZtceUCgYEAiQLEMOsrYfN+w9MndapxJ8/C02dT0po8+WzNddMc7KlkRZCYT5Tp\nxjS8HmbIkwBzI3q5Y8OlSUbEi+K39oyQDTfDVSZYLkvJ01VvT3vkbxHabDcI5X6r\nC/nSBca3oG2Hn6G7vhoZQHXJtxluWP8YqifjHDJCaabyJzWyC+JEtqA=\n-----END RSA PRIVATE KEY-----"
}

chef.config(options);




getCookbooks = function(callback){

	chef.getCookbooks(null,function(err, res){
		if(err)
			callback(err, null);

		//var jsonResp = JSON.parse(res)

		
		var keys = Object.keys(res);
		keys.sort(function(a,b){
			if(a<b){
		      return -1;
	        } else if(a>b){
		     return 1;
	        } else {
		     return 0;
	        }
		});
		callback(null, keys);
	});
	// chef.getClients(function(err, data){
	// 	console.log(JSON.parse(data));
	// 	console.log(JSON.stringify(err));
	// 	console.log(Object.keys());
	// });
}

module.exports.getCookbooks = getCookbooks;


