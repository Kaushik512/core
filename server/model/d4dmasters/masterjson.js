/* Copyright (C) Relevance Lab Private Limited- All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Gobinda Das <gobinda.das@relevancelab.com>,
 * Dec 2015
 */

var d4dModel = require('./d4dmastersmodel.js');
var logger = require('_pr/logger')(module);

var MasterJson = function() {

    this.getMasterJson = function(id, callback) {
        d4dModel.findOne({
            id: id
        }, function(err, d4dMasterJson) {
            if (err) {
                callback(err, null);
                logger.debug("Hit and error:" + err);
                return;
            }
            if (d4dMasterJson) {
                callback(null, d4dMasterJson);

            } else {
                callback(err, null);
            }
        });
    }
}

module.exports = new MasterJson();
