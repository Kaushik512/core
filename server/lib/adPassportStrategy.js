var util = require('util'),
    Strategy = require('passport-strategy'),
    ADClient = require('./ad-client.js');

var setDefaults = function(options) {
    options.usernameField || (options.usernameField = 'username');
    options.passwordField || (options.passwordField = 'password');
    options.host || (options.host = 'localhost');
    options.port || (options.port = '389');
    options.baseDn || (options.baseDn = '');
    options.ou || (options.ou = '');
    return options;
};


function ADPassportstrategy(opts) {
    Strategy.call(this);
    this.name = 'ad-custom-auth';
    opts = setDefaults(opts);
    this.getOptions = function() { // need to find a better way
        return opts;
    };
}

util.inherits(ADPassportstrategy, Strategy);

ADPassportstrategy.prototype.authenticate = function(req, options) {
    var self = this;
    var opts = this.getOptions();
    logger.debug(opts);
    var adClient = new ADClient({
        host: opts.host,
        port: opts.port,
        baseDn: opts.baseDn,
        ou: opts.ou
    });
    logger.debug(req.body);
    var username = req.body[opts.usernameField];
    var password = req.body[opts.passwordField];
    logger.debug(username, ' == ', password);
    if (!(username && password)) {
        return self.fail({
            message: 'Missing credentials'
        }, 400);
    };

    adClient.authenticate(username, password, function(err, userObj) {
        if (err) {
            return self.fail({
                message: 'Invalid username/password'
            }, 401);
        }

        return self.success(userObj);
    });

};

module.exports = ADPassportstrategy;