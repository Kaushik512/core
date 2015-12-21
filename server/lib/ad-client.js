/* Copyright (C) Relevance Lab Private Limited- All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Gobinda Das <gobinda.das@relevancelab.com>,
 * Dec 2015
 */

var ActiveDirectory = require('activedirectory');


var setDefaults = function(options) {
    options.host || (options.host = 'localhost');
    options.port || (options.port = '389');
    options.baseDn || (options.baseDn = 'dc=d4d-ldap,dc=relevancelab,dc=com');
    options.ou || (options.ou = '');

    return options;
};

function createDnObject(dnString) {
    var parts = dnString.split(',');
    var obj = {};
    for (var i = 0; i < parts.length; i++) {
        var keyValue = parts[i].split('=');
        logger.debug(keyValue);
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

var ADClient = function(options) {
    logger.debug('options ==>', options);
    if (!options) {
        options = {};
    }
    options = setDefaults(options);

    var client = new ActiveDirectory({
        url: 'ldap://' + options.host + ':' + options.port,
        baseDN: options.baseDn,
        //username: 'username@domain.com',
        //password: 'password'
    });


    this.authenticate = function(username, password, callback) {

        //logger.debug('hit authenticate =========>' + dnString);

        client.authenticate(username, password, function(err, auth) {
            if (err) {
                logger.debug("err ==> ", err);
                callback(err, null);
            } else {
                logger.debug("User String:{" + dnString + '}');
                var dnString = createDnString(username, options.baseDn, options.ou);
                callback(null, createDnObject(dnString));
            }
        });

    };


}

module.exports = ADClient;