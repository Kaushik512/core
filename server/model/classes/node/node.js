var logger = require('../../../lib/logger')(module);
var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var ObjectId = require('mongoose').Types.ObjectId;
var schemaValidator = require('../../dao/schema-validator');
var uniqueValidator = require('mongoose-unique-validator');

var InstanceSchema = new Schema({
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
    envId: {
        type: String,
        required: true,
        trim: true,
        validate: schemaValidator.envIdValidator
    },
    chefNodeName: String,
    runlist: [{
        type: String,
        trim: true,
        validate: schemaValidator.recipeValidator
    }],
    platformId: String,
    instanceIP: {
        type: String,
        trim: true
    },
    appUrls: [{
        name: String,
        url: String
    }],
    instanceState: String,
    bootStrapStatus: String,
    users: [{
        type: String,
        trim: true,
        required: true,
        validate: schemaValidator.catalystUsernameValidator
    }],
    hardware: {
        platform: String,
        platformVersion: String,
        architecture: String,
        memory: {
            total: String,
            free: String,
        },
        os: String,
    },
    chef: {
        serverId: {
            type: String,
            required: true,
            trim: true
        },
        chefNodeName: String
    },
    credentials: {
        username: {
            type: String,
            required: true,
            trim: true
        },
        password: String,
        pemFileLocation: String
    },
    blueprintData: {
        blueprintId: String,
        blueprintName: String,
        templateId: String,
        templateType: String,
        templateComponents: [String],
        iconPath: String,
    },
    docker: {
        dockerEngineStatus: String,
        dockerEngineUrl: String
    },
    serviceIds: [{
        type: String,
        trim: true
    }],
    actionLogs: [ActionLogSchema]
});