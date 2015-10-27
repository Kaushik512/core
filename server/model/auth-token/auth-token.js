var logger = require('_pr/logger')(module);
var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var ObjectId = require('mongoose').Types.ObjectId;
var schemaValidator = require('_pr/model/utils/schema-validator');
var uniqueValidator = require('mongoose-unique-validator');
var uuid = require('node-uuid');


var Schema = mongoose.Schema;



var AuthTokenSchema = new Schema({
    token: {
        type: String,
        // required: true,
        // trim: true
    },
    timestamp: {
        type: Number,
        // required: true,
        // trim: true,
    },
    sessionData: Object
});






// Static methods :- 

// creates a new task
AuthTokenSchema.statics.createNew = function(sessionData, callback) {
    console.log('here === >>> anshul');
    var token = uuid.v4();
    var that = this;
    var authToken = new that({
        token: token,
        timestamp: new Date().getTime(),
        sessionData: sessionData
    });

    console.log('auth == > ',authToken);

    authToken.save(function(err, data) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        callback(null, data);
    });
};

// find by token
AuthTokenSchema.statics.findByToken = function(token, callback) {
    if (!token) {
        process.nextTick(function() {
            callback(new Error("Invalid token"));
        });
        return;
    }
    var queryObj = {
        token: token,
    }

    this.find(queryObj, function(err, authTokens) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        if (!authTokens.length) {
            callback(null, null);
            return;
        }
        if (authTokens.length > 1) { // having more than one entry for token.

            for (var i = 0; i < authTokens.length; i++) {
                authTokens[i].remove(); // deleting all the tokens
            }
            callback(null, null);
        } else {
            callback(null, authTokens[0]);
        }

    });
};



// remove token
AuthTokenSchema.statics.removeByToken = function(token, callback) {
    if (!token) {
        process.nextTick(function() {
            callback(new Error("Invalid token"));
        });
        return;
    }
    this.remove({
        "token": token
    }, function(err, deleteCount) {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, deleteCount);
    });
};







var AuthToken = mongoose.model('AuthToken', AuthTokenSchema);

module.exports = AuthToken;