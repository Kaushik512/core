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
});

// Instance Method :- run task
jenkinsTaskSchema.methods.execute = function(userName, onExecute) {
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