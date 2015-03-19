var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;
var validate = require('mongoose-validator');
var logger = require('../../lib/logger')(module);
var schemaValidator = require('./schema-validator');



var Schema = mongoose.Schema;

var AppCardSchema = new Schema({
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
    instanceIds: [String],
    iconpath: {
        type: String,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        validate: schemaValidator.appCardNameValidator
    },
    users: [{
        type: String,
        required: true,
        trim: true,
        validate: schemaValidator.catalystUsernameValidator
    }],
    buildConfig: {
        jenkinsServerId: String,
        jobName: String,
    },
    deployConfig: {
        chefServerId: String,
        runlist: [{
            type: String,
            trim: true,
            validate: schemaValidator.recipeValidator
        }]
    },
    buildHistory: [{
        timestampStarted: Number,
        timestampEnded: Number,
        success: Boolean,
        user: String
    }],
    deployHistory: [{
        timestampStarted: Number,
        timestampEnded: Number,
        success: Boolean,
        user: String
    }],

    functionalTestUrl: String,
    performanceTestUrl: String,
    securityTestUrl: String,
    nonFunctionalTestUrl: String,
    unitTestUrl: String,
    codeCoverageTestUrl: String,
    codeAnalysisUrl: String







});

var AppCards = mongoose.model('appcard', AppCardSchema);

var AppCardsDao = function() {


    this.createAppCard = function(appCardData, callback) {
        logger.debug("Enter createAppCard");

        var appcard = new AppCards(appCardData);

        appcard.save(function(err, data) {
            if (err) {
                logger.error("createAppCard Failed", err, appCardData);
                callback(err, null);
                return;
            }
            logger.debug("Exit createAppCard");
            callback(null, data);
        });
    };


    this.getAppCardsByOrgBgAndProjectId = function(orgId, bgId, projectId, userName, callback) {
        logger.debug("Enter getAppCardsByOrgBgAndProjectId (%s,%s, %s, %s)", orgId, bgId, projectId, envId, instanceType, userName);
        var queryObj = {
            orgId: orgId,
            bgId: bgId,
            projectId: projectId,
        }
        if (userName) {
            queryObj.users = userName;
        }
        AppCards.find(queryObj, {
            'buildHistory': false,
            'deployHistory': false
        }, function(err, appCardsList) {
            if (err) {
                logger.error("Failed to getAppCardsByOrgBgAndProjectId (%s,%s, %s, %s)", orgId, bgId, projectId, userName, err);
                callback(err, null);
                return;
            }

            logger.debug("Exit getAppCardsByOrgBgAndProjectId (%s,%s, %s, %s)", orgId, bgId, projectId, userName);
            callback(null, appCardsList);
        });
    };
};

module.exports = new AppCardsDao();