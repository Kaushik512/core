var logger = require('../../../lib/logger')(module);
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
    jobResultURL: String,
    jobURL: String
});

// Instance Method :- run task
jenkinsTaskSchema.methods.execute = function(userName, baseUrl, onExecute, onComplete) {
    var self = this;
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
                        console.log('buildRes ==> ', buildRes);
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