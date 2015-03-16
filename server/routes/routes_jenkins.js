var Jenkins = require('../lib/jenkins');
var configmgmtDao = require('../model/d4dmasters/configmgmt');
var errorResponses = require('./error_responses');
var logger = require('../lib/logger')(module);
var url = require('url');

module.exports.setRoutes = function(app, verificationFunc) {
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


}