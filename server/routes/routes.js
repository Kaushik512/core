var express = require("express");
var path = require("path");

var auth = require('./routes_authentication');

var chef = require('./routes_chef.js');



var users = require('./routes_users');



var d4dMasters = require('./routes_d4dMasters');

var organizations = require('./routes_organizations');
var projects = require('./routes_projects');
var blueprints = require('./routes_blueprints');
var instances = require('./routes_instances');
var tasks = require('./routes_tasks');
var taskStatus = require('./routes_taskstatus');
var ec2 = require('./routes_aws_ec2');

var jenkins = require('./routes_jenkins');
var application = require('./routes_application');

module.exports.setRoutes = function(app) {


    app.all('*', function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");

        next();
    });


    var verificationFunctions = auth.setRoutes(app);
    var sessionVerificationFunc = verificationFunctions.sessionVerificationFunc;
    var adminSessionVerificationFunc = verificationFunctions.adminSessionVerificationFunc;


    d4dMasters.setRoutes(app, sessionVerificationFunc);

    organizations.setRoutes(app, sessionVerificationFunc);
    projects.setRoutes(app, sessionVerificationFunc);

    blueprints.setRoutes(app, sessionVerificationFunc);
    instances.setRoutes(app, sessionVerificationFunc);

    chef.setRoutes(app, sessionVerificationFunc);


    users.setRoutes(app, sessionVerificationFunc);

    tasks.setRoutes(app, sessionVerificationFunc);

    taskStatus.setRoutes(app, sessionVerificationFunc);

    ec2.setRoutes(app, sessionVerificationFunc);

    jenkins.setRoutes(app, sessionVerificationFunc);

    application.setRoutes(app, sessionVerificationFunc);


    app.get('/', function(req, res) {
        res.redirect('/private/index.html');
    });

    //for public html files
    app.use('/public', express.static(path.join(path.dirname(path.dirname(__dirname)), 'client/htmls/public')));

    app.get('/public/login.html', function(req, res, next) {
        if (req.session && req.session.user) {
            res.redirect('/');
        } else {
            //res.redirect('/login');
            next();
        }
    })

    // for private html files
    app.all('/private/*', function(req, res, next) {
        if (req.session && req.session.user) {
            if (req.session.user.authorizedfiles) {
                var authfiles = req.session.user.authorizedfiles.split(','); //To be moved to login page an hold a static variable.
                authfiles += ',index.html,settings.html,design.html,Tracker.html,noaccess.html'
                // console.log(authfiles.length, req.originalUrl.indexOf('.html'));
                if (req.originalUrl.indexOf('.html') > 0) //its a html file.
                {
                    var urlpart = req.originalUrl.split('/');
                    //  console.log(urlpart[urlpart.length -1], authfiles.length, authfiles.indexOf(urlpart[urlpart.length -1]));
                    if (authfiles.indexOf(urlpart[urlpart.length - 1]) < 0 && req.session.user.cn != 'sd1') {
                        console.log('not authorized');
                        //              res.redirect('/private/ajax/noaccess.html'); //To be fixed when micro authentication is implemented.
                        //            return;
                    } else {
                        console.log('Authorized');
                    }

                }
            }
            console.log('req received ' + req.originalUrl);
            next();
        } else {
            //res.redirect('/login');
            res.redirect('/public/login.html');
        }
    });
    app.use('/private', express.static(path.join(path.dirname(path.dirname(__dirname)), 'client/htmls/private')));



}