var ldap = require('ldapjs');



var setDefaults = function(options) {
    options.host || (options.host = 'localhost');
    options.port || (options.port = '389');
    options.baseDn || (options.baseDn = 'dc=d4d-ldap,dc=relevancelab,dc=com');
    options.ou || (options.ou = '');
    options.adminUser || (options.adminUser = 'admin');
    options.adminPass || (options.adminPass = 'SomePass');


    return options;
};

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

function createDnString(username, baseDn, ou) {
    var str = 'cn=' + username + ',';
    if (ou) {
        str += 'ou=' + ou + ',';
    }
    str += baseDn;
    return str;
    //'cn='+username+',ou=SCLT_Group3,dc=d4d-ldap,dc=relevancelab,dc=com';
}

var Ldap = function(options) {
    console.log('options ==>', options);
    if (!options) {
        options = {};
    }
    options = setDefaults(options);

    var client = ldap.createClient({
        url: 'ldap://' + options.host + ':' + options.port
    });

    this.authenticate = function(username, password, callback) {

        var dnString = createDnString(username, options.baseDn, options.ou);
        console.log('hit authenticate =========>' + dnString);
        client.bind(dnString, password, function(err, user) {
            if (err) {
                console.log("err ==> ", err);
                callback(err, null);
            } else {
                console.log("User String:{" + dnString + '}');
                callback(null, createDnObject(dnString));
            }
        });



    };
    this.compare = function(username, callback) {
        var dnString = createDnString(username, options.baseDn, options.ou);
        client.compare(dnString, 'sn', username, function(err, matched) {
            if (err) {
                callback(null, "false");
            } else {
                console.log('matched: ' + matched);
                callback(null, "true");
            }
        });
    };

    this.close = function(callback) {
        client.unbind(function(err) {
            if (typeof callback === 'function') {
                callback(err);
            }
        });
    };

    this.createUser = function(username, password, fname, lname, callback) {
        console.log('Entered Create User in Ldap', username, password, fname, lname);

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
        var dnString = createDnString(options.adminUser, options.baseDn, options.ou);
        var self = this;
        client.bind(dnString, options.adminPass, function(err) {
            if (err) {
                self.close();
                console.log('Error in binding for createuser' + err);
                return;
            }
            var userDnsString = createDnString(username, options.baseDn, options.ou);
            client.add(userDnsString, entry, function(err, user) {
                self.close();
                if (err) {
                    console.log('err in creating user');
                    console.log('dn == >', err.dn);
                    console.log('code == >', err.code);
                    console.log('name == >', err.name);
                    console.log('message == >', err.message);

                    callback(err.message, null);
                } else {
                    console.log('created');
                    // console.log('user ==> ', user);
                    callback(null, 200);
                }
            });
        });
    };

}

module.exports = Ldap;