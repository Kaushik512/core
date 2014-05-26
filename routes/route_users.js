var LdapClient = require('../controller/ldap-client');
var usersDao = require('../controller/users');


module.exports.setRoutes = function(app, verifySession) {

	var adminVerificationFunc = function(req, res, next) {
		if (req.session && req.session.user) {
			if (req.session.user.cn == 'admin') {
				next();
			} else {
				res.send(403);
			}
		} else {
			res.redirect('/login');
		}
	}

	app.get('/user/admin', adminVerificationFunc, function(req, res) {
		res.render('admin.ejs');
	});

	app.post('/user/create', adminVerificationFunc, function(req, res) {

		var ldapClient = new LdapClient();
		

		ldapClient.authenticate(req.session.user.cn, req.session.user.password, function(err, user) {
			if (err) {
				res.send(403);

			} else {
                 
				ldapClient.createUser(req.body.username, req.body.password, req.body.fname, req.body.lname, req.body.userGroup, req.body.userRole, function(createErr, user) {
					console.log(createErr);
					ldapClient.close(function(err) {
						if (createErr) {
							res.send(500);
						} else {

                            usersDao.createUser(req.body.username, req.body.fname, req.body.lname,req.body.userGroup,req.body.userRole,function(err,data){
                            	if(err) {
                            		console.log(err);
                            		res.send(500);
                            	} else {
                            		res.send(201);
                            	}
                            });

							res.send(201);
						}
					});
				});

			}
		});



	});

};