var LdapClient = require('../lib/ldap-client');
var usersDao = require('../model/users.js');
var usersGroups = require('../model/user-groups.js');
var usersRoles = require('../model/user-roles.js');
var cusers = require('../model/d4dmasters/users.js');
var configmgmtDao = require('../model/d4dmasters/configmgmt');
var logger = require('_pr/logger')(module);
var appConfig = require('_pr/config');
var ldapSettings = appConfig.ldap;
var passport = require('passport');
var bcrypt = require('bcryptjs');
var authUtil = require('../lib/utils/authUtil.js');
var GlobalSettings = require('_pr/model/global-settings/global-settings');

module.exports.setRoutes = function(app) {
    app.post('/auth/createldapUser', function(req, res) {
        //logger.debug('post /auth/createldapUser : Request', req);
        //var settings = ldapSettings;
        //   chefRepoPath = settings.chefReposLocation;
        if (req.body) {
            var ldapClient = new LdapClient({
                host: appConfig.ldap.host,
                port: appConfig.ldap.port,
                baseDn: appConfig.ldap.baseDn,
                ou: appConfig.ldap.ou,
                adminUser: appConfig.ldap.adminUser,
                adminPass: appConfig.ldap.adminPass
            });
            console.log('Create User request received:', req.body.username, req.body.password.length, req.body.fname, req.body.lname);

            //Hardcoding to be removed....
            ldapClient.createUser(req.body.username, req.body.password, req.body.fname, req.body.lname, function(err, user) {
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
        if (req.body && req.body.username && req.body.pass) {
            GlobalSettings.getGolbalSettings(function(err, globalSettings) {
                if (err) {
                    res.send(500, errorResponses.db.error);
                    return;
                }
                if (globalSettings.length) {
                    logger.debug("Authentication Strategy: ", globalSettings[0].authStrategy.externals);
                    if (globalSettings[0].authStrategy.externals) {
                        logger.debug("LDAP Authentication>>>>>");
                        passport.authenticate('ldap-custom-auth', function(err, user, info) {
                            logger.debug('passport error ==>', err);
                            logger.debug('passport user ==>', user);
                            logger.debug('passport info ==>', info);

                            if (err) {
                                return next(err);
                            }
                            if (!user) {
                                return res.redirect('/public/login.html?o=try');
                            }
                            req.session.user = user;
                            usersDao.getUser(user.cn, req, function(err, data) {
                                logger.debug("User is not a Admin.");
                                logger.debug('user ==>', data);
                                if (err) {
                                    req.session.destroy();
                                    next(err);
                                    return;
                                }
                                if (data && data.length) {
                                    user.roleId = data[0].userrolename;

                                    logger.debug('Just before role:', data[0].userrolename);
                                    user.roleName = "Admin";
                                    user.authorizedfiles = 'Track,Workspace,blueprints,Settings';

                                    req.logIn(user, function(err) {
                                        if (err) {
                                            return next(err);
                                        }
                                        return res.redirect('/private/index.html');
                                    });
                                } else {
                                    req.session.destroy();
                                    res.redirect('/public/login.html?o=try');
                                }
                            });
                        })(req, res, next);
                    } else { // Local Authentication

                        logger.debug("Local Authentication>>>>>");
                        var password = req.body.pass;
                        var userName = req.body.username;
                        var user = {
                            "cn": userName,
                            "password": password
                        };
                        req.session.user = user;
                        usersDao.getUser(userName, req, function(err, data) {
                            logger.debug("User is not a Admin.");
                            logger.debug('user ==>', data);
                            if (err) {
                                req.session.destroy();
                                next(err);
                                return;
                            }
                            if (data && data.length) {
                                user.roleId = data[0].userrolename;
                                if (typeof data[0].password != 'undefined') {
                                    // check for password
                                    authUtil.checkPassword(password, data[0].password, function(err, isMatched) {
                                        if (err) {
                                            req.session.destroy();
                                            next(err);
                                            return;
                                        }
                                        if (!isMatched) {
                                            req.session.destroy();
                                            res.redirect('/public/login.html?o=try');
                                        } else {
                                            logger.debug('Just before role:', data[0].userrolename);
                                            user.roleName = "Admin";
                                            user.authorizedfiles = 'Track,Workspace,blueprints,Settings';

                                            req.logIn(user, function(err) {
                                                if (err) {
                                                    return next(err);
                                                }
                                                return res.redirect('/private/index.html');
                                            });
                                        }
                                    });
                                } else {
                                    req.session.destroy();
                                    res.redirect('/public/login.html?o=try');
                                }
                            } else {
                                req.session.destroy();
                                res.redirect('/public/login.html?o=try');
                            }
                        });
                    }
                }
            });

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
        var ldapClient = new LdapClient({
            host: appConfig.ldap.host,
            port: appConfig.ldap.port,
            baseDn: appConfig.ldap.baseDn,
            ou: appConfig.ldap.ou,
            adminUser: appConfig.ldap.adminUser,
            adminPass: appConfig.ldap.adminPass
        });
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
        logger.debug("Return User from session:>>>> ", JSON.stringify(req.session.user));
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
