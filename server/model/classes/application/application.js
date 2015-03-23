var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;
var validate = require('mongoose-validator');
var logger = require('../../../lib/logger')(module);
var schemaValidator = require('../../dao/schema-validator');

var Build = require('./build/build.js');

var Schema = mongoose.Schema;

var ApplicationSchema = new Schema({
    orgId: {
        type: String,
        required: true,
        trim: true,
        validate: schemaValidator.orgIdValidator
    },
    bgId: {
        type: String,
        required: true,
        trim: true,
        validate: schemaValidator.bgIdValidator
    },
    projectId: {
        type: String,
        required: true,
        trim: true,
        validate: schemaValidator.projIdValidator
    },
    name: String,
    iconpath: {
        type: String,
        trim: true
    },
    git: {
        repoUrl: String,
        repoUsername: String,
        repoPassword: String,
    },
    users: [{
        type: String,
        required: true,
        trim: true,
        validate: schemaValidator.catalystUsernameValidator
    }],
    buildId: {}

});

// instance method 
ApplicationSchema.methods.build = function(user, callback) {
    logger.debug("Executing build");
    Build.getBuildById(this.buildId, function(err, build) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        build.execute(user, callback);
    });
};

// static methods
ApplicationSchema.methods.getBuild = function(callback) {
    Build.getBuildById(this.buildId, function(err, build) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        callback(null, build);
    });
};

ApplicationSchema.methods.getBuildHistory = function(callback) {
    Build.getBuildById(this.buildId, function(err, build) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        build.getHistory(callback);
    });
};

ApplicationSchema.methods.getLastBuildInfo = function(callback) {
    Build.getBuildById(this.buildId, function(err, build) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        build.getLastBuild(callback);
    });
};


// static methods
ApplicationSchema.statics.getApplicationById = function(applicationId, callback) {
    this.find({
        "_id": new ObjectId(applicationId)
    }, function(err, data) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        //console.log('data ==>', data);
        if (data.length) {
            callback(null, data[0]);
        } else {
            callback(null, null);
        }

    });
};


ApplicationSchema.statics.createNew = function(appData, callback) {
    logger.debug("Enter create new application");
    var self = this;
    var build = new Build(appData.build);
    logger.debug('saving build==>');
    build.save(function(err, data) {
        if (err) {
            logger.error("create Application Failed", err, appData);
            callback(err, null);
            return;
        }
        logger.debug('build saved ==>');
        console.log(data);
        appData.buildId = data._id;
        var application = new self(appData);

        application.save(function(err, data) {
            if (err) {
                logger.error("create Application Failed", err, appData);
                callback(err, null);
                return;
            }
            logger.debug("Exit createNew application");
            callback(null, data);
        });
    });
};

ApplicationSchema.statics.getAppCardsByOrgBgAndProjectId = function(orgId, bgId, projectId, callback) {
    logger.debug("Enter getAppCardsByOrgBgAndProjectId (%s,%s, %s, %s)", orgId, bgId, projectId);
    var queryObj = {
        orgId: orgId,
        bgId: bgId,
        projectId: projectId,
    }

    this.find(queryObj, function(err, applications) {
        if (err) {
            logger.error("Failed to getAppCardsByOrgBgAndProjectId (%s,%s, %s)", orgId, bgId, projectId, err);
            callback(err, null);
            return;
        }

        logger.debug("Exit getAppCardsByOrgBgAndProjectId (%s,%s, %s)", orgId, bgId, projectId);
        callback(null, applications);
    });
};

var Application = mongoose.model('application', ApplicationSchema);

module.exports = Application;