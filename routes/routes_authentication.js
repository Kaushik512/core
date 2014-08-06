var LdapClient = require('../controller/ldap-client');
var usersDao = require('../controller/users.js');
var usersGroups = require('../controller/user-groups.js');
var usersRoles = require('../controller/user-roles.js');

module.exports.setRoutes = function(app) {


	app.post('/auth/signin', function(req, res) {

		console.log(req.originalUrl);

		if (req.body && req.body.username && req.body.pass) {
			var ldapClient = new LdapClient();
			ldapClient.authenticate(req.body.username, req.body.pass, function(err, user) {
				if (err) {

					//res.send(403);  
					res.redirect('/private/index.html');

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
							res.send(200);
						} else {
							usersDao.getUser(user.cn, function(err, data) {
								if (data.length) {
									user.roleId = data[0].roleId;
									user.groupId = data[0].groupId;

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
								} else {
									res.send(500);
								}
							});
						}
					});
				}
			});
		} else {
			res.redirect('/public/login.html');
		}
	});


	app.get('/auth/signout', function(req, res) {
		req.session = null;
		//res.send(200);
		res.redirect('/public/login.html');
	});


	app.get('/login', function(req, res) {
		//res.render('login');
		res.redirect('/public/login.html');

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