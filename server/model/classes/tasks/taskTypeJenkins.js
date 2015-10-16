var logger = require('_pr/logger')(module);
var mongoose = require('mongoose');
var extend = require('mongoose-schema-extend');
var ObjectId = require('mongoose').Types.ObjectId;

var Jenkins = require('../../../lib/jenkins');
var configmgmtDao = require('../../d4dmasters/configmgmt.js');

var taskTypeSchema = require('./taskTypeSchema');


var jenkinsTaskSchema = taskTypeSchema.extend({
    jenkinsServerId: String,
    jobName: String,
    autoSyncFlag: String,
    jobResultURL: [String],
    jobURL: String,
    isParameterized: Boolean,
    parameterized: [{
        parameterName: String,
        name: String,
        defaultValue: [String],
        description: String
    }]
});

// Instance Method :- run task
jenkinsTaskSchema.methods.execute = function(userName, baseUrl, choiceParam, nexusData, onExecute, onComplete) {
    logger.debug("Choice Param in:::  anshul ",choiceParam);
    var self = this;
    //this.parameterized.name = choiceParam;
    configmgmtDao.getJenkinsDataFromId(this.jenkinsServerId, function(err, jenkinsData) {
        if (err) {
            logger.error('jenkins list fetch error', err);
            if (typeof onExecute === 'function') {
                onExecute(err);
            }
            return;
        } else {
            if (!(jenkinsData && jenkinsData.length)) {
                if (typeof onExecute === 'function') {
                    onExecute({
                        message: "Jenkins Data Not Found"
                    });
                }
                return;
            }
            jenkinsData = jenkinsData[0];
            var jenkins = new Jenkins({
                url: jenkinsData.jenkinsurl,
                username: jenkinsData.jenkinsusername,
                password: jenkinsData.jenkinspassword
            });
            jenkins.getJobInfo(self.jobName, function(err, jobInfo) {
                if (err) {
                    logger.error(err);
                    if (typeof onExecute === 'function') {
                        onExecute({
                            message: "Unable to fetch jenkins job info of job :- " + self.jobName
                        });
                    }
                    return;
                }
                // running the job
                if (!jobInfo.inQueue) {
                    if (typeof self.isParameterized != 'undefined' && self.isParameterized) {
                        logger.debug("parameterized executing.....");
                        var params = self.parameterized;
                        var param = {};
                        if (params.length > 0) {
                            logger.debug("++++++++++++++++++++++++++++++++++ in: ",choiceParam);
                            if (choiceParam) {
                                param = choiceParam;
                            } else {
                                for (var i = 0; i < params.length; i++) {
                                    param[params[i].name] = params[i].defaultValue;
                                }
                            }
                        } else {
                            onExecute({
                                message: "No Parameter available for job:- " + self.jobName
                            });
                        }
                        logger.debug("param object>>>>>>>>>>> ", JSON.stringify(param));
                        /*var dummyObj = {
                            "Catalyst_Setup": "testValGobinda",
                            "mybool": false
                        };
                         var choiceParams = {
                             "env": "cat3",
                             "os": "windows",
                             "author": "Gobinda Das"
                         };*/
                        
                        jenkins.buildJobWithParams(self.jobName, param, function(err, buildRes) {
                            if (err) {
                                logger.error(err);
                                if (typeof onExecute === 'function') {
                                    onExecute({
                                        message: "Unable to Build job :- " + self.jobName
                                    });
                                }
                                return;
                            }
                            logger.debug("buildRes ==> ", JSON.stringify(buildRes));
                            if (typeof onExecute === 'function') {
                                onExecute(null, {
                                    buildNumber: jobInfo.nextBuildNumber,
                                    jenkinsServerId: self.jenkinsServerId,
                                    jobName: self.jobName,
                                    lastBuildNumber: jobInfo.lastBuild.number,
                                    nextBuildNumber: jobInfo.nextBuildNumber
                                });
                            }

                            // polling for job status
                            function pollBuildStarted() {
                                jenkins.getJobInfo(self.jobName, function(err, latestJobInfo) {
                                    if (err) {
                                        logger.error(err);
                                        if (typeof onComplete === 'function') {
                                            onComplete(err, 1);
                                        }
                                        return;
                                    }
                                    if (jobInfo.nextBuildNumber <= latestJobInfo.lastBuild.number) {
                                        function pollBuildStatus() {
                                            jenkins.getBuildInfo(self.jobName, jobInfo.nextBuildNumber, function(err, buildInfo) {
                                                if (err) {
                                                    logger.error(err);
                                                    if (typeof onComplete === 'function') {
                                                        onComplete(err, 1);
                                                    }
                                                    return;
                                                }
                                                if (buildInfo.building) {
                                                    pollBuildStatus();
                                                } else {
                                                    var status = 1;
                                                    if (buildInfo.result === 'SUCCESS') {
                                                        status = 0;
                                                    }
                                                    if (typeof onComplete === 'function') {
                                                        onComplete(null, status);
                                                    }
                                                }
                                            });
                                        }
                                        pollBuildStatus();
                                    } else {
                                        pollBuildStarted();
                                    }
                                });
                            }
                            pollBuildStarted();
                        });
                    } else {
                        jenkins.buildJob(self.jobName, function(err, buildRes) {
                            if (err) {
                                logger.error(err);
                                if (typeof onExecute === 'function') {
                                    onExecute({
                                        message: "Unable to Build job :- " + self.jobName
                                    });
                                }
                                return;
                            }
                            //console.log('buildRes ==> ', buildRes);
                            logger.debug("buildRes ==> ", JSON.stringify(buildRes));
                            if (typeof onExecute === 'function') {
                                onExecute(null, {
                                    buildNumber: jobInfo.nextBuildNumber,
                                    jenkinsServerId: self.jenkinsServerId,
                                    jobName: self.jobName,
                                    lastBuildNumber: jobInfo.lastBuild.number,
                                    nextBuildNumber: jobInfo.nextBuildNumber
                                });
                            }

                            // polling for job status
                            function pollBuildStarted() {
                                jenkins.getJobInfo(self.jobName, function(err, latestJobInfo) {
                                    if (err) {
                                        logger.error(err);
                                        if (typeof onComplete === 'function') {
                                            onComplete(err, 1);
                                        }
                                        return;
                                    }
                                    if (jobInfo.nextBuildNumber <= latestJobInfo.lastBuild.number) {
                                        function pollBuildStatus() {
                                            jenkins.getBuildInfo(self.jobName, jobInfo.nextBuildNumber, function(err, buildInfo) {
                                                if (err) {
                                                    logger.error(err);
                                                    if (typeof onComplete === 'function') {
                                                        onComplete(err, 1);
                                                    }
                                                    return;
                                                }
                                                if (buildInfo.building) {
                                                    pollBuildStatus();
                                                } else {
                                                    var status = 1;
                                                    if (buildInfo.result === 'SUCCESS') {
                                                        status = 0;
                                                    }
                                                    if (typeof onComplete === 'function') {
                                                        onComplete(null, status);
                                                    }
                                                }
                                            });
                                        }
                                        pollBuildStatus();
                                    } else {
                                        pollBuildStarted();
                                    }
                                });
                            }
                            pollBuildStarted();




                        });
                    }
                } else {
                    if (typeof onExecute === 'function') {
                        onExecute({
                            message: 'A build is already in queue'
                        });
                    }

                }
            });
        }
    });

};

var JenkinsTask = mongoose.model('jenkinsTask', jenkinsTaskSchema);

module.exports = JenkinsTask;
