var jenkinsApi = require('jenkins-api');
var logger = require('_pr/logger')(module);
var url = require('url');



var Jenkins = function(options) {
    var parsedUrl = url.parse(options.url);
    var jenkinsUrl = parsedUrl.protocol + '//';
    if (options.username) {
        jenkinsUrl += options.username;
        var pass = options.password ? options.password : options.token;
        jenkinsUrl += ':' + pass + '@';
    }

    jenkinsUrl += parsedUrl.host+parsedUrl.path;
    

    logger.debug(jenkinsUrl);
    var jenkins = jenkinsApi.init(jenkinsUrl);


    this.getJobs = function(callback) {
        jenkins.all_jobs(function(err, data) {
            if (err) {
                logger.error(err);
                callback(err, null);
                return;
            }
            callback(null, data);
        });
    };

    this.getJobInfo = function(jobName, callback) {
        jenkins.job_info(jobName, function(err, data) {
            if (err) {
                logger.error(err);
                callback(err, null);
                return;
            }
            callback(null, data);
        })
    }

    this.buildJob = function(jobName, callback) {
        jenkins.build(jobName, function(err, data) {
            if (err) {
                logger.error(err);
                callback(err, null);
                return;
            }
            callback(null, data);
        });
    };


    this.buildJobWithParams = function(jobName, params, callback) {
        jenkins.build(jobName, params, function(err, data) {
            if (err) {
                logger.error(err);
                callback(err, null);
                return;
            }
            callback(null, data);
        });
    };

    this.getBuildInfo = function(jobName, buildNumber, callback) {
        jenkins.build_info(jobName, buildNumber, function(err, data) {
            if (err) {
                logger.error(err);
                callback(err, null);
                return;
            }
            callback(null, data);
        });
    };

    this.getLastBuildInfo = function(jobName, callback) {
        console.log(jobName);
        jenkins.last_build_info(jobName, function(err, data) {
            if (err) {
                logger.error(err, data);
                callback(err, null);
                return;
            }
            callback(null, data);
        });
    };


    this.getJobLastBuildReport = function(jobName, callback) {
        jenkins.last_build_report(jobName, function(err, data) {
            if (err) {
                logger.error(err);
                callback(err, null);
                return;
            }
            callback(null, data);
        });
    }

    this.getJobOutput = function(jobName, buildName, callback) {
        jenkins.job_output(jobName, buildName, function(err, data) {
            if (err) {
                logger.error(err);
                callback(err, null);
                return;
            }
            callback(null, data);
        });
    };




}

module.exports = Jenkins;