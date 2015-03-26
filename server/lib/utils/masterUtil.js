var logger = require('../../lib/logger')(module);
var d4dModelNew = require('../../model/d4dmasters/d4dmastersmodelnew.js');

var MasterUtil = function(){
	this.getMastersProvidersByRowid = function(rowid,callback){
		d4dModelNew.d4dModelMastersProviders.find({
            rowid:rowid
        }, function(err, d4dMasterJson) {
            if (err) {
                logger.debug("Hit and error:", err);
                callback(err, null);
            }
            if (d4dMasterJson) {
                logger.debug("sent response %s", JSON.stringify(d4dMasterJson));
                callback(null, d4dMasterJson);
            } 
            logger.debug("Record not found.");

        });
	}
	this.getMastersImagesByRowid = function(rowid,callback){
		d4dModelNew.d4dModelMastersImages.find({
            rowid:rowid
        }, function(err, d4dMasterJson) {
            if (err) {
                logger.debug("Hit and error:", err);
                callback(err, null);
            }
            if (d4dMasterJson) {
                logger.debug("sent response %s", JSON.stringify(d4dMasterJson));
                callback(null, d4dMasterJson);
            } 
            logger.debug("Record not found.");

        });
	}
}
module.exports = new MasterUtil();