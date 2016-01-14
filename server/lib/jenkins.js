/* Copyright (C) Relevance Lab Private Limited- All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Gobinda Das <gobinda.das@relevancelab.com>,
 * Dec 2015
 */

var jenkinsApi = require('jenkins-api');
var logger = require('_pr/logger')(module);
var url = require('url');
var fs = require('fs');
var Client = require('node-rest-client').Client;

var slackMsg = require('../routes/routes_slack');



var Jenkins = function(options) {
    var parsedUrl = url.parse(options.url);
    var jenkinsUrl = parsedUrl.protocol + '//';
    if (options.username) {
        jenkinsUrl += options.username;
        var pass = options.password ? options.password : options.token;
        jenkinsUrl += ':' + pass + '@';
    }

    jenkinsUrl += parsedUrl.host + parsedUrl.path;
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
            str = data.fullDisplayName;
            var res = str.split(" ");
            var res1 = str.split("#");
            msg = res[0]+" - Build" +res[1] +"- Successful: Check console output at jenkins.rlcatalyst.com/job/"+res[0]+"/"+res1[1]+" to view the results";
            slackMsg.slackMessage('https://hooks.slack.com/services/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','#catalyst_alert','@vimal.mishra',msg);
        });
    };

    this.getLastBuildInfo = function(jobName, callback) {
        logger.debug(jobName);
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

    this.getJobsBuildNumber = function(jobName, callback) {
        jenkins.last_build_info(jobName, function(err, data) {
            if (err) {
                logger.error(err);
                callback(null, {});
                return;
            }
            callback(null, data);
        });
    };

    this.updateJob = function(jobName, callback) {
        //var config = fs.readFileSync("/home/gobinda/Gobinda/config.xml", 'ascii');
        jenkins.update_job(jobName, function(config) {}, function(err, data) {
            if (err) {
                logger.debug("Error while updating job in jenkins: ", err);
                callback(err, null);
            }
            logger.debug("Update success jenkins job: ", JSON.stringify(data));
            callback(null, data);
        });

    };
    this.getDepthJobInfo = function(jobName, callback) {
        logger.debug("parsedUrl: ", parsedUrl.href);
        var options_auth = {
            user: options.username,
            password: options.password
        };
        client = new Client(options_auth);
        var jenkinsUrl1 = parsedUrl.href + 'job/' + jobName + '/api/json?depth=1';
        logger.debug('jenkinsUrl', jenkinsUrl1);
        client.registerMethod("jsonMethod", jenkinsUrl1, "GET");
        client.methods.jsonMethod(function(data, response) {
            callback(null, data);
        });
    }
}

module.exports = Jenkins;
