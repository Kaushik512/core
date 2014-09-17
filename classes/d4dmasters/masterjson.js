var d4dModel = require('./d4dmastersmodel.js');

var MasterJson = function() {

    this.getMasterJson = function(id, callback) {
        d4dModel.findOne({
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

module.exports = new MasterJson();