var Client = require('node-rest-client').Client;
var logger = require('_pr/logger')(module);
var mongoose = require('mongoose');
var request = require('request');

var CMDBConfigSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        trim: true
    },
    configname: {
        type: String,
        required: true,
        trim: true,
        //validate: nameValidator
    },
    url: {
        type: String,
        required: true,
        trim: true
    },
    servicenowusername: {
        type: String,
        required: true,
        trim: true,
        //validate: nameValidator
    },
    servicenowpassword: {
        type: String,
        required: true,
        trim: true
    },
    chefserver: {
        type: String,
        required: true,
        trim: true
    },
    orgname: {
        type: [String],
        required: true,
        trim: true,
        //validate: nameValidator
    },
    orgname_rowid: {
        type: [String],
        required: true,
        trim: true
    },
    rowid: {
        type: String,
        required: true,
        trim: true
    }
});


CMDBConfigSchema.statics.getCMDBServerById = function(serverId, callback) {

    logger.debug("START :: getCMDBServerById ");
    logger.debug("Servcer Id:", serverId);
    //var config = {username:"admin",password:"admin@123",host:"https://dev13730.service-now.com"};

    this.findOne({
        _id: serverId
    }, function(err, data) {
        if (err) {
            logger.error("Failed getServiceNow Config by Id", err);
            callback(err, null);
            return;
        }
        callback(null, data);
    });
}

CMDBConfigSchema.statics.getConfigItems = function(tableName, options, callback) {
    logger.debug("START :: getConfigItems");

    var basic_auth = {
        user: options.username,
        password: options.password
    };

    var tmp = options.host;
    var host = tmp.replace(/.*?:\/\//g, "");

    var servicenowURL = 'https://' + options.username + ':' + options.password + '@' + host + '/api/now/table/' + tableName;
    var options = {
        url: servicenowURL,
        headers: {
            'User-Agent': 'request',
            'Accept': 'application/json'
        }
    };

    logger.debug("options", options);

    request(options, function(error, response, body) {
        //logger.debug("response.statusCode", response.statusCode);
        if (!error && response.statusCode == 200) {
            logger.debug("success");
            var info = JSON.parse(body);
            callback(null, info);

        } else {
            logger.error("Error");
            callback(error, null);
        }

    });
}

CMDBConfigSchema.statics.getCMDBList = function(callback) {
    this.find({
        id: "90"
    }, function(err, data) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        callback(null, data);
    });
}

CMDBConfigSchema.statics.saveConfig = function(config, callback) {
    var configObj = config;
    var that = this;
    var obj = that(configObj);

    obj.save(function(err, data) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        logger.debug("Exit createNew CMDB configuration");
        callback(null, data);
        return;
    })

}

CMDBConfigSchema.statics.removeServerById = function(serverId, callback) {
    this.remove({
        "_id": serverId
    }, function(err, data) {
        if (err) {
            logger.error("Failed to remove item (%s)", err);
            callback(err, null);
            return;
        }
        logger.debug("Exit removeInstancebyId (%s)", serverId);
        callback(null, data);
    });
}

CMDBConfigSchema.statics.getConfigItemByName = function(name, tableName, options, callback) {
    logger.debug("START getConfigItemByName..");

    this.getConfigItems(tableName, options, function(err, data) {
        
        for (i = 0; i < data.result.length; i++) {
            if (data.result[i].name == name) {
                logger.debug("Node found");
                callback(null, data.result[i]);
                return;
            }

        }
        callback({
          erroMsg: "Selected Node not found"
        },null);
        
        return;
    });
}

var CMDBConfig = mongoose.model('CMDBConfig', CMDBConfigSchema);

module.exports = CMDBConfig;