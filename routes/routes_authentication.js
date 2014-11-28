var LdapClient = require('../controller/ldap-client');
var usersDao = require('../controller/users.js');
var usersGroups = require('../controller/user-groups.js');
var usersRoles = require('../controller/user-roles.js');
var cusers = require('../classes/d4dmasters/users.js');
var configmgmtDao = require('../classes/d4dmasters/configmgmt');

module.exports.setRoutes = function(app) {

	app.post('/auth/signin', function(req, res) {

		console.log(req);

		if (req.body && req.body.username && req.body.pass) {
			var ldapClient = new LdapClient();
			ldapClient.authenticate(req.body.username, req.body.pass, function(err, user) {
				if (err) {

					//res.send(403);  
					console.log('hitting index');
					res.redirect('/../public/login.html?o=try');

				} else {
					console.log(user);

					user.password = req.body.pass;
					req.session.user = user;
					ldapClient.close(function(err) {
						if (user.cn === 'admin') {
							user.permissions = {
								read: true,
								write: true,
								execute: true
							};
							user.roleName = 'Admin';
							console.log(req.session.user);
							//res.redirect('/user/admin');
							res.redirect('/private/index.html');
							res.send(200);
						} else {
							usersDao.getUser(user.cn, function(err, data) {
								if (data.length) {
									user.roleId = data[0].roleId;
									user.groupId = data[0].groupId;
									console.log('Just before role');
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
											console.log(err);
											res.send(500);
										} else {

											user.roleId = 3;
											user.groupId = 'tempUsers'
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
		req.session.destroy();
		//res.send(200);
		res.redirect('/public/login.html');
	});


	app.get('/login', function(req, res) {
		//res.render('login');
		res.redirect('/public/login.html');

	});

	app.get('/auth/userexists/:username',function(req,res){
		console.log('received Username Exisits ' + req.params.username);
		var ldapClient = new LdapClient();
		ldapClient.compare(req.params.username,function(err,status){
			res.send(status)
		});
	});

	app.get('/auth/userrole',function(req,res){
		res.send(req.session.cuserrole);
	});

	var verifySession = function(req, res, next) {
		if (req.session && req.session.user) {
			next();
		} else {
			//res.redirect('/login');
			res.send(403)
		}
	};

	var adminVerificationFunc = function(req, res, next) {
		if (req.session && req.session.user) {
			if (req.session.user.cn == 'admin') {
				next();
			} else {
				res.send(403);
			}
		} else {
			res.send(403);
		}
	}

	return {
		sessionVerificationFunc: verifySession,
		adminSessionVerificationFunc: adminVerificationFunc
	};

}