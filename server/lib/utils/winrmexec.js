/* Copyright (C) Relevance Lab Private Limited- All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Gobinda Das <gobinda.das@relevancelab.com>,
 * Dec 2015
 */

var winrm = require('winrm');

module.exports.exec = function(cmd, options, callback) {
    var path = options.path | '';
    var port = options.port | 5985;
    winrm.run(command, options.host, port, path, options.username, options.password, function(err, res) {
        //do stuff with response here
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, res);
    });
};