var logger = require('../../lib/logger')(module);
var d4dModelNew = require('../../model/d4dmasters/d4dmastersmodelnew.js');

var MasterUtil = function(){
	this.getMastersByRowid = function(rowid,callback){
		d4dModelNew.d4dModelMastersProviders.find({
            rowid: req.params.rowid
        }, function(err, d4dMasterJson) {
            if (err) {
                logger.debug("Hit and error:", err);
                callback(err, null);
            }
            if (d4dMasterJson) {
                res.writeHead(200, {
                    'Content-Type': 'application/json'
                });
               // res.end(JSON.stringify(d4dMasterJson));
                logger.debug("sent response %s", JSON.stringify(d4dMasterJson));
                callback(null, JSON.stringify(d4dMasterJson));
            } else {
                res.send(400, {
                    "error": err
                });
                logger.debug("Record not found.");
            }


        });
	}
}
module.exports = MasterUtil;