var d4dModelNew = require('./d4dmastersmodelnew.js');

var MasterJsonNew = function() {

    this.getMasterJson = function(id, callback) {
        console.log('Hit new model');
        d4dModelNew.findOne({
            id: id
        }, function(err, d4dMasterJson) {
            if (err) {
                callback(err, null);
                console.log("Hit and error:" + err);
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

module.exports = new MasterJsonNew();