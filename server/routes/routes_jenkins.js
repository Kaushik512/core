/* Copyright (C) Relevance Lab Private Limited- All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Gobinda Das <gobinda.das@relevancelab.com>, 
 * Aug 2015
 */

var Jenkins = require('../lib/jenkins');
var configmgmtDao = require('../model/d4dmasters/configmgmt');
var errorResponses = require('./error_responses');
var logger = require('_pr/logger')(module);
var url = require('url');
var fs = require('fs');
var currentDirectory = __dirname;

module.exports.setRoutes = function(app, verificationFunc) {
    app.get('/jenkins/version', function(req, res) {
        var jenkinVversion;
        try {
            jenkinVversion = fs.readFileSync(currentDirectory + '/../../version.json', {
                'encoding': 'utf8'
            });

            jenkinVversion = JSON.parse(jenkinVversion);

        } catch (err) {
            logger.error(err);
            res.send({});
            return;
        }
        res.send(jenkinVversion);
        return;
    });
    app.all('/jenkins/*', verificationFunc);

    app.get('/jenkins/', function(req, res) {
        configmgmtDao.getListNew('20', 'jenkinsname', function(err, jenkinsList) {
            if (err) {
                logger.error('jenkins list fetch error', err);
                res.send(500, errorResponses.db.error);
                return;
            }
            logger.debug(jenkinsList);
            res.send(jenkinsList);
        });
    });

    app.all('/jenkins/:jenkinsId/*', function(req, res, next) {
        var jenkinsId = req.params.jenkinsId;
        configmgmtDao.getJenkinsDataFromId(jenkinsId, function(err, jenkinsData) {
            if (err) {
                logger.error('jenkins list fetch error', err);
                res.send(500, errorResponses.db.error);
                return;
            } else {
                if (!(jenkinsData && jenkinsData.length)) {
                    res.send(404, errorResponses.jenkins.notFound);
                    return;
                }
                req.CATALYST = {
                    jenkins: jenkinsData[0]
                };
                next();
            }
        });
    });

    app.get('/jenkins/:jenkinsId/jobs', function(req, res) {
        var jenkinsData = req.CATALYST.jenkins;
        var jenkins = new Jenkins({
            url: jenkinsData.jenkinsurl,
            username: jenkinsData.jenkinsusername,
            password: jenkinsData.jenkinspassword
        });
        jenkins.getJobs(function(err, jobsList) {
            if (err) {
                logger.error('jenkins jobs fetch error', err);
                res.send(500, errorResponses.jenkins.serverError);
                return;
            }
            res.send(jobsList);
        });


    });

    app.get('/jenkins/:jenkinsId/jobs/:jobName', function(req, res) {
        var jenkinsData = req.CATALYST.jenkins;

        var jenkins = new Jenkins({
            url: jenkinsData.jenkinsurl,
            username: jenkinsData.jenkinsusername,
            password: jenkinsData.jenkinspassword
        });
        jenkins.getJobInfo(req.params.jobName, function(err, job) {
            if (err) {
                logger.error('jenkins jobs fetch error', err);
                res.send(500, errorResponses.jenkins.serverError);
                return;
            }
            res.send(job);
        });
    });

    app.get('/jenkins/:jenkinsId/jobs/:jobName/builds/:buildNumber', function(req, res) {
        var jenkinsData = req.CATALYST.jenkins;

        var jenkins = new Jenkins({
            url: jenkinsData.jenkinsurl,
            username: jenkinsData.jenkinsusername,
            password: jenkinsData.jenkinspassword
        });
        jenkins.getBuildInfo(req.params.jobName, req.params.buildNumber, function(err, buildData) {
            if (err) {
                logger.error('jenkins jobs fetch error', err);
                res.send(500, errorResponses.jenkins.serverError);
                return;
            }
            res.send(buildData);
        });
    });

    app.get('/jenkins/:jenkinsId/jobs/:jobName/builds/:buildNumber/output', function(req, res) {
        var jenkinsData = req.CATALYST.jenkins;

        var jenkins = new Jenkins({
            url: jenkinsData.jenkinsurl,
            username: jenkinsData.jenkinsusername,
            password: jenkinsData.jenkinspassword
        });
        jenkins.getJobOutput(req.params.jobName, req.params.buildNumber, function(err, jobOutput) {
            if (err) {
                logger.error('jenkins jobs fetch error', err);
                res.send(500, errorResponses.jenkins.serverError);
                return;
            }
            res.send(jobOutput);
        });


    });

    app.get('/jenkins/:jenkinsId/job/:jobName/lastBuild', function(req, res) {
        var jenkinsData = req.CATALYST.jenkins;

        var jenkins = new Jenkins({
            url: jenkinsData.jenkinsurl,
            username: jenkinsData.jenkinsusername,
            password: jenkinsData.jenkinspassword
        });
        jenkins.getJobsBuildNumber(req.params.jobName, function(err, jobOutput) {
            if (err) {
                logger.error('jenkins jobs fetch error', err);
                res.send(500, errorResponses.jenkins.serverError);
                // If job is newly created.
                //res.send({});
                return;
            }
            res.send(jobOutput);
        });


    });

    app.get('/jenkins/:jenkinsId/job/:jobName/update/parameter', function(req, res) {
        var jenkinsData = req.CATALYST.jenkins;

        var jenkins = new Jenkins({
            url: jenkinsData.jenkinsurl,
            username: jenkinsData.jenkinsusername,
            password: jenkinsData.jenkinspassword
        });

        jenkins.updateJob(req.params.jobName, function(err, jobOutput) {
            if (err) {
                logger.error('jenkins jobs fetch error', err);
                res.send(500, errorResponses.jenkins.serverError);
                return;
            }
            res.send(jobOutput);
        });


    });


}
