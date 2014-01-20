var ldap = require('../node_modules/ldapjs');


var client = ldap.createClient({
  url: 'ldap://192.168.105'
});

client.bind('cn=ldapuser1', 'pass@123', function(err) {
	  if(!err)
	  	console.log("Done");
	  else
	  	console.log(JSON.stringify(err));
});

authUser = function(req, res){

	client.bind('cn=ldapuser1', 'pass@123', function(err) {
	  assert.ifError(err);
	});


	if(req.data.user_name && req.data.user_pass){

	}
}