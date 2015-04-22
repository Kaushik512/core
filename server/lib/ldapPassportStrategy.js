var util = require('util'),
    Strategy = require('passport-strategy'),
    ldap = require('ldapjs');

var setDefaults = function(options) {
    options.usernameField || (options.usernameField = 'username');
    options.passwordField || (options.passwordField = 'password');
    options.host || (options.host = 'localhost');
    options.port || (options.port = 'port');
    options.baseDn || (options.baseDn = '');

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

}