var LdapClient = require('../controller/ldap-client');
var usersDao = require('../controller/users');
var usersGroups = require('../controller/user-groups.js');
var usersRoles = require('../controller/user-roles.js');


module.exports.setRoutes = function(app, adminVerificationFunc) {

	app.get('/user/admin', adminVerificationFunc, function(req, res) {
		usersGroups.getAllGroups(function(err, groups) {
			if (err) {
				res.send(500);
			} else {
				usersRoles.getAllRoles(function(err, userRoles) {
					if (err) {
						res.send(500);
					} else {
                       res.render('admin.ejs',{
                       	groups:groups,
                       	userRoles:userRoles
                       });
					}
				});

			}
		});

		
	});

	app.post('/user/create', adminVerificationFunc, function(req, res) {
		console.log(req.body);

		var ldapClient = new LdapClient();


		ldapClient.authenticate(req.session.user.cn, req.session.user.password, function(err, user) {
			if (err) {
				res.send(403);

			} else {

				ldapClient.createUser(req.body.username, req.body.password, req.body.fname, req.body.lname, function(createErr, user) {
					console.log(createErr);
					ldapClient.close(function(err) {
						if (createErr) {
							res.send(500);
						} else {

							usersDao.createUser(req.body.username, req.body.fname, req.body.lname, req.body.userGroup, req.body.userRole, function(err, data) {
								if (err) {
									console.log(err);
									res.send(500);
								} else {
									res.send(201);
								}
							});
						}
					});
				});

			}
		});



	});

};