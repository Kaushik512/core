var LdapClient = require('../lib/ldap-client');
var usersDao = require('../model/users.js');
var usersGroups = require('../model/user-groups.js');
var usersRoles = require('../model/user-roles.js');
var cusers = require('../model/d4dmasters/users.js');
var configmgmtDao = require('../model/d4dmasters/configmgmt');
var logger = require('../lib/logger')(module);
var appConfig = require('../config/app_config');
var ldapSettings = appConfig.ldap;

module.exports.setRoutes = function(app) {
	app.post('/auth/createldapUser',function(req,res){
		//logger.debug('post /auth/createldapUser : Request', req);
		//var settings = ldapSettings;
             //   chefRepoPath = settings.chefReposLocation;
		if (req.body) {
			var ldapClient = new LdapClient();
			console.log('Create User request received:', req.body.username, req.body.password.length, req.body.fname, req.body.lname);
			console.log('ldappass:' + ldapSettings.rootpass);
			//Hardcoding to be removed....
			ldapClient.createUser('Admin','ReleV@ance',req.body.username, req.body.password, req.body.fname, req.body.lname, function(err, user) {
			if(err){
				console.log('In Error', err);
				res.send(err);
			}
			else
				{

					res.send(200);
								return;}
			});
		}
		else
			res.send(req.body);
	});

	app.post('/auth/signin', function(req, res) {

		//logger.debug("post: /auth/signin :: Request = ", req);

		if (req.body && req.body.username && req.body.pass) {
			logger.debug("Creating LDAP Client");
			var ldapClient = new LdapClient();
			logger.debug("Authenticating LDAP Client with user = %s and passwd = %s", req.body.username, req.body.pass);
			ldapClient.authenticate(req.body.username, req.body.pass, function(err, user) {
				if (err) {
					logger.error("Authentication Failed : Redirecting user to index");
					res.redirect('/../public/login.html?o=try');

				} else {
					logger.debug("Authentication Passed. User = ", user);

					user.password = req.body.pass;
					req.session.user = user;
					ldapClient.close(function(err) {
						logger.debug("Attempting to Closing LDAP Connection");
						if(err){
							logger.error("Failed to close LDAP Connection .>> ", err);
						}
						if (user.cn === 'admin') {
							logger.debug("User is Admin");
							user.permissions = {
								read: true,
								write: true,
								execute: true
							};
							user.roleName = 'Admin';
							logger.debug("Redirecting to /private/index.html")
							//res.redirect('/user/admin');
							res.redirect('/private/index.html');
							res.send(200);
						} else {
							console.log('in else --- ' + user.cn); //sd1
							usersDao.getUser(user.cn, function(err, data) {
								logger.debug("User is not a Admin.");
								if (data.length) {
									user.roleId = data[0].userrolename;

									//user.groupId = data[0].groupId;
									console.log('Just before role:',data[0].roleId);
									configmgmtDao.getAccessFilesForRole(user.cn,user,req,res,function(err,getAccessFiles){
									if(getAccessFiles){
										
										getAccessFiles = getAccessFiles.replace(/\"/g,'').replace(/\:/g,'')
										console.log('Rcvd in call: ' + getAccessFiles);
										//req.session.user.authorizedfiles = getAccessFiles;
										//res.end(req.session.user.authorizedfiles);
											user.roleName = "Admin";
											user.authorizedfiles = getAccessFiles;
											res.redirect('/private/index.html');
										}
									else
										{
											logger.error("getAccessFiles not available")
											res.send(500);
											return;
										}
									});
									//Set the Access 
									/*cusers.getUserRole(null,user.cn,req);
									
									usersRoles.getRoleById(user.roleId, function(err, roleData) {
										if (err) {
											res.send(500);
											return;
										} else {
											if (roleData.length) {
												user.roleName = roleData[0].name;
												user.permissions = roleData[0].permissions;
												res.redirect('/private/index.html');
												//res.send(200);
											} else {
												res.send(500);
											}
										}
									});*/
								} else {
									//making an entry of that user in data base
									usersDao.createUser(user.cn, 'firstname', 'lastname', 0, 3, function(err, data) {
										if (err) {
											logger.error("Failed Creating User >> ", err);
											//console.log(err);
											res.send(500);
										} else {

											user.roleId = 3;
											user.groupId = 'tempUsers'
											usersRoles.getRoleById(user.roleId, function(err, roleData) {
												if (err) {
													logger.err("Failed to getRoleById(%s)", user.roleId, err);
													res.send(500);
													return;
												} else {
													if (roleData.length) {
														user.roleName = roleData[0].name;
														user.permissions = roleData[0].permissions;
														res.redirect('/private/index.html');
														//res.send(200);
													} else {
														logger.debug("No roleData available")
														res.send(500);
													}
												}
											});

											//res.send(201);
										}
									});

								}
							});
						}
					});
				}
			});
		} else {
			res.redirect('/public/login.html?o=try');
		}
	});
	

	app.get('/auth/signout', function(req, res) {
		logger.debug("/auth/signout. Signing out user")
		req.session.destroy();
		//res.send(200);
		res.redirect('/public/login.html');
	});


	app.get('/login', function(req, res) {
		//res.render('login');
		res.redirect('/public/login.html');

	});

	app.get('/auth/userexists/:username',function(req,res){
		logger.debug('Enter /auth/userexists/:username. for Username ::' + req.params.username);
		var ldapClient = new LdapClient();
		ldapClient.compare(req.params.username,function(err,status){
			logger.debug("/auth/userexists/:username. LDAP Response = "+ status);
			res.send(status)
		});
	});

	app.get('/auth/userrole',function(req,res){
		res.send(req.session.cuserrole);
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
		console.log('here ==>',req.session);
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