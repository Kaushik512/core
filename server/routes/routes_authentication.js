var LdapClient = require('../lib/ldap-client');
var usersDao = require('../model/users.js');
var usersGroups = require('../model/user-groups.js');
var usersRoles = require('../model/user-roles.js');
var cusers = require('../model/d4dmasters/users.js');
var configmgmtDao = require('../model/d4dmasters/configmgmt');
var logger = require('../lib/logger')(module);
var appConfig = require('../config/app_config');
var ldapSettings = appConfig.ldap;
var passport = require('passport');

module.exports.setRoutes = function(app) {
    app.post('/auth/createldapUser', function(req, res) {
        //logger.debug('post /auth/createldapUser : Request', req);
        //var settings = ldapSettings;
        //   chefRepoPath = settings.chefReposLocation;
        if (req.body) {
            var ldapClient = new LdapClient();
            console.log('Create User request received:', req.body.username, req.body.password.length, req.body.fname, req.body.lname);
            console.log('ldappass:' + ldapSettings.rootpass);
            //Hardcoding to be removed....
            ldapClient.createUser('Admin', 'ReleV@ance', req.body.username, req.body.password, req.body.fname, req.body.lname, function(err, user) {
                if (err) {
                    console.log('In Error', err);
                    res.send(err);
                } else {

                    res.send(200);
                    return;
                }
            });
        } else
            res.send(req.body);
    });
    app.post('/auth/signin', function(req, res, next) {
        console.log(req.body);
        if (req.body && req.body.username && req.body.pass) {
            passport.authenticate('ldap-custom-auth', function(err, user, info) {
                console.log('passport error ==>', err);
                console.log('passport user ==>', user);
                console.log('passport info ==>', info);

                if (err) {
                    return next(err);
                }
                if (!user) {
                    return res.redirect('/public/login.html?o=try');
                }
                req.session.user = user;
                usersDao.getUser(user.cn, req, function(err, data) {
                    logger.debug("User is not a Admin.");
                    if (err) {
                        next(err);
                    }
                    if (data.length) {
                        user.roleId = data[0].userrolename;

                        console.log('Just before role:', data[0].userrolename);
                        user.roleName = "Admin";
                        user.authorizedfiles = 'Track,Workspace,blueprints,Settings';

                        req.logIn(user, function(err) {
                            if (err) {
                                return next(err);
                            }
                            return res.redirect('/private/index.html');
                        });
                    } else {
                        // next({
                        //     message: "User not found"
                        // });
                        res.redirect('/public/login.html?o=try');
                    }
                });
            })(req, res, next);

        } else {
            res.redirect('/public/login.html?o=try');
        }
    });

    app.get('/auth/signout', function(req, res) {
        logger.debug("/auth/signout. Signing out user")
        req.logout(); //passport logout
        req.session.destroy();
        //res.send(200);
        res.redirect('/public/login.html');
    });


    app.get('/login', function(req, res) {
        //res.render('login');
        res.redirect('/public/login.html');

    });

    app.get('/auth/userexists/:username', function(req, res) {
        logger.debug('Enter /auth/userexists/:username. for Username ::' + req.params.username);
        var ldapClient = new LdapClient();
        ldapClient.compare(req.params.username, function(err, status) {
            // logger.debug("/auth/userexists/:username. LDAP Response = " + status);
            res.send(status)
        });
    });

    app.get('/auth/userrole', function(req, res) {
        res.send(req.session.cuserrole);
    });

    app.get('/auth/getpermissionset', function(req, res) {
        logger.debug('hit permissionset ' + req.session.user.cn);
        if (req.session.user.password)
            delete req.session.user.password;
        res.send(JSON.stringify(req.session.user));
    });

    var verifySession = function(req, res, next) {
        //logger.debug("Enter verifySession");
        if (req.session && req.session.user) {
            //logger.debug("Has Session && Session Has User");
            next();
        } else {
            logger.debug("No Valid Session for User - 403");
            //res.redirect('/login');
            res.send(403)
        }
    };

    var adminVerificationFunc = function(req, res, next) {
        //logger.debug("Enter adminVerificationFunc");
        console.log('here ==>', req.session);
        if (req.session && req.session.user) {
            //logger.debug("Has Session && Session Has User");
            if (req.session.user.cn == 'admin') {
                //logger.debug("Has Session && Session Has User and User is Admin");
                next();
            } else {
                logger.debug("Has Session && Session Has User But User is not Admin");
                res.send(403);
            }
        } else {
            logger.debug("No Valid Session for User - 403");
            res.send(403);
        }
    }

    return {
        sessionVerificationFunc: verifySession,
        adminSessionVerificationFunc: adminVerificationFunc
    };

}