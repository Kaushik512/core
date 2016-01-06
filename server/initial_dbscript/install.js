/* Copyright (C) Relevance Lab Private Limited- All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Gobinda Das <gobinda.das@relevancelab.com>,
 * Jan 2016
 */

// This file is like a installer which will install global settings into DB.

var logger = require('_pr/logger')(module);
var GlobalSettings = require('_pr/model/global-settings/global-settings');
var mongoDbConnect = require('_pr/lib/mongodb');
var appConfig = require('_pr/config');
var d4dModel = require('../model/d4dmasters/d4dmastersmodel.js');
var d4dModelNew = require('../model/d4dmasters/d4dmastersmodelnew.js');
var permissionsetsdao = require('_pr/model/dao/permissionsetsdao.js');
var userRole = require('_pr/model/user-roles.js');

var dboptions = {
    host: appConfig.db.host,
    port: appConfig.db.port,
    dbName: appConfig.db.dbName
};
mongoDbConnect(dboptions, function(err) {
    if (err) {
        logger.error("Unable to connect to mongo db >>" + err);
        throw new Error(err);
    } else {
        logger.debug('connected to mongodb - host = %s, port = %s, database = %s', dboptions.host, dboptions.port, dboptions.dbName);
    }
});

permissionsetsdao.listPermissionSets(function(err, data) {
    if (err) {
        logger.error("Got error while getting permission: ", err);
        return;
    }
    logger.debug("permission got successfully.");

    // To Make sure initial data not present in DB.If not present then insert.
    if (!data.length) {

        // start permissionset insertion

        var permissionData1 = {
            "roleid": "1",
            "rolename": "Designer",
            "permissions": [{
                "category": "settings",
                "type": "module",
                "access": [
                    "none"
                ]
            }, {
                "category": "design",
                "type": "module",
                "access": [
                    "read"
                ]
            }, {
                "category": "organization",
                "type": "resource",
                "access": [
                    "read"
                ]
            }, {
                "category": "environment",
                "type": "resource",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete"
                ]
            }, {
                "category": "businessgroups",
                "type": "resource",
                "access": [
                    "read"
                ]
            }, {
                "category": "projects",
                "type": "resource",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete"
                ]
            }, {
                "category": "instancelaunch",
                "type": "action",
                "access": [
                    "read",
                    "execute"
                ]
            }, {
                "category": "instancestart",
                "type": "action",
                "access": [
                    "read",
                    "execute"
                ]
            }, {
                "category": "instancestop",
                "type": "action",
                "access": [
                    "read",
                    "execute"
                ]
            }, {
                "category": "instanceterminate",
                "type": "action",
                "access": [
                    "read",
                    "execute"
                ]
            }, {
                "category": "instanceconnect",
                "type": "action",
                "access": [
                    "read",
                    "execute"
                ]
            }, {
                "category": "instanceservices",
                "type": "action",
                "access": [
                    "read",
                    "execute"
                ]
            }, {
                "category": "instancetasks",
                "type": "action",
                "access": [
                    "read",
                    "execute"
                ]
            }, {
                "category": "dockercontainerstart",
                "type": "action",
                "access": [
                    "read",
                    "execute"
                ]
            }, {
                "category": "dockercontainerstop",
                "type": "action",
                "access": [
                    "read",
                    "execute"
                ]
            }, {
                "category": "dockercontainerterminate",
                "type": "action",
                "access": [
                    "read",
                    "execute"
                ]
            }, {
                "category": "dockercontainerpause",
                "type": "action",
                "access": [
                    "read",
                    "execute"
                ]
            }, {
                "category": "chefserver",
                "type": "resource",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete"
                ]
            }, {
                "category": "chefenvironment",
                "type": "resource",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete"
                ]
            }, {
                "category": "dockerrepository",
                "type": "resource",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete"
                ]
            }, {
                "category": "buildservers",
                "type": "resource",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete"
                ]
            }, {
                "category": "provider",
                "type": "resource",
                "access": [
                    "read"
                ]
            }, {
                "category": "imagegallery",
                "type": "resource",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete"
                ]
            }, {
                "category": "jiraserver",
                "type": "resource",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete"
                ]
            }, {
                "category": "planningservers",
                "type": "resource",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete"
                ]
            }, {
                "category": "coderepository",
                "type": "resource",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete"
                ]
            }, {
                "category": "users",
                "type": "resource",
                "access": [
                    "read"
                ]
            }, {
                "category": "roles",
                "type": "resource",
                "access": [
                    "read"
                ]
            }, {
                "category": "teams",
                "type": "resource",
                "access": [
                    "read"
                ]
            }, {
                "category": "authenticationprovider",
                "type": "resource",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete"
                ]
            }, {
                "category": "templates",
                "type": "resource",
                "access": [
                    "read"
                ]
            }, {
                "category": "templatetypes",
                "type": "resource",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete"
                ]
            }, {
                "category": "services",
                "type": "resource",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete",
                    "execute"
                ]
            }, {
                "category": "blueprints",
                "type": "resource",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete",
                    "execute"
                ]
            }, {
                "category": "workzone",
                "type": "module",
                "access": [
                    "read"
                ]
            }, {
                "category": "instancerunlist",
                "type": "resource",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete",
                    "execute"
                ]
            }, {
                "category": "orchestration",
                "type": "resource",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete"
                ]
            }, {
                "category": "containers",
                "type": "resource",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete"
                ]
            }, {
                "category": "logs",
                "type": "resource",
                "access": [
                    "read"
                ]
            }, {
                "category": "configuration",
                "type": "resource",
                "access": [
                    "read"
                ]
            }, {
                "category": "organizationdashboard",
                "type": "resource",
                "access": [
                    "read"
                ]
            }, {
                "category": "businessunitdashboard",
                "type": "resource",
                "access": [
                    "read"
                ]
            }, {
                "category": "projectdashboard",
                "type": "resource",
                "access": [
                    "read"
                ]
            }, {
                "category": "jenkins",
                "type": "resource",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete"
                ]
            }, {
                "category": "jenkins_task",
                "type": "action",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete",
                    "execute"
                ]
            }, {
                "category": "chef_task",
                "type": "action",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete",
                    "execute"
                ]
            }, {
                "category": "custom_task",
                "type": "action",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete",
                    "execute"
                ]
            }, {
                "category": "application",
                "type": "action",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete",
                    "execute"
                ]
            }, {
                "category": "providers",
                "type": "resource",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete"
                ]
            }, {
                "category": "vmimage",
                "type": "resource",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete"
                ]
            }, {
                "category": "build",
                "type": "action",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete",
                    "execute"
                ]
            }, {
                "category": "application_instance",
                "type": "action",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete",
                    "execute"
                ]
            }, {
                "category": "deploy_history",
                "type": "action",
                "access": [
                    "read"
                ]
            }, {
                "category": "databag",
                "type": "resource",
                "access": [
                    "read"
                ]
            }, {
                "category": "instancechefclientrun",
                "type": "action",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete",
                    "execute"
                ]
            }, {
                "category": "puppetserver",
                "type": "resource",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete",
                    "execute"
                ]
            }]
        };

        permissionsetsdao.createNew(permissionData1, function(err, data) {
            if (err) {
                logger.error("Got error while saving permission: ", err);
                return;
            }
            logger.debug("permission saved successfully.");
        });

        var permissionData2 = {
            "roleid": "2",
            "rolename": "Consumer",
            "permissions": [{
                "category": "settings",
                "type": "module",
                "access": [
                    "none"
                ]
            }, {
                "category": "design",
                "type": "module",
                "access": [
                    "none"
                ]
            }, {
                "category": "organization",
                "type": "resource",
                "access": [
                    "read"
                ]
            }, {
                "category": "environment",
                "type": "resource",
                "access": [
                    "read"
                ]
            }, {
                "category": "businessgroups",
                "type": "resource",
                "access": [
                    "read"
                ]
            }, {
                "category": "projects",
                "type": "resource",
                "access": [
                    "read"
                ]
            }, {
                "category": "instancelaunch",
                "type": "action",
                "access": [
                    "read",
                    "execute"
                ]
            }, {
                "category": "instancestart",
                "type": "action",
                "access": [
                    "read",
                    "execute"
                ]
            }, {
                "category": "instancestop",
                "type": "action",
                "access": [
                    "read",
                    "execute"
                ]
            }, {
                "category": "instanceterminate",
                "type": "action",
                "access": [
                    "read",
                    "execute"
                ]
            }, {
                "category": "instanceconnect",
                "type": "action",
                "access": [
                    "read",
                    "execute"
                ]
            }, {
                "category": "instanceservices",
                "type": "action",
                "access": [
                    "read",
                    "execute"
                ]
            }, {
                "category": "instancetasks",
                "type": "action",
                "access": [
                    "read",
                    "execute"
                ]
            }, {
                "category": "dockercontainerstart",
                "type": "action",
                "access": [
                    "read",
                    "execute"
                ]
            }, {
                "category": "dockercontainerstop",
                "type": "action",
                "access": [
                    "read",
                    "execute"
                ]
            }, {
                "category": "dockercontainerterminate",
                "type": "action",
                "access": [
                    "read",
                    "execute"
                ]
            }, {
                "category": "dockercontainerpause",
                "type": "action",
                "access": [
                    "read",
                    "execute"
                ]
            }, {
                "category": "chefserver",
                "type": "resource",
                "access": [
                    "read"
                ]
            }, {
                "category": "chefenvironment",
                "type": "resource",
                "access": [
                    "read"
                ]
            }, {
                "category": "dockerrepository",
                "type": "resource",
                "access": [
                    "read"
                ]
            }, {
                "category": "buildservers",
                "type": "resource",
                "access": [
                    "read"
                ]
            }, {
                "category": "provider",
                "type": "resource",
                "access": [
                    "read"
                ]
            }, {
                "category": "imagegallery",
                "type": "resource",
                "access": [
                    "read"
                ]
            }, {
                "category": "jiraserver",
                "type": "resource",
                "access": [
                    "read"
                ]
            }, {
                "category": "planningservers",
                "type": "resource",
                "access": [
                    "read"
                ]
            }, {
                "category": "coderepository",
                "type": "resource",
                "access": [
                    "read"
                ]
            }, {
                "category": "users",
                "type": "resource",
                "access": [
                    "read"
                ]
            }, {
                "category": "roles",
                "type": "resource",
                "access": [
                    "read"
                ]
            }, {
                "category": "teams",
                "type": "resource",
                "access": [
                    "read"
                ]
            }, {
                "category": "authenticationprovider",
                "type": "resource",
                "access": [
                    "read"
                ]
            }, {
                "category": "templates",
                "type": "resource",
                "access": [
                    "read"
                ]
            }, {
                "category": "templatetypes",
                "type": "resource",
                "access": [
                    "read"
                ]
            }, {
                "category": "services",
                "type": "resource",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete",
                    "execute"
                ]
            }, {
                "category": "blueprints",
                "type": "resource",
                "access": [
                    "modify",
                    "execute"
                ]
            }, {
                "category": "workzone",
                "type": "module",
                "access": [
                    "read"
                ]
            }, {
                "category": "instancerunlist",
                "type": "resource",
                "access": [
                    "read",
                    "execute"
                ]
            }, {
                "category": "orchestration",
                "type": "resource",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete"
                ]
            }, {
                "category": "containers",
                "type": "resource",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete"
                ]
            }, {
                "category": "logs",
                "type": "resource",
                "access": [
                    "read"
                ]
            }, {
                "category": "configuration",
                "type": "resource",
                "access": [
                    "read"
                ]
            }, {
                "category": "organizationdashboard",
                "type": "resource",
                "access": [
                    "read"
                ]
            }, {
                "category": "businessunitdashboard",
                "type": "resource",
                "access": [
                    "read"
                ]
            }, {
                "category": "projectdashboard",
                "type": "resource",
                "access": [
                    "read"
                ]
            }, {
                "category": "jenkins",
                "type": "resource",
                "access": [
                    "read"
                ]
            }, {
                "category": "jenkins_task",
                "type": "action",
                "access": [
                    "read",
                    "execute"
                ]
            }, {
                "category": "chef_task",
                "type": "action",
                "access": [
                    "read",
                    "execute"
                ]
            }, {
                "category": "custom_task",
                "type": "action",
                "access": [
                    "read",
                    "execute"
                ]
            }, {
                "category": "application",
                "type": "action",
                "access": [
                    "read",
                    "execute"
                ]
            }, {
                "category": "providers",
                "type": "resource",
                "access": [
                    "read",
                    "execute"
                ]
            }, {
                "category": "vmimage",
                "type": "resource",
                "access": [
                    "read",
                    "execute"
                ]
            }, {
                "category": "build",
                "type": "action",
                "access": [
                    "read",
                    "execute"
                ]
            }, {
                "category": "application_instance",
                "type": "action",
                "access": [
                    "read",
                    "execute"
                ]
            }, {
                "category": "deploy_history",
                "type": "action",
                "access": [
                    "read"
                ]
            }, {
                "category": "databag",
                "type": "resource",
                "access": [
                    "read"
                ]
            }, {
                "category": "instancechefclientrun",
                "type": "action",
                "access": [
                    "read",
                    "execute"
                ]
            }, {
                "category": "puppetserver",
                "type": "resource",
                "access": [
                    "read",
                    "execute"
                ]
            }]
        };

        permissionsetsdao.createNew(permissionData2, function(err, data) {
            if (err) {
                logger.error("Got error while saving permission: ", err);
                return;
            }
            logger.debug("permission saved successfully.");
        });

        var permissionData3 = {
            "roleid": "3",
            "rolename": "Admin",
            "permissions": [{
                "category": "settings",
                "type": "module",
                "access": [
                    "read"
                ]
            }, {
                "category": "design",
                "type": "module",
                "access": [
                    "read"
                ]
            }, {
                "category": "organization",
                "type": "resource",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete"
                ]
            }, {
                "category": "environment",
                "type": "resource",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete"
                ]
            }, {
                "category": "businessgroups",
                "type": "resource",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete"
                ]
            }, {
                "category": "projects",
                "type": "resource",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete"
                ]
            }, {
                "category": "instancelaunch",
                "type": "action",
                "access": [
                    "read",
                    "execute"
                ]
            }, {
                "category": "instancestart",
                "type": "action",
                "access": [
                    "read",
                    "execute"
                ]
            }, {
                "category": "instancestop",
                "type": "action",
                "access": [
                    "read",
                    "execute"
                ]
            }, {
                "category": "instanceterminate",
                "type": "action",
                "access": [
                    "read",
                    "execute"
                ]
            }, {
                "category": "instanceconnect",
                "type": "action",
                "access": [
                    "read",
                    "execute"
                ]
            }, {
                "category": "instanceservices",
                "type": "action",
                "access": [
                    "read",
                    "execute"
                ]
            }, {
                "category": "instancetasks",
                "type": "action",
                "access": [
                    "read",
                    "execute"
                ]
            }, {
                "category": "dockercontainerstart",
                "type": "action",
                "access": [
                    "read",
                    "execute"
                ]
            }, {
                "category": "dockercontainerstop",
                "type": "action",
                "access": [
                    "read",
                    "execute"
                ]
            }, {
                "category": "dockercontainerterminate",
                "type": "action",
                "access": [
                    "read",
                    "execute"
                ]
            }, {
                "category": "dockercontainerpause",
                "type": "action",
                "access": [
                    "read",
                    "execute"
                ]
            }, {
                "category": "chefserver",
                "type": "resource",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete"
                ]
            }, {
                "category": "chefenvironment",
                "type": "resource",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete"
                ]
            }, {
                "category": "dockerrepository",
                "type": "resource",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete"
                ]
            }, {
                "category": "buildservers",
                "type": "resource",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete"
                ]
            }, {
                "category": "provider",
                "type": "resource",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete"
                ]
            }, {
                "category": "imagegallery",
                "type": "resource",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete"
                ]
            }, {
                "category": "jiraserver",
                "type": "resource",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete"
                ]
            }, {
                "category": "planningservers",
                "type": "resource",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete"
                ]
            }, {
                "category": "coderepository",
                "type": "resource",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete"
                ]
            }, {
                "category": "users",
                "type": "resource",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete"
                ]
            }, {
                "category": "roles",
                "type": "resource",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete"
                ]
            }, {
                "category": "teams",
                "type": "resource",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete"
                ]
            }, {
                "category": "authenticationprovider",
                "type": "resource",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete"
                ]
            }, {
                "category": "templates",
                "type": "resource",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete"
                ]
            }, {
                "category": "templatetypes",
                "type": "resource",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete"
                ]
            }, {
                "category": "services",
                "type": "resource",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete",
                    "execute"
                ]
            }, {
                "category": "blueprints",
                "type": "resource",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete",
                    "execute"
                ]
            }, {
                "category": "workzone",
                "type": "module",
                "access": [
                    "read"
                ]
            }, {
                "category": "instancerunlist",
                "type": "resource",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete",
                    "execute"
                ]
            }, {
                "category": "orchestration",
                "type": "resource",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete"
                ]
            }, {
                "category": "containers",
                "type": "resource",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete"
                ]
            }, {
                "category": "logs",
                "type": "resource",
                "access": [
                    "read"
                ]
            }, {
                "category": "configuration",
                "type": "resource",
                "access": [
                    "read"
                ]
            }, {
                "category": "organizationdashboard",
                "type": "resource",
                "access": [
                    "read"
                ]
            }, {
                "category": "businessunitdashboard",
                "type": "resource",
                "access": [
                    "read"
                ]
            }, {
                "category": "projectdashboard",
                "type": "resource",
                "access": [
                    "read"
                ]
            }, {
                "category": "jenkins",
                "type": "resource",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete"
                ]
            }, {
                "category": "jenkins_task",
                "type": "action",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete",
                    "execute"
                ]
            }, {
                "category": "chef_task",
                "type": "action",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete",
                    "execute"
                ]
            }, {
                "category": "custom_task",
                "type": "action",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete",
                    "execute"
                ]
            }, {
                "category": "application",
                "type": "action",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete",
                    "execute"
                ]
            }, {
                "category": "providers",
                "type": "resource",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete"
                ]
            }, {
                "category": "vmimage",
                "type": "resource",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete"
                ]
            }, {
                "category": "build",
                "type": "action",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete",
                    "execute"
                ]
            }, {
                "category": "application_instance",
                "type": "action",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete",
                    "execute"
                ]
            }, {
                "category": "deploy_history",
                "type": "action",
                "access": [
                    "read"
                ]
            }, {
                "category": "databag",
                "type": "resource",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete"
                ]
            }, {
                "category": "instancechefclientrun",
                "type": "action",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete",
                    "execute"
                ]
            }, {
                "category": "puppetserver",
                "type": "resource",
                "access": [
                    "create",
                    "read",
                    "modify",
                    "delete",
                    "execute"
                ]
            }]
        };

        permissionsetsdao.createNew(permissionData3, function(err, data) {
            if (err) {
                logger.error("Got error while saving permission: ", err);
                return;
            }
            logger.debug("permission saved successfully.");
        });

        // end permissionset insertion

        // Start create Role

        var roleData = {
            "userrolename": "Admin",
            "description": "Top level user for catalyst",
            "globalaccessname": "Designer,Consumer,Monitor,Organiser",
            "rowid": "61",
            "id": "6",
            "active": true,
            "orgname_rowid": [
                ""
            ],
            "orgname": [
                ""
            ]
        };

        var roleModel = new d4dModelNew.d4dModelMastersUserroles(roleData);
        roleModel.save(function(err, data) {
            if (err) {
                logger.error("Error while creating role: ", err);
                return;
            }
            logger.debug("Role created successfully.");
        });

        // End create Role

        // Create User
        var userData = {
            "loginname": "superadmin",
            "email": "superadmin@phoenix.com",
            "userrolename": "Admin",
            "rowid": "b0c6df04-cf8c-41f0-a13c-72989d33c4ee",
            "id": "7",
            "__v": 0,
            "active": true,
            "orgname": [""],
            "orgname_rowid": [""],
            "teamname": "DevTeam,DesignTeam",
            "teamname_rowid": "1ae4f099-7adc-4089-81c6-db2248774142,4dd44880-136f-4fba-bfca-3cd7653ee328",
            "password": "$2a$10$52EPhMqBjU4acttPaugfqe9dHyuHBcBrAvcYx8TrNfxDdugYptWPi"
        };
        var userModel = new d4dModelNew.d4dModelMastersUsers(userData);
        userModel.save(function(err, anUser) {
            if (err) {
                logger.debug("Failed to save User.");
                return;
            }
            logger.debug("Auto created User successful. ");
        });

        // End Create User

        // Create Team

        var teamData1 = {
            "teamname": "DevTeam",
            "description": "Developers for the phoenix project",
            "loginname": "superadmin",
            "loginname_rowid": "b0c6df04-cf8c-41f0-a13c-72989d33c4ee",
            "projectname": "",
            "projectname_rowid": "",
            "rowid": "1ae4f099-7adc-4089-81c6-db2248774142",
            "id": "21",
            "__v": 0,
            "orgname_rowid": [""],
            "orgname": [""]
        };
        var teamModel1 = new d4dModelNew.d4dModelMastersTeams(teamData1);
        teamModel1.save(function(err, aTeam) {
            if (err) {
                logger.debug("Failed to save Team.", err);
                return;
            }
            logger.debug("Auto created Team successful. ");
        });

        var teamData2 = {
            "teamname": "DesignTeam",
            "description": "Designers for the phoenix project",
            "loginname": "superadmin",
            "loginname_rowid": "b0c6df04-cf8c-41f0-a13c-72989d33c4ee",
            "projectname": "",
            "projectname_rowid": "",
            "rowid": "4dd44880-136f-4fba-bfca-3cd7653ee328",
            "id": "21",
            "__v": 0,
            "orgname_rowid": [""],
            "orgname": [""]
        };
        var teamModel2 = new d4dModelNew.d4dModelMastersTeams(teamData2);
        teamModel2.save(function(err, aTeam) {
            if (err) {
                logger.debug("Failed to save Team.", err);
                return;
            }
            logger.debug("Auto created Team successful. ");
        });

        // End Create Team

    } else {
        logger.info("Initial data setup already done.To setup again please clean DB and try again.");
    }
});
