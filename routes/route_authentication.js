var LdapClient = require('../controller/ldap-client');


module.exports.setRoutes = function(app) {


	app.post('/auth/signin', function(req, res) {
		if (req.body && req.body.username && req.body.pass) {
			var ldapClient = new LdapClient();
			ldapClient.authenticate(req.body.username, req.body.pass, function(err, user) {
				if (err) {

					res.redirect('/login');

				} else {
					console.log(user);
					user.password = req.body.pass;
					req.session.user = user;
					ldapClient.close(function(err) {
						if (user.cn === 'admin') {
							res.redirect('/user/admin');
						} else {
							res.redirect('/');
						}
					});
				}
			});
		} else {
			res.redirect('/login');
		}
	});


	app.get('/auth/signout', function(req, res) {
		req.session = null;
		res.redirect('/login');
	});


	app.get('/login', function(req, res) {
		res.render('login');
	});

	var verifySession = function(req, res, next) {
		if (req.session && req.session.user) {
			next();
		} else {
			res.redirect('/login');
		}
	};

	return verifySession;

}