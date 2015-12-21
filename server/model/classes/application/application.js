/* Copyright (C) Relevance Lab Private Limited- All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Gobinda Das <gobinda.das@relevancelab.com>,
 * Dec 2015
 */

var mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;
var validate = require('mongoose-validator');
var logger = require('_pr/logger')(module);
var schemaValidator = require('../../dao/schema-validator');
var utils = require('../utils/utils');

var Build = require('./build/build.js');
var AppInstance = require('./appinstance/appInstance');
var DeployHistory = require('./appinstance/deployHistory');

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
    buildId: String,
    appInstances: [AppInstance.schema],
    deployHistoryIds: [String]
});

// instance method 
ApplicationSchema.methods.build = function(user, baseUrl, callback) {
    logger.debug("Executing build");
    Build.getBuildById(this.buildId, function(err, build) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        build.execute(user, baseUrl, callback);
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

ApplicationSchema.methods.updateBuildParameters = function(buildParameters, callback) {
    Build.getBuildById(this.buildId, function(err, build) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        build.functionalTestUrl = buildParameters.functionalTestUrl;
        build.performanceTestUrl = buildParameters.performanceTestUrl;
        build.securityTestUrl = buildParameters.securityTestUrl;
        build.nonFunctionalTestUrl = buildParameters.nonFunctionalTestUrl;
        build.unitTestUrl = buildParameters.unitTestUrl;
        build.codeCoverageTestUrl = buildParameters.codeCoverageTestUrl;
        build.codeAnalysisUrl = buildParameters.codeAnalysisUrl;
        build.uiPerformaceUrl = buildParameters.uiPerformaceUrl;
        build.save(function(err, build) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, build);
            }

        });

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


ApplicationSchema.methods.addAppInstance = function(appInstanceData, callback) {
    var self = this;
    var appInstance = new AppInstance(appInstanceData);
    this.appInstances.push(appInstance);
    this.save(function(err, application) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        /*application.getNodes(function(err, nodes) {
            if (err) {
                logger.error(err);
                callback(err, null);
                return;
            }
            application.nodes = nodes;
            callback(null, application);
        });*/
        callback(null, appInstance);
    });
};

ApplicationSchema.methods.removeAppInstance = function(appInstanceId, callback) {
    var found = false;
    if (!this.appInstances.length) {
        callback({
            message: "AppInstance does not exists"
        }, null);
        return;
    }
    var appInstance;
    for (var i = 0; i < this.appInstances.length; i++) {
        if (appInstanceId == this.appInstances[i]._id) {
            appInstance = this.appInstances[i];
            this.appInstances.splice(i, 1);
            found = true;
            break;
        }
    }
    if (!found) {
        callback({
            message: "AppInstance does not exists"
        }, null);
        return;
    }
    this.save(function(err, application) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        callback(null, appInstance);
    });
};



ApplicationSchema.methods.getAppInstance = function(appInstanceId) {
    var appInstances = this.appInstances;
    if (!appInstances.length) {
        return null;
    }
    var appInstance = null;
    for (var i = 0; i < appInstances.length; i++) {
        if (appInstanceId == appInstances[i]._id) {
            appInstance = appInstances[i];
            break;
        }
    }

    return appInstance;
};

ApplicationSchema.methods.deploy = function(appInstanceId, workflowId, username, baseUrl, callback) {
    var self = this;
    var appInstances = this.appInstances;
    if (!appInstances.length) {
        callback({
            message: "AppInstance does not exist"
        }, null);
        return;
    }
    var appInstance = null;
    for (var i = 0; i < appInstances.length; i++) {
        if (appInstanceId == appInstances[i]._id) {
            appInstance = appInstances[i];
            break;
        }
    }
    if (appInstance) {
        var timestampStarted = new Date().getTime();
        var deployHistory = null;
        appInstance.executeWorkflow(workflowId, username, baseUrl, function(err, tasks) {
            if (err) {
                callback(err, null);
                return;
            }
            DeployHistory.createNew({
                applicationId: self._id,
                appInstanceId: appInstanceId,
                workflowId: workflowId,
                user: username,
                status: DeployHistory.DEPLOY_STATUS.RUNNING,
                timestampStarted: timestampStarted,
            }, function(err, history) {
                if (err) {
                    logger.error("unable to save build history", err);
                    return;
                }
                deployHistory = history;
                self.deployHistoryIds.push(history._id);
                self.save();
            });
            callback(null, tasks);
        }, function(err, status) {
            logger.debug('Deploy Completed');
            if (deployHistory) {
                deployHistory.timestampEnded = new Date().getTime();
                if (status === 0) {
                    deployHistory.status = DeployHistory.DEPLOY_STATUS.SUCCESS;
                } else {
                    deployHistory.status = DeployHistory.DEPLOY_STATUS.FAILED;
                }
                deployHistory.save();
            }
        });
    } else {
        callback({
            message: "AppInstance does not exist"
        }, null);
    }

};

ApplicationSchema.methods.getLastDeploy = function(callback) {
    if (this.deployHistoryIds && this.deployHistoryIds.length) {
        DeployHistory.getHistoryById(this.deployHistoryIds[this.deployHistoryIds.length - 1], function(err, history) {
            if (err) {
                callback(err, null);
                return;
            }
            callback(null, history);
        });
    } else {
        callback(null, null);
    }
};

ApplicationSchema.methods.getDeployHistory = function(callback) {
    DeployHistory.getHistoryByApplicationId(this._id, function(err, histories) {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, histories);
    });
};

ApplicationSchema.methods.getDeployHistoryById = function(id, callback) {
    DeployHistory.getHistoryById(id, function(err, history) {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, history);
    });
};


ApplicationSchema.methods.getNodes = function(callback) {
    var self = this;
    var nodesList = [];
    count = 0;
    if (!this.appInstances.length) {
        callback(null, nodesList);
        return;
    }

    function getAppInstanceNodes(appInstance) {
        appInstance.getNodes(function(err, nodes) {
            count++;
            if (err) {
                callback(err, null);
                return;
            }
            nodesList = utils.arrayMerge(nodesList, nodes);
            if (count < self.appInstances.length) {
                getAppInstanceNodes(self.appInstances[count]);
            } else {
                callback(null, nodesList);
            }
        });
    }
    getAppInstanceNodes(this.appInstances[count]);
};


// static methods
ApplicationSchema.statics.getApplicationById = function(applicationId, callback) {
    this.find({
        "_id": new ObjectId(applicationId)
    }, function(err, applications) {
        if (err) {
            logger.error(err);
            callback(err, null);
            return;
        }
        //logger.debug('data ==>', data);
        if (applications.length) {
            var application = applications[0];
            /*if (!(application.appInstances && applications.length)) {
                callback(err, application);
                return;
            }
            var count = 0;

            function getAppInstancesNodes(appInstance) {
                appInstance.getNodes(function(err, nodes) {
                    count++;
                    if (err) {
                        callback(err, null);
                        return;
                    }
                    appInstance.nodes = nodes;
                    if (count < application.appInstances.length) {
                        getAppInstancesNodes(application.appInstances[count]);
                    } else {
                        callback(null, application);
                    }

                });

            }
            getAppInstancesNodes(application.appInstances[count]);
            */
            callback(null, application);
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
        logger.debug(data);
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

ApplicationSchema.statics.getBuildsByTaskId = function(taskId, callback) {
    Build.getBuildsByTaskId(taskId, function(err, builds) {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, builds);

    });
};

var Application = mongoose.model('application', ApplicationSchema);

module.exports = Application;