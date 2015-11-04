var util = require('util'),
    Strategy = require('passport-strategy'),
    LdapClient = require('./ldap-client.js');

var setDefaults = function(options) {
    options.usernameField || (options.usernameField = 'username');
    options.passwordField || (options.passwordField = 'password');
    options.host || (options.host = 'localhost');
    options.port || (options.port = '389');
    options.baseDn || (options.baseDn = '');
    options.ou || (options.ou = '');
    return options;
};


function LDAPPassportstrategy(opts) {
    Strategy.call(this);
    this.name = 'ldap-custom-auth';
    opts = setDefaults(opts);
    this.getOptions = function() { // need to find a better way
        return opts;
    };
}

util.inherits(LDAPPassportstrategy, Strategy);

LDAPPassportstrategy.prototype.authenticate = function(req, options) {
    var self = this;
    var opts = this.getOptions();
    console.log(opts);
    var ldapClient = new LdapClient({
        host: opts.host,
        port: opts.port,
        baseDn: opts.baseDn,
        ou:opts.ou
    });
    console.log(req.body);
    var username = req.body[opts.usernameField];
    var password = req.body[opts.passwordField];
    console.log(username,' == ',password);
    if (!(username && password)) {
        return self.fail({
            message: 'Missing credentials'
        }, 400);
    };

    ldapClient.authenticate(username, password, function(err, userObj) {
        if (err) {
            return self.fail({
                message: 'Invalid username/password'
            }, 401);
        }
        ldapClient.close();
        return self.success(userObj);
    });

};

module.exports = LDAPPassportstrategy;