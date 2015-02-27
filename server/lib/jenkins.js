var jenkinsApi = require('jenkins-api');
var logger = require('./logger')(module);



var Jenkins = function(options) {

    var jenkinsUrl = 'http://';
    if (options.secureOnly) {
        jenkinsUrl = 'https://';
    }
    if (options.username) {
        jenkinsUrl += options.username;
        var pass = options.password ? options.password : options.token;
        jenkinsUrl += ':' + pass + '@';
    }

    jenkinsUrl += options.host;
    if (options.port) {
        jenkinsUrl += ':' + options.port;
    }

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

    this.getJobReport = function(jobName) {
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