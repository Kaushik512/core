var ldap = require('ldapjs');



function createDnObject(dnString) {
	var parts = dnString.split(',');
	var obj = {};
	for (var i = 0; i < parts.length; i++) {
		var keyValue = parts[i].split('=');
		console.log(keyValue);
		if (obj[keyValue[0]]) {
			obj[keyValue[0]] = [].concat(obj[keyValue[0]]);
			obj[keyValue[0]].push(keyValue[1]);
		} else {
			obj[keyValue[0]] = keyValue[1];
		}
	}
	return obj;
}

function createDnString(username, ou) {
	var str = 'cn=' + username + ',';
	if (ou) {
		str += 'ou=' + ou + ',';
	}
	str += 'dc=d4d-ldap,dc=relevancelab,dc=com'
	return str;
	//'cn='+username+',ou=SCLT_Group3,dc=d4d-ldap,dc=relevancelab,dc=com';
}

var Ldap = function() {

	var client = ldap.createClient({
		url: 'ldap://54.187.120.22:389'
	});

	this.authenticate = function(username, password, callback) {

		var dnString = createDnString(username);
		
		client.bind(dnString, password, function(err, user) {
			if (err) {
				console.log("err ==> ", err);
				callback(true, null);
			} else {
				callback(null, createDnObject(dnString));
			}
		});



	};
	this.close = function(callback) {
		client.unbind(function(err) {
			callback(err);
		});
	}

	this.createUser = function(username, password, fname, lname, callback) {
		var entry = {
			cn: username,
			gn: fname,
			sn: lname,
			userPassword: password,
			uid: username,
			objectclass: ['inetOrgPerson'],
			//uidNumber: new Date().getTime()
			//homeDirectory: '/home/users/' + username
			//dc=['d4d-ldap','relevancelab','com']
		};
		client.add('cn=' + username +',dc=d4d-ldap,dc=relevancelab,dc=com', entry, function(err, user) {
			if (err) {
				console.log('err in creating client');
				console.log('dn == >', err.dn);
				console.log('code == >', err.code);
				console.log('name == >', err.name);
				console.log('message == >', err.message);

				callback(err, null);
			} else {
				console.log('created');
				console.log('user ==> ', user);
				callback(null, user);
			}
		});

	}

}

module.exports = Ldap;