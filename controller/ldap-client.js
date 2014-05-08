var ldap = require('ldapjs');
var client = ldap.createClient({
	url: 'ldap://54.187.176.191:389'
});

var Ldap = function() {
    
	this.authenticate = function(username, password, callback) {
		client.bind('cn='+username+',dc=d4d-ldap,dc=relevancelab,dc=com',password, function(err,user) {
		   if(err) {
		   	console.log("err ==> ",err);
		   	callback(true,null);
		   } else {
		   	console.log("user ==>",user);
		   	callback(null,user);
		   }
		});
	}

}

module.exports = new Ldap();