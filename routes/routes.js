var express = require("express");
var path = require("path");

var auth = require('./routes_authentication');
var provider = require('./routes_devopsRoles.js');
var chef = require('./routes_chef.js');
var domains = require('./routes_domains.js');
var hiddenSettings = require('./routes_hiddenSetting.js');
var settings = require('./routes_settings');
var users = require('./routes_users');
var awsCloudFormation = require('./routes_awsCloudFormation');
var appFactory = require('./routes_appFactory');
var monitoring = require('./routes_monitoring');
var environments = require('./routes_environments');
var userGroups = require('./routes_usergroups');
var userRoles = require('./routes_userroles');
var docker = require('./routes_docker');
var ec2_routes = require('./routes_aws_ec2');

var d4dMasters = require('./routes_d4dMasters');

var organizations = require('./routes_organizations');
var projects = require('./routes_projects');
var blueprints = require('./routes_blueprints');
var instances = require('./routes_instances');



module.exports.setRoutes = function(app) {


  app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    
    next();
  });


  var verificationFunctions = auth.setRoutes(app);
  var sessionVerificationFunc = verificationFunctions.sessionVerificationFunc;
  var adminSessionVerificationFunc = verificationFunctions.adminSessionVerificationFunc;


  d4dMasters.setRoutes(app, adminSessionVerificationFunc);
  
  organizations.setRoutes(app,sessionVerificationFunc);
  projects.setRoutes(app,sessionVerificationFunc);

  blueprints.setRoutes(app, sessionVerificationFunc);
  instances.setRoutes(app, sessionVerificationFunc);
  
  chef.setRoutes(app, sessionVerificationFunc);
  ec2_routes.setRoutes(app, sessionVerificationFunc);

  users.setRoutes(app,sessionVerificationFunc);


  app.get('/', function(req, res) {
    res.redirect('/private/index.html');
  });

  //for public html files
  app.use('/public', express.static(path.join(path.dirname(__dirname), 'htmls/public')));

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
      if(req.session.user.authorizedfiles){
       var authfiles = req.session.user.authorizedfiles.split(','); //To be moved to login page an hold a static variable.
       authfiles += ',index.html,settings.html,design.html,Tracker.html,noaccess.html'
      // console.log(authfiles.length, req.originalUrl.indexOf('.html'));
       if(req.originalUrl.indexOf('.html') > 0) //its a html file.
       {
          var urlpart = req.originalUrl.split('/');
        //  console.log(urlpart[urlpart.length -1], authfiles.length, authfiles.indexOf(urlpart[urlpart.length -1]));
          if(authfiles.indexOf(urlpart[urlpart.length -1]) < 0 && req.session.user.cn !='sd1')
          {
              console.log('not authorized');
//              res.redirect('/private/ajax/noaccess.html'); //To be fixed when micro authentication is implemented.
  //            return;
          }
          else{
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
  app.use('/private', express.static(path.join(path.dirname(__dirname), 'htmls/private')));


  /* 
  provider.setRoutes(app, sessionVerificationFunc);
  chef.setRoutes(app, sessionVerificationFunc);
  domains.setRoutes(app, sessionVerificationFunc);
  hiddenSettings.setRoutes(app, sessionVerificationFunc);
  settings.setRoutes(app, sessionVerificationFunc);
  users.setRoutes(app, adminSessionVerificationFunc);
  awsCloudFormation.setRoutes(app, sessionVerificationFunc);
  appFactory.setRoutes(app, sessionVerificationFunc);
  monitoring.setRoutes(app, sessionVerificationFunc);
  environments.setRoutes(app, sessionVerificationFunc);
  userGroups.setRoutes(app, adminSessionVerificationFunc);
  userRoles.setRoutes(app, adminSessionVerificationFunc);
  docker.setRoutes(app,sessionVerificationFunc);
 
  */

}